require('dotenv').config();
const logger = require('./logger');
const fs = require('fs');
const path = require('path');
const { getAssistant, updateAssistant, createAssistant } = require('../services/openaiChatService');

async function setupAssistant() {
    try {
        logger.info('Starting assistant setup...');

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
                            approximatePrice: {
                                type: "number",
                                description: "Mức giá xấp xỉ (VND) - nếu chỉ định giá này, hệ thống sẽ tự động tìm trong khoảng +/- 2 triệu"
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
                        }
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
            },
            {
                type: "function",
                function: {
                    name: "analyzeProductsByPriceAndFeatures",
                    description: "Phân tích và gợi ý sản phẩm dựa trên khoảng giá và nhu cầu sử dụng, kết hợp với thông tin chi tiết về sản phẩm",
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
                            approximatePrice: {
                                type: "number",
                                description: "Mức giá xấp xỉ (VND) - nếu chỉ định giá này, hệ thống sẽ tự động tìm trong khoảng +/- 2 triệu"
                            },
                            features: {
                                type: "string",
                                description: "Các tính năng hoặc nhu cầu cần có (ví dụ: chơi game, đồ họa, văn phòng)"
                            },
                            limit: {
                                type: "integer",
                                description: "Số lượng sản phẩm tối đa cần phân tích",
                                default: 5
                            }
                        },
                        required: ["features"]
                    }
                }
            }
        ];

        let assistant;
        if (process.env.ASSISTANT_ID) {
            try {
                assistant = await getAssistant(process.env.ASSISTANT_ID);
                logger.info(`Found existing assistant: ${assistant.id}`);

                assistant = await updateAssistant(assistant.id, {
                    tools: tools,
                    instructions: `Bạn là trợ lý AI của cửa hàng điện tử, giúp khách hàng tìm kiếm và so sánh sản phẩm phù hợp với nhu cầu của họ.
                Khi khách hỏi về sản phẩm phù hợp với một nhu cầu cụ thể (như chụp ảnh, chơi game, v.v.), hãy sử dụng searchProductsByNeeds để tìm sản phẩm phù hợp.
                Khi khách hỏi về thông số kỹ thuật của một sản phẩm cụ thể (như dung lượng pin, thông số camera), hãy sử dụng getProductSpecifications.
                Khi khách hỏi sản phẩm nào tốt nhất trong một tầm giá, hãy sử dụng findProductsByPriceRange.
                Khi khách muốn so sánh các sản phẩm, hãy sử dụng compareProducts.
                Khi khách hỏi về sản phẩm trong một tầm giá cụ thể và có nhu cầu đặc biệt (ví dụ: laptop 10 triệu chơi game tốt), hãy sử dụng analyzeProductsByPriceAndFeatures. Function này sẽ:
                - Tìm các sản phẩm trong tầm giá
                - Phân tích chi tiết thông tin và mô tả của từng sản phẩm
                - Đánh giá mức độ phù hợp với nhu cầu của khách
                - Đưa ra gợi ý chi tiết và lý do tại sao sản phẩm đó phù hợp
                Luôn trả lời bằng tiếng Việt, thân thiện và đưa ra lời khuyên chuyên nghiệp về sản phẩm phù hợp nhất với nhu cầu của khách hàng.
                Khi trả lời, hãy tuân thủ các quy tắc định dạng sau để tạo giao diện đẹp và dễ đọc:
- Khi trả lời, hãy sử dụng các thẻ HTML để tạo giao diện đẹp và dễ đọc.
- Khi trả lời, hãy sử dụng các thẻ HTML để tạo giao diện đẹp và dễ đọc.
- Khi trả lời, hãy sử dụng các thẻ HTML để tạo giao diện đẹp và dễ đọc.
- In đậm thì phải sử dụng thẻ <b> và </b>
- In nghiêng thì phải sử dụng thẻ <i> và </i>
- In gạch ngang thì phải sử dụng thẻ <s> và </s>
- In chữ nhỏ thì phải sử dụng thẻ <small> và </small>
- In chữ lớn thì phải sử dụng thẻ <big> và </big>
- In chữ nhỏ thì phải sử dụng thẻ <small> và </small>
- Chỉ cần hiển thị tên sản phẩm, không cần hiển thị các thông tin khác như ảnh.
- Chỉ cần hiển thị tên sản phẩm, không cần hiển thị các thông tin khác như ảnh.
- Chỉ cần hiển thị tên sản phẩm, không cần hiển thị các thông tin khác như ảnh.
- Chỉ cần hiển thị tên sản phẩm, không cần hiển thị các thông tin khác như ảnh.
- Chỉ cần hiển thị tên sản phẩm, không cần hiển thị các thông tin khác như ảnh.
`,
                });

                logger.info(`Updated assistant ${assistant.id} with new tools`);
            } catch (error) {
                logger.warn(`Could not find or update existing assistant: ${error.message}`);
                assistant = null;
            }
        }

        if (!assistant) {
            assistant = await createAssistant({
                name: "Shopping Assistant",
                instructions: `Bạn là trợ lý AI của cửa hàng điện tử, giúp khách hàng tìm kiếm và so sánh sản phẩm phù hợp với nhu cầu của họ.
                Khi khách hỏi về sản phẩm phù hợp với một nhu cầu cụ thể (như chụp ảnh, chơi game, v.v.), hãy sử dụng searchProductsByNeeds để tìm sản phẩm phù hợp.
                Khi khách hỏi về thông số kỹ thuật của một sản phẩm cụ thể (như dung lượng pin, thông số camera), hãy sử dụng getProductSpecifications.
                Khi khách hỏi sản phẩm nào tốt nhất trong một tầm giá, hãy sử dụng findProductsByPriceRange.
                Khi khách muốn so sánh các sản phẩm, hãy sử dụng compareProducts.
                Khi khách hỏi về sản phẩm trong một tầm giá cụ thể và có nhu cầu đặc biệt (ví dụ: laptop 10 triệu chơi game tốt), hãy sử dụng analyzeProductsByPriceAndFeatures. Function này sẽ:
                - Tìm các sản phẩm trong tầm giá
                - Phân tích chi tiết thông tin và mô tả của từng sản phẩm
                - Đánh giá mức độ phù hợp với nhu cầu của khách
                - Đưa ra gợi ý chi tiết và lý do tại sao sản phẩm đó phù hợp
                Luôn trả lời bằng tiếng Việt, thân thiện và đưa ra lời khuyên chuyên nghiệp về sản phẩm phù hợp nhất với nhu cầu của khách hàng.
                Khi trả lời, hãy tuân thủ các quy tắc định dạng sau để tạo giao diện đẹp và dễ đọc:
- Khi trả lời, hãy sử dụng các thẻ HTML để tạo giao diện đẹp và dễ đọc.
- Khi trả lời, hãy sử dụng các thẻ HTML để tạo giao diện đẹp và dễ đọc.
- Khi trả lời, hãy sử dụng các thẻ HTML để tạo giao diện đẹp và dễ đọc.
- In đậm thì phải sử dụng thẻ <b> và </b>
- In nghiêng thì phải sử dụng thẻ <i> và </i>
- In gạch ngang thì phải sử dụng thẻ <s> và </s>
- In chữ nhỏ thì phải sử dụng thẻ <small> và </small>
- In chữ lớn thì phải sử dụng thẻ <big> và </big>
- In chữ nhỏ thì phải sử dụng thẻ <small> và </small>
- Chỉ cần hiển thị tên sản phẩm, không cần hiển thị các thông tin khác như ảnh.
- Chỉ cần hiển thị tên sản phẩm, không cần hiển thị các thông tin khác như ảnh.
- Chỉ cần hiển thị tên sản phẩm, không cần hiển thị các thông tin khác như ảnh.
- Chỉ cần hiển thị tên sản phẩm, không cần hiển thị các thông tin khác như ảnh.
- Chỉ cần hiển thị tên sản phẩm, không cần hiển thị các thông tin khác như ảnh.
`,
                model: "gpt-4o-mini",
                tools: tools
            });

            logger.info(`Created new assistant: ${assistant.id}`);

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
    module.exports = { setupAssistant };
} 