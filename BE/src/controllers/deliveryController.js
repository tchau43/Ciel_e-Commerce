const { getDeliveryFeeService } = require('../services/deliveryService');

/**
 * Calculate delivery fee based on shipping address
 * @route POST /api/delivery/calculate
 * @body {
 *   shippingAddress: {
 *     street: string,
 *     city: string,
 *     state: string,
 *     country: string,
 *     zipCode: string
 *   }
 * }
 */
const getDeliveryFee = async (req, res) => {
    try {
        const { shippingAddress } = req.body;

        if (!shippingAddress) {
            return res.status(400).json({ message: "Shipping address is required" });
        }

        const { street, city, state, country, zipCode } = shippingAddress;

        if (!street || !city || !state || !country || !zipCode) {
            return res.status(400).json({
                message: "Incomplete shipping address. All fields (street, city, state, country, zipCode) are required."
            });
        }

        const deliveryFee = await getDeliveryFeeService(shippingAddress);

        res.status(200).json({
            success: true,
            data: {
                deliveryFee: Math.round(deliveryFee),
                currency: 'VND',
                shippingAddress
            }
        });

    } catch (error) {
        console.error('Error calculating delivery fee:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to calculate delivery fee'
        });
    }
};

module.exports = {
    getDeliveryFee
}; 