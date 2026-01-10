<script setup lang="ts">
import { ref, computed } from 'vue';
import ProjectCard from './ProjectCard.vue';

// Define the Project type based on the content collection schema
interface Project {
  id: string;
  data: {
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
    publishDate: string;
    order?: number;
  };
}

const props = defineProps<{
  projects: Project[];
}>();

const sortMode = ref<'featured' | 'timeline'>('featured');
// Fixed card min-width for consistent layout (approx 3 cards per row on desktop)
const cardMinWidth = '350px';

// Computed property for handling sorting and grouping
const viewData = computed(() => {
  if (sortMode.value === 'featured') {
    // Relevance/Usage Sort (default logic)
    const sorted = [...props.projects].sort((a, b) => {
      // Featured first
      if (a.data.featured && !b.data.featured) return -1;
      if (!a.data.featured && b.data.featured) return 1;
      
      // Then by order
      const orderA = a.data.order || 999;
      const orderB = b.data.order || 999;
      if (orderA !== orderB) return orderA - orderB;
      
      return new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime();
    });
    return { type: 'flat', items: sorted };
  } else {
    // Timeline Sort (Group by Year)
    const groups: Record<string, Project[]> = {};
    const sorted = [...props.projects].sort((a, b) => 
      new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime()
    );

    sorted.forEach(project => {
      const year = new Date(project.data.publishDate).getFullYear().toString();
      if (!groups[year]) groups[year] = [];
      groups[year].push(project);
    });

    // Sort years descending
    const sortedYears = Object.keys(groups).sort((a, b) => Number(b) - Number(a));
    return { type: 'grouped', items: groups, years: sortedYears };
  }
});

// Dynamic grid style
const gridStyle = computed(() => ({
  '--card-min-width': cardMinWidth
}));
</script>

<template>
  <div class="projects-gallery">
    <!-- Controls Bar -->
    <div class="gallery-controls">
      <div class="control-group">
        <label for="sort-select" class="control-label">View Mode</label>
        <div class="select-wrapper">
          <select id="sort-select" v-model="sortMode" class="sort-select">
            <option value="featured">✨ Featured (Relevant)</option>
            <option value="timeline">📅 Timeline (History)</option>
          </select>
          <svg class="select-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>


    </div>

    <!-- Content Area -->
    <div class="gallery-content" :style="gridStyle">
      <!-- Flat View (Featured) -->
      <div v-if="viewData.type === 'flat'" class="projects-grid" role="list">
        <div 
          v-for="project in (viewData.items as Project[])" 
          :key="project.id"
          class="projects-grid__item fade-in"
        >
          <ProjectCard
            :title="project.data.title"
            :description="project.data.description"
            :technologies="project.data.technologies"
            :thumbnail="project.data.thumbnail"
            :links="project.data.links"
            :featured="project.data.featured"
          />
        </div>
      </div>

      <!-- Grouped View (Timeline) -->
      <div v-else class="timeline-view">
        <div v-for="year in (viewData.years as string[])" :key="year" class="timeline-year-group">
          <div class="year-header">
            <h3 class="year-title">{{ year }}</h3>
            <div class="year-line"></div>
          </div>
          <div class="projects-grid" role="list">
            <div 
              v-for="project in (viewData.items as Record<string, Project[]>)[year]" 
              :key="project.id"
              class="projects-grid__item fade-in"
            >
              <ProjectCard
                :title="project.data.title"
                :description="project.data.description"
                :technologies="project.data.technologies"
                :thumbnail="project.data.thumbnail"
                :links="project.data.links"
                :featured="project.data.featured"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-if="viewData.type === 'flat' ? viewData.items.length === 0 : viewData.years.length === 0" class="projects-empty">
      <p>No projects found.</p>
    </div>
  </div>
</template>

<style scoped>
.projects-gallery {
  width: 100%;
}

/* Controls Styles */
.gallery-controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-8);
  margin-bottom: var(--space-12);
  padding: var(--space-6);
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--color-gray-200);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.control-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Select Styling */
.select-wrapper {
  position: relative;
  width: 200px;
}

.sort-select {
  width: 100%;
  appearance: none;
  background: var(--color-gray-50);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  padding: var(--space-2) var(--space-4);
  padding-right: var(--space-10);
  font-size: var(--font-size-sm);
  color: var(--color-gray-900);
  cursor: pointer;
  transition: all var(--transition-base);
}

.sort-select:hover, .sort-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
  outline: none;
}

.select-icon {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--color-gray-500);
  pointer-events: none;
}



/* Content Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--card-min-width), 1fr));
  gap: var(--space-8);
}

/* Timeline View */
.timeline-year-group {
  margin-bottom: var(--space-16);
}

.year-header {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.year-title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-gray-300); /* Muted year color */
  margin: 0;
  line-height: 1;
}

.year-line {
  flex: 1;
  height: 2px;
  background: var(--color-gray-200);
  border-radius: var(--radius-full);
}

/* Animations */
.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.projects-empty {
  text-align: center;
  padding: var(--space-20);
  color: var(--color-gray-500);
  font-size: var(--font-size-lg);
}

/* Dark Mode Overrides for internal elements */
:global([data-theme="dark"]) .gallery-controls {
  background: var(--color-gray-900);
  border-color: var(--color-gray-800);
}

:global([data-theme="dark"]) .sort-select {
  background: var(--color-gray-800);
  border-color: var(--color-gray-700);
  color: var(--color-white);
}



/* Responsive adjust for controls */
@media (max-width: 640px) {
  .gallery-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .select-wrapper {
    width: 100%;
  }
}
</style>
