 import { useState, useEffect } from 'react';
import { Project } from '../utils/types';
import { MOCK_PROJECTS, getProjectsByUser } from '../utils/mockData';

export const useProjects = (userId?: number) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate API call delay
    setTimeout(() => {
      const userProjects = userId ? getProjectsByUser(userId) : MOCK_PROJECTS;
      setProjects(userProjects);
      setLoading(false);
    }, 100);
  }, [userId]);

  return {
    projects,
    loading,
    setProjects
  };
};