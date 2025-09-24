import mongoose, { Schema } from 'mongoose';

const shapeDataSchema = new Schema({
  type: {
    type: String,
    enum: ['rectangle', 'polygon', 'line', 'point', 'circle'],
    required: true
  },
  coordinates: {
    type: Schema.Types.Mixed, // Allows both number[][] and number[]
    required: true
  }
}, { _id: false });

const annotationSchema = new Schema({
  imageId: {
    type: Schema.Types.ObjectId,
    ref: 'Image',
    required: true
  },
  labelId: {
    type: Schema.Types.ObjectId,
    ref: 'Label',
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shapeData: {
    type: shapeDataSchema,
    required: true
  }
}, {
  timestamps: true
});

annotationSchema.index({ imageId: 1 });
annotationSchema.index({ labelId: 1 });
annotationSchema.index({ createdBy: 1 });
annotationSchema.index({ createdAt: -1 });

export const Annotation = mongoose.model('Annotation', annotationSchema);