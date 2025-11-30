import mongoose from "mongoose";

const FavoriteSchema = new mongoose.Schema(
  {
    userPhoneNumber: {
      type: String,
      required: true,
      index: true,
    },
    propertyId: {
      type: String,
      required: true,
      index: true,
    },
    propertyType: {
      type: String,
      enum: ["commercial", "residential"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index to ensure unique combination
FavoriteSchema.index({ userPhoneNumber: 1, propertyId: 1 }, { unique: true });

export default mongoose.models.Favorite || mongoose.model("Favorite", FavoriteSchema);

