<template>
  <Teleport to="body">
    <!-- Backdrop overlay -->
    <Transition name="backdrop">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-40"
        @click="handleBackdropClick"
        aria-hidden="true"
      />
    </Transition>

    <!-- CV Panel -->
    <Transition name="slide">
      <div
        v-if="isOpen"
        ref="cvPanel"
        class="fixed top-0 right-0 h-full w-full max-w-4xl bg-white shadow-2xl z-50 flex flex-col cv-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cv-dialog-title"
        aria-describedby="cv-dialog-description"
        @click.stop
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @keydown="handleKeydown"
        tabindex="-1"
      >
        <!-- Header with close button and navigation -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div class="flex items-center gap-4">
            <h2 id="cv-dialog-title" class="text-xl font-semibold text-gray-900">CV Document</h2>
            
            <!-- Page navigation for multi-page PDFs -->
            <nav v-if="totalPages > 1" class="flex items-center gap-2" aria-label="CV page navigation">
              <button
                ref="prevButton"
                @click="previousPage"
                :disabled="currentPage <= 1"
                class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                :aria-label="`Go to previous page. Currently on page ${currentPage} of ${totalPages}`"
                type="button"
              >
                <span aria-hidden="true">←</span>
                <span class="sr-only">Previous</span>
              </button>
              <span class="text-sm text-gray-600" aria-live="polite" aria-atomic="true">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <button
                ref="nextButton"
                @click="nextPage"
                :disabled="currentPage >= totalPages"
                class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                :aria-label="`Go to next page. Currently on page ${currentPage} of ${totalPages}`"
                type="button"
              >
                <span aria-hidden="true">→</span>
                <span class="sr-only">Next</span>
              </button>
            </nav>
          </div>

          <!-- Close button -->
          <button
            ref="closeButton"
            @click="closeViewer"
            class="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close CV document viewer"
            type="button"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Hidden description for screen readers -->
        <div id="cv-dialog-description" class="sr-only">
          CV document viewer with keyboard navigation. Use arrow keys to navigate pages, or use the navigation buttons. Press Escape to close.
        </div>

        <!-- CV Content -->
        <div class="flex-1 overflow-auto bg-gray-50 p-4" role="main">
          <div class="max-w-full mx-auto bg-white shadow-lg">
            <!-- Error state -->
            <div v-if="error" class="p-8 text-center" role="alert" aria-live="assertive">
              <div class="text-red-600 mb-4">
                <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Failed to load CV</h3>
              <p class="text-gray-600 mb-4">{{ error }}</p>
              <button
                @click="retryLoad"
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                type="button"
                aria-describedby="retry-description"
              >
                Try Again
              </button>
              <div id="retry-description" class="sr-only">
                Retry loading the CV document
              </div>
            </div>

            <!-- Loading state -->
            <div v-else-if="loading" class="p-8 text-center" role="status" aria-live="polite">
              <div class="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" aria-hidden="true"></div>
              <p class="text-gray-600">Loading CV document...</p>
            </div>

            <!-- PDF Content -->
            <div v-else class="w-full">
              <iframe
                ref="pdfFrame"
                :src="currentPdfUrl"
                class="w-full h-[800px] border-0"
                :title="`CV Document - Page ${currentPage} of ${totalPages}`"
                @load="handlePdfLoad"
                @error="handlePdfError"
                tabindex="0"
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

// Focus management refs
const cvPanel = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const prevButton = ref<HTMLButtonElement | null>(null)
const nextButton = ref<HTMLButtonElement | null>(null)
const lastFocusedElement = ref<HTMLElement | null>(null)

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

// Focus management methods
const getFocusableElements = (): HTMLElement[] => {
  if (!cvPanel.value) return []
  
  const focusableSelectors = [
    'button:not([disabled])',
    'iframe',
    '[tabindex]:not([tabindex="-1"])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]'
  ].join(', ')
  
  return Array.from(cvPanel.value.querySelectorAll(focusableSelectors)) as HTMLElement[]
}

const trapFocus = (event: KeyboardEvent) => {
  if (event.key !== 'Tab') return
  
  const focusableElements = getFocusableElements()
  if (focusableElements.length === 0) return
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  if (event.shiftKey) {
    // Shift + Tab
    if (document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    }
  } else {
    // Tab
    if (document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }
}

const setInitialFocus = () => {
  // Store the currently focused element to restore later
  lastFocusedElement.value = document.activeElement as HTMLElement
  
  // Focus the close button initially for easy access
  setTimeout(() => {
    if (closeButton.value) {
      closeButton.value.focus()
    } else if (cvPanel.value) {
      cvPanel.value.focus()
    }
  }, 100)
}

const restoreFocus = () => {
  if (lastFocusedElement.value) {
    lastFocusedElement.value.focus()
    lastFocusedElement.value = null
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!props.isOpen) return
  
  // Handle focus trapping
  trapFocus(event)
  
  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      closeViewer()
      break
    case 'ArrowLeft':
      if (event.target !== pdfFrame.value) {
        event.preventDefault()
        previousPage()
      }
      break
    case 'ArrowRight':
      if (event.target !== pdfFrame.value) {
        event.preventDefault()
        nextPage()
      }
      break
    case 'Home':
      if (event.target !== pdfFrame.value && totalPages.value > 1) {
        event.preventDefault()
        currentPage.value = 1
      }
      break
    case 'End':
      if (event.target !== pdfFrame.value && totalPages.value > 1) {
        event.preventDefault()
        currentPage.value = totalPages.value
      }
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
    
    // Set initial focus
    setInitialFocus()
  } else {
    // Restore body scroll
    if (typeof document !== 'undefined') {
      document.body.style.overflow = ''
    }
    
    // Restore focus to the element that opened the modal
    restoreFocus()
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

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus styles for accessibility */
button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

iframe:focus {
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