// src/controllers/emailController.js
const mongoose = require('mongoose');
const { sendEmail } = require("../config/mailer"); // Path to your mailer config
const Invoice = require('../models/invoice');     // Path to your Invoice model
// Optional: Helper for formatting currency or dates
const { formatCurrencyVND } = require('../utils/helper'); // Adjust path if needed

/**
 * Controller to trigger sending a payment/order confirmation email.
 * Fetches invoice details by ID and sends email to the user associated with the invoice.
 */
const sendPaymentConfirmationEmail = async (req, res) => {
  console.log("API call received for sendPaymentConfirmationEmail");
  const { invoiceId } = req.body; // Expecting invoiceId from the trigger

  // 1. Validate Input
  if (!invoiceId || !mongoose.Types.ObjectId.isValid(invoiceId)) {
    console.warn("Missing or invalid invoiceId for payment confirmation email:", invoiceId);
    return res.status(400).json({ message: "Missing or invalid required field: invoiceId" });
  }

  try {
    // 2. Fetch Populated Invoice Data directly here
    // Ensure all necessary fields for the email are populated
    const invoice = await Invoice.findById(invoiceId)
      .populate({ path: "user", select: "name email" }) // Essential: Populate user name and email
      .populate({ // Populate product details
        path: "items.product",
        select: "name images base_price", // Select fields needed for email
      })
      .populate({ // Populate variant details
        path: "items.variant",
        select: "types price", // Select fields needed for email
      })
      .lean(); // Use lean for plain object

    // Check if invoice and user data exist
    if (!invoice) {
      console.error(`Invoice not found for ID: ${invoiceId}`);
      return res.status(404).json({ message: "Invoice not found." });
    }
    if (!invoice.user || !invoice.user.email) { // CRITICAL: Check if user and email exist
      console.error(`User data or email missing for invoice ${invoiceId}. Cannot send confirmation.`);
      // Don't necessarily error out the whole request, but log it.
      // Depending on the trigger, maybe return success but indicate email skip.
      return res.status(200).json({ message: "Email skipped: User email missing from invoice data." });
    }

    // 3. Extract necessary data FOR EMAIL from the fetched invoice
    const userEmail = invoice.user.email; // <-- Use the email from the populated user
    const userName = invoice.user.name || 'Valued Customer';
    const orderId = invoice._id.toString();
    const items = invoice.items || [];
    const totalAmount = invoice.totalAmount;
    const shippingAddress = invoice.shippingAddress || {};
    const paymentMethod = invoice.paymentMethod || 'N/A';

    // 4. Generate Email Content
    const formattedTotal = formatCurrencyVND(totalAmount); // Use your helper
    const formattedShippingAddress = `
            ${shippingAddress.street || ''}<br>
            ${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.zipCode || ''}<br>
            ${shippingAddress.country || ''}
        `.trim().replace(/\n<br>/g, '<br>');

    const itemsHtml = items.map(item => {
      const product = item.product || {};
      const variant = item.variant || {};
      const price = item.priceAtPurchase; // Use price from invoice item
      const formattedPrice = formatCurrencyVND(price);
      const formattedSubtotal = formatCurrencyVND(price * item.quantity);
      const imageUrl = product.images?.[0] || ''; // Use first image

      return `
                <tr>
                    <td style="padding: 5px; border-bottom: 1px solid #eee; vertical-align: middle;">
                        ${imageUrl ? `<img src="${imageUrl}" alt="${product.name || ''}" width="50" style="vertical-align: middle; margin-right: 10px; max-height: 50px; object-fit: contain;">` : ''}
                        <span>
                           ${product.name || 'N/A'}
                           ${variant.types ? `<br><small style='color:#555;'>Type: ${variant.types}</small>` : ''}
                        </span>
                    </td>
                    <td style="padding: 5px; border-bottom: 1px solid #eee; text-align: center; vertical-align: middle;">${item.quantity}</td>
                    <td style="padding: 5px; border-bottom: 1px solid #eee; text-align: right; vertical-align: middle;">${formattedPrice}</td>
                    <td style="padding: 5px; border-bottom: 1px solid #eee; text-align: right; vertical-align: middle;">${formattedSubtotal}</td>
                </tr>
            `;
    }).join('');

    // Simple text version (for email clients that don't show HTML)
    const textVersion = `
Hello ${userName},

Thank you for your order #${orderId}!

Your payment of ${formattedTotal} via ${paymentMethod} was successful (or is being processed).

Order Summary:
${items.map(item => `- ${item.product?.name || 'Item'} ${item.variant?.types ? '(' + item.variant.types + ')' : ''} (Qty: ${item.quantity}) @ ${formatCurrencyVND(item.priceAtPurchase)}`).join("\n")}

Total: ${formattedTotal}

Shipping To:
${shippingAddress.street || ''}
${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.zipCode || ''}
${shippingAddress.country || ''}

We'll notify you when your order ships.
Thanks for shopping with us!
Your Company Name
[Your Support Email/Phone]
        `.trim();

    // Detailed HTML version
    const htmlVersion = `
            <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #444;">Order Confirmation</h2>
                <p>Hello ${userName},</p>
                <p>Thank you for your order! Your order is confirmed and is being processed.</p>
                <hr style="border: none; border-top: 1px solid #eee;">
                <p><strong>Order ID:</strong> #${orderId}</p>
                <p><strong>Total Amount:</strong> ${formattedTotal}</p>
                <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                <hr style="border: none; border-top: 1px solid #eee;">
                <h3 style="color: #444;">Order Summary:</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
                    <thead>
                        <tr style="background-color: #f8f8f8;">
                            <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Product</th>
                            <th style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">Quantity</th>
                            <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Price</th>
                            <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" style="text-align: right; padding: 10px 5px 5px; border-top: 2px solid #ddd; font-weight: bold;">Total:</td>
                            <td style="text-align: right; padding: 10px 5px 5px; border-top: 2px solid #ddd; font-weight: bold;">${formattedTotal}</td>
                        </tr>
                    </tfoot>
                </table>
                 <hr style="border: none; border-top: 1px solid #eee;">
                <h3 style="color: #444;">Shipping Address:</h3>
                <p style="margin-left: 15px; padding: 10px; background-color: #fdfdfd; border: 1px solid #eee;">
                    ${formattedShippingAddress.replace(/<br>/g, '<br>\n')}
                </p>
                 <hr style="border: none; border-top: 1px solid #eee;">
                <p>We will send another email when your order ships.</p>
                <p>Thanks again for shopping with us!</p>
                <p><strong>Your Company Name</strong></p>
                <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;">
                <p style="font-size: 12px; color: #777;">If you have any questions, please contact us at [Your Support Email] or call [Your Phone Number].</p>
            </div>
        `;

    // Set up mail options
    const mailOptions = {
      to: userEmail, // Send to user's registered email
      subject: `Your Order Confirmation - #${orderId}`,
      text: textVersion, // Plain text fallback
      html: htmlVersion,  // HTML version
    };

    // 5. Send Email using the mailer config
    await sendEmail(mailOptions);
    console.log(`Confirmation email sent successfully to ${userEmail} for invoice ${invoiceId}.`);
    res.status(200).json({ message: "Confirmation email sent successfully." });

  } catch (error) {
    console.error(`Error processing or sending payment confirmation for invoice ${invoiceId}:`, error);
    res.status(500).json({ message: `Failed to send confirmation email. ${error.message}` });
  }
};

module.exports = {
  sendPaymentConfirmationEmail,
  // You might add other email functions here later (e.g., shipping notification)
};