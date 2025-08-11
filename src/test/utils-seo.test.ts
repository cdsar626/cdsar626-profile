/**
 * Unit tests for SEO utility functions
 * Tests structured data generation, meta tag optimization, and SEO validation
 */

import { describe, it, expect } from 'vitest';
import {
  generateProjectStructuredData,
  generatePortfolioStructuredData,
  generateBreadcrumbStructuredData,
  generateFAQStructuredData,
  generateMetaDescription,
  generateKeywords,
  sanitizeSEOData,
  type SEOConfig
} from '../utils/seo';

// Mock project data for testing
const mockProject = {
  slug: 'test-project',
  data: {
    title: 'Test Project',
    description: 'A comprehensive test project showcasing modern web development techniques.',
    technologies: ['React', 'TypeScript', 'Node.js'],
    thumbnail: '/images/test-project.jpg',
    publishDate: new Date('2024-01-15'),
    featured: true,
    order: 1,
    links: {
      main: 'https://test-project.example.com',
      github: 'https://github.com/user/test-project',
      additional: 'https://docs.test-project.com'
    }
  },
  body: 'This is the detailed project description content.'
} as any;

const mockProjects = [
  mockProject,
  {
    slug: 'second-project',
    data: {
      title: 'Second Project',
      description: 'Another test project.',
      technologies: ['Vue', 'JavaScript'],
      thumbnail: 'https://external.com/image.jpg',
      publishDate: new Date('2024-02-01'),
      featured: false,
      order: 2,
      links: {
        main: 'https://second-project.example.com'
      }
    }
  }
] as any[];

