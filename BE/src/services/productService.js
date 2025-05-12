// services/productService.js
// Refactored to work with Product and a separate Variant collection.

const mongoose = require("mongoose");
const Category = require("../models/category"); // Adjust path if needed
const Brand = require("../models/brand"); // Adjust path if needed
const { Product, ProductIndex } = require("../models/product"); // Adjust path for NEW Product model
const Variant = require("../models/variant"); // Adjust path for NEW Variant model
const { generateCombinations } = require("../utils/helper"); // Adjust path if needed
const { createCategoryService } = require("./categoryService"); // Adjust path if needed
const { updateProductIndex } = require("./updateDb/updateProduct"); // Adjust path & ensure this function is updated for new structure
const logger = require("../config/logger"); // Đảm bảo đường dẫn chính xác

// --- CREATE PRODUCT (with Variants) ---
// Creates a Product document, then creates associated Variant documents,
// and finally updates the Product with references to the created Variants.
const createProductService = async (productData) => {
  try {
    const { variants, ...mainProductData } = productData;

    // --- 1. Handle Category ---
    const categoryInput = mainProductData.category;
    let category = null;
    if (categoryInput) {
      // Try finding by ID if it's a valid format, otherwise by name
      if (mongoose.Types.ObjectId.isValid(categoryInput)) {
        category = await Category.findById(categoryInput).lean();
      }
      if (!category && typeof categoryInput === "string") {
        // If not found by ID or not an ID, try name
        category = await Category.findOne({ name: categoryInput }).lean();
      }
      // Optionally auto-create category if not found by name
      if (!category && typeof categoryInput === "string") {
        console.warn(`Auto-creating category: ${categoryInput}`);
        // Assuming createCategoryService takes { name } and returns the document
        category = await createCategoryService({ name: categoryInput });
      }
    }
    if (!category) {
      // Ensure category was resolved
      throw new Error(
        "Valid category (ID or Name) is required and must exist or be creatable."
      );
    }

    // --- 2. Handle Brand (NEW LOGIC) ---
    const brandInput = mainProductData.brand;
    let resolvedBrandId = null; // Brand is optional in schema, so default to null

    if (brandInput) {
      // Only process if brand was provided
      let brand = null;
      // Try finding by ID if it's a valid format
      if (mongoose.Types.ObjectId.isValid(brandInput)) {
        brand = await Brand.findById(brandInput).lean();
      }
      // If not found by ID or not a valid ID format, try finding by name
      if (!brand && typeof brandInput === "string") {
        brand = await Brand.findOne({ name: brandInput }).lean();
      }

      // Optional: Auto-create brand if you want that behavior
      // if (!brand && typeof brandInput === 'string') {
      //     console.warn(`Auto-creating brand: ${brandInput}`);
      //     // You would need a createBrandService or create directly
      //     // brand = await createBrandService({ name: brandInput });
      //     const newBrand = new Brand({ name: brandInput });
      //     brand = await newBrand.save();
      // }

      if (brand && brand._id) {
        resolvedBrandId = brand._id; // Get the ObjectId
      } else if (typeof brandInput === "string") {
        // Throw error if brand name provided but not found (and not auto-creating)
        throw new Error(
          `Brand '${brandInput}' not found. Please create it first or provide a valid Brand ID.`
        );
      } else {
        // Throw error if invalid input type provided for brand
        throw new Error(`Invalid brand identifier provided: ${brandInput}`);
      }
    }
    // --- End Brand Handling ---

    // 3. Create the Product document
    const newProduct = new Product({
      ...mainProductData,
      category: category._id, // Use resolved category ID
      brand: resolvedBrandId, // <-- Use resolved brand ID (or null)
      variants: [], // Initialize empty, will be updated later if refs are added
    });
    await newProduct.save();

    // 4. Create Variant documents
    let createdVariantIds = [];
    if (variants && Array.isArray(variants) && variants.length > 0) {
      const variantsToCreate = variants.map((variantData) => ({
        ...variantData,
        product: newProduct._id,
      }));
      try {
        const createdVariants = await Variant.insertMany(variantsToCreate);
        createdVariantIds = createdVariants.map((v) => v._id);
      } catch (variantError) {
        await Product.findByIdAndDelete(newProduct._id); // Cleanup
        throw new Error(`Failed to create variants: ${variantError.message}`);
      }

      // 5. Update Product with Variant references
      newProduct.variants = createdVariantIds;
      await newProduct.save();
    }

    // 6. Update Product Index
    await updateProductIndex();

    // 7. Return created product
    const populatedProduct = await Product.findById(newProduct._id)
      .populate("category", "name") // Populate names only
      .populate("brand", "name")
      .lean();
    return populatedProduct;
  } catch (error) {
    console.error("Error in createProductService:", error);
    // Check if it's a Mongoose validation error to provide better feedback
    if (error.name === "ValidationError") {
      throw new Error(`Product validation failed: ${error.message}`);
    }
    throw new Error(error.message || "Error creating product");
  }
};

