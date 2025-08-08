/**
 * Integration tests for content collections
 * These tests verify that the content collections are properly configured
 * and that the project data is valid and accessible.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

const PROJECTS_DIR = join(process.cwd(), 'src', 'content', 'projects');

function getProjectFiles() {
  try {
    return readdirSync(PROJECTS_DIR).filter(file => file.endsWith('.md'));
  } catch (error) {
    return [];
  }
}

function parseProjectFile(filename: string) {
  const filePath = join(PROJECTS_DIR, filename);
  const fileContent = readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  
  return {
    slug: filename.replace('.md', ''),
    data,
    content
  };
}

describe('Content Collections', () => {
  describe('Project Files', () => {
    it('should have project files in the projects directory', () => {
      const projectFiles = getProjectFiles();
      expect(projectFiles.length).toBeGreaterThan(0);
    });
    
    it('should have valid frontmatter in all project files', () => {
      const projectFiles = getProjectFiles();
      
      projectFiles.forEach(filename => {
        const project = parseProjectFile(filename);
        
        // Check required fields
        expect(project.data).toHaveProperty('title');
        expect(project.data).toHaveProperty('description');
        expect(project.data).toHaveProperty('technologies');
        expect(project.data).toHaveProperty('thumbnail');
        expect(project.data).toHaveProperty('publishDate');
        
        // Check data types
        expect(typeof project.data.title).toBe('string');
        expect(typeof project.data.description).toBe('string');
        expect(Array.isArray(project.data.technologies)).toBe(true);
        expect(typeof project.data.thumbnail).toBe('string');
        
        // Check optional fields
        if ('featured' in project.data) {
          expect(typeof project.data.featured).toBe('boolean');
        }
        if ('order' in project.data) {
          expect(typeof project.data.order).toBe('number');
        }
      });
    });
    
    it('should have valid technologies arrays', () => {
      const projectFiles = getProjectFiles();
      
      projectFiles.forEach(filename => {
        const project = parseProjectFile(filename);
        
        expect(Array.isArray(project.data.technologies)).toBe(true);
        expect(project.data.technologies.length).toBeGreaterThan(0);
        
        project.data.technologies.forEach((tech: any) => {
          expect(typeof tech).toBe('string');
          expect(tech.length).toBeGreaterThan(0);
        });
      });
    });
    
    it('should have valid links structure when present', () => {
      const projectFiles = getProjectFiles();
      
      projectFiles.forEach(filename => {
        const project = parseProjectFile(filename);
        
        if (project.data.links) {
          const { links } = project.data;
          expect(typeof links).toBe('object');
          
          // Test URL validity for each link type
          if (links.main) {
            expect(() => new URL(links.main)).not.toThrow();
          }
          if (links.github) {
            expect(() => new URL(links.github)).not.toThrow();
            expect(links.github).toContain('github.com');
          }
          if (links.additional) {
            expect(() => new URL(links.additional)).not.toThrow();
          }
        }
      });
    });
    
    it('should have reasonable publish dates', () => {
      const projectFiles = getProjectFiles();
      
      projectFiles.forEach(filename => {
        const project = parseProjectFile(filename);
        
        const publishDate = new Date(project.data.publishDate);
        expect(publishDate.getTime()).not.toBeNaN();
        
        // Dates should be reasonable (not in far future or past)
        const now = new Date();
        const twoYearsAgo = new Date(now.getFullYear() - 2, 0, 1);
        const oneYearFromNow = new Date(now.getFullYear() + 1, 11, 31);
        
        expect(publishDate.getTime()).toBeGreaterThan(twoYearsAgo.getTime());
        expect(publishDate.getTime()).toBeLessThan(oneYearFromNow.getTime());
      });
    });
    
    it('should have non-empty content body', () => {
      const projectFiles = getProjectFiles();
      
      projectFiles.forEach(filename => {
        const project = parseProjectFile(filename);
        expect(project.content.trim().length).toBeGreaterThan(0);
      });
    });
    
    it('should have unique project orders', () => {
      const projectFiles = getProjectFiles();
      const orders = projectFiles
        .map(filename => parseProjectFile(filename))
        .filter(project => 'order' in project.data)
        .map(project => project.data.order);
      
      const uniqueOrders = new Set(orders);
      expect(uniqueOrders.size).toBe(orders.length);
    });
    
    it('should have at least one featured project', () => {
      const projectFiles = getProjectFiles();
      const featuredProjects = projectFiles
        .map(filename => parseProjectFile(filename))
        .filter(project => project.data.featured === true);
      
      expect(featuredProjects.length).toBeGreaterThan(0);
    });
  });
  
  describe('Content Schema Validation', () => {
    it('should match the expected schema structure', () => {
      const projectFiles = getProjectFiles();
      const requiredFields = ['title', 'description', 'technologies', 'thumbnail', 'publishDate'];
      const optionalFields = ['featured', 'order', 'links'];
      
      projectFiles.forEach(filename => {
        const project = parseProjectFile(filename);
        
        // Check all required fields are present
        requiredFields.forEach(field => {
          expect(project.data).toHaveProperty(field);
        });
        
        // Check no unexpected fields (only required + optional)
        const allowedFields = [...requiredFields, ...optionalFields];
        Object.keys(project.data).forEach(field => {
          expect(allowedFields).toContain(field);
        });
      });
    });
  });
});