// controllers/userController.js (Modified based on your code)

const {
  createUserService,
  userLoginService,
  getAllUsersService,
  updateUserbyIdService,
  getUserByIdService,
  getUsersPurchasedDetailService,
} = require("../services/userService"); // Your provided service imports
const { getInvoiceService } = require("../services/invoiceService"); // Keep if getUserPurchased uses it directly
const mongoose = require('mongoose'); // For ObjectId validation

const createUser = async (req, res) => {
  const { name, email, password, address, phoneNumber } = req.body; // Include optional fields
  try {
    // --- Input Validation ---
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: "Valid name is required." });
    }
    if (typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Valid email format is required." });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }
    // --- End Validation ---

    // Prepare data object for service
    const userData = { name: name.trim(), email, password, address, phoneNumber };

    const data = await createUserService(userData); // Pass object to service

    if (data === null) {
      // Assuming null means duplicate email based on your service logic
      return res.status(400).json({ message: "Email already exists." });
    }

    // Exclude password from response
    const { password: removedPassword, ...userResponse } = data.toObject ? data.toObject() : data; // Handle potential plain object return

    res.status(201).json({ message: "User created successfully", user: userResponse }); // Use 201 Created

  } catch (error) { // Catch errors thrown by the service (e.g., validation)
    console.error("Error in createUser controller:", error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: `Registration failed: ${error.message}` });
    } else {
      res.status(500).json({ message: error.message || "Failed to register user." });
    }
  }
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const data = await userLoginService(email, password);

    // Check the EC code returned by your service
    if (data && data.EC === 0) {
      res.status(200).json({ message: "Login successful", ...data }); // Spread the success data
    } else {
      // Use 401 Unauthorized for login failures
      res.status(401).json({ message: data.EM || "Invalid email or password." });
    }
  } catch (error) {
    console.error("Error in userLogin controller:", error);
    res.status(500).json({ message: "Login failed due to a server error." });
  }
};

const getAllUsers = async (req, res) => {
  // NOTE: This fetches ALL users. Add pagination via req.query if needed later
  // const { page = 1, limit = 10, sort = 'createdAt:desc', ...filters } = req.query;
  try {
    const data = await getAllUsersService(); // Pass query params if service supports them
    if (data === null) {
      // Service returned null on error based on its pattern
      throw new Error("Service failed to retrieve users.");
    }
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in getAllUsers controller:", error);
    res.status(500).json({ message: error.message || "Failed to retrieve users." });
  }
};

const getUserById = async (req, res) => {
  try {
    const requestedUserId = req.params.id;
    const authenticatedUser = req.user; // From verifyToken

    // --- Validation & Security ---
    if (!mongoose.Types.ObjectId.isValid(requestedUserId)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }
    if (!authenticatedUser?._id) {
      return res.status(401).json({ message: "Authentication error." });
    }
    if (authenticatedUser._id.toString() !== requestedUserId && authenticatedUser.role !== 'ADMIN') {
      return res.status(403).json({ message: "Forbidden: Cannot access this user's profile." });
    }
    // --- End Checks ---

    const data = await getUserByIdService(requestedUserId);

    if (data === null) {
      return res.status(404).json({ message: "User not found." });
    }

    // Ensure password is not sent back
    const { password, ...userResponse } = data.toObject ? data.toObject() : data;
    res.status(200).json(userResponse);

  } catch (error) {
    console.error(`Error fetching user ${req.params.id}:`, error);
    res.status(500).json({ message: "Failed to retrieve user profile." });
  }
};

