const nodemailer = require("nodemailer");
require("dotenv").config();

let transporter;

try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

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
}

const sendEmail = async (mailOptions) => {
  if (!transporter) {
    console.error("Email transporter is not initialized. Cannot send email.");
    throw new Error("Email service is currently unavailable.");
  }

  try {
    const optionsWithFrom = {
      ...mailOptions,
      from: mailOptions.from || process.env.EMAIL_FROM_ADDRESS,
    };

    console.log(`Sending email to: ${optionsWithFrom.to}`);
    const info = await transporter.sendMail(optionsWithFrom);
    console.log(
      `Email sent successfully to ${optionsWithFrom.to}. Message ID: ${info.messageId}`
    );
    return info;
  } catch (error) {
    console.error(`Error sending email to ${mailOptions.to}:`, error);
    throw error;
  }
};

module.exports = { sendEmail };
