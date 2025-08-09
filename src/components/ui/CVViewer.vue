<template>
  <Teleport to="body">
    <!-- Backdrop overlay -->
    <Transition name="backdrop">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-40"
        @click="handleBackdropClick"
      />
    </Transition>

    <!-- CV Panel -->
    <Transition name="slide">
      <div
        v-if="isOpen"
        class="fixed top-0 right-0 h-full w-full max-w-4xl bg-white shadow-2xl z-50 flex flex-col cv-panel"
        @click.stop
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- Header with close button and navigation -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div class="flex items-center gap-4">
            <h2 class="text-xl font-semibold text-gray-900">CV</h2>
            
            <!-- Page navigation for multi-page PDFs -->
            <div v-if="totalPages > 1" class="flex items-center gap-2">
              <button
                @click="previousPage"
                :disabled="currentPage <= 1"
                class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                aria-label="Previous page"
              >
                ←
              </button>
              <span class="text-sm text-gray-600">
                {{ currentPage }} / {{ totalPages }}
              </span>
              <button
                @click="nextPage"
                :disabled="currentPage >= totalPages"
                class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                aria-label="Next page"
              >
                →
              </button>
            </div>
          </div>

          <!-- Close button -->
          <button
            @click="closeViewer"
            class="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close CV viewer"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- CV Content -->
        <div class="flex-1 overflow-auto bg-gray-50 p-4">
          <div class="max-w-full mx-auto bg-white shadow-lg">
            <!-- Error state -->
            <div v-if="error" class="p-8 text-center">
              <div class="text-red-600 mb-4">
                <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Failed to load CV</h3>
              <p class="text-gray-600 mb-4">{{ error }}</p>
              <button
                @click="retryLoad"
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>

            <!-- Loading state -->
            <div v-else-if="loading" class="p-8 text-center">
              <div class="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p class="text-gray-600">Loading CV...</p>
            </div>

            <!-- PDF Content -->
            <div v-else class="w-full">
              <iframe
                ref="pdfFrame"
                :src="currentPdfUrl"
                class="w-full h-[800px] border-0"
                title="CV Document"
                @load="handlePdfLoad"
                @error="handlePdfError"
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface CVAsset {
  type: 'pdf' | 'image'
  src: string
  page?: number
  alt?: string
}

interface Props {
  isOpen: boolean
  cvAssets?: CVAsset[]
  defaultCvPath?: string
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  cvAssets: () => [],
  defaultCvPath: '/cv/sample-cv.pdf'
})

const emit = defineEmits<Emits>()

// Reactive state
const loading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)
const pdfFrame = ref<HTMLIFrameElement | null>(null)

// Initialize loading state based on isOpen prop
if (props.isOpen) {
  loading.value = true
}

// Computed properties
const currentAssets = computed(() => {
  if (props.cvAssets.length > 0) {
    return props.cvAssets
  }
  // Fallback to default CV
  return [{
    type: 'pdf' as const,
    src: props.defaultCvPath,
    page: 1
  }]
})

const currentPdfUrl = computed(() => {
  const asset = currentAssets.value[currentPage.value - 1]
  if (!asset) return props.defaultCvPath
  
  // For PDF files, append page parameter if supported
  if (asset.type === 'pdf' && asset.page && asset.page > 1) {
    return `${asset.src}#page=${asset.page}`
  }
  
  return asset.src
})

// Methods
const closeViewer = () => {
  emit('close')
}

const handleBackdropClick = () => {
  closeViewer()
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const handlePdfLoad = () => {
  loading.value = false
  error.value = null
}

const handlePdfError = () => {
  loading.value = false
  error.value = 'Unable to load the CV document. Please try again later.'
}

const retryLoad = () => {
  error.value = null
  loading.value = true
  
  // Force reload the iframe
  if (pdfFrame.value) {
    pdfFrame.value.src = currentPdfUrl.value
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!props.isOpen) return
  
  switch (event.key) {
    case 'Escape':
      closeViewer()
      break
    case 'ArrowLeft':
      previousPage()
      break
    case 'ArrowRight':
      nextPage()
      break
  }
}

// Touch interaction state
const touchState = ref({
  startX: 0,
  startY: 0,
  startTime: 0,
  isDragging: false,
  threshold: 50 // Minimum distance for swipe
})

// Touch event handlers for mobile navigation
const handleTouchStart = (event: TouchEvent) => {
  const touch = event.touches[0]
  touchState.value = {
    startX: touch.clientX,
    startY: touch.clientY,
    startTime: Date.now(),
    isDragging: false,
    threshold: 50
  }
}

const handleTouchMove = (event: TouchEvent) => {
  if (!touchState.value.startX) return
  
  const touch = event.touches[0]
  const deltaX = Math.abs(touch.clientX - touchState.value.startX)
  const deltaY = Math.abs(touch.clientY - touchState.value.startY)
  
  // If horizontal movement is greater than vertical, we might be swiping
  if (deltaX > deltaY && deltaX > 10) {
    touchState.value.isDragging = true
    // Prevent scrolling during horizontal swipe
    event.preventDefault()
  }
}

const handleTouchEnd = (event: TouchEvent) => {
  if (!touchState.value.startX) return
  
  const touch = event.changedTouches[0]
  const deltaX = touch.clientX - touchState.value.startX
  const deltaY = touch.clientY - touchState.value.startY
  const deltaTime = Date.now() - touchState.value.startTime
  
  // Check for swipe gesture (horizontal movement > threshold, quick gesture)
  if (Math.abs(deltaX) > touchState.value.threshold && 
      Math.abs(deltaX) > Math.abs(deltaY) && 
      deltaTime < 500) {
    
    if (deltaX > 0) {
      // Swipe right - previous page
      previousPage()
    } else {
      // Swipe left - next page
      nextPage()
    }
  }
  
  // Reset touch state
  touchState.value = {
    startX: 0,
    startY: 0,
    startTime: 0,
    isDragging: false,
    threshold: 50
  }
}

// Watchers
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    loading.value = true
    error.value = null
    currentPage.value = 1
    
    // Calculate total pages based on assets
    totalPages.value = Math.max(1, currentAssets.value.length)
    
    // Prevent body scroll when modal is open
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden'
    }
  } else {
    // Restore body scroll
    if (typeof document !== 'undefined') {
      document.body.style.overflow = ''
    }
  }
})

