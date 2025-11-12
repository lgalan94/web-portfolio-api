const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    position: { type: String, required: true },
    status: {
      type: String,
      enum: ["Applied", "Interview", "Offer", "Rejected", "Hired"],
      default: "Applied",
    },
    appliedDate: { type: Date, default: Date.now },
    link: { type: String },
    notes: { type: String },
    resumeUsed: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
