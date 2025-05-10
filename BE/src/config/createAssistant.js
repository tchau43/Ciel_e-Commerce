require('dotenv').config();
const OpenAI = require('openai');
const logger = require('./logger');
const fs = require('fs');
const path = require('path');
const assistantService = require('../services/openaiAssistantService');

async function setupAssistant() {
    try {
        logger.info('Starting assistant setup...');

        // Define the tool functions for your assistant
        const tools = [
            {
                type: "function",
                function: {
                    name: "searchProductsByNeeds",
                    description: "Tìm kiếm sản phẩm theo nhu cầu sử dụng",
                    parameters: {
                        type: "object",
                        properties: {
                            needs: {
                                type: "string",
                                description: "Nhu cầu sử dụng, mục đích sử dụng hoặc tính năng cần thiết của sản phẩm (ví dụ: chụp ảnh, chơi game, làm việc văn phòng)"
                            },
                            limit: {
                                type: "integer",
                                description: "Số lượng sản phẩm tối đa cần lấy",
                                default: 5
                            }
                        },
                        required: ["needs"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "getProductSpecifications",
                    description: "Lấy thông số kỹ thuật chi tiết của một sản phẩm",
                    parameters: {
                        type: "object",
                        properties: {
                            productName: {
                                type: "string",
                                description: "Tên sản phẩm cần lấy thông tin"
                            }
                        },
                        required: ["productName"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "findProductsByPriceRange",
                    description: "Tìm sản phẩm trong khoảng giá và theo nhu cầu (tùy chọn)",
                    parameters: {
                        type: "object",
                        properties: {
                            minPrice: {
                                type: "number",
                                description: "Giá thấp nhất (VND)"
                            },
                            maxPrice: {
                                type: "number",
                                description: "Giá cao nhất (VND)"
                            },
                            needs: {
                                type: "string",
                                description: "Nhu cầu sử dụng hoặc tính năng (tùy chọn)"
                            },
                            limit: {
                                type: "integer",
                                description: "Số lượng sản phẩm tối đa cần lấy",
                                default: 5
                            }
                        },
                        required: ["minPrice", "maxPrice"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "compareProducts",
                    description: "So sánh các sản phẩm dựa trên thông số kỹ thuật và tính năng",
                    parameters: {
                        type: "object",
                        properties: {
                            productNames: {
                                type: "array",
                                items: {
                                    type: "string"
                                },
                                description: "Danh sách tên các sản phẩm cần so sánh (tối thiểu 2 sản phẩm)"
                            }
                        },
                        required: ["productNames"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "listProductsByCategory",
                    description: "Lấy danh sách sản phẩm theo danh mục",
                    parameters: {
                        type: "object",
                        properties: {
                            categoryName: {
                                type: "string",
                                description: "Tên danh mục sản phẩm"
                            },
                            limit: {
                                type: "integer",
                                description: "Số lượng sản phẩm tối đa cần lấy",
                                default: 5
                            }
                        },
                        required: ["categoryName"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "listAllProducts",
                    description: "Lấy danh sách tất cả sản phẩm trong cửa hàng",
                    parameters: {
                        type: "object",
                        properties: {
                            limit: {
                                type: "integer",
                                description: "Số lượng sản phẩm tối đa cần lấy",
                                default: 5
                            }
                        }
                    }
                }
            }
        ];

        // Get existing assistant if it exists
        let assistant;
        if (process.env.ASSISTANT_ID) {
            try {
                assistant = await assistantService.getAssistant(process.env.ASSISTANT_ID);
                logger.info(`Found existing assistant: ${assistant.id}`);

                // Update the assistant with new tools
                assistant = await assistantService.updateAssistant(assistant.id, {
                    tools: tools,
                    instructions: `Bạn là trợ lý AI của cửa hàng điện tử, giúp khách hàng tìm kiếm và so sánh sản phẩm phù hợp với nhu cầu của họ.

Khi khách hỏi về sản phẩm phù hợp với một nhu cầu cụ thể (như chụp ảnh, chơi game, v.v.), hãy sử dụng searchProductsByNeeds để tìm sản phẩm phù hợp.

Khi khách hỏi về thông số kỹ thuật của một sản phẩm cụ thể (như dung lượng pin, thông số camera), hãy sử dụng getProductSpecifications.

Khi khách hỏi sản phẩm nào tốt nhất trong một tầm giá, hãy sử dụng findProductsByPriceRange.

Khi khách muốn so sánh các sản phẩm, hãy sử dụng compareProducts.

Luôn trả lời bằng tiếng Việt, thân thiện và đưa ra lời khuyên chuyên nghiệp về sản phẩm phù hợp nhất với nhu cầu của khách hàng.`
                });

                logger.info(`Updated assistant ${assistant.id} with new tools`);
            } catch (error) {
                logger.warn(`Could not find or update existing assistant: ${error.message}`);
                assistant = null;
            }
        }

        // Create new assistant if it doesn't exist
        if (!assistant) {
            assistant = await assistantService.createAssistant({
                name: "Shopping Assistant",
                instructions: `Bạn là trợ lý AI của cửa hàng điện tử, giúp khách hàng tìm kiếm và so sánh sản phẩm phù hợp với nhu cầu của họ.

Khi khách hỏi về sản phẩm phù hợp với một nhu cầu cụ thể (như chụp ảnh, chơi game, v.v.), hãy sử dụng searchProductsByNeeds để tìm sản phẩm phù hợp.

Khi khách hỏi về thông số kỹ thuật của một sản phẩm cụ thể (như dung lượng pin, thông số camera), hãy sử dụng getProductSpecifications.

Khi khách hỏi sản phẩm nào tốt nhất trong một tầm giá, hãy sử dụng findProductsByPriceRange.

Khi khách muốn so sánh các sản phẩm, hãy sử dụng compareProducts.

Luôn trả lời bằng tiếng Việt, thân thiện và đưa ra lời khuyên chuyên nghiệp về sản phẩm phù hợp nhất với nhu cầu của khách hàng.`,
                model: "gpt-4-turbo-preview",
                tools: tools
            });

            logger.info(`Created new assistant: ${assistant.id}`);

            // Save the assistant ID to .env file if it doesn't exist
            if (!process.env.ASSISTANT_ID) {
                const envPath = path.resolve(process.cwd(), '.env');
                let envContent = '';

                try {
                    envContent = fs.readFileSync(envPath, 'utf-8');
                } catch (error) {
                    logger.warn(`Could not read .env file: ${error.message}`);
                }

                const assistantEnvVar = `ASSISTANT_ID=${assistant.id}`;

                if (!envContent.includes('ASSISTANT_ID=')) {
                    const updatedEnvContent = envContent.trim() + '\n' + assistantEnvVar + '\n';
                    fs.writeFileSync(envPath, updatedEnvContent);
                    logger.info(`Added ASSISTANT_ID to .env file`);
                } else {
                    const updatedEnvContent = envContent.replace(
                        /ASSISTANT_ID=.*/,
                        assistantEnvVar
                    );
                    fs.writeFileSync(envPath, updatedEnvContent);
                    logger.info(`Updated ASSISTANT_ID in .env file`);
                }
            }
        }

        logger.info('Assistant setup completed successfully');
        return assistant;
    } catch (error) {
        logger.error(`Error setting up assistant: ${error.message}`);
        throw error;
    }
}

// Run the setup function if this file is executed directly
if (require.main === module) {
    setupAssistant()
        .then(assistant => {
            console.log('Assistant setup completed successfully');
            console.log(`Assistant ID: ${assistant.id}`);
            process.exit(0);
        })
        .catch(error => {
            console.error('Error setting up assistant:', error);
            process.exit(1);
        });
} else {
    // Export for use in other files
    module.exports = { setupAssistant };
} 