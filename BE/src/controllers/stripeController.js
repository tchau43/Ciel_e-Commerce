const {
  stripePaymentService,
  createPaymentIntentService,
} = require("../services/stripeService");

const stripePayment = async (req, res) => {
  const { id } = req.body;

  try {
    // Call the service to process the Stripe payment logic
    const data = await stripePaymentService(id);
    res.status(200).json(data); // Respond with the customer data from Stripe
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message }); // Return the error message
  }
};

const createPaymentIntent = async (req, res) => {
  const { amount } = req.body;
  try {
    const paymentIntent = await createPaymentIntentService(amount);
    // console.log("paymentIntent", paymentIntent)
    res.status(200).json({
      clientSecret: paymentIntent.client_secret, // Extract client_secret string
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { stripePayment, createPaymentIntent };
