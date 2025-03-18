const Category = require("../models/category");
const { Product, ProductIndex } = require("../models/product");
const { generateCombinations } = require("../utils/helper");
const { createCategoryService } = require("./categoryService");
const { updateProductIndex } = require("./updateDb/updateProduct");
const mongoose = require("mongoose");

const createProductService = async (productData) => {
  try {
    const categoryName = productData.category;
    let category = await Category.findOne({ name: categoryName });

    if (!category) {
      category = await createCategoryService({
        name: categoryName,
        description: "Default description for " + categoryName,
      });
    }

    const newProduct = new Product({
      ...productData,
      category: category._id,
    });
    await newProduct.save();
    return newProduct.populate("category");
  } catch (error) {
    throw new Error("Error creating product: " + error.message);
  }
};

const getAllProductsService = async (sort) => {
  try {
    let sortOption = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortOption[field] = order === 'desc' ? -1 : 1;
    }
    const products = await Product.find({}).sort(sortOption).populate("category")
    // console.log("ids", ids)
    updateProductIndex()
    return products
  } catch (error) {
    throw new Error("Error getting products: " + error.message);
  }
};


const getProductByIdService = async (id) => {
  try {
    const product = await Product.findById(id).populate("category");
    console.log(">>>>>>>>>>>>product", product)
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  } catch (error) {
    throw new Error("Error creating product: " + error.message);
  }
};

const getProductsByNameService = async (name) => {
  try {
    const products = await Product.find({
      name: { $regex: name, $options: "i" }
    });
    console.log(">>>>>>>>>>>>products", products)

    if (products.length === 0) {
      throw new Error("No products found with that name");
    }

    return products;
  } catch (error) {
    throw new Error("Error fetching products by name: " + error.message);
  }
};

const updateProductService = async (id, productData) => {
  try {
    const product = await Product.findByIdAndUpdate(id, productData, {
      new: true,
      runValidators: true,
    }).populate("category");
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  } catch (error) {
    throw new Error("Error creating product: " + error.message);
  }
};

const deleteProductService = async (id) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      throw new Error("Product not found");
    }
    return deletedProduct;
  } catch (error) {
    throw new Error("Error deleting product: " + error.message);
  }
};

const getProductsByCategoryService = async (categories) => {
  try {
    // Find products where the category matches any of the categoryIds
    // const products = await Product.find({ category: { $in: categories } });
    const products = await Product.find({
      category: { $in: categories },
    }).populate("category");

    if (products.length === 0) {
      return [];
    }

    return products;
  } catch (error) {
    console.error(error);
    throw new Error("Error founding product by category: " + error.message);
  }
};

// const searchProductService = async (searchText, categories = []) => {
//   try {
//     const query = {};

//     // Add search conditions only if searchText exists
//     if (searchText) {
//       query.$or = [
//         { name: { $regex: searchText, $options: "i" } },
//         { description: { $regex: searchText, $options: "i" } },
//         { "category.name": { $regex: searchText, $options: "i" } }
//       ];
//       const numericValue = parseFloat(searchText);
//       if (!isNaN(numericValue)) {
//         // Add price condition to $or array
//         query.$or.push({ price: { $lte: numericValue } });
//       }
//     }

//     // Add category filter if categories are provided
//     if (categories.length > 0) {
//       query.category = { $in: categories };
//     }

//     const products = await Product.find(query).populate("category");
//     return products;
//   } catch (error) {
//     console.error(error);
//     throw new Error("Error searching products: " + error.message);
//   }
// };

const searchProductService1 = async (searchText, categories = []) => {
  try {
    const productQuery = {};
    const query = {};

    if (categories.length > 0) {
      query.category = { $in: categories };
    }

    // Initialize query.$and
    if (!query.$and) {
      query.$and = [];  // Ensure query.$and is always an array
    }

    const keywords = searchText ? searchText.toLowerCase().split(/\s+/) : [];
    // console.log(">>>>>>>>keywords", keywords)

    // 2. Generate all keyword combinations (3-word, 2-word, 1-word)
    const combinations = [];
    for (let groupSize = keywords.length; groupSize >= 1; groupSize--) {
      const groups = generateCombinations(keywords, groupSize);
      combinations.push(...groups);
    }
    // console.log(">>>>>>>>combinations", combinations)

    // 3. Build regex conditions for ProductIndex
    const regexConditions = [];
    for (const combo of combinations) {
      console.log(">>>>>>>>>>>>combo", combo)
      for (const item of combo) {
        console.log(">>>>>>>>>>>>item", item)
        // regexConditions.push({ productIndex: { $regex: item, $options: "i" } });
        const products = await ProductIndex.find({ productIndex: { $regex: item, $options: "i" } })
        console.log(">>>>>>>>>>>>products", products)
      }
    }

    if (regexConditions.length > 0) {
      query.$and.push(...regexConditions);
    }
    // console.log(">>>>>>>>>>>>regexConditions", regexConditions)
    // const products = await ProductIndex.find(query);
    // console.log(">>>>>>>>>>>>products", products)


    // 4. Add price condition if searchText is numeric
    // const numericValue = parseFloat(searchText);
    // if (!isNaN(numericValue)) {
    //   indexConditions.push({ price: { $lte: numericValue } });
    // }

    // 5. Query ProductIndex
    // const productIndexQuery = { $or: indexConditions };
    // const productIndexes = indexConditions.length > 0
    //   ? await ProductIndex.find(productIndexQuery)
    //   : [];

    // // 6. Get unique product IDs from matches
    // const productIds = [...new Set(productIndexes.map(pi => pi.product.toString()))];

    // // 7. Build final Product query
    // if (productIds.length > 0) {
    //   productQuery._id = { $in: productIds.map(id => new mongoose.Types.ObjectId(id)) };
    // } else if (searchText) {
    //   return []; // No matches found
    // }

    // // 8. Add category filter
    // if (categories.length > 0) {
    //   productQuery.category = { $in: categories };
    // }

    // // 9. Fetch and return products (sorted by relevance)
    // // const products = await Product.find(productQuery).populate("category");

    // // Sort by number of matched keywords (3-word > 2-word > 1-word)
    // products.sort((a, b) => {
    //   const aIndex = productIndexes.find(pi => pi.product.equals(a._id))?.productIndex || '';
    //   const bIndex = productIndexes.find(pi => pi.product.equals(b._id))?.productIndex || '';
    //   return countMatchedKeywords(bIndex, keywords) - countMatchedKeywords(aIndex, keywords);
    // });

    return products;
  } catch (error) {
    console.error(error);
    throw new Error("Error searching products: " + error.message);
  }
};