// --- GET ALL PRODUCTS ---
// Fetches a list of products without populating their variant details.
const getAllProductsService = async (sort) => {
  try {
    let sortOption = {};
    if (sort && typeof sort === "string") {
      const [field, order] = sort.split(":");
      if (field && order && ["asc", "desc"].includes(order.toLowerCase())) {
        sortOption[field] = order.toLowerCase() === "desc" ? -1 : 1;
      } else {
        console.warn(`Invalid sort parameter: ${sort}. Using default.`);
        sortOption = { createdAt: -1 };
      }
    } else {
      sortOption = { createdAt: -1 }; // Default sort
    }

    const products = await Product.find({})
      .sort(sortOption)
      .populate("category", "name") // Populate only names for efficiency
      .populate("brand", "name") // Populate only names for efficiency
      .lean();

    // Note: products here will have product.variants as an array of ObjectIds
    // console.log("----------------------------products", products);
    return products;
  } catch (error) {
    console.error("Error in getAllProductsService:", error);
    throw new Error("Error getting products: " + error.message);
  }
};

// --- GET PRODUCT BY ID (WITH POPULATED VARIANTS) ---
// Fetches a single product and populates its associated variant details.
const getProductByIdService = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid product ID format");
    }

    const product = await Product.findById(id)
      .populate("category", "name") // Populate necessary fields
      .populate("brand", "name")
      .populate({
        // Populate the variants array using the references
        path: "variants",
        model: "Variant", // Explicitly state model if needed, usually inferred from ref
        // select: 'types price stock' // Optionally select specific variant fields
      })
      .lean(); // Use lean at the end

    if (!product) {
      throw new Error("Product not found");
    }
    // product.variants will now be an array of variant objects
    return product;
  } catch (error) {
    console.error(`Error in getProductByIdService for ID ${id}:`, error);
    throw new Error(error.message || "Error getting product by ID");
  }
};

// --- GET PRODUCTS BY NAME ---
// Fetches products matching a name, without populating variant details.
const getProductsByNameService = async (name) => {
  try {
    const products = await Product.find({
      name: { $regex: name, $options: "i" }, // Case-insensitive search
    })
      .populate("category", "name")
      .populate("brand", "name")
      .lean();

    return products; // variants field will be array of ObjectIds
  } catch (error) {
    console.error(`Error in getProductsByNameService for name ${name}:`, error);
    throw new Error("Error fetching products by name: " + error.message);
  }
};

