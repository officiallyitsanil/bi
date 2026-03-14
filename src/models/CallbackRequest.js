import mongoose from "mongoose";

const CallbackRequestSchema = new mongoose.Schema(
  {
    propertyName: { type: String },
    propertyId: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    preferredCallbackTime: { type: String },
    message: { type: String },
    status: { type: String, enum: ["pending", "contacted", "closed"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.models.CallbackRequest || mongoose.model("CallbackRequest", CallbackRequestSchema);
