const Stripe = require("stripe");
const User = require("../models/user");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const stripePaymentService = async (id) => {
  try {
    const user = await User.findOne({ _id: id });
    console.log("user", user);
    const customer = await stripe.customers.create({
      name: user.name,
      email: user.email,
      phone: user.phoneNumber,
      description: "New customer",
    });

    return customer;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create customer");
  }
};

const createPaymentIntentService = async (amount, metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "vnd",
      payment_method_types: ["card"],
      metadata: metadata,
      capture_method: "automatic",
    });
    return paymentIntent;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};

const getPaymentIntentStatus = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.status;
  } catch (error) {
    console.error("Error retrieving payment intent:", error);
    throw error;
  }
};

module.exports = {
  stripePaymentService,
  createPaymentIntentService,
  getPaymentIntentStatus,
};
