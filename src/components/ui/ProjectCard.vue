<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  description: string;
  technologies: string[];
  thumbnail: string;
  links: {
    main?: string;
    github?: string;
    additional?: string;
  };
  featured?: boolean;
}>();

// Helper to handle base URL (safe for client-side)
const getBaseUrl = () => {
  return import.meta.env.BASE_URL.replace(/\/$/, "");
};

// Image Logic (replicating ResponsiveImage.astro)
const imageProps = computed(() => {
  const base = getBaseUrl();
  const src = props.thumbnail;
  
  // Extract filename logic
  const pathParts = src.split('/');
  const filename = pathParts[pathParts.length - 1];
  const baseName = filename.split('.')[0];
  const directory = pathParts.slice(0, -1).join('/').replace(/^\//, "");
  
  const fullDirectory = base ? `${base}/${directory}` : `/${directory}`;
  const fullSrc = src.startsWith('/') ? (base ? `${base}${src}` : src) : src;

  const breakpoints = [320, 640, 768, 1024, 1280, 1536];
  
  const generateSrcset = (format: string) => {
    return breakpoints
      .map(width => `${fullDirectory}/${baseName}-${width}w.${format} ${width}w`)
      .join(', ');
  };

  return {
    src: fullSrc,
    webpSrcset: generateSrcset('webp'),
    avifSrcset: generateSrcset('avif'),
    fallbackSrcset: breakpoints
      .map(width => `${fullDirectory}/${baseName}-${width}w.jpg ${width}w`)
      .join(', ')
  };
});

// Helper to scrub/clean ID strings
const safeId = (str: string) => str.replace(/\s+/g, "-").toLowerCase();

</script>

<template>
  <article
    class="project-card"
    :data-featured="featured"
    role="article"
    :aria-labelledby="`project-title-${safeId(title)}`"
    tabindex="0"
  >
    <div class="project-card__background">
      <div class="project-card__thumbnail">
        <picture class="project-card__image-wrapper">
          <source :srcset="imageProps.avifSrcset" type="image/avif" />
          <source :srcset="imageProps.webpSrcset" type="image/webp" />
          <img 
            :src="imageProps.src" 
            :srcset="imageProps.fallbackSrcset"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            :alt="`Screenshot of ${title} project showing the main interface`"
            class="project-card__image"
            loading="lazy"
            decoding="async"
          />
        </picture>
        <div class="project-card__overlay" aria-hidden="true">
          <!-- Main link covering entire card -->
          <a
            v-if="links.main"
            :href="links.main"
            class="project-card__link project-card__link--main"
            :aria-label="`View ${title} project details and live demo`"
            target="_blank"
            rel="noopener noreferrer"
            tabindex="-1"
          >
            <div class="project-card__main-link-content">
              <svg
                class="project-card__main-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15,3 21,3 21,9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span class="project-card__main-text">View Project</span>
            </div>
          </a>

          <!-- Corner links -->
          <div class="project-card__corner-links">
            <a
              v-if="links.github"
              :href="links.github"
              class="project-card__link project-card__link--github"
              :aria-label="`View ${title} source code on GitHub`"
              target="_blank"
              rel="noopener noreferrer"
              tabindex="-1"
            >
              <svg
                class="project-card__icon"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              v-if="links.additional"
              :href="links.additional"
              class="project-card__link project-card__link--additional"
              :aria-label="`View additional resources for ${title} project`"
              target="_blank"
              rel="noopener noreferrer"
              tabindex="-1"
            >
              <svg
                class="project-card__icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div class="project-card__content">
        <h3
          :id="`project-title-${safeId(title)}`"
          class="project-card__title"
        >
          {{ title }}
        </h3>

        <div
          class="project-card__technologies"
          role="list"
          aria-label="Technologies used"
        >
          <span 
            v-for="tech in technologies" 
            :key="tech" 
            class="project-card__tech-tag" 
            role="listitem"
          >
            {{ tech }}
          </span>
        </div>
      </div>
    </div>

    <!-- Modal overlay -->
    <div 
      class="project-card__modal-overlay"
      role="dialog"
      :aria-labelledby="`modal-title-${safeId(title)}`"
      :aria-describedby="`modal-description-${safeId(title)}`"
      aria-hidden="true"
    >
      <div class="project-card__modal-backdrop"></div>
      <div class="project-card__modal-content">
        <div class="project-card__modal-header">
          <a
            v-if="links.main"
            :href="links.main"
            class="project-card__modal-icon-link project-card__modal-icon-link--left"
            :aria-label="`View ${title} live demo`"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              aria-hidden="true"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15,3 21,3 21,9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
          <h4 :id="`modal-title-${safeId(title)}`" class="project-card__modal-title">
            {{ title }}
          </h4>
          <div class="project-card__modal-header-right">
            <a
              v-if="links.github"
              :href="links.github"
              class="project-card__modal-icon-link"
              :aria-label="`View ${title} source code on GitHub`"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              v-if="links.additional"
              :href="links.additional"
              class="project-card__modal-icon-link"
              :aria-label="`View additional resources for ${title} project`"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </a>
          </div>
        </div>
        <div class="project-card__modal-body">
          <p :id="`modal-description-${safeId(title)}`" class="project-card__modal-description">
            {{ description }}
          </p>
          <div class="project-card__modal-technologies" role="list" aria-label="Technologies used in this project">
            <span 
              v-for="tech in technologies" 
              :key="tech"
              class="project-card__modal-tech-tag" 
              role="listitem"
            >
              {{ tech }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
  /* CSS Custom Properties for Modal */
  .project-card {
    --modal-animation-duration: 500ms;
    --modal-animation-easing: cubic-bezier(0.32, 0.72, 0, 1);
    --modal-shadow: 
      0 -20px 40px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(255, 255, 255, 0.1);
    --modal-border-radius: var(--radius-lg);
    --modal-padding: var(--space-4);
    
    background: var(--color-white);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-base);
    overflow: hidden; /* Contain modal within card bounds */
    transition:
      transform var(--transition-base) cubic-bezier(0.25, 0.46, 0.45, 0.94),
      box-shadow var(--transition-base) cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    will-change: transform;
    transform: translateZ(0); /* Hardware acceleration */
    backface-visibility: hidden;
  }

  .project-card:hover {
    transform: translateY(-4px) translateZ(0);
    box-shadow: var(--shadow-lg);
  }

  .project-card[data-featured="true"] {
    border: 2px solid var(--color-primary);
  }

  .project-card[data-featured="true"]::before {
    content: "Featured";
    position: absolute;
    top: var(--space-3);
    right: var(--space-3);
    background: var(--color-primary);
    color: var(--color-white);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-base);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    z-index: 10;
  }

  .project-card__thumbnail {
    position: relative;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: var(--color-gray-100);
    transition: filter 0.1s linear;
  }

  .project-card__image-wrapper {
      width: 100%;
      height: 100%;
      display: block;
  }

  .project-card__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-base) ease-out;
    will-change: transform;
    display: block;
  }

  .project-card:hover .project-card__image {
    transform: scale3d(1.05, 1.05, 1);
  }

  .project-card__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.6) 50%,
      rgba(0, 0, 0, 0.8) 100%
    );
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-base) ease-out;
    will-change: opacity, visibility;
  }

  .project-card:hover .project-card__overlay {
    opacity: 1;
    visibility: visible;
  }

  .project-card__corner-links {
    position: absolute;
    top: var(--space-3);
    right: var(--space-3);
    display: flex;
    gap: var(--space-2);
    z-index: 3;
  }

  .project-card__link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: rgba(255, 255, 255, 0.95);
    color: var(--color-gray-700);
    border-radius: var(--radius-full);
    transition: all var(--transition-fast) ease-out;
    text-decoration: none;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    will-change: transform, background-color;
    transform: translateZ(0);
  }

  .project-card__link:hover {
    background: var(--color-primary);
    color: var(--color-white);
    transform: scale3d(1.1, 1.1, 1) translateZ(0);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  .project-card__link--main {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
    background: transparent;
    backdrop-filter: none;
    border: none;
    z-index: 1;
  }

  .project-card__link--main:hover {
    background: transparent;
    transform: none;
    box-shadow: none;
  }

  .project-card__link--github,
  .project-card__link--additional {
    position: relative;
    z-index: 2;
    opacity: 0;
    transform: translateY(-8px) scale(0.8);
    transition: all var(--transition-base) ease-out;
  }

  .project-card:hover .project-card__link--github,
  .project-card:hover .project-card__link--additional {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .project-card:hover .project-card__link--github {
    transition-delay: 0.1s;
  }

  .project-card:hover .project-card__link--additional {
    transition-delay: 0.15s;
  }

  .project-card__icon {
    width: 20px;
    height: 20px;
  }

  .project-card__main-link-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    color: var(--color-white);
    text-align: center;
    opacity: 0;
    transform: translateY(8px);
    transition: all var(--transition-base) ease-out;
  }

  .project-card:hover .project-card__main-link-content {
    opacity: 1;
    transform: translateY(0);
  }

  .project-card__main-icon {
    width: 32px;
    height: 32px;
    stroke-width: 2;
  }

  .project-card__main-text {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    letter-spacing: 0.025em;
  }

  .project-card__content {
    padding: var(--space-3);
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .project-card__title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-gray-900) !important;
    margin-bottom: var(--space-2);
    line-height: var(--line-height-tight);
    flex: 1;
  }

  .project-card__technologies {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: auto;
  }

  .project-card__tech-tag {
    background: var(--color-gray-100);
    color: var(--color-gray-700);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    transition: all var(--transition-fast);
  }

  .project-card:hover .project-card__tech-tag {
    background: var(--color-primary);
    color: var(--color-gray-900);
  }

  /* Modal Overlay Styles */
  .project-card__modal-overlay {
    position: absolute;
    inset: 0;
    opacity: 0;
    visibility: hidden;
    transform: translateY(100%) scale(0.96);
    transition: 
      opacity var(--modal-animation-duration) var(--modal-animation-easing),
      transform var(--modal-animation-duration) var(--modal-animation-easing),
      visibility 0s var(--modal-animation-duration);
    will-change: opacity, transform;
    z-index: 10;
    border-radius: var(--modal-border-radius);
    overflow: visible; /* Allow shadows to spill */
    backface-visibility: hidden;
    transform-style: preserve-3d;
  }

  .project-card__modal-backdrop {
    display: none;
  }

  .project-card__modal-content {
    position: relative;
    z-index: 2;
    background: linear-gradient(
      160deg,
      rgba(40, 48, 64, 0.85) 0%,
      rgba(25, 30, 40, 0.9) 100%
    );
    backdrop-filter: blur(40px) saturate(180%);
    -webkit-backdrop-filter: blur(40px) saturate(180%);
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: var(--modal-padding);
    box-shadow: 
      0 -10px 40px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      inset 0 0 20px rgba(255, 255, 255, 0.05);
    border-radius: var(--modal-border-radius);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: background 0.4s ease;
    overflow: hidden;
    color: white;
  }
  
  /* Noise Texture */
  .project-card__modal-content::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E");
    opacity: 0.6;
    mix-blend-mode: soft-light;
    pointer-events: none;
    z-index: 0;
    background: linear-gradient(
      120deg,
      rgba(255, 255, 255, 0.15) 0%,
      rgba(255, 255, 255, 0.05) 20%,
      rgba(255, 255, 255, 0) 60%
    );
  }

  /* Specular Glare / Reflection */
  .project-card__modal-content::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.5) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    z-index: 3;
    opacity: 0.8;
  }

  .project-card__modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-4);
    position: relative;
    z-index: 2;
  }

  .project-card__modal-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-white);
    margin: 0;
    flex: 1;
    text-align: center;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  }

  .project-card__modal-header-right {
    display: flex;
    gap: var(--space-2);
  }

  .project-card__modal-icon-link {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-gray-300);
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-full);
    transition: all var(--transition-base);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .project-card__modal-icon-link:hover {
    background: var(--color-primary);
    color: var(--color-white);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .project-card__modal-icon-link svg {
    width: 18px;
    height: 18px;
  }

  .project-card__modal-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 2;
  }

  .project-card__modal-description {
    font-size: var(--font-size-base);
    line-height: 1.6;
    color: var(--color-gray-200);
    margin-bottom: var(--space-4);
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.05);
    padding-right: var(--space-2);
  }

  .project-card__modal-technologies {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: auto;
  }

  .project-card__modal-tech-tag {
    background: rgba(255, 255, 255, 0.15);
    color: var(--color-white);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  /* Focus and Modal interactions adapted for Vue */
  .project-card:focus-within .project-card__modal-overlay {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
    transition-delay: 0s;
  }

  .project-card:focus-within .project-card__overlay {
    opacity: 0;
    visibility: hidden;
  }

  /* Responsive Design */
  @media (max-width: 640px) {
    .project-card__content {
      padding: var(--space-4);
    }

    .project-card__title {
      font-size: var(--font-size-lg);
    }

    .project-card__corner-links {
      gap: var(--space-2);
    }

    .project-card__link {
      width: 40px;
      height: 40px;
    }

    .project-card__icon {
      width: 16px;
      height: 16px;
    }

    .project-card[data-featured="true"]::before {
      top: var(--space-2);
      right: var(--space-2);
      font-size: 0.625rem;
      padding: 0.125rem var(--space-1);
    }
  }
</style>
