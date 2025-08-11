/**
 * Test setup file
 * Configures global test environment and mocks
 */

import { vi } from 'vitest';

// Mock import.meta.env
vi.mock('import.meta.env', () => ({
  DEV: true,
  PROD: false,
  MODE: 'test'
}));

// Global test utilities
global.testUtils = {
  createMockProject: (overrides = {}) => ({
    slug: 'test-project',
    data: {
      title: 'Test Project',
      description: 'A test project description',
      technologies: ['React', 'TypeScript'],
      thumbnail: '/images/test.jpg',
      publishDate: new Date('2024-01-01'),
      featured: false,
      order: 1,
      links: {
        main: 'https://example.com',
        github: 'https://github.com/test/project'
      },
      ...overrides
    },
    body: 'Test project content'
  })
};

// Extend global types
declare global {
  var testUtils: {
    createMockProject: (overrides?: any) => any;
  };
}