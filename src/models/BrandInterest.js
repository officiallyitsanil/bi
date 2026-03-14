import mongoose from "mongoose";

const BrandInterestSchema = new mongoose.Schema(
  {
    propertyName: { type: String },
    propertyId: { type: String },
    brandName: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    interestType: { type: String },
    message: { type: String },
    status: { type: String, enum: ["pending", "contacted", "closed"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.models.BrandInterest || mongoose.model("BrandInterest", BrandInterestSchema);
