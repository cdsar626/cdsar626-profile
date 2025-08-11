import type { CollectionEntry } from 'astro:content';

export interface SEOConfig {
  title: string;
  description: string;
  image?: string;
  keywords?: string[];
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishDate?: Date;
  modifiedDate?: Date;
  noindex?: boolean;
  nofollow?: boolean;
}

export interface ProjectStructuredData {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  author: {
    '@type': string;
    name: string;
  };
  dateCreated: string;
  dateModified?: string;
  keywords: string;
  programmingLanguage: string[];
  url?: string;
  codeRepository?: string;
  image?: string;
  applicationCategory: string;
  operatingSystem: string;
}

/**
 * Generate structured data for a project
 */
export function generateProjectStructuredData(
  project: CollectionEntry<'projects'>,
  authorName: string = 'John Developer',
  baseUrl: string = 'https://johndeveloper.dev'
): ProjectStructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.data.title,
    description: project.data.description,
    author: {
      '@type': 'Person',
      name: authorName
    },
    dateCreated: project.data.publishDate instanceof Date && !isNaN(project.data.publishDate.getTime()) 
      ? project.data.publishDate.toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0],
    dateModified: project.data.publishDate instanceof Date && !isNaN(project.data.publishDate.getTime()) 
      ? project.data.publishDate.toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0],
    keywords: Array.isArray(project.data.technologies) 
      ? project.data.technologies.join(', ') 
      : '',
    programmingLanguage: Array.isArray(project.data.technologies) 
      ? project.data.technologies 
      : [],
    url: project.data.links.main,
    codeRepository: project.data.links.github,
    image: project.data.thumbnail && typeof project.data.thumbnail === 'string' && project.data.thumbnail.startsWith('http') 
      ? project.data.thumbnail 
      : project.data.thumbnail && typeof project.data.thumbnail === 'string'
        ? `${baseUrl}${project.data.thumbnail}`
        : `${baseUrl}/images/default-project.jpg`,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web Browser'
  };
}

/**
 * Generate structured data for the portfolio collection
 */
export function generatePortfolioStructuredData(
  projects: CollectionEntry<'projects'>[],
  authorName: string = 'John Developer',
  baseUrl: string = 'https://johndeveloper.dev'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Developer Portfolio Projects',
    description: 'A collection of full-stack development projects showcasing technical expertise',
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: generateProjectStructuredData(project, authorName, baseUrl)
    }))
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>,
  baseUrl: string = 'https://johndeveloper.dev'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  };
}

/**
 * Generate FAQ structured data for common portfolio questions
 */
export function generateFAQStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What technologies do you specialize in?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'I specialize in full-stack development with expertise in JavaScript, TypeScript, React, Vue.js, Node.js, and modern web technologies. I also work with databases, cloud services, and DevOps tools.'
        }
      },
      {
        '@type': 'Question',
        name: 'How can I view your CV?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can view my CV by clicking the CV button in the top right corner of the website. It will open an interactive viewer where you can browse through my professional experience and qualifications.'
        }
      },
      {
        '@type': 'Question',
        name: 'Are you available for freelance projects?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, I am available for freelance projects and consulting work. Please feel free to contact me through the provided contact information to discuss your project requirements.'
        }
      },
      {
        '@type': 'Question',
        name: 'What is your development approach?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'I follow modern development practices including test-driven development, agile methodologies, clean code principles, and performance optimization. I focus on creating scalable, maintainable, and user-friendly applications.'
        }
      }
    ]
  };
}

/**
 * Generate optimized meta description from content
 */
export function generateMetaDescription(content: string, maxLength: number = 160): string {
  // Remove markdown and HTML tags
  const cleanContent = content
    .replace(/[#*_`]/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }

  // Find the last complete sentence within the limit
  const truncated = cleanContent.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');

  // If we can fit a complete sentence and it's a reasonable length
  if (lastSentence > 0 && lastSentence >= maxLength * 0.5) {
    return cleanContent.substring(0, lastSentence + 1);
  } else if (lastSpace > maxLength * 0.8) {
    return cleanContent.substring(0, lastSpace) + '...';
  } else {
    return truncated + '...';
  }
}

/**
 * Generate keywords from project data
 */
export function generateKeywords(
  projects: CollectionEntry<'projects'>[],
  baseKeywords: string[] = []
): string[] {
  const techKeywords = new Set(baseKeywords);
  
  projects.forEach(project => {
    project.data.technologies.forEach(tech => {
      const lowerTech = tech.toLowerCase();
      techKeywords.add(lowerTech);
      
      // Add specific mappings for common technologies
      if (lowerTech.includes('node.js')) {
        techKeywords.add('node');
        techKeywords.add('nodejs');
      }
      if (lowerTech.includes('react')) {
        techKeywords.add('react');
        techKeywords.add('reactjs');
      }
      if (lowerTech.includes('vue')) {
        techKeywords.add('vue');
        techKeywords.add('vuejs');
      }
    });
  });

  // Add common variations and related terms
  const keywordMap: Record<string, string[]> = {
    'react': ['react.js', 'reactjs'],
    'vue': ['vue.js', 'vuejs'],
    'node': ['node.js', 'nodejs'],
    'node.js': ['node', 'nodejs'],
    'javascript': ['js', 'es6', 'es2015+'],
    'typescript': ['ts'],
    'css': ['css3', 'styling'],
    'html': ['html5', 'markup'],
    'git': ['version control', 'github'],
    'api': ['rest api', 'api development'],
    'database': ['db', 'data storage']
  };

  const expandedKeywords = new Set(techKeywords);
  
  techKeywords.forEach(keyword => {
    if (keywordMap[keyword]) {
      keywordMap[keyword].forEach(variant => expandedKeywords.add(variant));
    }
  });

  return Array.from(expandedKeywords).sort();
}

/**
 * Validate and sanitize SEO data
 */
export function sanitizeSEOData(data: Partial<SEOConfig>): SEOConfig {
  const sanitizedTitle = data.title ? data.title.trim().substring(0, 60).trim() : 'Portfolio - Full Stack Developer';
  const sanitizedDescription = data.description ? data.description.trim().substring(0, 160).trim() : 'Modern portfolio showcasing full-stack development projects and expertise';
  
  return {
    title: sanitizedTitle,
    description: sanitizedDescription,
    image: data.image || '/images/og-image.svg',
    keywords: data.keywords?.slice(0, 10) || ['developer', 'portfolio', 'full-stack'],
    type: data.type || 'website',
    author: data.author?.trim() || 'John Developer',
    publishDate: data.publishDate,
    modifiedDate: data.modifiedDate,
    noindex: data.noindex || false,
    nofollow: data.nofollow || false
  };
}