import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

/**
 * Safely loads all projects with error handling
 * @returns Promise<Project[]> - Array of valid projects
 */
export async function getProjects(): Promise<Project[]> {
  try {
    const projects = await getCollection('projects');
    
    // Sort by order and then by publish date (newest first)
    return projects.sort((a, b) => {
      if (a.data.order !== b.data.order) {
        return a.data.order - b.data.order;
      }
      return b.data.publishDate.getTime() - a.data.publishDate.getTime();
    });
    
  } catch (error) {
    console.error('Error loading projects:', error);
    
    // Return empty array as fallback
    return [];
  }
}

/**
 * Gets only featured projects
 * @returns Promise<Project[]> - Array of featured projects
 */
export async function getFeaturedProjects(): Promise<Project[]> {
  try {
    const projects = await getProjects();
    return projects.filter(project => project.data.featured);
  } catch (error) {
    console.error('Error loading featured projects:', error);
    return [];
  }
}

/**
 * Gets a specific project by slug
 * @param slug - The project slug
 * @returns Promise<Project | undefined> - The project or undefined if not found
 */
export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  try {
    const projects = await getProjects();
    return projects.find(project => project.slug === slug);
  } catch (error) {
    console.error(`Error loading project with slug "${slug}":`, error);
    return undefined;
  }
}

/**
 * Validates project data structure
 * @param project - The project to validate
 * @returns boolean - True if project is valid
 */
export function isValidProject(project: any): project is Project {
  if (!project || typeof project !== 'object') return false;
  
  const { data } = project;
  if (!data) return false;
  
  // Check required fields
  const requiredFields = ['title', 'description', 'technologies', 'thumbnail', 'publishDate'];
  for (const field of requiredFields) {
    if (!(field in data)) return false;
  }
  
  // Check data types
  if (typeof data.title !== 'string') return false;
  if (typeof data.description !== 'string') return false;
  if (!Array.isArray(data.technologies)) return false;
  if (typeof data.thumbnail !== 'string') return false;
  if (!(data.publishDate instanceof Date)) return false;
  
  // Check optional fields
  if ('featured' in data && typeof data.featured !== 'boolean') return false;
  if ('order' in data && typeof data.order !== 'number') return false;
  
  // Check links structure
  if ('links' in data && data.links) {
    const { links } = data;
    if (typeof links !== 'object') return false;
    
    // Validate URL fields if they exist
    const urlFields = ['main', 'github', 'additional'];
    for (const field of urlFields) {
      if (field in links && links[field]) {
        try {
          new URL(links[field]);
        } catch {
          return false;
        }
      }
    }
  }
  
  return true;
}

/**
 * Content collection error handler
 * @param error - The error to handle
 * @param context - Additional context for the error
 */
export function handleContentError(error: unknown, context: string = 'content loading'): void {
  console.error(`Content collection error during ${context}:`, error);
  
  // Log specific error types for debugging
  if (error instanceof Error) {
    if (error.message.includes('Invalid input')) {
      console.error('💡 Schema validation error - check frontmatter data types');
    } else if (error.message.includes('Collection')) {
      console.error('💡 Collection configuration error - check config.ts');
    } else if (error.message.includes('not found')) {
      console.error('💡 Content file not found - check file paths');
    }
  }
}

/**
 * Development helper to log project statistics
 */
export async function logProjectStats(): Promise<void> {
  if (import.meta.env.DEV) {
    try {
      const projects = await getProjects();
      const featured = projects.filter(p => p.data.featured);
      
      console.log('📊 Project Statistics:');
      console.log(`  Total projects: ${projects.length}`);
      console.log(`  Featured projects: ${featured.length}`);
      console.log(`  Technologies used: ${[...new Set(projects.flatMap(p => p.data.technologies))].length}`);
      
      // Log projects by order
      console.log('  Projects by order:');
      projects.forEach(p => {
        console.log(`    ${p.data.order}: ${p.data.title} ${p.data.featured ? '⭐' : ''}`);
      });
      
    } catch (error) {
      handleContentError(error, 'project statistics logging');
    }
  }
}