describe('SEO Utility Functions', () => {
  describe('generateProjectStructuredData', () => {
    it('should generate valid structured data for a project', () => {
      const result = generateProjectStructuredData(mockProject);

      expect(result).toEqual({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Test Project',
        description: 'A comprehensive test project showcasing modern web development techniques.',
        author: {
          '@type': 'Person',
          name: 'John Developer'
        },
        dateCreated: '2024-01-15',
        dateModified: '2024-01-15',
        keywords: 'React, TypeScript, Node.js',
        programmingLanguage: ['React', 'TypeScript', 'Node.js'],
        url: 'https://test-project.example.com',
        codeRepository: 'https://github.com/user/test-project',
        image: 'https://johndeveloper.dev/images/test-project.jpg',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web Browser'
      });
    });

    it('should handle custom author name and base URL', () => {
      const result = generateProjectStructuredData(
        mockProject,
        'Jane Smith',
        'https://janesmith.dev'
      );

      expect(result.author.name).toBe('Jane Smith');
      expect(result.image).toBe('https://janesmith.dev/images/test-project.jpg');
    });

    it('should handle external image URLs', () => {
      const projectWithExternalImage = {
        ...mockProject,
        data: {
          ...mockProject.data,
          thumbnail: 'https://external.com/image.jpg'
        }
      };

      const result = generateProjectStructuredData(projectWithExternalImage);
      expect(result.image).toBe('https://external.com/image.jpg');
    });

    it('should handle missing optional links', () => {
      const projectWithMinimalLinks = {
        ...mockProject,
        data: {
          ...mockProject.data,
          links: {
            main: 'https://example.com'
          }
        }
      };

      const result = generateProjectStructuredData(projectWithMinimalLinks);
      expect(result.url).toBe('https://example.com');
      expect(result.codeRepository).toBeUndefined();
    });

    it('should handle empty technologies array', () => {
      const projectWithNoTech = {
        ...mockProject,
        data: {
          ...mockProject.data,
          technologies: []
        }
      };

      const result = generateProjectStructuredData(projectWithNoTech);
      expect(result.keywords).toBe('');
      expect(result.programmingLanguage).toEqual([]);
    });
  });

  describe('generatePortfolioStructuredData', () => {
    it('should generate valid portfolio structured data', () => {
      const result = generatePortfolioStructuredData(mockProjects);

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('ItemList');
      expect(result.name).toBe('Developer Portfolio Projects');
      expect(result.numberOfItems).toBe(2);
      expect(result.itemListElement).toHaveLength(2);

      // Check first item
      const firstItem = result.itemListElement[0];
      expect(firstItem['@type']).toBe('ListItem');
      expect(firstItem.position).toBe(1);
      expect(firstItem.item.name).toBe('Test Project');

      // Check second item
      const secondItem = result.itemListElement[1];
      expect(secondItem.position).toBe(2);
      expect(secondItem.item.name).toBe('Second Project');
    });

    it('should handle empty projects array', () => {
      const result = generatePortfolioStructuredData([]);

      expect(result.numberOfItems).toBe(0);
      expect(result.itemListElement).toEqual([]);
    });

    it('should use custom author and base URL', () => {
      const result = generatePortfolioStructuredData(
        mockProjects,
        'Custom Author',
        'https://custom.dev'
      );

      const firstItem = result.itemListElement[0];
      expect(firstItem.item.author.name).toBe('Custom Author');
    });
  });

  describe('generateBreadcrumbStructuredData', () => {
    it('should generate valid breadcrumb structured data', () => {
      const breadcrumbItems = [
        { name: 'Home', url: '/' },
        { name: 'Projects', url: '/projects' },
        { name: 'Test Project', url: '/projects/test-project' }
      ];

      const result = generateBreadcrumbStructuredData(breadcrumbItems);

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('BreadcrumbList');
      expect(result.itemListElement).toHaveLength(3);

      // Check first breadcrumb
      const firstCrumb = result.itemListElement[0];
      expect(firstCrumb['@type']).toBe('ListItem');
      expect(firstCrumb.position).toBe(1);
      expect(firstCrumb.name).toBe('Home');
      expect(firstCrumb.item).toBe('https://johndeveloper.dev/');

      // Check last breadcrumb
      const lastCrumb = result.itemListElement[2];
      expect(lastCrumb.position).toBe(3);
      expect(lastCrumb.name).toBe('Test Project');
      expect(lastCrumb.item).toBe('https://johndeveloper.dev/projects/test-project');
    });

    it('should handle absolute URLs', () => {
      const breadcrumbItems = [
        { name: 'External', url: 'https://external.com' }
      ];

      const result = generateBreadcrumbStructuredData(breadcrumbItems);
      expect(result.itemListElement[0].item).toBe('https://external.com');
    });

    it('should handle custom base URL', () => {
      const breadcrumbItems = [
        { name: 'Home', url: '/' }
      ];

      const result = generateBreadcrumbStructuredData(
        breadcrumbItems,
        'https://custom.dev'
      );
      expect(result.itemListElement[0].item).toBe('https://custom.dev/');
    });
  });

  describe('generateFAQStructuredData', () => {
    it('should generate valid FAQ structured data', () => {
      const result = generateFAQStructuredData();

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('FAQPage');
      expect(result.mainEntity).toBeInstanceOf(Array);
      expect(result.mainEntity.length).toBeGreaterThan(0);

      // Check first FAQ item
      const firstFAQ = result.mainEntity[0];
      expect(firstFAQ['@type']).toBe('Question');
      expect(firstFAQ.name).toBeTruthy();
      expect(firstFAQ.acceptedAnswer['@type']).toBe('Answer');
      expect(firstFAQ.acceptedAnswer.text).toBeTruthy();
    });

    it('should include expected FAQ topics', () => {
      const result = generateFAQStructuredData();
      const questions = result.mainEntity.map((item: any) => item.name);

      expect(questions).toContain('What technologies do you specialize in?');
      expect(questions).toContain('How can I view your CV?');
      expect(questions).toContain('Are you available for freelance projects?');
      expect(questions).toContain('What is your development approach?');
    });
  });

  describe('generateMetaDescription', () => {
    it('should return content as-is if within limit', () => {
      const shortContent = 'This is a short description.';
      const result = generateMetaDescription(shortContent);

      expect(result).toBe(shortContent);
    });

    it('should truncate at sentence boundary when possible', () => {
      const content = 'This is the first sentence. This is a very long second sentence that would exceed the character limit and should be truncated properly.';
      const result = generateMetaDescription(content, 50);

      expect(result).toBe('This is the first sentence.');
      expect(result.length).toBeLessThanOrEqual(50);
    });

    it('should truncate at word boundary when no sentence boundary', () => {
      const content = 'This is a very long sentence without any periods that needs to be truncated at a word boundary';
      const result = generateMetaDescription(content, 50);

      expect(result).toMatch(/\.\.\.$|[^.]$/);
      expect(result.length).toBeLessThanOrEqual(53); // 50 + '...'
    });

    it('should remove markdown formatting', () => {
      const markdownContent = '# Heading\n\n**Bold text** and *italic text* with `code` blocks.';
      const result = generateMetaDescription(markdownContent);

      expect(result).not.toContain('#');
      expect(result).not.toContain('**');
      expect(result).not.toContain('*');
      expect(result).not.toContain('`');
    });

    it('should remove HTML tags', () => {
      const htmlContent = '<h1>Heading</h1><p>This is a <strong>paragraph</strong> with <a href="#">links</a>.</p>';
      const result = generateMetaDescription(htmlContent);

      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).toContain('Heading');
      expect(result).toContain('paragraph');
    });

    it('should handle empty or whitespace content', () => {
      expect(generateMetaDescription('')).toBe('');
      expect(generateMetaDescription('   \n\t   ')).toBe('');
    });

    it('should use custom max length', () => {
      const content = 'This is a test description that is longer than the custom limit.';
      const result = generateMetaDescription(content, 30);

      expect(result.length).toBeLessThanOrEqual(33); // 30 + '...'
    });
  });

  describe('generateKeywords', () => {
    it('should extract keywords from project technologies', () => {
      const result = generateKeywords(mockProjects);

      expect(result).toContain('react');
      expect(result).toContain('typescript');
      expect(result).toContain('node.js');
      expect(result).toContain('vue');
      expect(result).toContain('javascript');
    });

    it('should include base keywords', () => {
      const baseKeywords = ['portfolio', 'developer'];
      const result = generateKeywords(mockProjects, baseKeywords);

      expect(result).toContain('portfolio');
      expect(result).toContain('developer');
    });

    it('should add technology variations', () => {
      const result = generateKeywords(mockProjects);

      // React variations
      expect(result).toContain('react');
      expect(result).toContain('reactjs');

      // Node.js variations
      expect(result).toContain('node.js');
      expect(result).toContain('node');
      expect(result).toContain('nodejs');
    });

    it('should return sorted unique keywords', () => {
      const result = generateKeywords(mockProjects);

      // Check uniqueness
      const uniqueResult = [...new Set(result)];
      expect(result).toEqual(uniqueResult);

      // Check sorting
      const sortedResult = [...result].sort();
      expect(result).toEqual(sortedResult);
    });

    it('should handle empty projects array', () => {
      const result = generateKeywords([]);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle projects with no technologies', () => {
      const projectsWithoutTech = [{
        data: {
          technologies: []
        }
      }] as any[];

      const result = generateKeywords(projectsWithoutTech);
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('sanitizeSEOData', () => {
    it('should use provided values when valid', () => {
      const input: Partial<SEOConfig> = {
        title: 'Custom Title',
        description: 'Custom description for the page',
        image: '/custom-image.jpg',
        keywords: ['custom', 'keywords'],
        type: 'article',
        author: 'Custom Author',
        noindex: true,
        nofollow: true
      };

      const result = sanitizeSEOData(input);

      expect(result.title).toBe('Custom Title');
      expect(result.description).toBe('Custom description for the page');
      expect(result.image).toBe('/custom-image.jpg');
      expect(result.keywords).toEqual(['custom', 'keywords']);
      expect(result.type).toBe('article');
      expect(result.author).toBe('Custom Author');
      expect(result.noindex).toBe(true);
      expect(result.nofollow).toBe(true);
    });

    it('should use defaults for missing values', () => {
      const result = sanitizeSEOData({});

      expect(result.title).toBe('Portfolio - Full Stack Developer');
      expect(result.description).toBe('Modern portfolio showcasing full-stack development projects and expertise');
      expect(result.image).toBe('/images/og-image.svg');
      expect(result.keywords).toEqual(['developer', 'portfolio', 'full-stack']);
      expect(result.type).toBe('website');
      expect(result.author).toBe('John Developer');
      expect(result.noindex).toBe(false);
      expect(result.nofollow).toBe(false);
    });

    it('should truncate title to 60 characters', () => {
      const longTitle = 'This is a very long title that exceeds the recommended 60 character limit for SEO optimization';
      const result = sanitizeSEOData({ title: longTitle });

      expect(result.title.length).toBeLessThanOrEqual(60);
      expect(result.title.endsWith(' ')).toBe(false); // Should not end with space
    });

    it('should truncate description to 160 characters', () => {
      const longDescription = 'This is a very long description that exceeds the recommended 160 character limit for meta descriptions in search engine optimization and should be truncated appropriately while maintaining readability.';
      const result = sanitizeSEOData({ description: longDescription });

      expect(result.description.length).toBeLessThanOrEqual(160);
      expect(result.description.endsWith(' ')).toBe(false); // Should not end with space
    });

    it('should limit keywords to 10 items', () => {
      const manyKeywords = Array.from({ length: 15 }, (_, i) => `keyword${i}`);
      const result = sanitizeSEOData({ keywords: manyKeywords });

      expect(result.keywords.length).toBe(10);
    });

    it('should trim whitespace from strings', () => {
      const input = {
        title: '  Whitespace Title  ',
        description: '  Whitespace Description  ',
        author: '  Whitespace Author  '
      };

      const result = sanitizeSEOData(input);

      expect(result.title).toBe('Whitespace Title');
      expect(result.description).toBe('Whitespace Description');
      expect(result.author).toBe('Whitespace Author');
    });

    it('should handle undefined and null values', () => {
      const input = {
        title: undefined,
        description: null,
        keywords: undefined
      } as any;

      const result = sanitizeSEOData(input);

      expect(result.title).toBe('Portfolio - Full Stack Developer');
      expect(result.description).toBe('Modern portfolio showcasing full-stack development projects and expertise');
      expect(result.keywords).toEqual(['developer', 'portfolio', 'full-stack']);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed project data gracefully', () => {
      const malformedProject = {
        data: {
          title: null,
          description: null,
          technologies: 'not-an-array',
          thumbnail: null,
          publishDate: new Date('invalid-date'), // This creates an invalid Date object
          links: {} // Empty links object
        }
      } as any;

      // The function should handle malformed data without throwing
      const result = generateProjectStructuredData(malformedProject);
      expect(result).toBeTruthy();
      expect(result['@type']).toBe('SoftwareApplication');
      expect(result.keywords).toBe('');
      expect(result.programmingLanguage).toEqual([]);
    });

    it('should handle special characters in structured data', () => {
      const specialProject = {
        ...mockProject,
        data: {
          ...mockProject.data,
          title: 'Project with "quotes" & <tags>',
          description: 'Description with émojis 🚀 and symbols: @#$%'
        }
      };

      const result = generateProjectStructuredData(specialProject);
      expect(result.name).toBe('Project with "quotes" & <tags>');
      expect(result.description).toBe('Description with émojis 🚀 and symbols: @#$%');
    });

    it('should handle very long technology arrays', () => {
      const projectWithManyTech = {
        ...mockProject,
        data: {
          ...mockProject.data,
          technologies: Array.from({ length: 50 }, (_, i) => `Tech${i}`)
        }
      };

      const result = generateProjectStructuredData(projectWithManyTech);
      expect(result.programmingLanguage).toHaveLength(50);
      expect(result.keywords.split(', ')).toHaveLength(50);
    });
  });
});