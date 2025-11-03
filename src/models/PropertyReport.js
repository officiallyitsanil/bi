import mongoose from "mongoose";

const PropertyReportSchema = new mongoose.Schema(
  {
    propertyId: {
      type: String,
      required: true,
    },
    propertyName: {
      type: String,
      required: true,
    },
    reporterName: {
      type: String,
      required: true,
    },
    reporterEmail: {
      type: String,
      required: true,
    },
    reporterPhone: {
      type: String,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        "incorrect_info",
        "fraud",
        "duplicate",
        "sold",
        "inappropriate",
        "other",
      ],
    },
    details: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.PropertyReport ||
  mongoose.model("PropertyReport", PropertyReportSchema);
