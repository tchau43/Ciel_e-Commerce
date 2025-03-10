const { createInvoiceService } = require("../services/invoiceService");

const createInvoice = async (req, res) => {
    const { userId, productsList, payment, address } = req.body
    try {
        // Call the service function to create the invoice
        const data = await createInvoiceService(userId, productsList, payment, address);

        // Send the response back
        res.status(201).json({
            message: "Invoice created successfully",
            invoice: data
        });
    } catch (error) {
        // Handle errors gracefully
        res.status(500).json({ message: error.message });
    }
}

module.exports = { createInvoice };