// --- UPDATE PRODUCT (CORE FIELDS ONLY) ---
// Updates fields directly on the Product document (e.g., name, description, category).
// Does NOT handle variant updates - use variant-specific services for that.
const updateProductService = async (id, productData) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid product ID format");
    }

    // 1. Handle Category Resolution
    let resolvedCategoryId;
    const categoryInput = productData.category;
    if (categoryInput !== undefined) {
      // Only process if category was provided
      if (
        typeof categoryInput === "object" &&
        categoryInput !== null &&
        categoryInput._id
      ) {
        resolvedCategoryId = categoryInput._id; // Assume valid if object with _id
      } else if (typeof categoryInput === "string") {
        let foundCategory = null;
        if (mongoose.Types.ObjectId.isValid(categoryInput)) {
          foundCategory = await Category.findById(categoryInput).lean();
        }
        if (!foundCategory) {
          foundCategory = await Category.findOne({
            name: categoryInput,
          }).lean();
        }
        if (!foundCategory)
          throw new Error(`Category '${categoryInput}' not found`);
        resolvedCategoryId = foundCategory._id;
      } else if (categoryInput === null) {
        resolvedCategoryId = null; // Allow unsetting if schema permits
      }
    }

    // 2. Prepare update data, excluding fields that shouldn't be updated here
    const updateData = { ...productData };
    delete updateData.variants; // *** Crucial: Never update variants array via this service ***
    delete updateData.averageRating; // Managed by review logic
    delete updateData.numberOfReviews; // Managed by review logic
    // Only set category if it was resolved from input
    if (categoryInput !== undefined) {
      updateData.category = resolvedCategoryId;
    } else {
      delete updateData.category; // Don't modify category if not provided
    }

    // 3. Perform the Product update
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators
    })
      .populate("category", "name")
      .populate("brand", "name"); // Populate refs

    if (!updatedProduct) {
      throw new Error("Product not found for update");
    }

    // 4. Update Product Index (ensure this function is compatible)
    await updateProductIndex();

    // 5. Return updated product (without populated variants)
    return updatedProduct.toObject();
  } catch (error) {
    console.error(`Error in updateProductService for ID ${id}:`, error);
    throw new Error(error.message || "Error updating product core details");
  }
};

// --- DELETE PRODUCT (AND VARIANTS) ---
// Deletes a product, its associated variants, and its index entry.
const deleteProductService = async (id) => {
  let session; // Define session variable
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid product ID format");
    }

    // Optional: Use a transaction for multi-document delete
    session = await mongoose.startSession();
    session.startTransaction();

    // 1. Delete the product document
    const deletedProduct = await Product.findByIdAndDelete(id, { session });

    if (!deletedProduct) {
      // If product not found, maybe abort transaction and throw error
      await session.abortTransaction();
      session.endSession();
      throw new Error("Product not found for deletion");
    }

    // 2. Delete associated variants
    const deleteVariantsResult = await Variant.deleteMany(
      { product: id },
      { session }
    );
    console.log(
      `Deleted ${deleteVariantsResult.deletedCount} variants for product ${id}`
    );

    // 3. Delete from ProductIndex
    await ProductIndex.deleteOne({ product: id }, { session });
    console.log(`Deleted ProductIndex entry for product ${id}`);

    // If all steps succeeded, commit the transaction
    await session.commitTransaction();
    session.endSession();

    return deletedProduct.toObject(); // Return data of the deleted product
  } catch (error) {
    // If any error occurred, abort the transaction
    if (session && session.inTransaction()) {
      // Check if session exists and transaction is active
      await session.abortTransaction();
    }
    console.error(`Error in deleteProductService for ID ${id}:`, error);
    throw new Error(error.message || "Error deleting product");
  } finally {
    // End the session if it exists and wasn't already ended
    if (session) {
      session.endSession();
    }
  }
};

