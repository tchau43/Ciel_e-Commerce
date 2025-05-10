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
                    console.log("---------------------------------------getOrderStatus");
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

                // === NEW FUNCTION TOOLS FOR PRODUCT QUERIES ===

                // 1. Search products by usage/needs
                else if (functionName === "searchProductsByNeeds") {
                    const { needs, limit = 5 } = functionArgs;

                    if (!needs || typeof needs !== "string") {
                        logger.warn(`Missing or invalid needs for searchProductsByNeeds.`);
                        output = JSON.stringify({
                            error: "Missing or invalid needs parameter.",
                        });
                    } else {
                        logger.info(`Searching products for needs: "${needs}" with limit: ${limit}`);

                        // First, search products by needs as keywords
                        const products = await productService.searchProductService(needs);

                        // Process and format full product details including specifications
                        const productsWithDetails = await Promise.all(
                            products.slice(0, limit).map(async (product) => {
                                // Get full product details including specs if needed
                                const details = await productService.getProductByIdService(product._id);
                                return {
                                    id: details._id,
                                    name: details.name,
                                    description: details.description,
                                    base_price: details.base_price,
                                    sale_price: details.sale_price,
                                    discount_percent: details.discount_percent,
                                    category: details.category?.name,
                                    brand: details.brand?.name,
                                    specs: details.specifications || {},
                                    features: details.features || [],
                                    image: details.images && details.images.length > 0 ? details.images[0] : null
                                };
                            })
                        );

                        output = JSON.stringify({
                            message: productsWithDetails.length > 0
                                ? `Tìm thấy ${productsWithDetails.length} sản phẩm phù hợp với nhu cầu "${needs}":`
                                : `Không tìm thấy sản phẩm nào phù hợp với nhu cầu "${needs}".`,
                            products: productsWithDetails
                        });
                    }
                }

                // 2. Get detailed product specifications
                else if (functionName === "getProductSpecifications") {
                    const { productName } = functionArgs;

                    if (!productName || typeof productName !== "string") {
                        logger.warn(`Missing or invalid productName for getProductSpecifications.`);
                        output = JSON.stringify({
                            error: "Missing or invalid productName parameter.",
                        });
                    } else {
                        logger.info(`Getting specifications for product: "${productName}"`);

                        // Search for the product by name
                        const products = await productService.searchProductService(productName);

                        if (products && products.length > 0) {
                            // Get the most relevant product (first match)
                            const productDetails = await productService.getProductByIdService(products[0]._id);

                            output = JSON.stringify({
                                product: {
                                    id: productDetails._id,
                                    name: productDetails.name,
                                    category: productDetails.category?.name,
                                    brand: productDetails.brand?.name,
                                    price: productDetails.base_price,
                                    sale_price: productDetails.sale_price,
                                    specifications: productDetails.specifications || {},
                                    features: productDetails.features || [],
                                    description: productDetails.description
                                }
                            });
                        } else {
                            output = JSON.stringify({
                                message: `Không tìm thấy sản phẩm nào có tên "${productName}".`
                            });
                        }
                    }
                }

                // 3. Find products by price range
                else if (functionName === "findProductsByPriceRange") {
                    const { minPrice, maxPrice, needs, limit = 5 } = functionArgs;

                    if (
                        (minPrice !== undefined && typeof minPrice !== "number") ||
                        (maxPrice !== undefined && typeof maxPrice !== "number")
                    ) {
                        logger.warn(`Invalid price range for findProductsByPriceRange.`);
                        output = JSON.stringify({
                            error: "Invalid price range parameters. Both minPrice and maxPrice must be numbers.",
                        });
                    } else {
                        const priceFilter = {};
                        if (minPrice !== undefined) priceFilter.minPrice = minPrice;
                        if (maxPrice !== undefined) priceFilter.maxPrice = maxPrice;

                        logger.info(`Finding products in price range: ${JSON.stringify(priceFilter)} with needs: "${needs || 'any'}"`);

                        // Get products filtered by price range
                        let products;

                        if (needs) {
                            // If needs specified, search by both needs and price
                            products = await productService.searchProductsByPriceAndNeedsService(
                                priceFilter.minPrice,
                                priceFilter.maxPrice,
                                needs
                            );
                        } else {
                            // If no needs, just filter by price
                            products = await productService.getProductsByPriceRangeService(
                                priceFilter.minPrice,
                                priceFilter.maxPrice
                            );
                        }

                        // Format the product results
                        const formattedProducts = products.slice(0, limit).map(p => ({
                            id: p._id,
                            name: p.name,
                            price: p.base_price,
                            sale_price: p.sale_price,
                            category: p.category?.name,
                            brand: p.brand?.name,
                            description: p.description,
                            features: p.features || []
                        }));

                        output = JSON.stringify({
                            message: formattedProducts.length > 0
                                ? `Tìm thấy ${formattedProducts.length} sản phẩm trong tầm giá từ ${minPrice || 0} đến ${maxPrice || 'không giới hạn'}${needs ? ` phù hợp với nhu cầu "${needs}"` : ''}:`
                                : `Không tìm thấy sản phẩm nào trong tầm giá từ ${minPrice || 0} đến ${maxPrice || 'không giới hạn'}${needs ? ` phù hợp với nhu cầu "${needs}"` : ''}.`,
                            products: formattedProducts
                        });
                    }
                }

                // 4. Compare products
                else if (functionName === "compareProducts") {
                    const { productNames } = functionArgs;

                    if (!Array.isArray(productNames) || productNames.length < 2) {
                        logger.warn(`Invalid productNames for compareProducts.`);
                        output = JSON.stringify({
                            error: "Invalid productNames parameter. Must provide an array of at least 2 product names.",
                        });
                    } else {
                        logger.info(`Comparing products: ${JSON.stringify(productNames)}`);

                        // Get product details for each product name
                        const productsDetails = await Promise.all(
                            productNames.map(async (name) => {
                                const products = await productService.searchProductService(name);
                                if (products && products.length > 0) {
                                    return productService.getProductByIdService(products[0]._id);
                                }
                                return null;
                            })
                        );

                        // Filter out any products that weren't found
                        const validProducts = productsDetails.filter(p => p !== null);

                        if (validProducts.length >= 2) {
                            // Format product details for comparison
                            const comparisonData = validProducts.map(p => ({
                                id: p._id,
                                name: p.name,
                                price: p.base_price,
                                sale_price: p.sale_price,
                                category: p.category?.name,
                                brand: p.brand?.name,
                                specifications: p.specifications || {},
                                features: p.features || []
                            }));

                            output = JSON.stringify({
                                message: `So sánh ${validProducts.length} sản phẩm:`,
                                products: comparisonData
                            });
                        } else {
                            output = JSON.stringify({
                                message: `Không tìm đủ sản phẩm để so sánh. Vui lòng kiểm tra lại tên sản phẩm.`
                            });
                        }
                    }
                }

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
        `Assistant run ${run.id} timed out after ${(pollingInterval * maxAttempts) / 1000
        } seconds. Last status: ${run.status}`
    );
};

