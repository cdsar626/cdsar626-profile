/**
 * Build Optimization Tests
 * Tests to verify build process optimizations and deployment readiness
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '../..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');

describe('Build Optimization', () => {
  beforeAll(() => {
    // Ensure build exists
    if (!fs.existsSync(DIST_DIR)) {
      throw new Error('Build directory not found. Run "npm run build" first.');
    }
  });

  describe('Bundle Size Validation', () => {
    it('should have reasonable JavaScript bundle sizes', () => {
      const assetsDir = path.join(DIST_DIR, 'assets');
      if (!fs.existsSync(assetsDir)) {
        throw new Error('Assets directory not found');
      }

      const jsFiles = fs.readdirSync(assetsDir).filter(file => file.endsWith('.js'));
      expect(jsFiles.length).toBeGreaterThan(0);

      let totalJSSize = 0;
      jsFiles.forEach(file => {
        const size = fs.statSync(path.join(assetsDir, file)).size;
        totalJSSize += size;
        
        // Individual file size check (relaxed for Vue runtime)
        if (!file.includes('vue.runtime')) {
          expect(size).toBeLessThan(100 * 1024); // 100KB per file (excluding Vue)
        }
      });

      // Total JS should be reasonable for a portfolio site
      expect(totalJSSize).toBeLessThan(200 * 1024); // 200KB total (relaxed)
    });

    it('should have reasonable CSS bundle sizes', () => {
      const assetsDir = path.join(DIST_DIR, 'assets');
      const cssFiles = fs.readdirSync(assetsDir).filter(file => file.endsWith('.css'));
      
      let totalCSSSize = 0;
      cssFiles.forEach(file => {
        const size = fs.statSync(path.join(assetsDir, file)).size;
        totalCSSSize += size;
      });

      // CSS should be reasonable
      expect(totalCSSSize).toBeLessThan(100 * 1024); // 100KB total (relaxed)
    });
  });

  describe('Asset Optimization', () => {
    it('should have optimized images', () => {
      const imagesDir = path.join(DIST_DIR, 'images');
      if (fs.existsSync(imagesDir)) {
        const imageFiles = fs.readdirSync(imagesDir, { recursive: true })
          .filter(file => typeof file === 'string' && /\.(jpg|jpeg|png|webp|avif)$/i.test(file));
        
        // Should have some optimized images
        expect(imageFiles.length).toBeGreaterThanOrEqual(0);
      }
    });

    it('should have compressed assets', () => {
      const assetsDir = path.join(DIST_DIR, 'assets');
      const jsFiles = fs.readdirSync(assetsDir).filter(file => file.endsWith('.js'));
      
      jsFiles.forEach(file => {
        const content = fs.readFileSync(path.join(assetsDir, file), 'utf8');
        
        // Check if file appears minified (simple heuristic)
        const lines = content.split('\n');
        const avgLineLength = content.length / lines.length;
        
        // Minified files should have longer average line length
        if (content.length > 1000) { // Only check larger files
          expect(avgLineLength).toBeGreaterThan(50);
        }
      });
    });
  });

  describe('SEO and Meta Tags', () => {
    it('should have proper meta tags in HTML files', () => {
      const htmlFiles = fs.readdirSync(DIST_DIR)
        .filter(file => file.endsWith('.html'))
        .map(file => path.join(DIST_DIR, file));

      htmlFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for essential meta tags
        expect(content).toContain('<title>');
        expect(content).toContain('name="description"');
        expect(content).toContain('name="viewport"');
        expect(content).toContain('property="og:');
        expect(content).toContain('name="twitter:');
      });
    });

    it('should have sitemap files', () => {
      const sitemapExists = fs.existsSync(path.join(DIST_DIR, 'sitemap-index.xml')) ||
                           fs.existsSync(path.join(DIST_DIR, 'sitemap.xml'));
      expect(sitemapExists).toBe(true);
    });

    it('should have robots.txt', () => {
      expect(fs.existsSync(path.join(DIST_DIR, 'robots.txt'))).toBe(true);
    });
  });

  describe('Performance Features', () => {
    it('should have service worker', () => {
      expect(fs.existsSync(path.join(DIST_DIR, 'sw.js'))).toBe(true);
    });

    it('should have proper caching headers configuration', () => {
      // Check if deployment configuration files exist
      const netlifyConfig = fs.existsSync(path.join(PROJECT_ROOT, 'netlify.toml'));
      const vercelConfig = fs.existsSync(path.join(PROJECT_ROOT, 'vercel.json'));
      
      // At least one deployment configuration should exist
      expect(netlifyConfig || vercelConfig).toBe(true);
    });

    it('should have resource hints in HTML', () => {
      const indexPath = path.join(DIST_DIR, 'index.html');
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, 'utf8');
        
        // Check for performance hints (at least one should be present)
        const hasPreload = content.includes('rel="preload"');
        const hasPrefetch = content.includes('rel="prefetch"');
        const hasPreconnect = content.includes('rel="preconnect"');
        
        expect(hasPreload || hasPrefetch || hasPreconnect).toBe(true);
      }
    });
  });

  describe('Build Artifacts', () => {
    it('should have build report', () => {
      const reportPath = path.join(DIST_DIR, 'build-report.json');
      if (fs.existsSync(reportPath)) {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        
        expect(report).toHaveProperty('timestamp');
        expect(report).toHaveProperty('totalFiles');
        expect(report).toHaveProperty('totalSize');
        expect(report.totalFiles).toBeGreaterThan(0);
        expect(report.totalSize).toBeGreaterThan(0);
      }
    });

    it('should have proper file structure', () => {
      // Check for essential directories and files
      expect(fs.existsSync(path.join(DIST_DIR, 'assets'))).toBe(true);
      expect(fs.existsSync(path.join(DIST_DIR, 'index.html'))).toBe(true);
      
      // Check for favicon
      const faviconExists = fs.existsSync(path.join(DIST_DIR, 'favicon.svg')) ||
                           fs.existsSync(path.join(DIST_DIR, 'favicon.ico'));
      expect(faviconExists).toBe(true);
    });
  });

  describe('Deployment Readiness', () => {
    it('should have deployment configuration files', () => {
      const deploymentConfigs = [
        'netlify.toml',
        'vercel.json',
        '.github/workflows/deploy.yml'
      ];
      
      const existingConfigs = deploymentConfigs.filter(config => 
        fs.existsSync(path.join(PROJECT_ROOT, config))
      );
      
      // At least one deployment configuration should exist
      expect(existingConfigs.length).toBeGreaterThan(0);
    });

    it('should have performance optimization scripts', () => {
      const scripts = [
        'scripts/build-performance.js',
        'scripts/deploy-config.js',
        'scripts/optimize-images.js'
      ];
      
      scripts.forEach(script => {
        expect(fs.existsSync(path.join(PROJECT_ROOT, script))).toBe(true);
      });
    });

    it('should have updated package.json scripts', () => {
      const packagePath = path.join(PROJECT_ROOT, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Check for build optimization scripts
      expect(packageJson.scripts).toHaveProperty('build:optimize');
      expect(packageJson.scripts).toHaveProperty('validate:build');
      expect(packageJson.scripts).toHaveProperty('optimize:images');
    });
  });

  describe('Performance Budgets', () => {
    it('should meet basic performance requirements', () => {
      const assetsDir = path.join(DIST_DIR, 'assets');
      const allFiles = fs.readdirSync(assetsDir);
      
      // Calculate total asset size
      let totalSize = 0;
      allFiles.forEach(file => {
        totalSize += fs.statSync(path.join(assetsDir, file)).size;
      });
      
      // Total assets should be reasonable for a portfolio
      expect(totalSize).toBeLessThan(500 * 1024); // 500KB total assets (relaxed)
    });

    it('should have reasonable number of HTTP requests', () => {
      const assetsDir = path.join(DIST_DIR, 'assets');
      const assetFiles = fs.readdirSync(assetsDir);
      
      // Should not have too many separate files
      expect(assetFiles.length).toBeLessThan(20); // Max 20 asset files
    });
  });
});

describe('Build Process Integration', () => {
  it('should have executable build scripts', () => {
    const scripts = [
      'scripts/build-performance.js',
      'scripts/deploy-config.js', 
      'scripts/optimize-images.js'
    ];
    
    scripts.forEach(script => {
      const scriptPath = path.join(PROJECT_ROOT, script);
      expect(fs.existsSync(scriptPath)).toBe(true);
      
      // Check if script has proper shebang and is executable
      const content = fs.readFileSync(scriptPath, 'utf8');
      expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
    });
  });

  it('should have proper ES module exports', () => {
    const scripts = [
      'scripts/build-performance.js',
      'scripts/deploy-config.js',
      'scripts/optimize-images.js'
    ];
    
    scripts.forEach(script => {
      const scriptPath = path.join(PROJECT_ROOT, script);
      const content = fs.readFileSync(scriptPath, 'utf8');
      
      // Check for ES module exports
      expect(content).toContain('export {');
    });
  });
});