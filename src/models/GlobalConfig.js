import mongoose from 'mongoose';

const GlobalConfigSchema = new mongoose.Schema({
  isFullNavVisible: {
    type: Boolean,
    default: false,
  },
  whatsappNo: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
  strict: true,
  collection: 'globalconfigs',
});

export default mongoose.models.GlobalConfig || mongoose.model('GlobalConfig', GlobalConfigSchema);
