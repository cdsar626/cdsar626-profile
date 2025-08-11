/**
 * Mock for astro:content module
 * Provides test implementations of Astro content collection functions
 */

import { vi } from 'vitest';

// Mock project data for testing
const mockProjects = [
  {
    slug: 'ecommerce-platform',
    data: {
      title: 'E-commerce Platform',
      description: 'A full-featured e-commerce platform with modern UI',
      technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      thumbnail: '/images/ecommerce.jpg',
      publishDate: new Date('2024-01-15'),
      featured: true,
      order: 1,
      links: {
        main: 'https://ecommerce-demo.example.com',
        github: 'https://github.com/johndeveloper/ecommerce-platform',
        additional: 'https://docs.ecommerce-demo.example.com'
      }
    },
    body: 'Detailed description of the e-commerce platform project...'
  },
  {
    slug: 'task-manager',
    data: {
      title: 'Task Management App',
      description: 'Collaborative task management with real-time updates',
      technologies: ['Vue.js', 'JavaScript', 'Express', 'MongoDB'],
      thumbnail: '/images/taskmanager.jpg',
      publishDate: new Date('2024-02-01'),
      featured: true,
      order: 2,
      links: {
        main: 'https://taskmanager-demo.example.com',
        github: 'https://github.com/johndeveloper/task-manager'
      }
    },
    body: 'Detailed description of the task management app...'
  },
  {
    slug: 'analytics-dashboard',
    data: {
      title: 'Analytics Dashboard',
      description: 'Real-time analytics dashboard with data visualization',
      technologies: ['React', 'D3.js', 'Python', 'FastAPI'],
      thumbnail: '/images/analytics.jpg',
      publishDate: new Date('2024-03-01'),
      featured: false,
      order: 3,
      links: {
        main: 'https://analytics-demo.example.com',
        github: 'https://github.com/johndeveloper/analytics-dashboard'
      }
    },
    body: 'Detailed description of the analytics dashboard...'
  }
];

// Mock getCollection function
export const getCollection = vi.fn().mockImplementation((collectionName: string) => {
  if (collectionName === 'projects') {
    return Promise.resolve(mockProjects);
  }
  return Promise.resolve([]);
});

// Mock CollectionEntry type
export type CollectionEntry<T extends string> = T extends 'projects' 
  ? typeof mockProjects[0]
  : never;

// Export mock data for use in tests
export { mockProjects };