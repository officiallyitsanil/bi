import mongoose from "mongoose";

const ScheduleTourSchema = new mongoose.Schema(
    {
        propertyName: {
            type: String,
        },
        propertyId: {
            type: String,
        },
        propertyType: {
            type: String,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
        },
        phone: {
            type: String,
        },
        tourDate: {
            type: Date,
        },
        tourTime: {
            type: String,
        },
        tourType: {
            type: String,
            enum: ["in-person", "video-chat"],
            default: "in-person",
        },
        message: {
            type: String,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.ScheduleTour || mongoose.model("ScheduleTour", ScheduleTourSchema);
