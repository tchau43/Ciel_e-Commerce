// controllers/invoiceController.js
const { createInvoiceService, getInvoiceService } = require("../services/invoiceService");

const createInvoice = async (req, res) => {
    // Destructure according to the updated InvoiceRequest type
    const { userId, productsList, paymentMethod, shippingAddress } = req.body; // <-- Updated names

    // Basic validation (add more as needed)
    if (!userId || !productsList || !paymentMethod || !shippingAddress) {
        return res.status(400).json({ message: "Missing required invoice fields." });
    }

    try {
        const data = await createInvoiceService(
            userId,
            productsList,
            paymentMethod, // <-- Pass paymentMethod
            shippingAddress // <-- Pass shippingAddress object
        );

        res.status(201).json({
            message: "Invoice created successfully",
            invoice: data, // Send back the created invoice data
        });
    } catch (error) {
        // Log the specific error on the server
        console.error("Invoice Creation Error:", error);
        // Send a generic error message to the client
        res.status(500).json({ message: error.message || "Failed to create invoice." });
    }
};

// getInvoice remains the same structurally
const getInvoice = async (req, res) => {
    const { userId } = req.params;
    try {
        const data = await getInvoiceService(userId);
        // Send 200 OK for successful retrieval
        res.status(200).json(data); // Changed status to 200
    } catch (error) {
        console.error("Get Invoice Error:", error);
        res.status(500).json({ message: error.message || "Failed to get invoices." });
    }
};

module.exports = { createInvoice, getInvoice };