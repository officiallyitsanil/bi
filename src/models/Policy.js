import mongoose, { Schema } from 'mongoose';

const policySchema = new Schema({
  identifier: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

const Policy = mongoose.models.Policy || mongoose.model('Policy', policySchema);

export default Policy;