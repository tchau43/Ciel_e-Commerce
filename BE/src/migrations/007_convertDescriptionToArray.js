// node ./src/migrations/007_convertDescriptionToArray.js
// (Thay X bằng số thứ tự migration tiếp theo của bạn)

require("dotenv").config();
const mongoose = require("mongoose");
const { Product } = require("../models/product");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Lỗi: Không tìm thấy MONGODB_URI trong file .env.");
  process.exit(1);
}

async function runMigration() {
  console.log("!!! QUAN TRỌNG !!!");
  console.log(
    "!!! Đảm bảo schema Product trong models/product.js đã cập nhật 'description' thành [String]. !!!"
  );
  console.log(
    "!!! Sao lưu (BACKUP) cơ sở dữ liệu của bạn TRƯỚC KHI chạy script này. !!!"
  );
  console.log(
    "--- Chuyển đổi 'description' từ String sang Array (v2 - Bỏ qua kiểm tra typeof trong loop) ---"
  );
  console.log(
    "---------------------------------------------------------------------------------------------"
  );

  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  await new Promise((resolve) => {
    readline.question(
      "Nhập YES để xác nhận và bắt đầu chuyển đổi description (v2): ",
      (answer) => {
        readline.close();
        if (answer !== "YES") {
          console.log("Thao tác đã bị hủy.");
          process.exit(0);
        }
        resolve();
      }
    );
  });

  let connection;
  let processedProductCount = 0;
  let updatedProductCount = 0;
  let errorCount = 0;
  let productCursor;

  try {
    console.log("Đang kết nối đến cơ sở dữ liệu...");
    connection = await mongoose.connect(MONGODB_URI);
    console.log("Đã kết nối cơ sở dữ liệu.");

    console.log("Bắt đầu chuyển đổi trường description...");

    productCursor = Product.find(
      { description: { $type: "string" } },
      { _id: 1, name: 1, description: 1 }
    ).cursor();

    console.log("Đang xử lý các sản phẩm...");

    await productCursor.eachAsync(
      async (product) => {
        processedProductCount++;
        const productId = product._id;
        const originalDescription = product.description;
        console.log(
          `\nĐang xử lý Product ID: ${productId} (Tên: ${product.name})`
        );
        console.log(
          `  -> Giá trị description lấy từ cursor:`,
          originalDescription
        );
        console.log(
          `  -> Kiểu dữ liệu (typeof) của description khi lấy từ cursor: ${typeof originalDescription}`
        );

        const descriptionAsString = String(originalDescription);

        try {
          const newDescriptionArray = [
            descriptionAsString,
            "description2",
            "description 3",
          ];

          console.log(
            `  -> Thử chuyển đổi description thành mảng:`,
            newDescriptionArray
          );

          const updateResult = await Product.updateOne(
            { _id: productId },
            { $set: { description: newDescriptionArray } }
          );

          if (updateResult.modifiedCount === 1) {
            console.log(`  -> Cập nhật thành công Product ${productId}.`);
            updatedProductCount++;
          } else if (
            updateResult.matchedCount === 1 &&
            updateResult.modifiedCount === 0
          ) {
            console.log(
              `  -> Product ${productId} đã khớp nhưng không cần sửa đổi (có thể đã là mảng?).`
            );
          } else {
            console.warn(
              `  -> Không tìm thấy Product ${productId} khi cập nhật (matchedCount: ${updateResult.matchedCount}).`
            );
          }
        } catch (error) {
          console.error(`  -> LỖI khi xử lý Product ${productId}:`, error);
          errorCount++;
        }
      },
      { parallel: 5 }
    );

    console.log("\n--- Tổng kết Migration ---");
    console.log(
      `Tổng số sản phẩm đã kiểm tra (theo $type: string ban đầu): ${processedProductCount}`
    );
    console.log(
      `Sản phẩm đã cập nhật 'description' thành công: ${updatedProductCount}`
    );
    console.log(`Sản phẩm gặp lỗi trong quá trình xử lý: ${errorCount}`);
    console.log("-------------------------");
    console.log("Script chuyển đổi description (v2) đã hoàn tất.");
  } catch (error) {
    console.error(
      "\n!!! Lỗi nghiêm trọng trong quá trình thiết lập hoặc xử lý migration !!!:",
      error
    );
    errorCount++;
  } finally {
    if (productCursor) {
      try {
        await productCursor.close();
        console.log("Đã đóng con trỏ sản phẩm (product cursor).");
      } catch (cursorCloseError) {
        console.error("Lỗi khi đóng con trỏ sản phẩm:", cursorCloseError);
      }
    }
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log("Đã ngắt kết nối cơ sở dữ liệu.");
    } else {
      console.log("Kết nối cơ sở dữ liệu đã đóng hoặc gặp lỗi trước đó.");
    }

    if (errorCount > 0) {
      console.warn(
        `\nMigration hoàn thành với ${errorCount} lỗi. Vui lòng kiểm tra log cẩn thận.`
      );
      process.exit(1);
    } else if (processedProductCount === 0) {
      console.log(
        "\nKhông có sản phẩm nào có 'description' dạng string cần chuyển đổi (theo $type ban đầu)."
      );
      process.exit(0);
    } else if (updatedProductCount === 0 && processedProductCount > 0) {
      console.log(
        `\nĐã kiểm tra ${processedProductCount} sản phẩm nhưng không có sản phẩm nào được cập nhật thành công. Vui lòng kiểm tra lại Schema và log.`
      );
      process.exit(1);
    } else {
      console.log("\nMigration hoàn thành thành công.");
      process.exit(0);
    }
  }
}

runMigration();
