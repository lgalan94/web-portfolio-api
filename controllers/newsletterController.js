const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Newsletter = require("../models/Newsletter");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

exports.subscribe = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    // Check if already subscribed
    const existing = await Newsletter.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "You're already subscribed." });

    // Generate unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString("hex");
    const subscriber = new Newsletter({ email, unsubscribeToken });
    await subscriber.save();

    const unsubscribeLink = `${process.env.FRONTEND_URL}/unsubscribe?token=${unsubscribeToken}`;

    // Send email via Nodemailer
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "🎉 Welcome to My Developer Newsletter!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Hey there 👋</h2>
          <p>Thanks for subscribing to my newsletter!</p>
          <p>You’ll receive updates about my latest projects, coding tips, and dev insights.</p>
          <br />
          <a href="${process.env.CLIENT_URL}" 
             style="background:#4f46e5;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;">
             Visit My Portfolio
          </a>
          <br /><br />
          <p style="font-size:12px;color:#777;">
            If you ever want to unsubscribe, click here:
            <a href="${unsubscribeLink}" style="color:#ef4444;">Unsubscribe</a>
          </p>
        </div>
      `,
    });

    res.status(200).json({ message: "Subscribed successfully!" });
  } catch (error) {
    console.error("❌ Subscription error:", error);
    res.status(500).json({ message: "Failed to subscribe", error: error.message });
  }
};

exports.unsubscribe = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await Newsletter.findOneAndDelete({ unsubscribeToken: token });
    if (!user) return res.status(400).send("Invalid unsubscribe token");
    res.send("You’ve been unsubscribed successfully. 💔");
  } catch (err) {
    console.error("❌ Unsubscribe error:", err);
    res.status(500).send("Server error");
  }
};
