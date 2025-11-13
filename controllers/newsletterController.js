const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Newsletter = require("../models/Newsletter");

// ===============================
// 🔹 Configure Nodemailer
// ===============================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Gmail address
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

// ===============================
// 🔹 Subscribe Controller
// ===============================
exports.subscribe = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required." });

  try {
    // Check if already subscribed
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "This email is already subscribed." });
    }

    // Generate unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString("hex");

    // Save subscriber
    const subscriber = new Newsletter({ email, unsubscribeToken });
    await subscriber.save();

    // Build unsubscribe URL
    const unsubscribeUrl = `${process.env.FRONTEND_URL}/unsubscribe?token=${unsubscribeToken}`;

    // Send welcome email
    await transporter.sendMail({
      from: `"My Portfolio" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to My Newsletter 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #2563eb;">Welcome to My Newsletter 🎉</h2>
          <p>Hi there,</p>
          <p>Thank you for subscribing! You’ll now receive updates about my latest projects, tips, and insights right in your inbox.</p>
          <p>I’m excited to share my work and journey with you.</p>
          <hr style="margin: 20px 0;">
          <p style="font-size: 14px; color: #555;">If you ever wish to unsubscribe, you can do so anytime by clicking below:</p>
          <p>
            <a href="${unsubscribeUrl}" style="background-color: #ef4444; color: white; text-decoration: none; padding: 10px 16px; border-radius: 6px;">Unsubscribe</a>
          </p>
          <p style="font-size: 13px; color: #999;">Best regards,<br><strong>Your Name</strong></p>
        </div>
      `,
    });

    res.status(200).json({ message: "Subscribed successfully and email sent!" });
  } catch (err) {
    console.error("❌ Subscription error:", err);
    res.status(500).json({ message: "Subscription failed. Please try again later." });
  }
};

// ===============================
// 🔹 Unsubscribe Controller
// ===============================
exports.unsubscribe = async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send("Invalid unsubscribe link.");

  try {
    const subscriber = await Newsletter.findOneAndDelete({ unsubscribeToken: token });
    if (!subscriber) {
      return res.status(404).send("Invalid or expired unsubscribe link.");
    }

    console.log(`🗑️ Unsubscribed: ${subscriber.email}`);
    res.send(`
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin:auto; text-align:center; padding: 40px;">
        <h2 style="color:#ef4444;">You've been unsubscribed</h2>
        <p style="color:#555;">We're sad to see you go, ${subscriber.email}.</p>
        <p style="color:#777;">You can resubscribe anytime from our website.</p>
      </div>
    `);
  } catch (err) {
    console.error("❌ Unsubscribe error:", err);
    res.status(500).send("An error occurred while unsubscribing.");
  }
};