const searchProductService2 = async (searchText, categories = []) => {
  try {
    const query = {};

    // Handle category filter
    if (categories.length > 0) {
      query.category = { $in: categories };
    }

    // Split search text into keywords
    const keywords = searchText ? searchText.toLowerCase().split(/\s+/) : [];
    console.log(">>>>>>>> keywords", keywords);

    let productIds = [];

    if (keywords.length > 0) {
      // Generate all combinations (3-word, 2-word, 1-word)
      const combinations = [];
      for (let groupSize = keywords.length; groupSize >= 1; groupSize--) {
        combinations.push(...generateCombinations(keywords, groupSize));
      }
      console.log(">>>>>>>> combinations", combinations);

      // Build search conditions for ProductIndex
      const indexConditions = combinations.map(combo => ({
        $and: combo.map(keyword => ({
          productIndex: {
            $regex: `(^|_)${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|_)`,
            $options: 'i'
          }
        }))
      }));

      // Add price condition if search text is numeric
      const numericValue = parseFloat(searchText);
      if (!isNaN(numericValue)) {
        indexConditions.push({ price: { $lte: numericValue } });
      }

      const combinedQuery = {
        ...query, // Include category filter
        $or: indexConditions // Add keyword and price conditions
      };

      // Search ProductIndex with the combined query
      const productIndexResults = await ProductIndex.find(combinedQuery);


      // Get unique product IDs and preserve order
      const seenIds = new Set();
      productIds = productIndexResults
        .map(result => result.product.toString())
        .filter(id => {
          if (seenIds.has(id)) return false;
          seenIds.add(id);
          return true;
        });
    }

    // Add product IDs to query
    // if (productIds.length > 0) {
    //   query._id = { $in: productIds.map(id => new mongoose.Types.ObjectId(id)) };
    // } else if (searchText) {
    //   return [];
    // }

    // Get final products
    let products = await Product.find({ _id: { $in: productIds } }).populate("category");

    // Sort results by match priority
    // products.sort((a, b) => {
    //   // Get index of first occurrence in productIds array
    //   const aIndex = productIds.indexOf(a._id.toString());
    //   const bIndex = productIds.indexOf(b._id.toString());
    //   return aIndex - bIndex;
    // });

    return products;
  } catch (error) {
    console.error(error);
    throw new Error("Error searching products: " + error.message);
  }
};

const searchProductService = async (searchText, categories = []) => {
  try {
    let query = {};

    // Handle category filter
    if (categories.length > 0) {
      query.category = { $in: categories };
    }

    // Split search text into keywords
    const keywords = searchText ? searchText.toLowerCase().split(/\s+/) : [];

    const seenIds = new Set();
    const productIds = [];

    if (keywords.length > 0) {
      // Process combinations from largest to smallest
      for (let groupSize = keywords.length; groupSize >= 1; groupSize--) {
        const combinations = generateCombinations(keywords, groupSize);

        const groupConditions = combinations.map(combo => ({
          $and: combo.map(keyword => ({
            productIndex: {
              $regex: `(^|_)${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|_)`,
              $options: 'i'
            }
          }))
        }));
        // console.log(">>>>>>>> groupConditions", groupConditions);
        // console.log(">>>>>>>> query", query);

        if (groupConditions.length === 0) continue;

        const results = await ProductIndex.find({ $or: groupConditions });

        // Add new unique IDs in order of discovery
        results.forEach(result => {
          const idStr = result.product.toString();
          if (!seenIds.has(idStr)) {
            seenIds.add(idStr);
            productIds.push(idStr);
          }
        });
      }
    }
    if (productIds.length > 0) {
      query._id = { $in: productIds };
    }
    console.log(">>>>>>>> query", query);

    // Get final products and sort by priority
    let products = [];
    if (productIds.length > 0 || categories.length > 0) {
      products = await Product.find(query).populate("category");
      // Get all matching products
      // products = await Product.find({
      //   _id: { $in: productIds }
      // }).populate("category");

      // Create a map for efficient lookups
      const idMap = new Map();
      productIds.forEach((id, index) => idMap.set(id, index));
      // console.log(">>>>>>>> idMap", idMap);


      // Sort products based on their position in productIds array
      products.sort((a, b) => {
        const aIndex = idMap.get(a._id.toString());
        const bIndex = idMap.get(b._id.toString());
        return aIndex - bIndex;
      });
    }

    return products;
  } catch (error) {
    console.error(error);
    throw new Error("Error searching products: " + error.message);
  }
};

module.exports = {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  getProductsByNameService,
  updateProductService,
  deleteProductService,
  getProductsByCategoryService,
  searchProductService,
};
