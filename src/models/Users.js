import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required.'],
    unique: true,
    match: [/^\+[1-9]\d{1,14}$/, 'Please fill a valid phone number'],
  },
  name: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please fill a valid email'],
  },
  address: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

export default mongoose.models.Users || mongoose.model('Users', UserSchema);
