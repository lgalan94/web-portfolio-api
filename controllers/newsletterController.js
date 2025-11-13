const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const Newsletter = require("../models/Newsletter"); // your model

// Configure transporter (Gmail example)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // app password
  },
});

exports.subscribe = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    // Generate unique unsubscribe token
    const token = crypto.randomBytes(20).toString("hex");

    // Save subscriber to database
    const subscriber = new Newsletter({ email, unsubscribeToken: token });
    await subscriber.save();

    // Compose email
    const unsubscribeUrl = `${process.env.BASE_URL}/newsletter/unsubscribe/${token}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0ea5e9;">Welcome to My Newsletter!</h2>
        <p>Hi there,</p>
        <p>Thank you for subscribing! You’ll now receive the latest updates on my projects, articles, and web development tips.</p>
        <p style="margin-top: 20px;">If you ever want to unsubscribe, simply click the link below:</p>
        <p><a href="${unsubscribeUrl}" style="color: #ef4444;">Unsubscribe</a></p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
        <p style="font-size: 12px; color: #888;">You are receiving this email because you subscribed to our newsletter.</p>
      </div>
    `;

    // Send welcome email
    await transporter.sendMail({
      from: `"Lito Galan Jr" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to My Newsletter!",
      html: htmlContent,
    });

    res.status(200).json({ message: "Subscribed and welcome email sent!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to subscribe" });
  }
};

// Unsubscribe controller
exports.unsubscribe = async (req, res) => {
  const { token } = req.params;
  try {
    const deleted = await Newsletter.findOneAndDelete({ unsubscribeToken: token });
    if (!deleted) return res.status(404).send("Invalid or expired unsubscribe link.");

    res.send("You have been unsubscribed successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to unsubscribe.");
  }
};
