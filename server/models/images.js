import mongoose, { Schema } from 'mongoose';

const imageSchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  filename: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  width: {
    type: Number,
    required: true,
    min: 1
  },
  height: {
    type: Number,
    required: true,
    min: 1
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

imageSchema.index({ projectId: 1 });
imageSchema.index({ uploadedAt: -1 });
imageSchema.index({ filename: 1, projectId: 1 });

export const Image = mongoose.model('Image', imageSchema);