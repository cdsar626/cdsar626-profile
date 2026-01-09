// @ts-check
import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';

/**
 * Configure dynamic pathing based on environment
 * GITHUB_ACTIONS is true when building on GitHub (for Pages)
 * For VPS or local builds, we assume root deployment (/)
 */
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';
const siteUrl = isGitHubPages ? 'https://cdsar626.github.io' : 'https://tu-dominio-vps.com'; // Cambia esto por tu dominio real si lo tienes
const baseDir = isGitHubPages ? '/cdsar626-profile' : '/';

// https://astro.build/config
export default defineConfig({
    // Site URL for SEO and sitemap generation
    site: siteUrl,

    // Base URL for deployment (adjust for subdirectory deployments)
    base: baseDir,

    // Trailing slash configuration for consistent URLs
    trailingSlash: 'ignore',

    vite: {
        build: {
            // Enhanced code splitting for better performance
            rollupOptions: {
                output: {
                    manualChunks: {
                        // Separate Vue components into their own chunk
                        vue: ['vue'],
                        // Separate large dependencies
                        vendor: ['@astrojs/vue']
                    }
                }
            }
        }
    },

    integrations: [
        vue({
            // Vue optimization settings
            template: {
                compilerOptions: {
                    // Optimize for production
                    hoistStatic: true,
                    cacheHandlers: true
                }
            }
        }),
        sitemap({
            // Enhanced sitemap configuration
            changefreq: 'weekly',
            priority: 0.7,
            lastmod: new Date(),
            // Filter out test and admin pages
            filter: (page) => !page.includes('/admin') && !page.includes('/test'),
            // Custom entries for dynamic content
            customPages: [
                `${siteUrl}${baseDir === '/' ? '' : baseDir}/`,
            ],
            // Generate separate sitemaps for different content types
            serialize(item) {
                // Customize sitemap entries
                if (item.url.includes('/projects/')) {
                    item.priority = 0.8;
                }
                return item;
            }
        })
    ],

    // Enhanced image optimization configuration
    image: {
        domains: [],
        remotePatterns: [],
        // Enable responsive image generation with Sharp
        service: {
            entrypoint: 'astro/assets/services/sharp',
            config: {
                limitInputPixels: 268402689, // ~16K x 16K pixels
                // Sharp optimization settings
                jpeg: {
                    quality: 85,
                    progressive: true,
                    mozjpeg: true
                },
                png: {
                    quality: 90,
                    compressionLevel: 9,
                    adaptiveFiltering: true
                },
                webp: {
                    quality: 85,
                    effort: 6
                },
                avif: {
                    quality: 80,
                    effort: 9
                }
            }
        }
    },

    // Build configuration for optimal performance
    build: {
        // Inline critical CSS automatically
        inlineStylesheets: 'auto',
        // Enable asset optimization
        assets: 'assets'
    },

    // Enhanced prefetch configuration for better performance
    prefetch: {
        prefetchAll: false, // More selective prefetching
        defaultStrategy: 'viewport' // Prefetch when in viewport
    },

    // Compression and optimization
    compressHTML: true,

    // Output configuration for static hosting
    output: 'static',

    // Server configuration for development
    server: {
        port: 3000,
        host: true // Allow external connections
    },

    // Markdown configuration for better performance
    markdown: {
        // Optimize markdown processing
        shikiConfig: {
            // Use a lightweight theme
            theme: 'github-light',
        },
        // Enable syntax highlighting caching
        syntaxHighlight: 'shiki'
    }
});
