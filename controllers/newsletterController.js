const crypto = require("crypto");
const Newsletter = require("../models/Newsletter");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ Subscribe user
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    // Prevent duplicates
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "You are already subscribed." });
    }

    // Generate unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString("hex");

    const newSubscriber = new Newsletter({
      email,
      unsubscribeToken,
    });

    await newSubscriber.save();

    // Generate unsubscribe URL
    const unsubscribeUrl = `${process.env.FRONTEND_URL}/unsubscribe?token=${unsubscribeToken}`;

    // ✅ Send confirmation email
    await resend.emails.send({
      from: "Lito Galan Jr<litojrgalan@gmail.com>",
      to: email,
      subject: "Welcome to My Newsletter 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Thanks for Subscribing!</h2>
          <p>Hi there,</p>
          <p>You've successfully subscribed to our newsletter. 🎉</p>
          <p>We’ll occasionally send you updates about new projects, articles, and announcements.</p>
          <p style="margin-top: 20px;">If you didn’t subscribe, you can <a href="${unsubscribeUrl}" style="color: #d9534f;">unsubscribe here</a>.</p>
          <hr />
          <p style="font-size: 12px; color: #888;">Sent with ❤️ from Your Portfolio</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true, message: "Subscription successful! Please check your email." });

  } catch (error) {
    console.error("❌ Subscription error:", error);
    return res.status(500).json({ success: false, message: "Failed to subscribe. Please try again later." });
  }
};

// ✅ Unsubscribe user
exports.unsubscribe = async (req, res) => {
  try {
    const { token } = req.query;

    const subscriber = await Newsletter.findOne({ unsubscribeToken: token });
    if (!subscriber) {
      return res.status(400).send("<h3>Invalid or expired unsubscribe link.</h3>");
    }

    await Newsletter.deleteOne({ _id: subscriber._id });

    return res.send(`
      <h2>You have been unsubscribed.</h2>
      <p>We're sad to see you go 😔</p>
    `);
  } catch (error) {
    console.error("❌ Unsubscribe error:", error);
    return res.status(500).send("<h3>Something went wrong. Please try again later.</h3>");
  }
};
