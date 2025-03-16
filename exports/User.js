import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Define the User schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Hash the password before saving the user
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Export the User model as default
const User = mongoose.model('User', UserSchema);
export default User;