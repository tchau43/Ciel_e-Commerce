// src/config/mailer.js
const nodemailer = require("nodemailer");
require("dotenv").config(); // Load .env variables

let transporter;

try {
  // Configure the transporter using environment variables
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"), // Default to 587 if not set
    secure: process.env.EMAIL_SECURE === "true", // secure:true for port 465, false for other ports (like 587 with STARTTLS)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Optional: Verify connection configuration during startup
  transporter.verify((error, success) => {
    if (error) {
      console.error("Mailer Configuration Error:", error);
    } else {
      console.log(
        "Email Transporter is configured correctly and ready to send messages."
      );
    }
  });
} catch (error) {
  console.error("Failed to create email transporter:", error);
  // Depending on your app's needs, you might want to prevent startup
  // or allow the app to run without email functionality.
}

/**
 * Sends an email using the pre-configured transporter.
 * @param {object} mailOptions - Options for Nodemailer sendMail (to, subject, text, html, etc.)
 * @returns {Promise<object>} - Nodemailer info object on success
 * @throws {Error} - If transporter is not initialized or sending fails
 */
const sendEmail = async (mailOptions) => {
  if (!transporter) {
    console.error("Email transporter is not initialized. Cannot send email.");
    throw new Error("Email service is currently unavailable.");
  }

  try {
    // Ensure a 'from' address is set, using the default from .env if not specified
    const optionsWithFrom = {
      ...mailOptions,
      from: mailOptions.from || process.env.EMAIL_FROM_ADDRESS,
    };

    console.log(`Sending email to: ${optionsWithFrom.to}`);
    const info = await transporter.sendMail(optionsWithFrom);
    console.log(
      `Email sent successfully to ${optionsWithFrom.to}. Message ID: ${info.messageId}`
    );
    return info; // Return info object (includes messageId)
  } catch (error) {
    console.error(`Error sending email to ${mailOptions.to}:`, error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

module.exports = { sendEmail };
