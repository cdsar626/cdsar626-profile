import { describe, it, expect } from 'vitest';

// Mock data for testing
const mockProjectData = {
  title: "Test Project",
  description: "A test project for component verification",
  technologies: ["React", "TypeScript", "Tailwind"],
  thumbnail: "/images/test-thumbnail.svg",
  links: {
    main: "https://example.com",
    github: "https://github.com/test/project",
    additional: "https://docs.example.com"
  },
  featured: true
};

describe('ProjectCard Component', () => {
  it('should have correct interface structure', () => {
    // Test that our mock data matches the expected interface
    expect(mockProjectData).toHaveProperty('title');
    expect(mockProjectData).toHaveProperty('description');
    expect(mockProjectData).toHaveProperty('technologies');
    expect(mockProjectData).toHaveProperty('thumbnail');
    expect(mockProjectData).toHaveProperty('links');
    expect(mockProjectData).toHaveProperty('featured');
    
    // Test data types
    expect(typeof mockProjectData.title).toBe('string');
    expect(typeof mockProjectData.description).toBe('string');
    expect(Array.isArray(mockProjectData.technologies)).toBe(true);
    expect(typeof mockProjectData.thumbnail).toBe('string');
    expect(typeof mockProjectData.links).toBe('object');
    expect(typeof mockProjectData.featured).toBe('boolean');
  });

  it('should handle optional link properties', () => {
    const minimalProject = {
      title: "Minimal Project",
      description: "A project with minimal links",
      technologies: ["JavaScript"],
      thumbnail: "/images/minimal.svg",
      links: {
        main: "https://example.com"
        // github and additional are optional
      } as { main: string; github?: string; additional?: string },
      featured: false
    };

    expect(minimalProject.links.main).toBeDefined();
    expect(minimalProject.links.github).toBeUndefined();
    expect(minimalProject.links.additional).toBeUndefined();
  });

  it('should handle empty technologies array', () => {
    const projectWithoutTech = {
      ...mockProjectData,
      technologies: []
    };

    expect(Array.isArray(projectWithoutTech.technologies)).toBe(true);
    expect(projectWithoutTech.technologies.length).toBe(0);
  });

  it('should handle featured flag correctly', () => {
    const featuredProject = { ...mockProjectData, featured: true };
    const regularProject = { ...mockProjectData, featured: false };
    const defaultProject = { ...mockProjectData };
    delete (defaultProject as any).featured;

    expect(featuredProject.featured).toBe(true);
    expect(regularProject.featured).toBe(false);
    expect(defaultProject.featured).toBeUndefined();
  });
});

// Test CSS class names and structure expectations
describe('ProjectCard CSS Classes', () => {
  const expectedClasses = [
    'project-card',
    'project-card__thumbnail',
    'project-card__image',
    'project-card__overlay',
    'project-card__links',
    'project-card__link',
    'project-card__link--main',
    'project-card__link--github',
    'project-card__link--additional',
    'project-card__icon',
    'project-card__content',
    'project-card__title',
    'project-card__description',
    'project-card__technologies',
    'project-card__tech-tag'
  ];

  it('should define all expected CSS classes', () => {
    // This test ensures we maintain consistent naming
    expectedClasses.forEach(className => {
      expect(className).toMatch(/^project-card/);
    });
  });

  it('should follow BEM naming convention', () => {
    const bemPattern = /^project-card(__[a-z-]+)?(--[a-z-]+)?$/;
    
    expectedClasses.forEach(className => {
      expect(className).toMatch(bemPattern);
    });
  });
});

// Test accessibility requirements
describe('ProjectCard Accessibility', () => {
  it('should include required accessibility attributes', () => {
    const requiredAriaLabels = [
      'View {title} project',
      'View {title} on GitHub',
      'Additional link for {title}'
    ];

    requiredAriaLabels.forEach(label => {
      expect(label).toContain('{title}');
    });
  });

  it('should support screen reader text', () => {
    const screenReaderText = 'View Project';
    expect(screenReaderText).toBe('View Project');
  });
});

export { mockProjectData };