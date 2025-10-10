import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required.'],
    unique: true,
    match: [/^\+[1-9]\d{1,14}$/, 'Please fill a valid phone number'],
  },
}, {
  timestamps: true,
});

export default mongoose.models.Users || mongoose.model('Users', UserSchema);
