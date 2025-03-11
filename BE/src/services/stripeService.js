const Stripe = require("stripe");
const User = require("../models/user");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Use environment variable for the secret key

// Create a customer
const stripePaymentService = async (id) => {
  try {
    const user = await User.findOne({ _id: id });
    console.log("user", user);
    const customer = await stripe.customers.create({
      name: user.name,
      email: user.email,
      //   metadata: {
      //     // Store custom data in metadata
      //     userId: user._id, // Store your userId in metadata
      //   },
      phone: user.phoneNumber,
      description: "New customer",
    });

    return customer;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create customer");
  }
};

const createPaymentIntentService = async (amount) => {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "vnd",
        payment_method_types: ["card"],
      });
      return paymentIntent; // Returns the full paymentIntent object
    } catch (error) {
      console.error(error);
      throw error; // Propagate the error for better debugging
    }
  };

module.exports = { stripePaymentService, createPaymentIntentService };
