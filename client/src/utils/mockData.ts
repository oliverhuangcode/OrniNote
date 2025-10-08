import { User, Team, Project, Image, Label, Annotation, TeamMember, ProjectShare } from './types';

export const MOCK_USERS: User[] = [
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

export const MOCK_TEAMS: Team[] = [
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

export const MOCK_PROJECTS: Project[] = [
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

export const MOCK_IMAGES: Image[] = [
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

export const MOCK_LABELS: Label[] = [
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

export const MOCK_ANNOTATIONS: Annotation[] = [
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

// Helper functions
export const getProjectsByUser = (userId: number): Project[] => {
  return MOCK_PROJECTS.filter(project => project.ownerId === userId);
};

export const getImagesByProject = (projectId: number): Image[] => {
  return MOCK_IMAGES.filter(image => image.projectId === projectId);
};

export const getLabelsByProject = (projectId: number): Label[] => {
  return MOCK_LABELS.filter(label => label.projectId === projectId);
};

// Current user (for testing)
export const CURRENT_USER: User = MOCK_USERS[0];

const ADJECTIVES = [
  'Happy', 'Clever', 'Swift', 'Brave', 'Calm', 'Bright', 
  'Cheerful', 'Daring', 'Eager', 'Fancy', 'Gentle', 'Jolly'
];

const ANIMALS = [
  'Cat', 'Dog', 'Fox', 'Bear', 'Panda', 'Rabbit', 
  'Tiger', 'Lion', 'Penguin', 'Dolphin', 'Koala', 'Otter'
];

// You can now optionally use real usernames if you want to pass user data
// Or keep the anonymous animal names for privacy

export function getAnonymousName(connectionId: number, username?: string): string {
  // If you want to show real usernames:
  if (username) return username;
  
  // Otherwise use anonymous names:
  const adjectives = [
    'Happy', 'Clever', 'Swift', 'Brave', 'Calm', 'Bright', 
    'Cheerful', 'Daring', 'Eager', 'Fancy', 'Gentle', 'Jolly'
  ];

  const animals = [
    'Cat', 'Dog', 'Fox', 'Bear', 'Panda', 'Rabbit', 
    'Tiger', 'Lion', 'Penguin', 'Dolphin', 'Koala', 'Otter'
  ];

  const adjective = adjectives[connectionId % adjectives.length];
  const animal = animals[Math.floor(connectionId / adjectives.length) % animals.length];
  return `${adjective} ${animal}`;
}