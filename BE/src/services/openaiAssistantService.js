// src/services/openaiAssistantService.js
const OpenAI = require("openai");
const logger = require("../config/logger");
require("dotenv").config();

// --- Khởi tạo OpenAI Client ---
let openai;
try {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in environment variables.");
  }
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  logger.info("OpenAI client initialized successfully.");
} catch (error) {
  logger.error("Failed to initialize OpenAI client:", error);
  openai = null;
}

const ASSISTANT_ID = process.env.ASSISTANT_ID;
if (!ASSISTANT_ID) {
  logger.warn(
    "ASSISTANT_ID is not set in environment variables. Chatbot may not function correctly."
  );
}

// --- Hàm tạo hoặc lấy Thread ID ---
const getOrCreateThread = async (existingThreadId = null) => {
  if (!openai) throw new Error("OpenAI client not initialized.");
  if (existingThreadId) {
    try {
      await openai.beta.threads.retrieve(existingThreadId);
      logger.debug(`Using existing thread: ${existingThreadId}`);
      return existingThreadId;
    } catch (error) {
      if (error.status !== 404) {
        logger.warn(
          `Error retrieving existing thread ${existingThreadId}: ${error.message}`
        );
      } else {
        logger.info(
          `Existing thread ${existingThreadId} not found. Creating a new one.`
        );
      }
    }
  }
  const thread = await openai.beta.threads.create();
  logger.info(`Created new thread: ${thread.id}`);
  return thread.id;
};

// --- Hàm thêm tin nhắn vào Thread ---
const addMessageToThread = async (threadId, userMessage) => {
  if (!openai) throw new Error("OpenAI client not initialized.");
  logger.debug(`Adding message to thread ${threadId}: "${userMessage}"`);
  const message = await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: userMessage,
  });
  return message;
};

