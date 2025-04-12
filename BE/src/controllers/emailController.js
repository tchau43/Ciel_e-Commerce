// src/controllers/emailController.js
const { sendEmail } = require('../config/mailer'); // Adjust path as needed

// Controller function to handle sending payment confirmation
const sendPaymentConfirmationEmail = async (req, res) => {
    // **SECURITY NOTE**: In a production environment, you should **ALWAYS** verify
    // the payment status server-side using a webhook from Stripe or by querying
    // the Stripe API with an ID provided by the client.
    // Do NOT rely solely on the client telling you the payment was successful.
    console.log('API call received to send payment confirmation email.');

    // Extract necessary data from the request body sent by the frontend
    const { userEmail, orderId, items, totalAmount } = req.body;

    // Basic validation
    if (!userEmail || !orderId || !items || totalAmount === undefined) {
        console.warn('Missing required fields for payment confirmation email:', req.body);
        return res.status(400).json({ message: 'Missing required fields: userEmail, orderId, items, totalAmount' });
    }

    // Construct email content (customize as needed)
    const mailOptions = {
        to: userEmail,
        subject: `Order Confirmation - #${orderId}`,
        text: `Hello,\n\nThank you for your order #${orderId}!\n\nYour payment of $${totalAmount.toFixed(2)} has been processed successfully.\n\nOrder Summary:\n${items.map(item => `- ${item.name} (Qty: ${item.quantity})`).join('\n')}\n\nWe appreciate your business!\nYour Company Name`,
        html: `
            <h1>Order Confirmation</h1>
            <p>Hello,</p>
            <p>Thank you for your order <strong>#${orderId}</strong>!</p>
            <p>Your payment of <strong>$${totalAmount.toFixed(2)}</strong> has been processed successfully.</p>
            <h2>Order Summary:</h2>
            <ul>
                ${items.map(item => `<li>${item.name} (Qty: ${item.quantity})</li>`).join('')}
            </ul>
            <p>We appreciate your business!</p>
            <p><strong>Your Company Name</strong></p>
        `,
    };

    try {
        await sendEmail(mailOptions);
        res.status(200).json({ message: 'Confirmation email sent successfully.' });
    } catch (error) {
        // Error logging is handled within sendEmail, just send response here
        res.status(500).json({ message: 'Failed to send confirmation email.' });
    }
};

module.exports = {
    sendPaymentConfirmationEmail,
    // Add other email-related controller functions here if needed
};