const updateUserbyId = async (req, res) => {
  // NOTE: This route is ADMIN only based on router setup
  const { id } = req.params; // ID of user to update
  const updateData = req.body; // Contains fields to update { name?, status?, role? }

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    // --- Sanitize & Validate updateData ---
    const sanitizedData = {};
    if (updateData.name !== undefined) {
      if (typeof updateData.name === 'string' && updateData.name.trim().length > 0) {
        sanitizedData.name = updateData.name.trim();
      } else { return res.status(400).json({ message: "Invalid name provided." }); }
    }
    // **DO NOT UPDATE EMAIL HERE** - requires verification flow usually
    // if (updateData.email ... ) { ... }

    if (updateData.status !== undefined) {
      if (typeof updateData.status === 'boolean') {
        sanitizedData.status = updateData.status;
      } else { return res.status(400).json({ message: "Status must be true or false." }); }
    }
    if (updateData.role !== undefined) {
      const allowedRoles = ['CUSTOMER', 'ADMIN']; // Update if you have more roles
      if (allowedRoles.includes(updateData.role)) {
        sanitizedData.role = updateData.role;
      } else { return res.status(400).json({ message: `Invalid role. Allowed: ${allowedRoles.join(', ')}` }); }
    }
    // Exclude password explicitly
    delete sanitizedData.password;
    delete sanitizedData._id;
    // --- End Sanitization ---

    if (Object.keys(sanitizedData).length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update." });
    }

    // Call service with the sanitized data object
    const updatedUser = await updateUserbyIdService(id, sanitizedData);

    if (updatedUser === null) {
      return res.status(404).json({ message: "User not found or update failed." });
    }

    // Service should return updated user without password
    res.status(200).json({ message: "User updated successfully", user: updatedUser });

  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: `User update validation failed: ${error.message}` });
    } else {
      res.status(500).json({ message: error.message || "Failed to update user." });
    }
  }
};

const getUserPurchased = async (req, res) => {
  // This uses your original logic but adds validation & security
  try {
    const requestedUserId = req.params.userId;
    const authenticatedUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(requestedUserId)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }
    if (!authenticatedUser?._id) {
      return res.status(401).json({ message: "Authentication error." });
    }

    // Security Check
    if (authenticatedUser._id.toString() !== requestedUserId && authenticatedUser.role !== 'ADMIN') {
      return res.status(403).json({ message: "Forbidden: Cannot access another user's purchase history." });
    }

    // Use the invoice service to get relevant invoices for the user
    // Ensure getInvoiceService populates product and category correctly
    const invoices = await getInvoiceService(requestedUserId); // Service should handle "not found" gracefully

    const purchasedProducts = [];
    invoices.forEach((invoice) => {
      // Only process 'delivered' orders for purchase history? Or 'paid'? Add filter if needed.
      // if (invoice.orderStatus === 'delivered') {
      invoice.items.forEach((item) => {
        // Ensure nested data exists before accessing _id
        if (item.product?._id && item.product?.category?._id) {
          purchasedProducts.push({
            productId: item.product._id,
            categoryId: item.product.category._id,
          });
        } else {
          console.warn(`Skipping item in invoice ${invoice._id} due to missing product/category data during populate.`);
        }
      });
      // }
    });
    // console.log("-------------------------------CONTROLLER: Purchased products:", purchasedProducts);
    // Optionally de-duplicate the list if needed, though repeats might be intended
    // const uniquePurchases = Array.from(new Map(purchasedProducts.map(item => [item.productId.toString(), item])).values());

    res.status(200).json(purchasedProducts);

  } catch (error) {
    console.error(`Error fetching purchased products for user ${req.params.userId}:`, error);
    res.status(500).json({ message: error.message || "Failed to retrieve purchase history." });
  }
};

const getUsersPurchasedDetail = async (req, res) => {
  // Admin only route
  try {
    const purchases = await getUsersPurchasedDetailService(); // Service aggregates data
    if (purchases === null) {
      throw new Error("Service failed to retrieve purchase details.");
    }
    res.status(200).json(purchases);
  } catch (error) {
    console.error("Error getting all user purchases detail:", error);
    res.status(500).json({ message: error.message || "Failed to retrieve purchase details." });
  }
};

module.exports = {
  createUser,
  userLogin,
  getAllUsers,
  getUserById,
  updateUserbyId,
  getUserPurchased,
  getUsersPurchasedDetail
};