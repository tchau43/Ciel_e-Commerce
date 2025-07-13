const OpenAI = require("openai");
const logger = require("../config/logger");
const { getOrCreateSession, getMessagesForSession } = require("./chatHistoryService");
const { Product } = require("../models/product");
const { searchProductService, getAllProductsService, listProductsByCategoryService, getProductByIdService, searchProductsByPriceAndNeedsService, getProductsByPriceRangeService } = require("./productService");
require("dotenv").config();


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
    logger.warn("ASSISTANT_ID is not set in environment variables. Chatbot may not function correctly.");
}

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

const addMessageToThread = async (threadId, userMessage) => {
    if (!openai) throw new Error("OpenAI client not initialized.");
    logger.debug(`Adding message to thread ${threadId}: "${userMessage}"`);
    const message = await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: userMessage,
    });
    return message;
};

const calculatePriceRange = (price, range = 2000000) => {
    const minPrice = Math.max(0, price - range);
    const maxPrice = price + range;
    return { minPrice, maxPrice };
};

const handleRequiredActions = async (toolCalls) => {
    if (!toolCalls) return [];
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
                });
                return;
            }
            let output = null;
            logger.info(
                `Executing function call: ${functionName} with args: ${JSON.stringify(
                    functionArgs
                )}`
            );
            try {
                if (functionName === "listAllProducts") {
                    console.log("---------------------------------------listAllProducts");
                    const limit =
                        functionArgs.limit &&
                            Number.isInteger(functionArgs.limit) &&
                            functionArgs.limit > 0
                            ? functionArgs.limit
                            : 5;
                    logger.info(`Listing all products with limit: ${limit}`);
                    const allProducts =
                        await getAllProductsService();
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
                } else if (functionName === "listProductsByCategory") {
                    console.log(
                        "---------------------------------------listProductsByCategory"
                    );
                    const categoryName = functionArgs.categoryName;
                    const limit =
                        functionArgs.limit && Number.isInteger(functionArgs.limit) && functionArgs.limit > 0 ? functionArgs.limit : 5;
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
                        const productsInCategory =
                            await listProductsByCategoryService(
                                categoryName,
                                limit
                            );
                        if (productsInCategory.length > 0) {
                            output = JSON.stringify({
                                message: `Tìm thấy ${productsInCategory.length} sản phẩm trong danh mục "${categoryName}":`,
                                category: categoryName,
                                products: productsInCategory,
                            });
                        } else {
                            output = JSON.stringify({
                                message: `Không tìm thấy sản phẩm nào trong danh mục "${categoryName}".`,
                                category: categoryName,
                            });
                        }
                    }
                }
                else if (functionName === "searchProductsByNeeds") {
                    console.log("---------------------------------------searchProductsByNeeds");
                    const { needs, limit = 5 } = functionArgs;
                    if (!needs || typeof needs !== "string") {
                        logger.warn(`Missing or invalid needs for searchProductsByNeeds.`);
                        output = JSON.stringify({
                            error: "Missing or invalid needs parameter.",
                        });
                    } else {
                        logger.info(`Searching products for needs: "${needs}" with limit: ${limit}`);
                        const products = await searchProductService(needs);
                        const productsWithDetails = await Promise.all(
                            products.slice(0, limit).map(async (product) => {
                                const details = await getProductByIdService(product._id);
                                return {
                                    id: details._id,
                                    name: details.name,
                                    description: details.description,
                                    base_price: details.base_price,
                                    category: details.category?.name,
                                    brand: details.brand?.name,
                                    tags: details.tags || [],
                                    images: details.images || [],
                                    popularity: details.popularity,
                                    averageRating: details.averageRating,
                                    numberOfReviews: details.numberOfReviews
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
                else if (functionName === "getProductSpecifications") {
                    console.log("---------------------------------------getProductSpecifications");
                    const { productName } = functionArgs;
                    if (!productName || typeof productName !== "string") {
                        logger.warn(`Missing or invalid productName for getProductSpecifications.`);
                        output = JSON.stringify({
                            error: "Missing or invalid productName parameter.",
                        });
                    } else {
                        logger.info(`Getting specifications for product: "${productName}"`);
                        const products = await searchProductService(productName);
                        if (products && products.length > 0) {
                            const productDetails = await getProductByIdService(products[0]._id);
                            output = JSON.stringify({
                                product: {
                                    id: productDetails._id,
                                    name: productDetails.name,
                                    category: productDetails.category?.name,
                                    brand: productDetails.brand?.name,
                                    price: productDetails.base_price,
                                    specifications: productDetails.specifications || {},
                                    features: productDetails.features || [],
                                    description: productDetails.description,
                                    tags: productDetails.tags || [],
                                    images: productDetails.images || [],
                                    popularity: productDetails.popularity,
                                    averageRating: productDetails.averageRating,
                                    numberOfReviews: productDetails.numberOfReviews
                                }
                            });
                        } else {
                            output = JSON.stringify({
                                message: `Không tìm thấy sản phẩm nào có tên "${productName}".`
                            });
                        }
                    }
                }
                else if (functionName === "findProductsByPriceRange") {
                    console.log("---------------------------------------findProductsByPriceRange");
                    const { minPrice, maxPrice, approximatePrice, needs, limit = 5 } = functionArgs;

                    let priceFilter = {};
                    if (approximatePrice !== undefined) {
                        const range = calculatePriceRange(approximatePrice);
                        priceFilter = range;
                    } else {
                        if (minPrice !== undefined && maxPrice !== undefined) {
                            priceFilter = { minPrice, maxPrice };
                        } else {
                            logger.warn(`Invalid price parameters for findProductsByPriceRange.`);
                            output = JSON.stringify({
                                error: "Thiếu thông tin về khoảng giá cần tìm.",
                            });
                            return;
                        }
                    }

                    logger.info(`Finding products in price range: ${JSON.stringify(priceFilter)} with needs: "${needs || 'any'}"`);

                    let products;
                    if (needs) {
                        products = await searchProductsByPriceAndNeedsService(
                            priceFilter.minPrice,
                            priceFilter.maxPrice,
                            needs
                        );
                    } else {
                        products = await getProductsByPriceRangeService(
                            priceFilter.minPrice,
                            priceFilter.maxPrice
                        );
                    }
                    const formattedProducts = products.slice(0, limit).map(p => ({
                        id: p._id,
                        name: p.name,
                        price: p.base_price,
                        category: p.category?.name,
                        brand: p.brand?.name,
                        description: p.description,
                        tags: p.tags || [],
                        images: p.images || [],
                        popularity: p.popularity,
                        averageRating: p.averageRating,
                        numberOfReviews: p.numberOfReviews
                    }));
                    output = JSON.stringify({
                        message: formattedProducts.length > 0
                            ? `Tìm thấy ${formattedProducts.length} sản phẩm trong tầm giá từ ${priceFilter.minPrice} đến ${priceFilter.maxPrice}${needs ? ` phù hợp với nhu cầu "${needs}"` : ''}:`
                            : `Không tìm thấy sản phẩm nào trong tầm giá từ ${priceFilter.minPrice} đến ${priceFilter.maxPrice}${needs ? ` phù hợp với nhu cầu "${needs}"` : ''}.`,
                        products: formattedProducts
                    });
                }

                else if (functionName === "compareProducts") {
                    console.log("---------------------------------------compareProducts");
                    const { productNames } = functionArgs;
                    if (!Array.isArray(productNames) || productNames.length < 2) {
                        logger.warn(`Invalid productNames for compareProducts.`);
                        output = JSON.stringify({
                            error: "Invalid productNames parameter. Must provide an array of at least 2 product names.",
                        });
                    } else {
                        logger.info(`Comparing products: ${JSON.stringify(productNames)}`);
                        const productsDetails = await Promise.all(
                            productNames.map(async (name) => {
                                const products = await searchProductService(name);
                                if (products && products.length > 0) {
                                    return getProductByIdService(products[0]._id);
                                }
                                return null;
                            })
                        );

                        const validProducts = productsDetails.filter(p => p !== null);
                        if (validProducts.length >= 2) {
                            const comparisonData = validProducts.map(p => ({
                                id: p._id,
                                name: p.name,
                                price: p.base_price,
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
                else if (functionName === "analyzeProductsByPriceAndFeatures") {
                    console.log("---------------------------------------analyzeProductsByPriceAndFeatures");
                    const { minPrice, maxPrice, approximatePrice, features, limit = 5 } = functionArgs;

                    let priceFilter = {};
                    if (approximatePrice !== undefined) {
                        const range = calculatePriceRange(approximatePrice);
                        priceFilter = range;
                    } else {
                        if (minPrice !== undefined && maxPrice !== undefined) {
                            priceFilter = { minPrice, maxPrice };
                        } else {
                            logger.warn(`Missing required price parameters for analyzeProductsByPriceAndFeatures`);
                            output = JSON.stringify({
                                error: "Thiếu thông tin về khoảng giá cần tìm."
                            });
                            return;
                        }
                    }

                    if (!features) {
                        logger.warn(`Missing required features parameter for analyzeProductsByPriceAndFeatures`);
                        output = JSON.stringify({
                            error: "Thiếu thông tin về tính năng cần tìm."
                        });
                        return;
                    }

                    logger.info(`Analyzing products with price range ${priceFilter.minPrice}-${priceFilter.maxPrice} and features: ${features}`);
                    const result = await analyzeProductsByPriceAndFeatures(priceFilter.minPrice, priceFilter.maxPrice, features, limit);
                    output = JSON.stringify(result);
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
            if (output !== null) {
                toolOutputs.push({
                    tool_call_id: toolCall.id,
                    output: output,
                });
            } else {
                logger.warn(
                    `Skipping tool output for call ${toolCall.id} due to upstream error.`
                );
            }
        })
    );
    return toolOutputs;
};

const runAssistantAndGetResponse = async (threadId) => {
    if (!openai) throw new Error("OpenAI client not initialized.");
    if (!ASSISTANT_ID) throw new Error("ASSISTANT_ID is not configured.");
    logger.info(`Initiating run for assistant ${ASSISTANT_ID} on thread ${threadId}`);

    try {
        const session = await getOrCreateSession(null, threadId);
        let contextMessage = '';

        try {
            const recentMessages = await getMessagesForSession(session._id, 5);
            if (recentMessages.length > 0) {
                logger.info(`Adding ${recentMessages.length} messages as context`);
                contextMessage = recentMessages
                    .reverse()
                    .map(msg => `${msg.sender}: ${msg.message}`)
                    .join("\n");
            }
        } catch (error) {
            logger.warn(`Failed to get recent messages: ${error.message}`);
        }

        // Luôn gửi formatting instructions cho mỗi tin nhắn
        const formattingInstructions = `
QUAN TRỌNG - QUY TẮC ĐỊNH DẠNG VĂN BẢN:
- TUYỆT ĐỐI KHÔNG ĐƯỢC SỬ DỤNG MARKDOWN (**, ##, *, _, ~~, etc.)
- PHẢI SỬ DỤNG HTML TAGS cho mọi định dạng văn bản
- Mọi định dạng PHẢI tuân theo các mẫu HTML bên dưới, không được tự ý thay đổi

ĐỊNH DẠNG VĂN BẢN CƠ BẢN:
- In đậm: <b>text</b> (KHÔNG ĐƯỢC DÙNG **, chỉ dùng thẻ b)
- In nghiêng: <i>text</i> (KHÔNG ĐƯỢC DÙNG *, chỉ dùng thẻ i)
- Gạch chân: <u>text</u>
- Gạch ngang: <s>text</s>
- Chữ nhỏ: <small>text</small>
- Chữ lớn: <big>text</big>
- Xuống dòng: <br/>

CẤU TRÚC PHẢN HỒI:
1. Định dạng chung:
   <div class="mb-4">Nội dung đoạn văn</div>
   <div class="text-lg font-bold text-blue-600 mb-2">Tiêu đề chính</div>
   <div class="text-gray-600 mb-4">Mô tả chung</div>

2. Khi liệt kê sản phẩm:
   <div class="product-card bg-white p-4 rounded-lg shadow-sm mb-4">
     <div class="text-lg font-bold text-blue-600">[Tên sản phẩm]</div>
     <div class="text-xl font-bold text-red-600 my-2">[Giá]</div>
     <div class="text-gray-600">[Mô tả ngắn]</div>
   </div>

3. Khi hiển thị thông số kỹ thuật:
   <div class="specs-grid">
     <div class="spec-item">
       <span class="spec-label">[Tên thông số]</span>
       <span class="spec-value">[Giá trị]</span>
     </div>
   </div>

4. Khi so sánh sản phẩm:
   <div class="comparison-table">
     <div class="compare-row">
       <div class="compare-label">[Tiêu chí]</div>
       <div class="compare-value">[Sản phẩm A]</div>
       <div class="compare-value">[Sản phẩm B]</div>
     </div>
   </div>

5. Khi đưa ra lời khuyên:
   <div class="advice-box bg-blue-50 p-4 rounded-lg border border-blue-200">
     <div class="text-blue-800">[Nội dung lời khuyên]</div>
   </div>

Previous conversation context:
${contextMessage}`;

        await addMessageToThread(threadId, formattingInstructions);

        let run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: ASSISTANT_ID,
        });
        logger.info(`Run ${run.id} created with initial status: ${run.status}`);
        const pollingInterval = 1500;
        const maxAttempts = 30;
        let attempts = 0;
        while (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, pollingInterval));
            attempts++;
            logger.debug(`Polling run ${run.id} status (Attempt ${attempts}/${maxAttempts})`);
            try {
                run = await openai.beta.threads.runs.retrieve(threadId, run.id);
                logger.debug(`Run ${run.id} current status: ${run.status}`);
            } catch (retrieveError) {
                logger.error(`Failed to retrieve status for run ${run.id}: ${retrieveError.message}`);
                if (retrieveError.status === 404) {
                    throw new Error(`Run ${run.id} could not be found.`);
                }
                if (attempts >= maxAttempts) {
                    throw new Error(`Failed to retrieve run status after ${maxAttempts} attempts: ${retrieveError.message}`);
                }
                continue;
            }
            if (run.status === "completed") {
                logger.info(`Run ${run.id} completed successfully.`);
                const messages = await openai.beta.threads.messages.list(threadId, {
                    order: "desc",
                    limit: 1,
                });
                const lastMessage = messages.data.find(
                    (msg) => msg.run_id === run.id && msg.role === "assistant"
                );
                if (lastMessage?.content[0]?.type === "text") {
                    logger.info(`Assistant response received for run ${run.id}`);
                    return lastMessage.content[0].text.value;
                } else {
                    logger.warn(`Run ${run.id} completed but no text response found`);
                    throw new Error("Assistant completed but did not provide a text response");
                }
            }
            if (["failed", "cancelled", "expired"].includes(run.status)) {
                const errorMessage = run.last_error
                    ? `${run.last_error.code}: ${run.last_error.message}`
                    : "No specific error message provided";
                logger.error(`Run ${run.id} failed with status ${run.status}. Error: ${errorMessage}`);
                throw new Error(`Assistant run failed: ${errorMessage}`);
            }
            if (run.status === "requires_action") {
                logger.info(`Run ${run.id} requires function execution`);
                const toolCallsForSubmission = run.required_action.submit_tool_outputs.tool_calls;
                // console.log("---------------------------------------toolCallsForSubmission", toolCallsForSubmission);
                const toolOutputs = await handleRequiredActions(toolCallsForSubmission);
                // console.log("---------------------------------------toolOutputs", toolOutputs);
                if (toolOutputs && toolOutputs.length > 0) {
                    logger.info(`Submitting ${toolOutputs.length} tool outputs for run ${run.id}`);
                    try {
                        run = await openai.beta.threads.runs.submitToolOutputs(threadId, run.id, {
                            tool_outputs: toolOutputs,
                        });
                        logger.info(`Tool outputs submitted successfully for run ${run.id}`);
                    } catch (submitError) {
                        logger.error(`Failed to submit tool outputs: ${submitError.message}`);
                        await cancelRunSafely(threadId, run.id);
                        throw new Error(`Failed to submit tool outputs: ${submitError.message}`);
                    }
                } else {
                    logger.error(`No valid tool outputs generated for run ${run.id}`);
                    await cancelRunSafely(threadId, run.id);
                    throw new Error("Failed to generate valid tool outputs");
                }
            }
        }
        logger.error(`Run ${run.id} timed out after ${maxAttempts} attempts`);
        await cancelRunSafely(threadId, run.id);
        throw new Error(`Assistant run timed out after ${(pollingInterval * maxAttempts) / 1000} seconds`);
    } catch (error) {
        logger.warn(`Failed to handle chat context: ${error.message}`);
    }
};


const cancelRunSafely = async (threadId, runId) => {
    try {
        await openai.beta.threads.runs.cancel(threadId, runId);
        logger.info(`Successfully cancelled run ${runId}`);
    } catch (cancelError) {
        logger.warn(`Failed to cancel run ${runId}: ${cancelError.message}`);
    }
};


const createAssistant = async (options) => {
    if (!openai) throw new Error("OpenAI client not initialized.");
    const {
        name,
        instructions,
        model = "gpt-4-turbo-preview",
        tools = [],
        metadata = {}
    } = options;
    logger.info(`Creating new assistant with name: ${name}`);
    try {
        const assistant = await openai.beta.assistants.create({
            name,
            instructions,
            model,
            tools,
            metadata
        });
        logger.info(`Assistant created successfully: ${assistant.id}`);
        return assistant;
    } catch (error) {
        logger.error(`Failed to create assistant: ${error.message}`);
        throw error;
    }
};


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

const analyzeProductsByPriceAndFeatures = async (minPrice = 0, maxPrice, features, limit = 5) => {
    try {
        const products = await Product.find({
            base_price: { $gte: minPrice, $lte: maxPrice }
        })
            .populate('category', 'name')
            .populate('brand', 'name')
            .limit(limit)
            .lean();

        if (!products || products.length === 0) {
            return {
                message: "Không tìm thấy sản phẩm nào trong tầm giá này.",
                products: []
            };
        }

        const productsWithAnalysis = products.map(product => {
            const analysisText = [
                product.name,
                ...(product.description || []),
                ...(product.tags || [])
            ].join(' ');

            const featureKeywords = features.toLowerCase().split(/\s+/);
            const matchScore = featureKeywords.reduce((score, keyword) => {
                const regex = new RegExp(keyword, 'gi');
                const matches = (analysisText.match(regex) || []).length;
                return score + matches;
            }, 0);

            return {
                ...product,
                matchScore,
                analysis: {
                    relevantTags: product.tags?.filter(tag =>
                        featureKeywords.some(keyword =>
                            tag.toLowerCase().includes(keyword)
                        )
                    ) || [],
                    price: {
                        original: product.base_price,
                        inBudget: product.base_price <= maxPrice
                    }
                }
            };
        });

        productsWithAnalysis.sort((a, b) => b.matchScore - a.matchScore);
        return {
            message: "Đã phân tích sản phẩm theo yêu cầu của bạn.",
            products: productsWithAnalysis.map(product => ({
                id: product._id,
                name: product.name,
                brand: product.brand?.name,
                category: product.category?.name,
                price: product.analysis.price,
                matchScore: product.matchScore,
                relevantTags: product.analysis.relevantTags,
                description: product.description,
                tags: product.tags
            }))
        };
    } catch (error) {
        logger.error(`Error in analyzeProductsByPriceAndFeatures: ${error.message}`);
        throw new Error(`Không thể phân tích sản phẩm: ${error.message}`);
    }
};

module.exports = {
    getOrCreateThread,
    addMessageToThread,
    runAssistantAndGetResponse,
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
