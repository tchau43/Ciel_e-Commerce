const { sendEmail } = require("../config/mailer");
const Invoice = require("../models/invoice");

// Helper function to generate all possible combinations of a specific size
function generateCombinations(array, size) {
    const result = [];
    function backtrack(start, current) {
        if (current.length === size) {
            result.push([...current]);
            return;
        }
        for (let i = start; i < array.length; i++) {
            current.push(array[i]);
            backtrack(i + 1, current);
            current.pop();
        }
    }
    backtrack(0, []);
    return result;
}

function formatCurrencyVND(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return 'N/A'; // Return 'N/A' for invalid input
    }
    try {
        // Use Intl API for robust currency formatting
        const formatter = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            // maximumFractionDigits: 0 // Optional: Remove decimals if preferred for VND
        });
        return formatter.format(amount);
    } catch (error) {
        console.error("Currency formatting error:", error);
        return String(amount); // Fallback to simple string conversion
    }
}

// --- Helper function to build and send the email ---
// Takes the saved invoice object. Gets recipient email from invoice.user.
// --- Helper function to build and send the order confirmation email ---
async function triggerOrderConfirmationEmail(savedInvoice) {
    console.log(`Attempting email trigger for Invoice ${savedInvoice?._id}`);
    if (!savedInvoice?._id) {
        console.error("triggerOrderConfirmationEmail called with invalid savedInvoice object");
        return;
    }

    try {
        // Fetch again with necessary population for email content
        const invoiceForEmail = await Invoice.findById(savedInvoice._id)
            .populate({ path: "user", select: "name email" })
            .populate({ path: "items.product", select: "name images base_price" })
            .populate({ path: "items.variant", select: "types price" })
            .lean();

        if (!invoiceForEmail) {
            console.error(`Invoice ${savedInvoice._id} not found when fetching for email.`);
            return; // Exit if invoice not found
        }
        if (!invoiceForEmail.user || !invoiceForEmail.user.email) {
            console.warn(`User data or email missing for invoice ${invoiceForEmail._id}. Skipping confirmation email.`);
            return; // Cannot send without recipient email
        }

        // Extract data needed for the email template
        const recipientEmail = invoiceForEmail.user.email;
        const userName = invoiceForEmail.user.name || 'Valued Customer';
        const orderId = invoiceForEmail._id.toString();
        const items = invoiceForEmail.items || [];
        const totalAmount = invoiceForEmail.totalAmount;
        const shippingAddress = invoiceForEmail.shippingAddress || {};
        const paymentMethod = invoiceForEmail.paymentMethod || 'N/A';
        const formattedTotal = formatCurrencyVND(totalAmount);

        // Format shipping address for display
        const formattedShippingAddress = `
            ${shippingAddress.name || ''}<br>
            ${shippingAddress.street || ''}<br>
            ${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.zipCode || ''}<br>
            ${shippingAddress.country || ''}
        `.trim().replace(/(\n\s*<br>)+/g, '<br>').replace(/^<br>|<br>$/g, ''); // Clean up extra breaks


        // --- START: Generate HTML for items table ---
        const itemsHtml = items.map(item => {
            const product = item.product || {};
            const variant = item.variant || {};
            const price = item.priceAtPurchase; // Use the price recorded at the time of purchase
            const formattedPrice = formatCurrencyVND(price);
            const formattedSubtotal = formatCurrencyVND(price * item.quantity);
            const imageUrl = product.images?.[0] || ''; // Use first product image

            return `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; vertical-align: middle;">
                        ${imageUrl ? `<img src="${imageUrl}" alt="${product.name || ''}" width="50" style="vertical-align: middle; margin-right: 10px; max-height: 50px; object-fit: contain;">` : ''}
                        <span style="display: inline-block; vertical-align: middle;">
                           ${product.name || 'N/A'}
                           ${variant.types ? `<br><small style='color:#555;'>Type: ${variant.types}</small>` : ''}
                        </span>
                    </td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center; vertical-align: middle;">${item.quantity}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; vertical-align: middle;">${formattedPrice}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; vertical-align: middle;">${formattedSubtotal}</td>
                </tr>
            `;
        }).join('');
        // --- END: Generate HTML for items table ---


        // --- START: Generate full HTML Body ---
        const htmlVersion = `
            <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
                <h2 style="color: #444; border-bottom: 2px solid #eee; padding-bottom: 10px;">Order Confirmation</h2>
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
                    ${formattedShippingAddress}
                </p>
                 <hr style="border: none; border-top: 1px solid #eee;">
                <p>We will send another email when your order ships.</p>
                <p>Thanks again for shopping with us!</p>
                <p><strong>Your Company Name</strong></p>
                <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;">
                <p style="font-size: 12px; color: #777;">If you have any questions, please contact us at [Your Support Email] or call [Your Phone Number].</p>
            </div>
        `;
        // --- END: Generate full HTML Body ---


        // Simple text version (can be simplified further)
        const textVersion = `...`; // (Keep simple text version from previous examples)

        // Set up mail options using the generated HTML
        const mailOptions = {
            to: recipientEmail,
            subject: `Your Order Confirmation - #${orderId}`,
            text: textVersion,
            html: htmlVersion, // <-- Assign the generated HTML here
        };

        // Send asynchronously
        sendEmail(mailOptions)
            .then(() => console.log(`Confirmation email sent successfully to ${recipientEmail} for invoice ${orderId}.`))
            .catch(err => console.error(`FAILED to send confirmation email to ${recipientEmail} for invoice ${orderId}:`, err));

    } catch (error) {
        console.error(`Error preparing or sending order confirmation email for Invoice ${savedInvoice?._id || 'Unknown ID'}:`, error);
    }
}

module.exports = { generateCombinations, formatCurrencyVND, triggerOrderConfirmationEmail }