watch(() => currentAssets.value, (newAssets) => {
  totalPages.value = Math.max(1, newAssets.length)
}, { immediate: true })

watch(currentPdfUrl, () => {
  if (props.isOpen) {
    loading.value = true
    error.value = null
  }
})

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  // Ensure body scroll is restored
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* Backdrop transition */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* Mobile-specific touch optimizations */
@media (hover: none) and (pointer: coarse) {
  .cv-panel {
    /* Improve touch scrolling */
    -webkit-overflow-scrolling: touch;
  }
  
  /* Larger touch targets for mobile */
  button {
    min-height: 44px;
    min-width: 44px;
    padding: 12px;
  }
  
  /* Navigation buttons with better touch feedback */
  .flex.items-center.gap-2 button {
    padding: 8px 12px;
    font-size: 16px;
    border-radius: 8px;
    transition: all 0.2s ease;
  }
  
  .flex.items-center.gap-2 button:active {
    transform: scale(0.95);
    background-color: #e5e7eb;
  }
  
  /* Close button with better touch feedback */
  .rounded-full:active {
    transform: scale(0.9);
    background-color: #f3f4f6;
  }
  
  /* PDF iframe adjustments for mobile */
  iframe {
    height: calc(100vh - 120px) !important;
    min-height: 400px;
  }
  
  /* Header adjustments for mobile */
  .flex.items-center.justify-between {
    flex-wrap: wrap;
    gap: 12px;
  }
  
  /* Make navigation more prominent on mobile */
  .flex.items-center.gap-2 {
    order: 2;
    width: 100%;
    justify-content: center;
    margin-top: 8px;
  }
  
  /* Swipe indicator for mobile users */
  .cv-panel::after {
    content: 'Swipe left/right to navigate pages';
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 12px;
    opacity: 0;
    animation: swipeHint 3s ease-in-out 1s;
    pointer-events: none;
    z-index: 60;
  }
  
  @keyframes swipeHint {
    0%, 90%, 100% { opacity: 0; }
    10%, 80% { opacity: 1; }
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .fixed.right-0 {
    width: 100vw;
    max-width: none;
  }
  
  /* Adjust padding for smaller screens */
  .p-4 {
    padding: 16px 12px;
  }
  
  /* Stack header elements on very small screens */
  .flex.items-center.gap-4 {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .flex.items-center.gap-4 h2 {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  /* Very small screens - optimize space */
  .p-4 {
    padding: 12px 8px;
  }
  
  .bg-gray-50.p-4 {
    padding: 8px;
  }
  
  /* Hide page count text on very small screens, keep only buttons */
  .text-sm.text-gray-600 {
    font-size: 12px;
  }
  
  /* Make navigation buttons smaller but still touch-friendly */
  .flex.items-center.gap-2 button {
    padding: 6px 10px;
    min-width: 40px;
    min-height: 40px;
  }
}

/* Focus styles for accessibility */
button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Smooth scrolling for PDF content */
.overflow-auto {
  scroll-behavior: smooth;
}

/* Enhanced loading state for mobile */
@media (max-width: 768px) {
  .animate-spin {
    width: 32px;
    height: 32px;
  }
  
  .p-8.text-center {
    padding: 32px 16px;
  }
}

/* Improved error state for mobile */
@media (max-width: 768px) {
  .w-16.h-16 {
    width: 48px;
    height: 48px;
  }
  
  .text-lg {
    font-size: 16px;
  }
  
  .px-4.py-2 {
    padding: 12px 20px;
    min-height: 44px;
  }
}
</style>