import mongoose from "mongoose";

const BuilderContactSchema = new mongoose.Schema(
    {
        builderName: {
            type: String,
        },
        builderId: {
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
        message: {
            type: String,
        },
        status: {
            type: String,
            enum: ["pending", "contacted", "closed"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.BuilderContact || mongoose.model("BuilderContact", BuilderContactSchema);