// --- Hàm xử lý Function Calling ---
const handleRequiredActions = async (toolCalls) => {
  if (!toolCalls) return [];

  const productService = require("./productService");
  const invoiceService = require("./invoiceService"); // ... import các service khác ...
  const toolOutputs = [];

  await Promise.all(
    toolCalls.map(async (toolCall) => {
      const functionName = toolCall.function.name;
      console.log("----------------------------toolCall", toolCall);
      let functionArgs = {};
      try {
        if (toolCall.function.arguments) {
          functionArgs = JSON.parse(toolCall.function.arguments);
        }
      } catch (parseError) {
        logger.error(
          `Error parsing arguments for function ${functionName}: ${parseError}`
        );
        output = JSON.stringify({
          error: `Failed to parse arguments: ${parseError.message}`,
        }); // Báo lỗi parse cho AI // Skip processing this toolCall further, let the catch block below handle potential re-throw
        return; // Thoát khỏi map callback cho trường hợp này
      }

      let output = null; // Reset output to null for the try block below
      logger.info(
        `Executing function call: ${functionName} with args: ${JSON.stringify(
          functionArgs
        )}`
      );

      try {
        // --- ĐỊNH NGHĨA CÁCH GỌI HÀM CỦA BẠN Ở ĐÂY ---
        if (functionName === "getProductInfo") {
          const productName = functionArgs.productName;
          if (!productName || typeof productName !== "string") {
            logger.warn(`Missing or invalid productName for getProductInfo.`);
            output = JSON.stringify({
              error: "Missing or invalid productName argument.",
            });
          } else {
            const products = await productService.searchProductService(
              productName
            );
            // Áp dụng limit mặc định cho kết quả tìm kiếm theo tên
            const limitedProducts = products ? products.slice(0, 5) : [];
            output =
              limitedProducts.length > 0
                ? JSON.stringify(limitedProducts)
                : JSON.stringify({
                    message: `Không tìm thấy sản phẩm nào cho "${productName}".`,
                  });
          }
        } else if (functionName === "getOrderStatus") {
          // Placeholder
          output = JSON.stringify({
            status: "Processing",
            eta: "2 days",
            message: "Placeholder: Implement real order status check.",
          });
        } else if (functionName === "listAllProducts") {
          console.log("---------------------------------------listAllProducts");
          const limit =
            functionArgs.limit &&
            Number.isInteger(functionArgs.limit) &&
            functionArgs.limit > 0
              ? functionArgs.limit
              : 5; // Mặc định 5

          logger.info(`Listing all products with limit: ${limit}`);

          const allProducts =
            await productService.getAllProductsService(/* Có thể truyền limit vào đây nếu service hỗ trợ */); // Slice kết quả nếu service không hỗ trợ limit

          const summarizedProducts = allProducts.slice(0, limit).map((p) => ({
            id: p._id,
            name: p.name,
            base_price: p.base_price,
            category: p.category?.name,
            brand: p.brand?.name,
          }));

          if (allProducts.length > 0) {
            output = JSON.stringify({
              message: `Tìm thấy ${allProducts.length} sản phẩm. Dưới đây là ${summarizedProducts.length} sản phẩm đầu tiên:`,
              products: summarizedProducts,
            });
          } else {
            output = JSON.stringify({
              message: "Cửa hàng hiện chưa có sản phẩm nào.",
            });
          }

          // ===> THÊM LOGIC XỬ LÝ HÀM MỚI: countProductsByCategory <===
        } else if (functionName === "countProductsByCategory") {
          console.log(
            "---------------------------------------countProductsByCategory"
          );
          const categoryName = functionArgs.categoryName;

          if (!categoryName || typeof categoryName !== "string") {
            logger.warn(
              `Missing or invalid categoryName for countProductsByCategory.`
            );
            output = JSON.stringify({
              error: "Missing or invalid categoryName argument.",
            });
          } else {
            logger.info(`Counting products for category: "${categoryName}"`);
            // Gọi service backend để đếm sản phẩm theo danh mục
            const count = await productService.countProductsByCategoryService(
              categoryName
            );

            // Format kết quả trả về cho Assistant (chỉ số lượng)
            output = JSON.stringify({
              message: `Số lượng sản phẩm trong danh mục "${categoryName}": ${count}`,
              category: categoryName, // Trả về tên category để Assistant dễ dùng
              count: count,
            });
          }
          // ===> KẾT THÚC LOGIC XỬ LÝ HÀM MỚI <===

          // ===> CẬP NHẬT LOGIC XỬ LÝ HÀM listProductsByCategory (tên mới của getProductsByCategory) <===
        } else if (functionName === "listProductsByCategory") {
          // Đã đổi tên
          console.log(
            "---------------------------------------listProductsByCategory"
          );
          const categoryName = functionArgs.categoryName;

          // Lấy limit từ arguments, áp dụng mặc định 5 nếu không có/không hợp lệ
          const limit =
            functionArgs.limit &&
            Number.isInteger(functionArgs.limit) &&
            functionArgs.limit > 0
              ? functionArgs.limit
              : 5; // Mặc định 5 cho listProductsByCategory

          // Kiểm tra categoryName có hợp lệ không
          if (!categoryName || typeof categoryName !== "string") {
            logger.warn(
              `Missing or invalid categoryName for listProductsByCategory.`
            );
            output = JSON.stringify({
              error: "Missing or invalid categoryName argument.",
            });
          } else {
            logger.info(
              `Listing products for category: "${categoryName}" with limit: ${limit}`
            );
            // Gọi service backend để lấy danh sách sản phẩm theo danh mục
            // Đảm bảo hàm service này đã nhận limit
            const productsInCategory =
              await productService.listProductsByCategoryService(
                categoryName,
                limit
              ); // Đã đổi tên hàm service

            // Format kết quả trả về cho Assistant (danh sách sản phẩm)
            if (productsInCategory.length > 0) {
              output = JSON.stringify({
                message: `Tìm thấy ${productsInCategory.length} sản phẩm trong danh mục "${categoryName}":`,
                category: categoryName, // Trả về tên category để Assistant dễ dùng
                products: productsInCategory,
              });
            } else {
              output = JSON.stringify({
                message: `Không tìm thấy sản phẩm nào trong danh mục "${categoryName}".`,
                category: categoryName, // Trả về tên category
              });
            }
          }
        }
        // ===> KẾT THÚC LOGIC XỬ LÝ HÀM listProductsByCategory <===
        else {
          logger.warn(
            `Function ${functionName} is not defined in the backend.`
          );
          output = JSON.stringify({
            error: `Function ${functionName} not implemented in backend.`,
          });
        }
      } catch (error) {
        logger.error(
          `Error executing function ${functionName}: ${error.message}`
        );
        output = JSON.stringify({
          error: `Error executing function ${functionName}: ${error.message}`,
        });
      }

      // Chỉ push toolOutput nếu 'output' đã được gán giá trị (tức là không có lỗi parse ban đầu)
      // hoặc nếu bạn muốn push cả lỗi parse vào toolOutputs
      if (output !== null) {
        toolOutputs.push({
          tool_call_id: toolCall.id,
          output: output, // Đảm bảo output luôn là string JSON
        });
      } else {
        // Xử lý trường hợp lỗi parse khiến output ban đầu vẫn là null/undefined
        logger.warn(
          `Skipping tool output for call ${toolCall.id} due to upstream error.`
        );
        // Có thể thêm một output lỗi chung ở đây nếu muốn Assistant nhận được phản hồi cho tool call này
        // toolOutputs.push({
        //    tool_call_id: toolCall.id,
        //    output: JSON.stringify({ error: "Internal server error or invalid arguments." }),
        // });
      }
    })
  ); // Kết thúc Promise.all / map

  return toolOutputs;
};

