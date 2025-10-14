import mongoose, { Schema } from 'mongoose';

// Coordinate validation functions
const validateRectangleCoordinates = (coords) => {
  return (
    coords &&
    typeof coords.x === 'number' &&
    typeof coords.y === 'number' &&
    typeof coords.width === 'number' &&
    typeof coords.height === 'number' &&
    coords.width > 0 &&
    coords.height > 0
  );
};

const validatePolygonCoordinates = (coords) => {
  return (
    coords &&
    Array.isArray(coords.points) &&
    coords.points.length >= 3 &&
    coords.points.every((p) => 
      Array.isArray(p) && 
      p.length === 2 && 
      typeof p[0] === 'number' && 
      typeof p[1] === 'number'
    )
  );
};

const validateLineCoordinates = (coords) => {
  return (
    coords &&
    Array.isArray(coords.points) &&
    coords.points.length >= 2 &&
    coords.points.every((p) => 
      Array.isArray(p) && 
      p.length === 2 && 
      typeof p[0] === 'number' && 
      typeof p[1] === 'number'
    )
  );
};

const validatePointCoordinates = (coords) => {
  return (
    coords &&
    typeof coords.x === 'number' &&
    typeof coords.y === 'number'
  );
};

const validatePathCoordinates = (coords) => {
  return (
    coords &&
    Array.isArray(coords.points) &&
    coords.points.length >= 2 &&
    coords.points.every((p) => 
      Array.isArray(p) && 
      p.length === 2 && 
      typeof p[0] === 'number' && 
      typeof p[1] === 'number'
    )
  );
};

const validateTextCoordinates = (coords) => {
  return (
    coords &&
    typeof coords.x === 'number' &&
    typeof coords.y === 'number' &&
    (coords.text === undefined || typeof coords.text === 'string')
  );
};

const validateSkeletonCoordinates = (coords) => {
  return (
    coords &&
    Array.isArray(coords.points) &&
    Array.isArray(coords.edges) &&
    coords.points.every((p) => 
      p &&
      typeof p.x === 'number' &&
      typeof p.y === 'number' &&
      typeof p.labelId === 'string' &&
      typeof p.labelName === 'string' &&
      typeof p.color === 'string'
    ) &&
    coords.edges.every((e) =>
      e &&
      typeof e.from === 'number' &&
      typeof e.to === 'number' &&
      typeof e.labelId === 'string' &&
      typeof e.labelName === 'string' &&
      typeof e.color === 'string'
    )
  );
};

const shapeDataSchema = new Schema({
  type: {
    type: String,
    enum: ['rectangle', 'polygon', 'line', 'point', 'path', 'brush', 'text', 'skeleton'],
    required: true
  },
  coordinates: {
    type: Schema.Types.Mixed,
    required: true
    // Remove the validate block - we'll handle it in pre('validate')
  },
  isNormalised: {
    type: Boolean,
    default: false
  }
},
{ _id: false });

shapeDataSchema.pre('validate', function(next) {
  const coords = this.coordinates;
  const type = this.type;
  
  console.log('Pre-validate: Checking coordinates for type:', type, coords);
  
  let isValid = false;
  
  switch(type) {
    case 'rectangle':
      isValid = validateRectangleCoordinates(coords);
      break;
    
    case 'polygon':
      isValid = validatePolygonCoordinates(coords);
      break;
    
    case 'line':
      isValid = validateLineCoordinates(coords);
      break;
    
    case 'point':
      isValid = validatePointCoordinates(coords);
      break;

    case 'path':
    case 'brush':
      isValid = validatePathCoordinates(coords);
      break;
    
    case 'text':
      isValid = validateTextCoordinates(coords);
      break;
      
    case 'skeleton':
      isValid = validateSkeletonCoordinates(coords);
      break;
    
    default:
      console.error('Unknown shape type in validation:', type);
      isValid = false;
  }
  
  if (!isValid) {
    console.error('Validation failed for type:', type, 'coords:', coords);
    this.invalidate('coordinates', `Invalid coordinates for shape type: ${type}`);
  }
  
  next();
});

const annotationSchema = new Schema({
  imageId: {
    type: Schema.Types.ObjectId,
    ref: 'Image',
    required: true,
    index: true
  },
  labelId: {
    type: Schema.Types.ObjectId,
    ref: 'Label',
    required: true,
    index: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  shapeData: {
    type: shapeDataSchema,
    required: true
  }, 
  area: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

annotationSchema.index({ imageId: 1, labelId: 1 });
annotationSchema.index({ imageId: 1, createdBy: 1 });
annotationSchema.index({ createdAt: -1 });

annotationSchema.pre('save', function(next) {
  if (this.shapeData.type === 'rectangle') {
    // Rectangle: width × height
    const coords = this.shapeData.coordinates;
    this.area = coords.width * coords.height;
  } 
  else if (this.shapeData.type === 'polygon') {
    // Polygon: Shoelace formula
    const points = this.shapeData.coordinates.points;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i][0] * points[j][1];
      area -= points[j][0] * points[i][1];
    }
    this.area = Math.abs(area / 2);
  }
  // Lines and points don't have area
  
  next();
});

export const Annotation = mongoose.model('Annotation', annotationSchema);