const { sendEmail } = require("../config/mailer");
const Invoice = require("../models/invoice");

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

function slugify(text = '') {
    if (typeof text !== 'string') return '';

    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

function formatCurrencyVND(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return 'N/A';
    }

    try {
        const formatter = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        });
        return formatter.format(amount);
    } catch (error) {
        console.error("Currency formatting error:", error);
        return String(amount);
    }
}

async function triggerOrderConfirmationEmail(savedInvoice) {
    console.log(`Attempting email trigger for Invoice ${savedInvoice?._id}`);

    if (!savedInvoice?._id) {
        console.error("triggerOrderConfirmationEmail called with invalid savedInvoice object");
        return;
    }

    try {
        const invoiceForEmail = await Invoice.findById(savedInvoice._id)
            .populate({ path: "user", select: "name email" })
            .populate({
                path: "items.product",
                select: "name images",
            })
            .populate({
                path: "items.variant",
                select: "types",
            })
            .lean();

        if (!invoiceForEmail) throw new Error(`Invoice ${savedInvoice._id} not found for email.`);
        if (!invoiceForEmail.user || !invoiceForEmail.user.email) {
            console.warn(`User data or email missing for invoice ${invoiceForEmail._id}. Skipping confirmation email.`);
            return;
        }

        const recipientEmail = invoiceForEmail.user.email;
        const userName = invoiceForEmail.user.name || 'Valued Customer';
        const orderId = invoiceForEmail._id.toString();
        const items = invoiceForEmail.items || [];
        const subtotal = invoiceForEmail.subtotal;
        const discountAmount = invoiceForEmail.discountAmount || 0;
        const deliveryFee = invoiceForEmail.deliveryFee || 0;
        const totalAmount = invoiceForEmail.totalAmount;
        const couponCode = invoiceForEmail.couponCode;
        const shippingAddress = invoiceForEmail.shippingAddress || {};
        const paymentMethod = invoiceForEmail.paymentMethod || 'N/A';

        const formattedSubtotal = formatCurrencyVND(subtotal);
        const formattedDiscount = formatCurrencyVND(discountAmount);
        const formattedDeliveryFee = formatCurrencyVND(deliveryFee);
        const formattedTotal = formatCurrencyVND(totalAmount);

        const formattedShippingAddress = `
            ${shippingAddress.street || ''}<br>
            ${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.zipCode || ''}<br>
            ${shippingAddress.country || ''}
        `.trim().replace(/(\n\s*<br>)+/g, '<br>').replace(/^<br>|<br>$/g, '');

        const itemsHtml = items.map(item => {
            const product = item.product || {};
            const variant = item.variant || {};
            const price = item.priceAtPurchase;
            const formattedPrice = formatCurrencyVND(price);
            const itemSubtotal = formatCurrencyVND(price * item.quantity);
            const imageUrl = product.images?.[0] ? `${process.env.YOUR_BASE_URL || ''}/${product.images[0]}` : '';

            return `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; vertical-align: middle;">
                        ${imageUrl ? `<img src="${imageUrl}" alt="${product.name || ''}" width="50" style="vertical-align: middle; margin-right: 10px; max-height: 50px; object-fit: contain;">` : ''}
                        <span style="display: inline-block; vertical-align: middle;">
                           ${product.name || 'N/A'}
                           ${variant.types ? `<br><small style='color:#555;'>Variant: ${variant.types}</small>` : ''}
                        </span>
                    </td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center; vertical-align: middle;">${item.quantity}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; vertical-align: middle;">${formattedPrice}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; vertical-align: middle;">${itemSubtotal}</td>
                </tr>
            `;
        }).join('');

        const htmlVersion = `
            <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #ddd; padding: 25px;">
                <h2 style="color: #444; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 0;">Order Confirmation</h2>
                <p>Hello ${userName},</p>
                <p>Thank you for your order! Your order #${orderId} is confirmed and is being processed.</p>
                <hr style="border: none; border-top: 1px solid #eee;">
                <p><strong>Order ID:</strong> #${orderId}</p>
                <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                ${couponCode ? `<p><strong>Coupon Applied:</strong> ${couponCode}</p>` : ''}
                <hr style="border: none; border-top: 1px solid #eee;">

                <h3 style="color: #444; margin-top: 25px;">Order Summary:</h3>
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
                            <td colspan="3" style="text-align: right; padding: 10px 5px 5px; border-top: 2px solid #ddd;">Subtotal:</td>
                            <td style="text-align: right; padding: 10px 5px 5px; border-top: 2px solid #ddd;">${formattedSubtotal}</td>
                        </tr>
                        ${discountAmount > 0 ? `
                        <tr>
                            <td colspan="3" style="text-align: right; padding: 5px;">Discount (${couponCode || ''}):</td>
                            <td style="text-align: right; padding: 5px;">-${formattedDiscount}</td>
                        </tr>` : ''}
                        <tr>
                            <td colspan="3" style="text-align: right; padding: 5px;">Delivery Fee:</td>
                            <td style="text-align: right; padding: 5px;">${formattedDeliveryFee}</td>
                        </tr>
                        <tr>
                            <td colspan="3" style="text-align: right; padding: 10px 5px 5px; border-top: 2px solid #aaa; font-weight: bold;">Total Amount:</td>
                            <td style="text-align: right; padding: 10px 5px 5px; border-top: 2px solid #aaa; font-weight: bold;">${formattedTotal}</td>
                        </tr>
                    </tfoot>
                </table>
                <hr style="border: none; border-top: 1px solid #eee;">

                <h3 style="color: #444;">Shipping Address:</h3>
                <div style="margin-left: 15px; padding: 10px; background-color: #fdfdfd; border: 1px solid #eee; margin-bottom: 20px;">
                    ${formattedShippingAddress || 'Address not provided.'}
                </div>
                <hr style="border: none; border-top: 1px solid #eee;">

                <p>We will send another email when your order ships.</p>
                <p>Thanks again for shopping with us!</p>
                <p><strong>[Your Company Name]</strong></p>
                <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;">
                <p style="font-size: 12px; color: #777; text-align: center;">If you have any questions, please contact us at [Your Support Email] or call [Your Phone Number].</p>
            </div>
        `;

        const textVersion = `
Hello ${userName},

Thank you for your order #${orderId}! Your order is confirmed and is being processed.

Order Summary:
${items.map(item => `- ${item.product?.name || 'Item'} ${item.variant?.types ? '(' + item.variant.types + ')' : ''} (Qty: ${item.quantity}) @ ${formatCurrencyVND(item.priceAtPurchase)} = ${formatCurrencyVND(item.priceAtPurchase * item.quantity)}`).join("\n")}

Subtotal: ${formattedSubtotal}
${discountAmount > 0 ? `Discount (${couponCode || ''}): -${formattedDiscount}\n` : ''}Delivery Fee: ${formattedDeliveryFee}
Total Amount: ${formattedTotal}

Payment Method: ${paymentMethod}

Shipping To:
${shippingAddress.street || ''}
${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.zipCode || ''}
${shippingAddress.country || ''}

We'll notify you when your order ships.
Thanks for shopping with us!
[Your Company Name]
[Your Support Email/Phone]
        `.trim();

        const mailOptions = {
            to: recipientEmail,
            subject: `Your Order Confirmation - #${orderId}`,
            text: textVersion,
            html: htmlVersion,
        };

        await sendEmail(mailOptions);
        console.log(`Confirmation email sent successfully to ${recipientEmail} for invoice ${orderId}.`);
    } catch (error) {
        console.error(`Error preparing or sending order confirmation email for Invoice ${savedInvoice?._id || 'Unknown ID'}:`, error);
    }
}

module.exports = { generateCombinations, formatCurrencyVND, triggerOrderConfirmationEmail, slugify };