import { describe, it, expect, beforeAll } from 'vitest';
import { 
  generateProjectStructuredData, 
  generatePortfolioStructuredData, 
  generateFAQStructuredData,
  generateKeywords,
  generateMetaDescription,
  sanitizeSEOData
} from '../utils/seo';

describe('SEO Optimization', () => {
  let projects: any[];

  beforeAll(async () => {
    // Mock projects data for testing
    projects = [
      {
        data: {
          title: 'Test Project',
          description: 'A test project for SEO validation',
          technologies: ['React', 'TypeScript', 'Node.js'],
          thumbnail: '/images/test-thumbnail.jpg',
          featured: true,
          order: 1,
          links: {
            main: 'https://example.com',
            github: 'https://github.com/test/project'
          },
          publishDate: new Date('2024-01-01')
        }
      }
    ];
  });

  describe('Project Structured Data', () => {
    it('should generate valid project structured data', () => {
      const structuredData = generateProjectStructuredData(projects[0]);
      
      expect(structuredData['@context']).toBe('https://schema.org');
      expect(structuredData['@type']).toBe('SoftwareApplication');
      expect(structuredData.name).toBe('Test Project');
      expect(structuredData.description).toBe('A test project for SEO validation');
      expect(structuredData.programmingLanguage).toEqual(['React', 'TypeScript', 'Node.js']);
      expect(structuredData.author['@type']).toBe('Person');
      expect(structuredData.author.name).toBe('John Developer');
    });

    it('should handle missing optional fields gracefully', () => {
      const minimalProject = {
        data: {
          title: 'Minimal Project',
          description: 'Basic project',
          technologies: ['JavaScript'],
          thumbnail: '/test.jpg',
          featured: false,
          order: 1,
          links: {},
          publishDate: new Date('2024-01-01')
        }
      };

      const structuredData = generateProjectStructuredData(minimalProject);
      expect(structuredData.name).toBe('Minimal Project');
      expect(structuredData.url).toBeUndefined();
      expect(structuredData.codeRepository).toBeUndefined();
    });
  });

  describe('Portfolio Structured Data', () => {
    it('should generate valid portfolio collection structured data', () => {
      const portfolioData = generatePortfolioStructuredData(projects);
      
      expect(portfolioData['@context']).toBe('https://schema.org');
      expect(portfolioData['@type']).toBe('ItemList');
      expect(portfolioData.name).toBe('Developer Portfolio Projects');
      expect(portfolioData.numberOfItems).toBe(1);
      expect(portfolioData.itemListElement).toHaveLength(1);
      expect(portfolioData.itemListElement[0]['@type']).toBe('ListItem');
      expect(portfolioData.itemListElement[0].position).toBe(1);
    });
  });

  describe('FAQ Structured Data', () => {
    it('should generate valid FAQ structured data', () => {
      const faqData = generateFAQStructuredData();
      
      expect(faqData['@context']).toBe('https://schema.org');
      expect(faqData['@type']).toBe('FAQPage');
      expect(faqData.mainEntity).toBeInstanceOf(Array);
      expect(faqData.mainEntity.length).toBeGreaterThan(0);
      
      const firstQuestion = faqData.mainEntity[0];
      expect(firstQuestion['@type']).toBe('Question');
      expect(firstQuestion.name).toBeDefined();
      expect(firstQuestion.acceptedAnswer['@type']).toBe('Answer');
      expect(firstQuestion.acceptedAnswer.text).toBeDefined();
    });
  });

  describe('Keyword Generation', () => {
    it('should generate keywords from project technologies', () => {
      const keywords = generateKeywords(projects, ['developer', 'portfolio']);
      
      expect(keywords).toContain('developer');
      expect(keywords).toContain('portfolio');
      expect(keywords).toContain('react');
      expect(keywords).toContain('typescript');
      expect(keywords).toContain('node');
    });

    it('should include keyword variations', () => {
      const keywords = generateKeywords(projects);
      
      // Should include variations for common technologies
      expect(keywords).toContain('react');
      expect(keywords).toContain('react.js');
      expect(keywords).toContain('reactjs');
    });

    it('should limit and sort keywords', () => {
      const keywords = generateKeywords(projects);
      
      expect(keywords).toBeInstanceOf(Array);
      expect(keywords.length).toBeGreaterThan(0);
      // Keywords should be sorted
      const sortedKeywords = [...keywords].sort();
      expect(keywords).toEqual(sortedKeywords);
    });
  });

  describe('Meta Description Generation', () => {
    it('should generate meta description within character limit', () => {
      const content = 'This is a test content for meta description generation. It should be truncated properly if it exceeds the maximum length limit.';
      const description = generateMetaDescription(content, 100);
      
      expect(description.length).toBeLessThanOrEqual(100);
      expect(description).not.toContain('<');
      expect(description).not.toContain('#');
    });

    it('should preserve complete sentences when possible', () => {
      const content = 'Short sentence. Another short one. Third sentence.';
      const description = generateMetaDescription(content, 50);
      
      // Should preserve complete sentences when they fit within reasonable bounds
      expect(description.length).toBeLessThanOrEqual(50);
      expect(description).toContain('Short sentence.');
    });

    it('should handle markdown and HTML tags', () => {
      const content = '# Heading\n\n**Bold text** and *italic text*. <p>HTML paragraph</p>';
      const description = generateMetaDescription(content);
      
      expect(description).not.toContain('#');
      expect(description).not.toContain('**');
      expect(description).not.toContain('*');
      expect(description).not.toContain('<p>');
      expect(description).not.toContain('</p>');
    });
  });

  describe('SEO Data Sanitization', () => {
    it('should sanitize and validate SEO data', () => {
      const rawData = {
        title: '  Very Long Title That Exceeds The Recommended Length For SEO Optimization  ',
        description: 'A'.repeat(200), // Exceeds 160 character limit
        keywords: Array.from({ length: 15 }, (_, i) => `keyword${i}`), // Exceeds 10 keyword limit
        author: '  John Developer  '
      };

      const sanitized = sanitizeSEOData(rawData);
      
      expect(sanitized.title.length).toBeLessThanOrEqual(60);
      expect(sanitized.title).not.toMatch(/^\s|\s$/); // No leading/trailing whitespace
      expect(sanitized.description.length).toBeLessThanOrEqual(160);
      expect(sanitized.keywords.length).toBeLessThanOrEqual(10);
      expect(sanitized.author).toBe('John Developer');
    });

    it('should provide default values for missing data', () => {
      const sanitized = sanitizeSEOData({});
      
      expect(sanitized.title).toBe('Portfolio - Full Stack Developer');
      expect(sanitized.description).toContain('Modern portfolio');
      expect(sanitized.keywords).toContain('developer');
      expect(sanitized.type).toBe('website');
      expect(sanitized.author).toBe('John Developer');
      expect(sanitized.noindex).toBe(false);
      expect(sanitized.nofollow).toBe(false);
    });
  });

  describe('URL and Image Handling', () => {
    it('should handle absolute and relative URLs correctly', () => {
      const projectWithRelativeImage = {
        data: {
          ...projects[0].data,
          thumbnail: '/images/relative-image.jpg'
        }
      };

      const structuredData = generateProjectStructuredData(projectWithRelativeImage);
      expect(structuredData.image).toBe('https://johndeveloper.dev/images/relative-image.jpg');
    });

    it('should preserve absolute URLs', () => {
      const projectWithAbsoluteImage = {
        data: {
          ...projects[0].data,
          thumbnail: 'https://external.com/image.jpg'
        }
      };

      const structuredData = generateProjectStructuredData(projectWithAbsoluteImage);
      expect(structuredData.image).toBe('https://external.com/image.jpg');
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly for structured data', () => {
      const testDate = new Date('2024-03-15T10:30:00Z');
      const project = {
        data: {
          ...projects[0].data,
          publishDate: testDate
        }
      };

      const structuredData = generateProjectStructuredData(project);
      expect(structuredData.dateCreated).toBe('2024-03-15');
      expect(structuredData.dateModified).toBe('2024-03-15');
    });
  });
});

