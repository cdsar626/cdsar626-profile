/**
 * Unit tests for content utility functions
 * Tests data processing, validation, and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  isValidProject, 
  handleContentError, 
  logProjectStats,
  getProjects,
  getFeaturedProjects,
  getProjectBySlug
} from '../utils/content';

// Mock console methods
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

// Mock import.meta.env
vi.mock('import.meta.env', () => ({
  DEV: true
}));

describe('Content Utility Functions', () => {
  beforeEach(() => {
    mockConsoleError.mockClear();
    mockConsoleLog.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isValidProject', () => {
    const validProject = {
      slug: 'test-project',
      data: {
        title: 'Test Project',
        description: 'A test project description',
        technologies: ['React', 'TypeScript'],
        thumbnail: '/images/test.jpg',
        publishDate: new Date('2024-01-01'),
        featured: true,
        order: 1,
        links: {
          main: 'https://example.com',
          github: 'https://github.com/test/project',
          additional: 'https://docs.example.com'
        }
      }
    };

    it('should return true for valid project', () => {
      expect(isValidProject(validProject)).toBe(true);
    });

    it('should return false for null or undefined', () => {
      expect(isValidProject(null)).toBe(false);
      expect(isValidProject(undefined)).toBe(false);
    });

    it('should return false for non-object input', () => {
      expect(isValidProject('string')).toBe(false);
      expect(isValidProject(123)).toBe(false);
      expect(isValidProject([])).toBe(false);
    });

    it('should return false for project without data property', () => {
      expect(isValidProject({})).toBe(false);
      expect(isValidProject({ slug: 'test' })).toBe(false);
    });

    it('should return false for missing required fields', () => {
      const requiredFields = ['title', 'description', 'technologies', 'thumbnail', 'publishDate'];
      
      requiredFields.forEach(field => {
        const invalidProject = {
          ...validProject,
          data: { ...validProject.data }
        };
        delete (invalidProject.data as any)[field];
        
        expect(isValidProject(invalidProject)).toBe(false);
      });
    });

    it('should validate data types for required fields', () => {
      const typeTests = [
        { field: 'title', invalidValue: 123 },
        { field: 'description', invalidValue: [] },
        { field: 'technologies', invalidValue: 'string' },
        { field: 'thumbnail', invalidValue: null },
        { field: 'publishDate', invalidValue: 'not-a-date' }
      ];

      typeTests.forEach(({ field, invalidValue }) => {
        const invalidProject = {
          ...validProject,
          data: {
            ...validProject.data,
            [field]: invalidValue
          }
        };
        
        expect(isValidProject(invalidProject)).toBe(false);
      });
    });

    it('should validate optional field types', () => {
      // Test invalid featured type
      const invalidFeatured = {
        ...validProject,
        data: {
          ...validProject.data,
          featured: 'not-boolean'
        }
      };
      expect(isValidProject(invalidFeatured)).toBe(false);

      // Test invalid order type
      const invalidOrder = {
        ...validProject,
        data: {
          ...validProject.data,
          order: 'not-number'
        }
      };
      expect(isValidProject(invalidOrder)).toBe(false);
    });

    it('should validate links structure', () => {
      // Test invalid links type
      const invalidLinksType = {
        ...validProject,
        data: {
          ...validProject.data,
          links: 'not-object'
        }
      };
      expect(isValidProject(invalidLinksType)).toBe(false);

      // Test invalid URL in links
      const invalidURL = {
        ...validProject,
        data: {
          ...validProject.data,
          links: {
            main: 'not-a-url'
          }
        }
      };
      expect(isValidProject(invalidURL)).toBe(false);
    });

    it('should accept project without optional fields', () => {
      const minimalProject = {
        slug: 'minimal',
        data: {
          title: 'Minimal Project',
          description: 'A minimal project',
          technologies: ['JavaScript'],
          thumbnail: '/images/minimal.jpg',
          publishDate: new Date('2024-01-01')
        }
      };
      
      expect(isValidProject(minimalProject)).toBe(true);
    });

    it('should accept project with empty links object', () => {
      const projectWithEmptyLinks = {
        ...validProject,
        data: {
          ...validProject.data,
          links: {}
        }
      };
      
      expect(isValidProject(projectWithEmptyLinks)).toBe(true);
    });

    it('should validate partial links', () => {
      const projectWithPartialLinks = {
        ...validProject,
        data: {
          ...validProject.data,
          links: {
            main: 'https://example.com'
            // github and additional are optional
          }
        }
      };
      
      expect(isValidProject(projectWithPartialLinks)).toBe(true);
    });
  });

  describe('handleContentError', () => {
    it('should log error with default context', () => {
      const error = new Error('Test error');
      
      handleContentError(error);
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Content collection error during content loading:',
        error
      );
    });

    it('should log error with custom context', () => {
      const error = new Error('Test error');
      const context = 'project validation';
      
      handleContentError(error, context);
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Content collection error during project validation:',
        error
      );
    });

    it('should provide specific guidance for schema validation errors', () => {
      const error = new Error('Invalid input: expected string');
      
      handleContentError(error);
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        '💡 Schema validation error - check frontmatter data types'
      );
    });

    it('should provide specific guidance for collection errors', () => {
      const error = new Error('Collection not found');
      
      handleContentError(error);
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        '💡 Collection configuration error - check config.ts'
      );
    });

    it('should provide specific guidance for file not found errors', () => {
      const error = new Error('File not found');
      
      handleContentError(error);
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        '💡 Content file not found - check file paths'
      );
    });

    it('should handle non-Error objects', () => {
      const error = 'String error';
      
      handleContentError(error);
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Content collection error during content loading:',
        error
      );
    });
  });

  describe('getProjects', () => {
    it('should return sorted projects', async () => {
      const projects = await getProjects();
      
      expect(projects).toBeInstanceOf(Array);
      expect(projects.length).toBeGreaterThan(0);
      
      // Check that projects are sorted by order
      for (let i = 1; i < projects.length; i++) {
        expect(projects[i].data.order).toBeGreaterThanOrEqual(projects[i - 1].data.order);
      }
    });

    it('should handle errors gracefully', async () => {
      // Mock getCollection to throw an error
      const { getCollection } = await import('astro:content');
      vi.mocked(getCollection).mockRejectedValueOnce(new Error('Collection error'));
      
      const projects = await getProjects();
      
      expect(projects).toEqual([]);
      expect(mockConsoleError).toHaveBeenCalledWith('Error loading projects:', expect.any(Error));
    });
  });

  describe('getFeaturedProjects', () => {
    it('should return only featured projects', async () => {
      const featuredProjects = await getFeaturedProjects();
      
      expect(featuredProjects).toBeInstanceOf(Array);
      featuredProjects.forEach(project => {
        expect(project.data.featured).toBe(true);
      });
    });

    it('should handle errors gracefully', async () => {
      // Mock getProjects to throw an error indirectly
      const { getCollection } = await import('astro:content');
      vi.mocked(getCollection).mockRejectedValueOnce(new Error('Collection error'));
      
      const featuredProjects = await getFeaturedProjects();
      
      expect(featuredProjects).toEqual([]);
      expect(mockConsoleError).toHaveBeenCalledWith('Error loading projects:', expect.any(Error));
    });
  });

  describe('getProjectBySlug', () => {
    it('should return project with matching slug', async () => {
      const project = await getProjectBySlug('ecommerce-platform');
      
      expect(project).toBeTruthy();
      expect(project?.slug).toBe('ecommerce-platform');
      expect(project?.data.title).toBe('E-commerce Platform');
    });

    it('should return undefined for non-existent slug', async () => {
      const project = await getProjectBySlug('non-existent-project');
      
      expect(project).toBeUndefined();
    });

    it('should handle errors gracefully', async () => {
      const { getCollection } = await import('astro:content');
      vi.mocked(getCollection).mockRejectedValueOnce(new Error('Collection error'));
      
      const project = await getProjectBySlug('test-slug');
      
      expect(project).toBeUndefined();
      expect(mockConsoleError).toHaveBeenCalledWith('Error loading projects:', expect.any(Error));
    });
  });

  describe('logProjectStats', () => {
    it('should log project statistics in development mode', async () => {
      await logProjectStats();
      
      // Should log statistics in development mode
      expect(mockConsoleLog).toHaveBeenCalledWith('📊 Project Statistics:');
    });

    it('should handle errors gracefully', async () => {
      const { getCollection } = await import('astro:content');
      vi.mocked(getCollection).mockRejectedValueOnce(new Error('Stats error'));
      
      await logProjectStats();
      
      // Should not throw errors even if getProjects fails
      expect(mockConsoleError).toHaveBeenCalledWith('Error loading projects:', expect.any(Error));
    });
  });

  describe('Project Data Processing', () => {
    it('should handle empty technologies array', () => {
      const projectWithEmptyTech = {
        slug: 'empty-tech',
        data: {
          title: 'Empty Tech Project',
          description: 'A project with no technologies',
          technologies: [],
          thumbnail: '/images/empty.jpg',
          publishDate: new Date('2024-01-01')
        }
      };
      
      expect(isValidProject(projectWithEmptyTech)).toBe(true);
    });

    it('should handle future publish dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const futureProject = {
        slug: 'future-project',
        data: {
          title: 'Future Project',
          description: 'A project with future date',
          technologies: ['React'],
          thumbnail: '/images/future.jpg',
          publishDate: futureDate
        }
      };
      
      expect(isValidProject(futureProject)).toBe(true);
    });

    it('should handle special characters in project data', () => {
      const specialCharsProject = {
        slug: 'special-chars',
        data: {
          title: 'Project with "Special" Characters & Symbols!',
          description: 'A project with émojis 🚀 and special chars: <>&"\'',
          technologies: ['React', 'Node.js', 'TypeScript'],
          thumbnail: '/images/special-chars.jpg',
          publishDate: new Date('2024-01-01')
        }
      };
      
      expect(isValidProject(specialCharsProject)).toBe(true);
    });

    it('should handle very long strings', () => {
      const longString = 'A'.repeat(1000);
      
      const longStringProject = {
        slug: 'long-string',
        data: {
          title: longString,
          description: longString,
          technologies: ['React'],
          thumbnail: '/images/long.jpg',
          publishDate: new Date('2024-01-01')
        }
      };
      
      expect(isValidProject(longStringProject)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle circular references in project data', () => {
      const circularProject: any = {
        slug: 'circular',
        data: {
          title: 'Circular Project',
          description: 'A project with circular reference',
          technologies: ['React'],
          thumbnail: '/images/circular.jpg',
          publishDate: new Date('2024-01-01')
        }
      };
      
      // Create circular reference
      circularProject.data.self = circularProject;
      
      // Should handle gracefully without infinite recursion
      expect(() => isValidProject(circularProject)).not.toThrow();
    });

    it('should handle prototype pollution attempts', () => {
      const maliciousProject = {
        slug: 'malicious',
        data: {
          title: 'Malicious Project',
          description: 'A project with prototype pollution attempt',
          technologies: ['React'],
          thumbnail: '/images/malicious.jpg',
          publishDate: new Date('2024-01-01'),
          '__proto__': { polluted: true },
          'constructor': { prototype: { polluted: true } }
        }
      };
      
      expect(isValidProject(maliciousProject)).toBe(true);
      expect((Object.prototype as any).polluted).toBeUndefined();
    });
  });
});