const addVariantToProductService = async (productId, variantData) => {
  const session = await mongoose.startSession(); // Use transaction for multi-step operation
  session.startTransaction();
  try {
    // Validate Product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error("Invalid Product ID format.");
    }

    // 1. Find the parent product to ensure it exists
    const product = await Product.findById(productId).session(session);
    if (!product) {
      throw new Error("Parent product not found.");
    }

    // 2. Create the new Variant document
    const newVariant = new Variant({
      ...variantData, // Should contain types, price, stock
      product: productId, // Link to the parent product
    });
    await newVariant.save({ session }); // Save within the transaction

    // 3. Add the new variant's ID to the product's variants array
    await Product.findByIdAndUpdate(
      productId,
      {
        $push: { variants: newVariant._id }, // Add reference to the array
      },
      { session }
    ); // Perform update within the transaction

    // If all steps succeed, commit the transaction
    await session.commitTransaction();
    console.log(`Added Variant ${newVariant._id} to Product ${productId}`);

    // Return the newly created variant (as plain object)
    return newVariant.toObject();
  } catch (error) {
    // If any error occurs, abort the transaction
    await session.abortTransaction();
    console.error(`Error adding variant to product ${productId}:`, error);
    throw error; // Re-throw the error to be caught by the controller
  } finally {
    // Always end the session
    session.endSession();
  }
};

// --- GET PRODUCTS BY CATEGORY ---
// Fetches products matching categories, without populating variant details.
const getProductsByCategoryService = async (categoryIds) => {
  // ... (Implementation from previous response - unchanged) ...
  try {
    const validCategoryIds = categoryIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );
    if (validCategoryIds.length === 0) return [];
    const products = await Product.find({ category: { $in: validCategoryIds } })
      .populate("category", "name")
      .populate("brand", "name")
      .lean();
    return products;
  } catch (error) {
    console.error("Error in getProductsByCategoryService:", error);
    throw new Error("Error finding products by category: " + error.message);
  }
};

// --- SEARCH PRODUCT ---
// Fetches products based on search text/categories, using ProductIndex.
// Does not populate variant details.
const searchProductService = async (searchText, categories = []) => {
  // ... (Implementation from previous response - unchanged, ensure generateCombinations exists) ...
  try {
    // ... (logic using ProductIndex then Product.find) ...
    let productQuery = {};
    const validCategoryIds = categories
      .map((cat) => (typeof cat === "string" ? cat.trim() : cat))
      .filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validCategoryIds.length > 0)
      productQuery.category = { $in: validCategoryIds };

    let finalProductIds = []; // Will store ordered ObjectIds if searching text
    if (
      searchText &&
      typeof searchText === "string" &&
      searchText.trim().length > 0
    ) {
      const keywords = searchText.toLowerCase().trim().split(/\s+/);
      const seenIds = new Set();
      for (let groupSize = keywords.length; groupSize >= 1; groupSize--) {
        const combinations = generateCombinations(keywords, groupSize); // Ensure this helper exists
        const groupConditions = combinations.map((combo) => ({
          $and: combo.map((keyword) => ({
            productIndex: {
              $regex: `(^|[^a-zA-Z0-9])${keyword.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
              )}([^a-zA-Z0-9]|$)`,
              $options: "i",
            },
          })),
        }));
        if (groupConditions.length > 0) {
          const indexResults = await ProductIndex.find(
            { $or: groupConditions },
            { product: 1 }
          ).lean();
          indexResults.forEach((result) => {
            const idStr = result.product.toString();
            if (!seenIds.has(idStr)) {
              seenIds.add(idStr);
              finalProductIds.push(result.product); // Store ObjectId
            }
          });
        }
      }
      if (finalProductIds.length === 0 && validCategoryIds.length === 0)
        return [];
      if (finalProductIds.length > 0)
        productQuery._id = { $in: finalProductIds };
    }

    let products = [];
    // Only query if categories or search results exist
    if (validCategoryIds.length > 0 || finalProductIds.length > 0) {
      products = await Product.find(productQuery)
        .populate("category", "name")
        .populate("brand", "name")
        .lean();
    } else if (!searchText || searchText.trim().length === 0) {
      // No categories and no search text
      return [];
    }

    // Sort results according to search relevance if searchText was used
    if (finalProductIds.length > 0 && products.length > 0) {
      const idOrderMap = new Map();
      finalProductIds.forEach((id, index) =>
        idOrderMap.set(id.toString(), index)
      );
      products.sort((a, b) => {
        const aIndex = idOrderMap.get(a._id.toString());
        const bIndex = idOrderMap.get(b._id.toString());
        if (aIndex === undefined && bIndex === undefined) return 0; // Neither were in search results? keep order
        if (aIndex === undefined) return 1; // a is not in search results, put it after b
        if (bIndex === undefined) return -1; // b is not in search results, put it after a
        return aIndex - bIndex; // Sort by search order
      });
    }
    return products; // Returns products WITHOUT variants populated
  } catch (error) {
    console.error("Error searching products:", error);
    throw new Error("Error searching products: " + error.message);
  }
};

