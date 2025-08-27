import mongoose, { Schema } from 'mongoose';

const labelSchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  colour: {
    type: String,
    required: true,
    trim: true,
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color code']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

labelSchema.index({ projectId: 1, name: 1 }, { unique: true });

export const Label = mongoose.model('Label', labelSchema);