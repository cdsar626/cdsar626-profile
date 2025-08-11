#!/usr/bin/env node

/**
 * Build Performance Validation Script
 * Validates build output against performance budgets and optimization requirements
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { performanceBudgets, buildOptimizations } from '../src/utils/build-optimization.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '../dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${colors.bold}${colors.blue}=== ${message} ===${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

// Get file size in bytes
function getFileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch (error) {
    return 0;
  }
}

// Get all files in directory recursively
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Validate bundle sizes
function validateBundleSizes() {
  logHeader('Bundle Size Validation');
  
  if (!fs.existsSync(ASSETS_DIR)) {
    logError('Assets directory not found. Run build first.');
    return false;
  }
  
  const files = fs.readdirSync(ASSETS_DIR);
  let totalJSSize = 0;
  let totalCSSSize = 0;
  let violations = [];
  
  // Calculate JavaScript bundle sizes
  const jsFiles = files.filter(file => file.endsWith('.js'));
  jsFiles.forEach(file => {
    const size = getFileSize(path.join(ASSETS_DIR, file));
    totalJSSize += size;
    
    // Check individual file size
    if (size > performanceBudgets.bundles.async) {
      violations.push(`JavaScript file ${file} (${(size / 1024).toFixed(1)}KB) exceeds async chunk budget (${(performanceBudgets.bundles.async / 1024).toFixed(1)}KB)`);
    }
    
    log(`  ${file}: ${(size / 1024).toFixed(1)}KB`);
  });
  
  // Calculate CSS bundle sizes
  const cssFiles = files.filter(file => file.endsWith('.css'));
  cssFiles.forEach(file => {
    const size = getFileSize(path.join(ASSETS_DIR, file));
    totalCSSSize += size;
    log(`  ${file}: ${(size / 1024).toFixed(1)}KB`);
  });
  
  // Check total bundle sizes
  if (totalJSSize > performanceBudgets.bundles.initial) {
    violations.push(`Total JavaScript size (${(totalJSSize / 1024).toFixed(1)}KB) exceeds budget (${(performanceBudgets.bundles.initial / 1024).toFixed(1)}KB)`);
  }
  
  if (totalCSSSize > performanceBudgets.bundles.css) {
    violations.push(`Total CSS size (${(totalCSSSize / 1024).toFixed(1)}KB) exceeds budget (${(performanceBudgets.bundles.css / 1024).toFixed(1)}KB)`);
  }
  
  // Report results
  log(`\nTotal JavaScript: ${(totalJSSize / 1024).toFixed(1)}KB`);
  log(`Total CSS: ${(totalCSSSize / 1024).toFixed(1)}KB`);
  
  if (violations.length === 0) {
    logSuccess('All bundle size budgets passed');
    return true;
  } else {
    violations.forEach(violation => logError(violation));
    return false;
  }
}

// Validate asset optimization
function validateAssetOptimization() {
  logHeader('Asset Optimization Validation');
  
  const allFiles = getAllFiles(DIST_DIR);
  let optimizationIssues = [];
  
  // Check for unoptimized images
  const imageFiles = allFiles.filter(file => 
    /\.(jpg|jpeg|png|gif|svg)$/i.test(file) && !file.includes('favicon')
  );
  
  imageFiles.forEach(file => {
    const size = getFileSize(file);
    const fileName = path.basename(file);
    
    // Check if large images exist without WebP alternatives
    if (size > 100 * 1024 && /\.(jpg|jpeg|png)$/i.test(file)) {
      const webpVersion = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      if (!fs.existsSync(webpVersion)) {
        optimizationIssues.push(`Large image ${fileName} (${(size / 1024).toFixed(1)}KB) missing WebP version`);
      }
    }
    
    log(`  ${fileName}: ${(size / 1024).toFixed(1)}KB`);
  });
  
  // Check for critical CSS inlining
  const htmlFiles = allFiles.filter(file => file.endsWith('.html'));
  htmlFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check if critical CSS is inlined
    if (!content.includes('<style>') && !content.includes('critical')) {
      optimizationIssues.push(`HTML file ${path.basename(file)} may be missing inlined critical CSS`);
    }
    
    // Check for resource hints
    const hasPreload = content.includes('rel="preload"');
    const hasPrefetch = content.includes('rel="prefetch"');
    const hasPreconnect = content.includes('rel="preconnect"');
    
    if (!hasPreload && !hasPrefetch && !hasPreconnect) {
      optimizationIssues.push(`HTML file ${path.basename(file)} missing resource hints (preload/prefetch/preconnect)`);
    }
  });
  
  if (optimizationIssues.length === 0) {
    logSuccess('Asset optimization checks passed');
    return true;
  } else {
    optimizationIssues.forEach(issue => logWarning(issue));
    return false;
  }
}

// Validate compression and minification
function validateCompression() {
  logHeader('Compression and Minification Validation');
  
  const allFiles = getAllFiles(DIST_DIR);
  let compressionIssues = [];
  
  // Check JavaScript minification
  const jsFiles = allFiles.filter(file => file.endsWith('.js'));
  jsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check if file appears to be minified (simple heuristic)
    const lines = content.split('\n');
    const avgLineLength = content.length / lines.length;
    
    if (avgLineLength < 50 && lines.length > 10) {
      compressionIssues.push(`JavaScript file ${path.basename(file)} may not be properly minified`);
    }
  });
  
  // Check CSS minification
  const cssFiles = allFiles.filter(file => file.endsWith('.css'));
  cssFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for common minification indicators
    if (content.includes('  ') || content.includes('\n\n')) {
      compressionIssues.push(`CSS file ${path.basename(file)} may not be properly minified`);
    }
  });
  
  // Check HTML minification
  const htmlFiles = allFiles.filter(file => file.endsWith('.html'));
  htmlFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for excessive whitespace
    if (content.includes('  ') && !content.includes('<pre>')) {
      compressionIssues.push(`HTML file ${path.basename(file)} may not be properly minified`);
    }
  });
  
  if (compressionIssues.length === 0) {
    logSuccess('Compression and minification checks passed');
    return true;
  } else {
    compressionIssues.forEach(issue => logWarning(issue));
    return false;
  }
}

// Validate SEO and meta tags
function validateSEO() {
  logHeader('SEO and Meta Tags Validation');
  
  const htmlFiles = getAllFiles(DIST_DIR).filter(file => file.endsWith('.html'));
  let seoIssues = [];
  
  htmlFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const fileName = path.basename(file);
    
    // Check for essential meta tags
    const requiredTags = [
      { tag: '<title>', name: 'title tag' },
      { tag: 'name="description"', name: 'meta description' },
      { tag: 'name="viewport"', name: 'viewport meta tag' },
      { tag: 'property="og:', name: 'Open Graph tags' },
      { tag: 'name="twitter:', name: 'Twitter Card tags' }
    ];
    
    requiredTags.forEach(({ tag, name }) => {
      if (!content.includes(tag)) {
        seoIssues.push(`${fileName} missing ${name}`);
      }
    });
    
    // Check for structured data
    if (!content.includes('application/ld+json')) {
      seoIssues.push(`${fileName} missing structured data (JSON-LD)`);
    }
    
    // Check for canonical URL
    if (!content.includes('rel="canonical"')) {
      seoIssues.push(`${fileName} missing canonical URL`);
    }
  });
  
  // Check for sitemap
  const sitemapExists = fs.existsSync(path.join(DIST_DIR, 'sitemap-index.xml')) || 
                       fs.existsSync(path.join(DIST_DIR, 'sitemap.xml'));
  
  if (!sitemapExists) {
    seoIssues.push('Sitemap not found');
  }
  
  // Check for robots.txt
  if (!fs.existsSync(path.join(DIST_DIR, 'robots.txt'))) {
    seoIssues.push('robots.txt not found');
  }
  
  if (seoIssues.length === 0) {
    logSuccess('SEO validation passed');
    return true;
  } else {
    seoIssues.forEach(issue => logWarning(issue));
    return false;
  }
}

// Generate build report
function generateBuildReport() {
  logHeader('Build Report Generation');
  
  const allFiles = getAllFiles(DIST_DIR);
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: allFiles.length,
    totalSize: 0,
    fileTypes: {},
    largestFiles: [],
    performance: {
      bundleSizes: {},
      optimizations: [],
      seoScore: 0
    }
  };
  
  // Calculate file statistics
  allFiles.forEach(file => {
    const size = getFileSize(file);
    const ext = path.extname(file).toLowerCase();
    
    report.totalSize += size;
    
    if (!report.fileTypes[ext]) {
      report.fileTypes[ext] = { count: 0, size: 0 };
    }
    report.fileTypes[ext].count++;
    report.fileTypes[ext].size += size;
    
    report.largestFiles.push({
      file: path.relative(DIST_DIR, file),
      size: size
    });
  });
  
  // Sort largest files
  report.largestFiles.sort((a, b) => b.size - a.size);
  report.largestFiles = report.largestFiles.slice(0, 10);
  
  // Save report
  const reportPath = path.join(DIST_DIR, 'build-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  logSuccess(`Build report generated: ${reportPath}`);
  log(`Total build size: ${(report.totalSize / 1024 / 1024).toFixed(2)}MB`);
  log(`Total files: ${report.totalFiles}`);
  
  return report;
}

// Main validation function
async function validateBuild() {
  log(`${colors.bold}${colors.blue}🚀 Build Performance Validation${colors.reset}\n`);
  
  if (!fs.existsSync(DIST_DIR)) {
    logError('Build directory not found. Run "npm run build" first.');
    process.exit(1);
  }
  
  const results = {
    bundleSizes: validateBundleSizes(),
    assetOptimization: validateAssetOptimization(),
    compression: validateCompression(),
    seo: validateSEO()
  };
  
  const report = generateBuildReport();
  
  // Summary
  logHeader('Validation Summary');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  if (passed === total) {
    logSuccess(`All ${total} validation checks passed! 🎉`);
    process.exit(0);
  } else {
    logWarning(`${passed}/${total} validation checks passed`);
    logError('Some optimizations may be needed. Check the warnings above.');
    process.exit(1);
  }
}

// Run validation if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     import.meta.url.endsWith('build-performance.js') && process.argv[1].endsWith('build-performance.js');

if (isMainModule) {
  validateBuild().catch(error => {
    logError(`Validation failed: ${error.message}`);
    process.exit(1);
  });
}

export { validateBuild, generateBuildReport };