// --- VARIANT-SPECIFIC SERVICES ---

// GET /variants/:variantId
const getVariantByIdService = async (variantId) => {
  if (!mongoose.Types.ObjectId.isValid(variantId)) {
    throw new Error("Invalid Variant ID format");
  }
  // Optionally populate product name for context
  const variant = await Variant.findById(variantId)
    .populate("product", "name")
    .lean();
  if (!variant) {
    throw new Error("Variant not found.");
  }
  return variant;
};

// PATCH /variants/:variantId
const updateVariantService = async (variantId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(variantId)) {
    throw new Error("Invalid Variant ID format");
  }
  // Prevent changing the parent product via this route
  delete updateData.product;
  // Add any other protected fields for variants

  const updatedVariant = await Variant.findByIdAndUpdate(
    variantId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  ).lean(); // Use lean if returning plain object

  if (!updatedVariant) {
    throw new Error("Variant not found for update.");
  }
  // Potential: Trigger ProductIndex update if variant price change affects indexed price
  // await updateProductIndex(updatedVariant.product);
  return updatedVariant;
};

// DELETE /variants/:variantId
const deleteVariantService = async (variantId) => {
  if (!mongoose.Types.ObjectId.isValid(variantId)) {
    throw new Error("Invalid Variant ID format");
  }
  // Find the variant first to get its product ID
  const variantToDelete = await Variant.findByIdAndDelete(variantId);
  if (!variantToDelete) {
    throw new Error("Variant not found for deletion.");
  }
  // Remove the reference from the parent Product's variants array
  await Product.findByIdAndUpdate(variantToDelete.product, {
    $pull: { variants: variantId }, // Remove the specific variant ID from the array
  });
  console.log(
    `Removed variant ref ${variantId} from product ${variantToDelete.product}`
  );

  // Potential: Trigger ProductIndex update
  // await updateProductIndex(variantToDelete.product);

  return variantToDelete; // Return the deleted variant data
};

// PATCH /variants/:variantId/stock (Example specific update)
const updateVariantStockService = async (variantId, stockChange) => {
  if (!mongoose.Types.ObjectId.isValid(variantId)) {
    throw new Error("Invalid Variant ID format");
  }
  if (typeof stockChange !== "number") {
    throw new Error("Stock change must be a number");
  }

  // Use $inc to safely adjust stock
  const updatedVariant = await Variant.findByIdAndUpdate(
    variantId,
    { $inc: { stock: stockChange } }, // Increment/decrement stock
    { new: true, runValidators: true } // Return updated, validate (e.g., min: 0)
  );
  if (!updatedVariant) throw new Error("Variant not found for stock update.");

  // Check if stock went negative if your business logic forbids it
  if (updatedVariant.stock < 0) {
    // Optional: Rollback the change if stock cannot be negative
    await Variant.findByIdAndUpdate(variantId, {
      $inc: { stock: -stockChange },
    }); // Revert
    throw new Error("Stock cannot be negative. Update reverted.");
    // Or just log a warning / handle differently
  }
  return updatedVariant;
};