// --- Assistant Management Functions ---

// Create a new assistant
const createAssistant = async (options) => {
    if (!openai) throw new Error("OpenAI client not initialized.");

    const {
        name,
        instructions,
        model = "gpt-4-turbo-preview",
        tools = [],
        fileIds = [],
        metadata = {}
    } = options;

    logger.info(`Creating new assistant with name: ${name}`);

    try {
        const assistant = await openai.beta.assistants.create({
            name,
            instructions,
            model,
            tools,
            file_ids: fileIds,
            metadata
        });

        logger.info(`Assistant created successfully: ${assistant.id}`);
        return assistant;
    } catch (error) {
        logger.error(`Failed to create assistant: ${error.message}`);
        throw error;
    }
};

// Retrieve an assistant
const getAssistant = async (assistantId) => {
    if (!openai) throw new Error("OpenAI client not initialized.");
    if (!assistantId) throw new Error("Assistant ID is required");

    logger.info(`Retrieving assistant: ${assistantId}`);

    try {
        const assistant = await openai.beta.assistants.retrieve(assistantId);
        return assistant;
    } catch (error) {
        logger.error(`Failed to retrieve assistant ${assistantId}: ${error.message}`);
        throw error;
    }
};

// Update an assistant
const updateAssistant = async (assistantId, updates) => {
    if (!openai) throw new Error("OpenAI client not initialized.");
    if (!assistantId) throw new Error("Assistant ID is required");

    logger.info(`Updating assistant: ${assistantId}`);

    try {
        const assistant = await openai.beta.assistants.update(
            assistantId,
            updates
        );

        logger.info(`Assistant ${assistantId} updated successfully`);
        return assistant;
    } catch (error) {
        logger.error(`Failed to update assistant ${assistantId}: ${error.message}`);
        throw error;
    }
};

