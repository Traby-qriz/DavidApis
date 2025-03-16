// In your models or exports folder, create Stats.js
import mongoose from 'mongoose';

const statsSchema = new mongoose.Schema({
  total_requests: { type: Number, required: true, default: 0 },
});

const Stats = mongoose.model('Stats', statsSchema);
export default Stats;