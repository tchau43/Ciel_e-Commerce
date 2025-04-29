// src/services/openaiAssistantService.js
const OpenAI = require('openai');
const logger = require('../config/logger'); // Đảm bảo đường dẫn đúng
require('dotenv').config();

// --- Khởi tạo OpenAI Client ---
let openai;
try {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not set in environment variables.');
    }
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    logger.info('OpenAI client initialized successfully.');
} catch (error) {
    logger.error('Failed to initialize OpenAI client:', error);
    // Ngăn chặn service hoạt động nếu client không khởi tạo được
    openai = null;
}

const ASSISTANT_ID = process.env.ASSISTANT_ID;
if (!ASSISTANT_ID) {
    logger.warn('ASSISTANT_ID is not set in environment variables. Chatbot may not function correctly.');
}

// --- Hàm tạo hoặc lấy Thread ID ---
const getOrCreateThread = async (existingThreadId = null) => {
    if (!openai) throw new Error("OpenAI client not initialized.");
    if (existingThreadId) {
        try {
            // Thử lấy thread để kiểm tra tồn tại
            await openai.beta.threads.retrieve(existingThreadId);
            logger.debug(`Using existing thread: ${existingThreadId}`);
            return existingThreadId;
        } catch (error) {
            // Bỏ qua lỗi nếu thread không tồn tại (ví dụ: đã bị xóa), sẽ tạo mới bên dưới
            if (error.status !== 404) {
                logger.warn(`Error retrieving existing thread ${existingThreadId}: ${error.message}`);
            } else {
                logger.info(`Existing thread ${existingThreadId} not found. Creating a new one.`);
            }
        }
    }
    // Tạo thread mới nếu không có ID hoặc ID không hợp lệ/không tìm thấy
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

    // Import các service bạn cần để thực thi hàm
    const productService = require('./productService'); // Đảm bảo đường dẫn đúng
    const invoiceService = require('./invoiceService'); // Đảm bảo đường dẫn đúng
    // ... import các service khác ...

    const toolOutputs = [];

    // Sử dụng Promise.all để thực thi song song nếu các hàm độc lập
    // Hoặc giữ vòng lặp for...of nếu cần thực thi tuần tự
    await Promise.all(toolCalls.map(async (toolCall) => {
        const functionName = toolCall.function.name;
        let functionArgs = {};
        try {
            if (toolCall.function.arguments) {
                functionArgs = JSON.parse(toolCall.function.arguments);
            }
        } catch (parseError) {
            logger.error(`Error parsing arguments for function ${functionName}: ${parseError}`);
            // Không cần gán {}, sẽ trả về lỗi bên dưới
        }

        let output = null;
        logger.info(`Executing function call: ${functionName} with args: ${JSON.stringify(functionArgs)}`);

        try {
            // --- ĐỊNH NGHĨA CÁCH GỌI HÀM CỦA BẠN Ở ĐÂY ---
            if (functionName === 'getProductInfo') {
                const products = await productService.searchProductService(functionArgs.productName);
                const limitedProducts = products ? products.slice(0, 5) : [];
                output = limitedProducts.length > 0 ? JSON.stringify(limitedProducts) : JSON.stringify({ message: "Không tìm thấy sản phẩm nào." });

            } else if (functionName === 'getOrderStatus') {
                // Placeholder - Cần implement logic thực tế và xác thực user nếu cần
                // const userId = ??? // Cần cách lấy userId trong ngữ cảnh này nếu cần thiết
                // const invoice = await invoiceService.getInvoiceByCodeAndUser(functionArgs.orderId, userId);
                output = JSON.stringify({ status: "Processing", eta: "2 days", message: "Placeholder: Implement real order status check." });

            } else if (functionName === 'listAllProducts') {
                const limit = functionArgs.limit && Number.isInteger(functionArgs.limit) && functionArgs.limit > 0 ? functionArgs.limit : 5;
                // Cập nhật productService.getAllProductsService để nhận tham số nếu cần
                // const sortOption = functionArgs.sort || 'createdAt:desc'; // Ví dụ lấy sort
                const allProducts = await productService.getAllProductsService(/* Truyền options nếu service hỗ trợ */);

                const summarizedProducts = allProducts.slice(0, limit).map(p => ({
                    id: p._id,
                    name: p.name,
                    base_price: p.base_price,
                    category: p.category?.name,
                    brand: p.brand?.name
                }));

                if (summarizedProducts.length > 0) {
                    output = JSON.stringify({
                        message: `Tìm thấy ${allProducts.length} sản phẩm. Dưới đây là ${summarizedProducts.length} sản phẩm đầu tiên:`,
                        products: summarizedProducts
                    });
                } else {
                    output = JSON.stringify({ message: "Cửa hàng hiện chưa có sản phẩm nào." });
                }

            } else {
                logger.warn(`Function ${functionName} is not defined in the backend.`);
                output = JSON.stringify({ error: `Function ${functionName} not implemented.` });
            }
        } catch (error) {
            logger.error(`Error executing function ${functionName}: ${error.message}`);
            // Trả về lỗi để AI biết function call không thành công
            output = JSON.stringify({ error: `Error executing function ${functionName}: ${error.message}` });
        }

        toolOutputs.push({
            tool_call_id: toolCall.id,
            output: output, // Đảm bảo output luôn là string
        });
    })); // Kết thúc Promise.all / map

    return toolOutputs;
};


