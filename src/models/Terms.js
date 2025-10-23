import mongoose, { Schema } from 'mongoose';

const termsSchema = new Schema({
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

const Terms = mongoose.models.Terms || mongoose.model('Terms', termsSchema);

export default Terms;