// --- Hàm chạy Assistant và chờ kết quả ---
const runAssistantAndGetResponse = async (threadId) => {
  if (!openai) throw new Error("OpenAI client not initialized.");
  if (!ASSISTANT_ID) throw new Error("ASSISTANT_ID is not configured.");

  logger.info(
    `Initiating run for assistant ${ASSISTANT_ID} on thread ${threadId}`
  );
  let run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: ASSISTANT_ID, // instructions: "Your optional override instructions here..."
  });
  logger.info(`Run ${run.id} created with initial status: ${run.status}`);

  const pollingInterval = 1500; // 1.5 giây
  const maxAttempts = 25; // Tăng nhẹ giới hạn chờ nếu cần
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, pollingInterval));
    attempts++;
    logger.debug(`Polling run ${run.id} status (Attempt ${attempts})`);

    try {
      run = await openai.beta.threads.runs.retrieve(threadId, run.id);
      logger.debug(`Run ${run.id} current status: ${run.status}`);
    } catch (retrieveError) {
      logger.error(
        `Failed to retrieve status for run ${run.id}: ${retrieveError.message}`
      );
      if (retrieveError.status === 404) {
        throw new Error(`Run ${run.id} could not be found.`);
      }
      if (attempts >= maxAttempts) {
        throw new Error(
          `Failed to retrieve run status after multiple attempts: ${retrieveError.message}`
        );
      }
      continue;
    }

    if (run.status === "completed") {
      logger.info(`Run ${run.id} completed.`);
      const messages = await openai.beta.threads.messages.list(threadId, {
        order: "desc",
        limit: 1,
      });
      const lastMessage = messages.data.find(
        (msg) => msg.run_id === run.id && msg.role === "assistant"
      );

      if (lastMessage?.content[0]?.type === "text") {
        logger.info(`Assistant text response received for run ${run.id}.`);
        return lastMessage.content[0].text.value;
      } else {
        logger.warn(`Run ${run.id} completed but no final text message found.`);
        return "Tôi đã xử lý xong yêu cầu nhưng không có phản hồi dạng văn bản.";
      }
    }

    if (["failed", "cancelled", "expired"].includes(run.status)) {
      const errorMessage = run.last_error
        ? run.last_error.message
        : "No specific error message provided.";
      logger.error(
        `Run ${run.id} ended unexpectedly. Status: ${run.status}. Error: ${errorMessage}`
      );
      throw new Error(
        `Assistant run ${run.id} ended with status: ${run.status}. ${errorMessage}`
      );
    }

    if (run.status === "requires_action") {
      logger.info(`Run ${run.id} requires action (Function Calling).`); // Pass the *correct* tool_calls array from the *current* run status
      const toolCallsForSubmission =
        run.required_action.submit_tool_outputs.tool_calls;
      const toolOutputs = await handleRequiredActions(toolCallsForSubmission);

      if (toolOutputs && toolOutputs.length > 0) {
        logger.info(
          `Submitting ${toolOutputs.length} tool output(s) for run ${run.id}`
        );
        try {
          run = await openai.beta.threads.runs.submitToolOutputs(
            threadId,
            run.id,
            {
              tool_outputs: toolOutputs,
            }
          );
          logger.info(
            `Tool outputs submitted for run ${run.id}. New status: ${run.status}`
          );
        } catch (submitError) {
          logger.error(
            `Error submitting tool outputs for run ${run.id}: ${submitError}`
          );
          try {
            await openai.beta.threads.runs.cancel(threadId, run.id);
            logger.info(`Cancelled run ${run.id} due to submission error.`);
          } catch (cancelError) {
            logger.error(
              `Failed to cancel run ${run.id} after submission error: ${cancelError.message}`
            );
          }
          throw new Error(
            `Failed to submit tool outputs for run ${run.id}: ${submitError.message}`
          );
        }
      } else {
        logger.warn(
          `handleRequiredActions returned no outputs for run ${run.id} despite requires_action. This might indicate an issue.`
        );
        // It might be better to just let the run fail or timeout naturally if no output was generated
        // Or submit an empty tool_outputs array if the API supports it for specific error cases?
        // For now, we'll just log and let the loop continue, hoping the state clarifies or it times out.
        // Alternatively, you could cancel the run:
        // await openai.beta.threads.runs.cancel(threadId, run.id);
        // throw new Error(`Assistant required action, but no valid tool outputs were generated by backend for run ${run.id}.`);
      }
    }
  }

  logger.warn(
    `Run ${run.id} timed out after ${attempts} attempts. Last status: ${run.status}. Attempting to cancel.`
  );
  try {
    await openai.beta.threads.runs.cancel(threadId, run.id);
    logger.info(`Cancelled run ${run.id} due to timeout.`);
  } catch (cancelError) {
    logger.error(
      `Failed to cancel run ${run.id} after timeout (it might have already completed/failed): ${cancelError.message}`
    );
    try {
      const finalRunState = await openai.beta.threads.runs.retrieve(
        threadId,
        run.id
      );
      logger.warn(
        `Final state of timed-out run ${run.id} after cancel attempt: ${finalRunState.status}`
      );
    } catch (finalRetrieveError) {
      logger.error(
        `Could not retrieve final state for timed-out run ${run.id}: ${finalRetrieveError.message}`
      );
    }
  }
  throw new Error(
    `Assistant run ${run.id} timed out after ${
      (pollingInterval * maxAttempts) / 1000
    } seconds. Last status: ${run.status}`
  );
};

module.exports = {
  getOrCreateThread,
  addMessageToThread,
  runAssistantAndGetResponse,
};