describe('SEO Integration Tests', () => {
  it('should validate complete SEO workflow', () => {
    // Simulate the complete SEO data generation workflow
    const mockProjects = [
      {
        data: {
          title: 'E-commerce Platform',
          description: 'Full-stack e-commerce solution with React and Node.js',
          technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
          thumbnail: '/images/ecommerce.jpg',
          featured: true,
          order: 1,
          links: {
            main: 'https://ecommerce.example.com',
            github: 'https://github.com/user/ecommerce'
          },
          publishDate: new Date('2024-01-15')
        }
      },
      {
        data: {
          title: 'Weather Dashboard',
          description: 'Real-time weather application with Vue.js',
          technologies: ['Vue.js', 'TypeScript', 'API Integration'],
          thumbnail: '/images/weather.jpg',
          featured: false,
          order: 2,
          links: {
            main: 'https://weather.example.com',
            github: 'https://github.com/user/weather'
          },
          publishDate: new Date('2024-02-01')
        }
      }
    ];

    // Generate all SEO components
    const keywords = generateKeywords(mockProjects, ['developer', 'portfolio']);
    const portfolioData = generatePortfolioStructuredData(mockProjects);
    const faqData = generateFAQStructuredData();
    
    const seoData = sanitizeSEOData({
      title: 'John Developer - Full Stack Portfolio',
      description: 'Experienced developer showcasing modern web applications',
      keywords: keywords,
      type: 'website' as const,
      author: 'John Developer'
    });

    // Validate the complete SEO package
    expect(seoData.title).toBeDefined();
    expect(seoData.description).toBeDefined();
    expect(seoData.keywords.length).toBeGreaterThan(0);
    expect(portfolioData.numberOfItems).toBe(2);
    expect(faqData.mainEntity.length).toBeGreaterThan(0);
    
    // Validate structured data integrity
    expect(portfolioData.itemListElement[0].item.name).toBe('E-commerce Platform');
    expect(portfolioData.itemListElement[1].item.name).toBe('Weather Dashboard');
  });
});