// List assistants
const listAssistants = async (limit = 20, order = "desc", after = null, before = null) => {
    if (!openai) throw new Error("OpenAI client not initialized.");

    logger.info(`Listing assistants (limit: ${limit}, order: ${order})`);

    try {
        const params = { limit, order };
        if (after) params.after = after;
        if (before) params.before = before;

        const assistants = await openai.beta.assistants.list(params);
        return assistants;
    } catch (error) {
        logger.error(`Failed to list assistants: ${error.message}`);
        throw error;
    }
};

// Delete an assistant
const deleteAssistant = async (assistantId) => {
    if (!openai) throw new Error("OpenAI client not initialized.");
    if (!assistantId) throw new Error("Assistant ID is required");

    logger.info(`Deleting assistant: ${assistantId}`);

    try {
        const response = await openai.beta.assistants.del(assistantId);
        logger.info(`Assistant ${assistantId} deleted successfully`);
        return response;
    } catch (error) {
        logger.error(`Failed to delete assistant ${assistantId}: ${error.message}`);
        throw error;
    }
};

// Add a file to an assistant
const addFileToAssistant = async (assistantId, fileId) => {
    if (!openai) throw new Error("OpenAI client not initialized.");
    if (!assistantId) throw new Error("Assistant ID is required");
    if (!fileId) throw new Error("File ID is required");

    logger.info(`Adding file ${fileId} to assistant ${assistantId}`);

    try {
        const file = await openai.beta.assistants.files.create(
            assistantId,
            { file_id: fileId }
        );

        logger.info(`File ${fileId} added to assistant ${assistantId}`);
        return file;
    } catch (error) {
        logger.error(`Failed to add file ${fileId} to assistant ${assistantId}: ${error.message}`);
        throw error;
    }
};

// Remove a file from an assistant
const removeFileFromAssistant = async (assistantId, fileId) => {
    if (!openai) throw new Error("OpenAI client not initialized.");
    if (!assistantId) throw new Error("Assistant ID is required");
    if (!fileId) throw new Error("File ID is required");

    logger.info(`Removing file ${fileId} from assistant ${assistantId}`);

    try {
        const response = await openai.beta.assistants.files.del(
            assistantId,
            fileId
        );

        logger.info(`File ${fileId} removed from assistant ${assistantId}`);
        return response;
    } catch (error) {
        logger.error(`Failed to remove file ${fileId} from assistant ${assistantId}: ${error.message}`);
        throw error;
    }
};

// List files attached to an assistant
const listAssistantFiles = async (assistantId, limit = 20, order = "desc", after = null, before = null) => {
    if (!openai) throw new Error("OpenAI client not initialized.");
    if (!assistantId) throw new Error("Assistant ID is required");

    logger.info(`Listing files for assistant ${assistantId}`);

    try {
        const params = { limit, order };
        if (after) params.after = after;
        if (before) params.before = before;

        const files = await openai.beta.assistants.files.list(
            assistantId,
            params
        );

        return files;
    } catch (error) {
        logger.error(`Failed to list files for assistant ${assistantId}: ${error.message}`);
        throw error;
    }
};

// Upload a file for assistants API
const uploadFile = async (filePath, purpose = "assistants") => {
    if (!openai) throw new Error("OpenAI client not initialized.");
    if (!filePath) throw new Error("File path is required");

    const fs = require('fs');

    logger.info(`Uploading file ${filePath} for purpose: ${purpose}`);

    try {
        const file = await openai.files.create({
            file: fs.createReadStream(filePath),
            purpose
        });

        logger.info(`File uploaded successfully: ${file.id}`);
        return file;
    } catch (error) {
        logger.error(`Failed to upload file ${filePath}: ${error.message}`);
        throw error;
    }
};

module.exports = {
    getOrCreateThread,
    addMessageToThread,
    runAssistantAndGetResponse,
    // Export the new assistant management functions
    createAssistant,
    getAssistant,
    updateAssistant,
    listAssistants,
    deleteAssistant,
    addFileToAssistant,
    removeFileFromAssistant,
    listAssistantFiles,
    uploadFile
};