const getProductsSortedByPriceService = async (sortOrder = -1, limit = 1) => {
  try {
    logger.debug(
      `Sorting products by effective price: order=${sortOrder}, limit=${limit}`
    ); //

    const aggregationPipeline = [
      // Stage 1: Lấy thông tin các variants liên quan
      {
        $lookup: {
          from: "variants", // Tên collection của variants
          localField: "variants", // Trường chứa array ObjectId trong Product
          foreignField: "_id", // Trường _id trong Variant
          as: "variantDetails", // Tên mảng mới chứa thông tin variants
        },
      },
      // Stage 2: "Mở" mảng variantDetails, giữ lại SP không có variant
      {
        $unwind: {
          path: "$variantDetails",
          preserveNullAndEmptyArrays: true, // Quan trọng: Giữ lại SP không có variant nào
        },
      },
      // Stage 3: Nhóm theo sản phẩm để tìm giá cao/thấp nhất của variant (hoặc giữ base_price)
      {
        $group: {
          _id: "$_id", // Nhóm theo Product ID
          name: { $first: "$name" },
          category: { $first: "$category" }, // Giữ lại ID để populate sau
          brand: { $first: "$brand" }, // Giữ lại ID để populate sau
          // Tìm giá cao nhất/thấp nhất trong các variant của SP này
          extremeVariantPrice:
            sortOrder === -1
              ? { $max: "$variantDetails.price" } // Tìm giá variant cao nhất nếu sort descending
              : { $min: "$variantDetails.price" }, // Tìm giá variant thấp nhất nếu sort ascending
          base_price: { $first: "$base_price" }, // Giữ lại base_price
          // Thêm các trường khác của Product bạn muốn giữ lại với $first
        },
      },
      // Stage 4: Xác định giá hiệu dụng để sắp xếp
      // Ưu tiên giá variant nếu nó tồn tại và hợp lệ, nếu không dùng base_price
      {
        $addFields: {
          effectivePrice: {
            $ifNull: ["$extremeVariantPrice", "$base_price"],
            // Logic phức tạp hơn có thể cần:
            // $cond: {
            //    if: { $and: [ { $ne: ["$extremeVariantPrice", null] }, { $gte: ["$extremeVariantPrice", 0] } ] },
            //    then: "$extremeVariantPrice",
            //    else: "$base_price"
            // }
          },
        },
      },
      // Stage 5: Lọc bỏ những sản phẩm không xác định được giá
      {
        $match: {
          effectivePrice: { $ne: null, $exists: true },
        },
      },
      // Stage 6: Sắp xếp theo giá hiệu dụng
      {
        $sort: {
          effectivePrice: sortOrder, // -1 cho cao nhất, 1 cho thấp nhất
        },
      },
      // Stage 7: Giới hạn số lượng kết quả
      {
        $limit: limit,
      },
      // --- TÙY CHỌN: Populate Category/Brand sau khi aggregate ---
      // Stage 8: Lookup Category
      {
        $lookup: {
          from: "categories", // Tên collection categories
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      // Stage 9: Lookup Brand
      {
        $lookup: {
          from: "brands", // Tên collection brands
          localField: "brand",
          foreignField: "_id",
          as: "brandInfo",
        },
      },
      // Stage 10: Định dạng lại output, lấy tên category/brand
      {
        $project: {
          _id: 1,
          name: 1,
          effectivePrice: 1, // Giữ lại giá đã dùng để sort
          base_price: 1, // Có thể giữ hoặc bỏ
          category: { $arrayElemAt: ["$categoryInfo.name", 0] }, // Lấy tên category
          brand: { $arrayElemAt: ["$brandInfo.name", 0] }, // Lấy tên brand
          // Thêm các trường khác nếu cần
        },
      },
    ];

    const products = await Product.aggregate(aggregationPipeline);
    logger.debug(
      `Aggregation result for extreme products: ${JSON.stringify(products)}`
    ); //

    return products; // Trả về mảng sản phẩm đã aggregate và sort
  } catch (error) {
    logger.error(
      `Error getting products sorted by price (aggregation): ${error.message}`,
      error
    ); //
    throw error;
  }
};

/**
 * Đếm số lượng sản phẩm thuộc một danh mục dựa trên tên.
 * @param {string} categoryName - Tên danh mục cần đếm.
 * @returns {Promise<number>} - Số lượng sản phẩm tìm được.
 */
const countProductsByCategoryService = async (categoryName) => {
  try {
    if (
      !categoryName ||
      typeof categoryName !== "string" ||
      categoryName.trim() === ""
    ) {
      logger.warn(`Invalid categoryName provided for count: ${categoryName}`);
      return 0; // Trả về 0 nếu tên danh mục không hợp lệ
    }

    // Tìm ID của danh mục dựa trên tên (không phân biệt hoa/thường)
    const category = await Category.findOne({
      name: { $regex: new RegExp(`^${categoryName.trim()}$`, "i") },
    }).lean();

    if (!category) {
      // Không tìm thấy danh mục nào khớp với tên
      logger.info(`Category not found for count by name: "${categoryName}"`);
      return 0; // Trả về 0 nếu không tìm thấy danh mục
    }

    // Đếm số lượng sản phẩm thuộc danh mục đó
    const count = await Product.countDocuments({
      category: category._id, // Lọc theo ID của category tìm được
    });

    logger.info(
      `Counted ${count} products in category "${categoryName}" (ID: ${category._id})`
    );
    return count; // Trả về số lượng
  } catch (error) {
    logger.error(
      `Error in countProductsByCategoryService for name "${categoryName}": ${error.message}`,
      error
    );
    throw new Error("Error counting products by category: " + error.message);
  }
};

// --- RENAMED/UPDATED: LIST PRODUCTS BY CATEGORY ---
// Hàm này được sửa đổi từ getProductsByCategoryService trước đó
/**
 * Lấy danh sách sản phẩm (có giới hạn) thuộc một danh mục dựa trên tên.
 * @param {string} categoryName - Tên danh mục cần tìm.
 * @param {number} [limit=5] - Số lượng sản phẩm tối đa.
 * @returns {Promise<Array>} - Mảng các sản phẩm tìm được.
 */
const listProductsByCategoryService = async (categoryName, limit = 5) => {
  try {
    if (
      !categoryName ||
      typeof categoryName !== "string" ||
      categoryName.trim() === ""
    ) {
      logger.warn(`Invalid categoryName provided for list: ${categoryName}`);
      return []; // Trả về mảng rỗng nếu tên danh mục không hợp lệ
    }

    // Bước 1: Tìm ID của danh mục dựa trên tên
    const category = await Category.findOne({
      name: { $regex: new RegExp(`^${categoryName.trim()}$`, "i") },
    }).lean();

    if (!category) {
      // Không tìm thấy danh mục nào khớp với tên
      logger.info(`Category not found for list by name: "${categoryName}"`);
      return []; // Trả về mảng rỗng nếu không tìm thấy danh mục
    }

    // Bước 2: Tìm các sản phẩm thuộc danh mục đó
    const productLimit =
      limit && Number.isInteger(limit) && limit > 0 ? limit : 5;

    const products = await Product.find({
      category: category._id, // Lọc theo ID của category tìm được
    })
      .limit(productLimit) // Áp dụng giới hạn số lượng
      .populate("category", "name") // Populate chỉ trường name
      .populate("brand", "name") // Populate chỉ trường name
      .lean(); // Sử dụng lean() để chỉ lấy plain JavaScript object

    // Làm sạch dữ liệu trả về giống như trong listAllProducts
    const summarizedProducts = products.map((p) => ({
      id: p._id,
      name: p.name,
      base_price: p.base_price,
      category: p.category?.name, // Đảm bảo truy cập an toàn
      brand: p.brand?.name, // Đảm bảo truy cập an toàn
      // Thêm các trường khác bạn muốn hiển thị cho Assistant
    }));

    logger.info(
      `Found ${summarizedProducts.length} products for category "${categoryName}" (ID: ${category._id}) with limit ${limit}`
    );
    return summarizedProducts; // Trả về mảng sản phẩm đã tóm tắt
  } catch (error) {
    logger.error(
      `Error in listProductsByCategoryService for name "${categoryName}": ${error.message}`,
      error
    );
    // Ném lỗi để hàm gọi (handleRequiredActions) có thể bắt và báo lại cho Assistant
    throw new Error("Error finding products by category: " + error.message);
  }
};

// Get products by price range
const getProductsByPriceRangeService = async (minPrice = 0, maxPrice = Number.MAX_SAFE_INTEGER) => {
  try {
    const query = { base_price: { $gte: minPrice } };

    if (maxPrice !== Number.MAX_SAFE_INTEGER && maxPrice !== undefined) {
      query.base_price.$lte = maxPrice;
    }

    const products = await Product.find(query)
      .populate("category", "name")
      .populate("brand", "name")
      .sort({ base_price: 1 })
      .lean();

    return products;
  } catch (error) {
    logger.error(`Error in getProductsByPriceRangeService: ${error.message}`);
    throw error;
  }
};

// Search products by both price range and needs/keywords
const searchProductsByPriceAndNeedsService = async (minPrice = 0, maxPrice = Number.MAX_SAFE_INTEGER, keywords) => {
  try {
    // Create text search query for keywords
    const textQuery = keywords ?
      {
        $or: [
          { name: { $regex: keywords, $options: 'i' } },
          { description: { $regex: keywords, $options: 'i' } },
          { "specifications.description": { $regex: keywords, $options: 'i' } },
          { "features": { $regex: keywords, $options: 'i' } }
        ]
      } : {};

    // Create price range query
    const priceQuery = { base_price: { $gte: minPrice } };
    if (maxPrice !== Number.MAX_SAFE_INTEGER && maxPrice !== undefined) {
      priceQuery.base_price.$lte = maxPrice;
    }

    // Combine both queries
    const query = {
      ...textQuery,
      ...priceQuery
    };

    const products = await Product.find(query)
      .populate("category", "name")
      .populate("brand", "name")
      .sort({ base_price: 1 })
      .lean();

    return products;
  } catch (error) {
    logger.error(`Error in searchProductsByPriceAndNeedsService: ${error.message}`);
    throw error;
  }
};

// --- GET FEATURED PRODUCTS ---
// Trả về các sản phẩm nổi bật dựa trên các tiêu chí như lượt đánh giá cao, bán chạy, hoặc sản phẩm mới
const getFeaturedProductsService = async (limit = 3) => {
  try {
    // Giới hạn số lượng sản phẩm được trả về
    const limitNum = parseInt(limit, 10) || 3;

    // Lấy danh sách sản phẩm sắp xếp theo độ phổ biến và đánh giá
    const featuredProducts = await Product.find({})
      .sort({
        averageRating: -1, // Sắp xếp theo đánh giá cao nhất
        numberOfReviews: -1 // Ưu tiên sản phẩm có nhiều đánh giá
      })
      .limit(limitNum)
      .populate("category", "name")
      .populate("brand", "name")
      .lean();

    return featuredProducts;
  } catch (error) {
    console.error("Error in getFeaturedProductsService:", error);
    throw new Error("Error getting featured products: " + error.message);
  }
};

// ... (Phần còn lại của file productService.js, đảm bảo export hàm mới)

module.exports = {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  getProductsByNameService,
  updateProductService,
  deleteProductService,
  getProductsByCategoryService,
  searchProductService,
  // Variant services
  getVariantByIdService,
  addVariantToProductService,
  updateVariantService,
  deleteVariantService,
  updateVariantStockService,
  //
  getProductsSortedByPriceService,
  listProductsByCategoryService,
  countProductsByCategoryService,
  getProductsByPriceRangeService,
  searchProductsByPriceAndNeedsService,
  getFeaturedProductsService,
};
