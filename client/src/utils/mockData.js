// src/utils/mockData.js

// Users
export const MOCK_USERS = [
  {
    id: 1,
    username: "john_doe",
    email: "john@example.com"
  },
  {
    id: 2,
    username: "jane_smith", 
    email: "jane@example.com"
  }
];

// Teams
export const MOCK_TEAMS = [
  {
    id: 1,
    ownerId: 1,
    name: "Research Team",
  },
  {
    id: 2,
    ownerId: 2,
    name: "Bird Study Group"
  }
];

// Projects
export const MOCK_PROJECTS = [
  {
    id: 1,
    ownerId: 1,
    name: "Duck Species Dataset",
    description: "Annotation project for various duck species",
  },
  {
    id: 2,
    ownerId: 1,
    name: "Songbird Keypoints",
    description: "Keypoint detection for songbirds",
  },
  {
    id: 3,
    ownerId: 2,
    name: "Eagle Pose Analysis",
    description: "Eagle posture and behavior analysis",
  }
];

// Images
export const MOCK_IMAGES = [
  {
    id: 1,
    projectId: 1,
    filename: "duck1.jpg",
    url: "https://images.unsplash.com/photo-1551727076-ec4e0b9b2c3e?w=400&h=300",
    width: 400,
    height: 300
  },
  {
    id: 2,
    projectId: 1,
    filename: "duck2.jpg", 
    url: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400&h=300",
    width: 400,
    height: 300
  },
  {
    id: 3,
    projectId: 2,
    filename: "songbird1.jpg",
    url: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=300",
    width: 400,
    height: 300
  }
];

// Labels
export const MOCK_LABELS = [
  {
    id: 1,
    projectId: 1,
    name: "Head",
    colour: "#ff0000"
  },
  {
    id: 2,
    projectId: 1,
    name: "Beak",
    colour: "#00ff00"
  },
  {
    id: 3,
    projectId: 1,
    name: "Wing", 
    colour: "#0000ff"
  },
  {
    id: 4,
    projectId: 2,
    name: "Eye",
    colour: "#ffff00"
  }
];

// Annotations
export const MOCK_ANNOTATIONS = [
  {
    id: 1,
    imageId: 1,
    labelId: 1,
    createdBy: 1,
    shapeData: '{"type":"point","x":150,"y":100}'
  },
  {
    id: 2,
    imageId: 1,
    labelId: 2,
    createdBy: 1,
    shapeData: '{"type":"point","x":180,"y":120}'
  },
  {
    id: 3,
    imageId: 2,
    labelId: 1,
    createdBy: 2,
    shapeData: '{"type":"rectangle","x":50,"y":80,"width":100,"height":60}'
  }
];

// Team Members
export const MOCK_TEAM_MEMBERS = [
  {
    teamId: 1,
    userId: 1,
    role: "owner"
  },
  {
    teamId: 1,
    userId: 2,
    role: "member"
  }
];

// Project Shares
export const MOCK_PROJECT_SHARES = [
  {
    projectId: 1,
    teamId: 1,
    permission: "edit"
  },
  {
    projectId: 2,
    teamId: 1,
    permission: "view"
  }
];

// Helper functions to get related data
export const getProjectsByUser = (userId) => {
  return MOCK_PROJECTS.filter(project => project.ownerId === userId);
};

export const getImagesByProject = (projectId) => {
  return MOCK_IMAGES.filter(image => image.projectId === projectId);
};

export const getLabelsByProject = (projectId) => {
  return MOCK_LABELS.filter(label => label.projectId === projectId);
};

export const getAnnotationsByImage = (imageId) => {
  return MOCK_ANNOTATIONS.filter(annotation => annotation.imageId === imageId);
};

export const getUserById = (userId) => {
  return MOCK_USERS.find(user => user.id === userId);
};

export const getProjectById = (projectId) => {
  return MOCK_PROJECTS.find(project => project.id === projectId);
};

// Current user (for testing)
export const CURRENT_USER = MOCK_USERS[0]; // john_doe