// --- Hàm chạy Assistant và chờ kết quả (ĐÃ SỬA LỖI POLLING) ---
const runAssistantAndGetResponse = async (threadId) => {
    if (!openai) throw new Error("OpenAI client not initialized.");
    if (!ASSISTANT_ID) throw new Error("ASSISTANT_ID is not configured.");

    logger.info(`Initiating run for assistant ${ASSISTANT_ID} on thread ${threadId}`);
    // --- Tạo Run ban đầu ---
    let run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: ASSISTANT_ID,
        // instructions: "Your optional override instructions here..."
    });
    logger.info(`Run ${run.id} created with initial status: ${run.status}`);

    const pollingInterval = 1500; // 1.5 giây
    const maxAttempts = 25; // Tăng nhẹ giới hạn chờ nếu cần
    let attempts = 0;

    // --- Vòng lặp Polling chính ---
    while (attempts < maxAttempts) {
        // Đợi một khoảng thời gian trước khi kiểm tra lại
        await new Promise(resolve => setTimeout(resolve, pollingInterval));
        attempts++;
        logger.debug(`Polling run ${run.id} status (Attempt ${attempts})`);

        // Lấy trạng thái run hiện tại
        try {
            run = await openai.beta.threads.runs.retrieve(threadId, run.id);
            logger.debug(`Run ${run.id} current status: ${run.status}`);
        } catch (retrieveError) {
            // Xử lý lỗi khi không thể lấy trạng thái run (ví dụ: run bị hủy bởi yếu tố bên ngoài)
            logger.error(`Failed to retrieve status for run ${run.id}: ${retrieveError.message}`);
            // Có thể thử lại hoặc ném lỗi tùy tình huống
            if (retrieveError.status === 404) { // Run không còn tồn tại
                throw new Error(`Run ${run.id} could not be found.`);
            }
            // Nếu lỗi mạng hoặc lỗi tạm thời, có thể tiếp tục vòng lặp để thử lại
            if (attempts >= maxAttempts) { // Nếu đã hết lần thử thì mới ném lỗi
                throw new Error(`Failed to retrieve run status after multiple attempts: ${retrieveError.message}`);
            }
            continue; // Thử lại ở lần lặp sau
        }


        // --- Xử lý các trạng thái cuối cùng ---
        if (run.status === 'completed') {
            logger.info(`Run ${run.id} completed.`);
            const messages = await openai.beta.threads.messages.list(threadId, { order: 'desc', limit: 1 });
            const lastMessage = messages.data.find(msg => msg.run_id === run.id && msg.role === 'assistant');

            if (lastMessage?.content[0]?.type === 'text') {
                logger.info(`Assistant text response received for run ${run.id}.`);
                return lastMessage.content[0].text.value; // ===> KẾT THÚC THÀNH CÔNG
            } else {
                // Có thể có các loại content khác hoặc không có content
                logger.warn(`Run ${run.id} completed but no final text message found.`);
                // Kiểm tra các loại content khác nếu cần (ví dụ: image_file)
                // if (lastMessage?.content[0]?.type === 'image_file') { ... }
                return "Tôi đã xử lý xong yêu cầu nhưng không có phản hồi dạng văn bản."; // Hoặc trả về null/thông báo khác
            }
        }

        if (['failed', 'cancelled', 'expired'].includes(run.status)) {
            const errorMessage = run.last_error ? run.last_error.message : 'No specific error message provided.';
            logger.error(`Run ${run.id} ended unexpectedly. Status: ${run.status}. Error: ${errorMessage}`);
            throw new Error(`Assistant run ${run.id} ended with status: ${run.status}. ${errorMessage}`); // ===> KẾT THÚC (lỗi)
        }

        // --- Xử lý requires_action ---
        if (run.status === 'requires_action') {
            logger.info(`Run ${run.id} requires action (Function Calling).`);
            const toolOutputs = await handleRequiredActions(run.required_action.submit_tool_outputs.tool_calls);

            if (toolOutputs && toolOutputs.length > 0) {
                logger.info(`Submitting ${toolOutputs.length} tool output(s) for run ${run.id}`);
                try {
                    // Chỉ submit, không tạo run mới. Run ID giữ nguyên.
                    // SubmitToolOutputs trả về đối tượng run với status mới (thường là queued/in_progress)
                    run = await openai.beta.threads.runs.submitToolOutputs(threadId, run.id, {
                        tool_outputs: toolOutputs,
                        // stream: false // Đảm bảo không stream output ở đây nếu không xử lý stream
                    });
                    logger.info(`Tool outputs submitted for run ${run.id}. New status: ${run.status}`);
                    // !!! QUAN TRỌNG: Không return hay gọi đệ quy ở đây.
                    // Vòng lặp while sẽ tự động tiếp tục để poll trạng thái mới của run này.
                } catch (submitError) {
                    logger.error(`Error submitting tool outputs for run ${run.id}: ${submitError}`);
                    // Cân nhắc việc hủy run hoặc ném lỗi
                    try {
                        await openai.beta.threads.runs.cancel(threadId, run.id);
                        logger.info(`Cancelled run ${run.id} due to submission error.`);
                    } catch (cancelError) {
                        logger.error(`Failed to cancel run ${run.id} after submission error: ${cancelError.message}`);
                    }
                    throw new Error(`Failed to submit tool outputs for run ${run.id}: ${submitError.message}`); // ===> KẾT THÚC (lỗi submit)
                }
            } else {
                // Trường hợp hiếm khi handleRequiredActions trả về mảng rỗng dù có toolCalls
                logger.warn(`No tool outputs were generated for run ${run.id} despite requires_action. Cancelling run.`);
                await openai.beta.threads.runs.cancel(threadId, run.id);
                throw new Error(`Assistant required action for run ${run.id}, but no function output was generated.`); // ===> KẾT THÚC (lỗi không có output)
            }
        }
        // --- Nếu run vẫn đang ở trạng thái 'queued' hoặc 'in_progress' ---
        // Vòng lặp sẽ tiếp tục và đợi ở await new Promise(...) ở lần lặp kế tiếp

    } // Kết thúc vòng lặp while

    // Nếu hết thời gian chờ (maxAttempts) mà run vẫn chưa xong
    logger.warn(`Run ${run.id} timed out after ${attempts} attempts. Last status: ${run.status}. Attempting to cancel.`);
    try {
        await openai.beta.threads.runs.cancel(threadId, run.id);
        logger.info(`Cancelled run ${run.id} due to timeout.`);
    } catch (cancelError) {
        // Lỗi khi cancel có thể xảy ra nếu run đã tự kết thúc trong lúc chờ đợi
        logger.error(`Failed to cancel run ${run.id} after timeout (it might have already completed/failed): ${cancelError.message}`);
        // Kiểm tra lại trạng thái cuối cùng nếu cần
        try {
            const finalRunState = await openai.beta.threads.runs.retrieve(threadId, run.id);
            logger.warn(`Final state of timed-out run ${run.id} after cancel attempt: ${finalRunState.status}`);
        } catch (finalRetrieveError) {
            logger.error(`Could not retrieve final state for timed-out run ${run.id}: ${finalRetrieveError.message}`);
        }
    }
    throw new Error(`Assistant run ${run.id} timed out after ${pollingInterval * maxAttempts / 1000} seconds. Last status: ${run.status}`); // ===> KẾT THÚC (timeout)
};

module.exports = {
    getOrCreateThread,
    addMessageToThread,
    runAssistantAndGetResponse,
    // Không cần export handleRequiredActions vì nó được gọi nội bộ
};