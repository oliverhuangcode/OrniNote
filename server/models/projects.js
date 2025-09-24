import mongoose, { Schema } from 'mongoose';

const collaboratorSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['Owner', 'Editor', 'Viewer'],
    required: true,
    default: 'Viewer'
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false }); 

const projectSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ''
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [collaboratorSchema] // array of collaborators
}, {
  timestamps: true
});

projectSchema.index({ owner: 1, name: 1 });             
projectSchema.index({ 'collaborators.user': 1 }); // find projects user is in 
projectSchema.index({ updatedAt: -1 });                  
projectSchema.index({ owner: 1, updatedAt: -1 });        
projectSchema.index({ _id: 1, 'collaborators.user': 1 }, { unique: true }); // so then you cant add someone twice


export const Project = mongoose.model('Project', projectSchema);