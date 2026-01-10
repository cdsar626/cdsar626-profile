<template>
  <Teleport to="body">
    <!-- Backdrop overlay -->
    <Transition name="backdrop">
      <div
        v-if="isOpen"
        class="backdrop"
        @click="handleBackdropClick"
        aria-hidden="true"
      />
    </Transition>

    <!-- CV Panel -->
    <Transition :name="isRestoring ? 'none' : 'slide'">
      <div
        v-if="isOpen"
        ref="cvPanel"
        class="cv-panel"
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
        <div class="cv-header">
          <div class="cv-header-left">
            <h2 id="cv-dialog-title" class="cv-title">CV Document</h2>
            
            <!-- Page navigation for multi-page PDFs -->
            <nav v-if="totalPages > 1" class="cv-nav" aria-label="CV page navigation">
              <button
                ref="prevButton"
                @click="previousPage"
                :disabled="currentPage <= 1"
                class="cv-nav-btn"
                :aria-label="`Go to previous page. Currently on page ${currentPage} of ${totalPages}`"
                type="button"
              >
                <span aria-hidden="true">←</span>
                <span class="sr-only">Previous</span>
              </button>
              <span class="cv-page-counter" aria-live="polite" aria-atomic="true">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <button
                ref="nextButton"
                @click="nextPage"
                :disabled="currentPage >= totalPages"
                class="cv-nav-btn"
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
            class="cv-close-btn"
            aria-label="Close CV document viewer"
            type="button"
          >
            <svg class="cv-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Hidden description for screen readers -->
        <div id="cv-dialog-description" class="sr-only">
          CV document viewer with keyboard navigation. Use arrow keys to navigate pages, or use the navigation buttons. Press Escape to close.
        </div>

        <!-- CV Content -->
        <div 
          ref="cvContent"
          class="cv-content" 
          role="main"
          @scroll="handleScroll"
        >
          <div class="cv-content-container">
            <!-- Error state -->
            <div v-if="error" class="cv-error" role="alert" aria-live="assertive">
              <div class="cv-error-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 class="cv-error-title">Failed to load CV</h3>
              <p class="cv-error-message">{{ error }}</p>
              <button
                @click="retryLoad"
                class="cv-retry-btn"
                type="button"
                aria-describedby="retry-description"
              >
                Try Again
              </button>
              <div id="retry-description" class="sr-only">
                Retry loading the CV document
              </div>
            </div>

            <!-- Loading state Overlay -->
            <div v-if="loading" class="cv-loading" role="status" aria-live="polite">
              <div class="cv-spinner" aria-hidden="true"></div>
              <p class="cv-loading-text">Loading CV document...</p>
            </div>

            <!-- PDF Content (Always in DOM to allow background loading) -->
            <div 
              class="cv-pdf-container" 
              :class="{ 'cv-pdf-hidden': loading && !isPreloaded }"
            >
              <!-- Clean PDF embed without browser controls -->
              <object
                ref="pdfObject"
                :data="`${currentPdfUrl}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH&zoom=100&page=1&pagemode=none&download=0`"
                type="application/pdf"
                class="cv-pdf-object"
                :title="`CV Document - Page ${currentPage} of ${totalPages}`"
                @load="handlePdfLoad"
                @error="handlePdfError"
              >
                <!-- Fallback for browsers that don't support PDF objects -->
                <div class="cv-fallback">
                  <div class="cv-fallback-content">
                    <svg class="cv-fallback-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 class="cv-fallback-title">PDF Viewer Not Available</h3>
                    <p class="cv-fallback-message">Your browser doesn't support inline PDF viewing.</p>
                    <a 
                      :href="currentPdfUrl" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="cv-fallback-btn"
                    >
                      <svg class="cv-fallback-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Download CV
                    </a>
                  </div>
                </div>
              </object>
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
const isOpen = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)
const pdfObject = ref<HTMLObjectElement | null>(null)
const cvContent = ref<HTMLElement | null>(null)
const isPreloaded = ref(false)
const preloadError = ref<string | null>(null)
const isRestoring = ref(false)

// Focus management refs
const cvPanel = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const prevButton = ref<HTMLButtonElement | null>(null)
const nextButton = ref<HTMLButtonElement | null>(null)
const lastFocusedElement = ref<HTMLElement | null>(null)

// Initialize loading state
// Component starts closed by default

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

// Background preloading
const preloadPDF = () => {
  console.log('Preloading PDF in background...')
  
  // Create a hidden iframe to preload the PDF
  const preloadFrame = document.createElement('iframe')
  preloadFrame.style.display = 'none'
  preloadFrame.style.position = 'absolute'
  preloadFrame.style.left = '-9999px'
  preloadFrame.src = props.defaultCvPath
  
  preloadFrame.onload = () => {
    console.log('PDF preloaded successfully')
    isPreloaded.value = true
    preloadError.value = null
    document.body.removeChild(preloadFrame)
  }
  
  preloadFrame.onerror = () => {
    console.error('PDF preload failed')
    preloadError.value = 'Failed to preload PDF'
    document.body.removeChild(preloadFrame)
  }
  
  document.body.appendChild(preloadFrame)
}

// Methods
const openViewer = (page?: number, isRestore = false) => {
  console.log('Opening CV viewer...')
  isRestoring.value = isRestore
  isOpen.value = true
  
  // Reset restoring flag after a short delay so manual clicks still animate
  if (isRestore) {
    setTimeout(() => {
      isRestoring.value = false
    }, 500)
  }
  
  // ... page handling ...
  if (page) {
    currentPage.value = page
  } else if (!currentPage.value) {
    currentPage.value = 1
  }
  
  // Save state to session storage
  sessionStorage.setItem('cv-viewer-open', 'true')
  sessionStorage.setItem('cv-viewer-page', currentPage.value.toString())
  
  // OPTIMIZATION: If restoring session, skip the spinner entirely
  // The Service Worker cache will make it instant
  if (isRestore || isPreloaded.value) {
    loading.value = false
    error.value = null
  } else if (preloadError.value) {
    loading.value = false
    error.value = preloadError.value
  } else {
    loading.value = true
    error.value = null
    
    // Safety timeout
    setTimeout(() => {
      if (loading.value) {
        loading.value = false
      }
    }, 2000)
  }
  
  // Calculate total pages based on assets
  totalPages.value = Math.max(1, currentAssets.value.length)
  
  // Prevent body scroll when modal is open
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = '0px' // Prevent layout shift
  }
  
  // Set initial focus
  setInitialFocus()
}

const closeViewer = () => {
  isOpen.value = false
  
  // Clear persistence
  sessionStorage.removeItem('cv-viewer-open')
  sessionStorage.removeItem('cv-viewer-page')
  sessionStorage.removeItem('cv-viewer-scroll')
  
  // Restore body scroll
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
  
  // Restore focus to the element that opened the modal
  restoreFocus()
  
  emit('close')
}

const handleBackdropClick = () => {
  closeViewer()
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    sessionStorage.setItem('cv-viewer-page', currentPage.value.toString())
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    sessionStorage.setItem('cv-viewer-page', currentPage.value.toString())
  }
}

const handlePdfLoad = () => {
  console.log('PDF iframe loaded successfully')
  loading.value = false
  error.value = null
}

const handlePdfError = (event: Event) => {
  console.error('PDF iframe failed to load:', event)
  loading.value = false
  error.value = 'Unable to load the CV document. Please try again later.'
}

const retryLoad = () => {
  error.value = null
  loading.value = true
  
  // Force reload the PDF object
  if (pdfObject.value) {
    pdfObject.value.data = currentPdfUrl.value + `#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&scrollbar=0`
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
  if (!isOpen.value) return
  
  // Handle focus trapping
  trapFocus(event)
  
  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      closeViewer()
      break
    case 'ArrowLeft':
      if (event.target !== pdfObject.value) {
        event.preventDefault()
        previousPage()
      }
      break
    case 'ArrowRight':
      if (event.target !== pdfObject.value) {
        event.preventDefault()
        nextPage()
      }
      break
    case 'Home':
      if (event.target !== pdfObject.value && totalPages.value > 1) {
        event.preventDefault()
        currentPage.value = 1
      }
      break
    case 'End':
      if (event.target !== pdfObject.value && totalPages.value > 1) {
        event.preventDefault()
        currentPage.value = 1
      }
      break
  }
}

const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  if (target && isOpen.value) {
    sessionStorage.setItem('cv-viewer-scroll', target.scrollTop.toString())
  }
}

const restoreScroll = () => {
  const savedScroll = sessionStorage.getItem('cv-viewer-scroll')
  if (savedScroll && cvContent.value) {
    cvContent.value.scrollTop = parseInt(savedScroll)
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
watch(() => currentAssets.value, (newAssets) => {
  totalPages.value = Math.max(1, newAssets.length)
}, { immediate: true })

watch(currentPdfUrl, () => {
  if (isOpen.value) {
    loading.value = true
    error.value = null
  }
})

// Event handler for opening CV viewer
const handleOpenCVViewer = () => {
  openViewer()
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  
  // Listen for custom event to open CV viewer
  document.addEventListener('open-cv-viewer', handleOpenCVViewer)
  
  // Restore state from sessionStorage if needed
  const wasOpen = sessionStorage.getItem('cv-viewer-open') === 'true'
  const lastPage = parseInt(sessionStorage.getItem('cv-viewer-page') || '1')
  
  if (wasOpen) {
    console.log('Restoring CV viewer state from session...')
    openViewer(lastPage, true) // Pass true to skip spinner
    
    // Attempt scroll restoration after DOM update
    setTimeout(restoreScroll, 100)
  }
  
  // Start preloading PDF in background after component mounts
  setTimeout(() => {
    preloadPDF()
  }, 1000) // Wait 1 second after page load to start preloading
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('open-cv-viewer', handleOpenCVViewer)
  // Ensure body scroll is restored
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* Enhanced modal styling with stronger specificity */
.cv-panel {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  z-index: 9999 !important;
  width: 100% !important;
  height: 100vh !important;
  background: white !important;
  box-shadow: 
    -20px 0 60px -10px rgba(0, 0, 0, 0.25),
    -10px 0 30px -5px rgba(0, 0, 0, 0.15),
    -5px 0 15px -3px rgba(0, 0, 0, 0.1) !important;
  border-left: 1px solid rgba(0, 0, 0, 0.1) !important;
}

/* Force header styling */
.cv-panel .flex.items-center.justify-between {
  background: linear-gradient(to right, #ffffff, #f9fafb) !important;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
  padding: 1.5rem !important;
  border-bottom: 1px solid #e5e7eb !important;
    color: navy !important;

}

/* Force close button styling */
.cv-panel button[aria-label="Close CV document viewer"] {
  padding: 0.75rem !important;
  border-radius: 9999px !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
  border: 1px solid #e5e7eb !important;
  background: white !important;
}

.cv-panel button[aria-label="Close CV document viewer"]:hover {
  background: #fef2f2 !important;
  color: #dc2626 !important;
  border-color: #fecaca !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
}

/* Force navigation button styling */
.cv-panel nav button {
  padding: 0.5rem 1rem !important;
  background: white !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
  transition: all 0.2s ease !important;
  font-weight: 500 !important;
}

.cv-panel nav button:hover:not(:disabled) {
  background: #eff6ff !important;
  color: #2563eb !important;
  border-color: #bfdbfe !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
}

/* Force page counter styling */
.cv-panel nav span {
  background: white !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
  padding: 0.5rem 0.75rem !important;
  font-weight: 500 !important;
  color: #374151 !important;
}

/* Force content area styling */
.cv-panel .flex-1[role="main"] {
  background: linear-gradient(to bottom right, #f9fafb, #f3f4f6) !important;
  padding: 1rem !important;
}

.cv-panel .flex-1[role="main"] > div {
  background: white !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
  border-radius: 0.5rem !important;
  border: 1px solid #e5e7eb !important;
  overflow: hidden !important;
}

/* Backdrop overlay */
.fixed.inset-0 {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  z-index: 9998 !important;
  background: rgba(0, 0, 0, 0.5) !important;
}

/* Force proper height for PDF content */
.cv-panel .flex-1 {
  min-height: 0 !important;
  flex: 1 1 0% !important;
}

.cv-panel object {
  min-height: calc(100vh - 120px) !important;
  height: 100% !important;
}

/* Desktop modal sizing - much wider */
@media (min-width: 768px) {
  .cv-panel {
    max-width: none !important;
    width: 90% !important;
    left: 5% !important;
    right: 5% !important;
  }
}

@media (min-width: 1024px) {
  .cv-panel {
    max-width: none !important;
    width: 95% !important;
    left: 2.5% !important;
    right: 2.5% !important;
  }
}

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
  
  /* Swipe indicator removed - was too intrusive */
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

/* Clean CSS without Tailwind dependencies */

/* Modal backdrop */
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
}

/* Main modal panel */
.cv-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  width: 100%;
  height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;
  box-shadow: 
    -20px 0 60px -10px rgba(0, 0, 0, 0.25),
    -10px 0 30px -5px rgba(0, 0, 0, 0.15),
    -5px 0 15px -3px rgba(0, 0, 0, 0.1);
  border-left: 1px solid rgba(0, 0, 0, 0.1);
}

/* Header styling */
.cv-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: linear-gradient(to right, #ffffff, #f9fafb);
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.cv-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cv-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

/* Navigation styling */
.cv-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cv-nav-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  font-weight: 500;
  cursor: pointer;
  color: #374151;
}

.cv-nav-btn:hover:not(:disabled) {
  background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.cv-nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cv-page-counter {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0.75rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

/* Close button styling */
.cv-close-btn {
  padding: 0.75rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  background: white;
  cursor: pointer;
  color: #6b7280;
}

.cv-close-btn:hover {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.cv-close-icon {
  width: 1.5rem;
  height: 1.5rem;
}

/* Content area styling */
.cv-content {
  flex: 1;
  overflow: hidden;
  background: linear-gradient(to bottom right, #f9fafb, #f3f4f6);
  padding: 1rem;
  min-height: 0;
}

.cv-content-container {
  width: 100%;
  height: 100%;
  background: white;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

/* PDF container */
.cv-pdf-container {
  width: 100%;
  height: 100%;
}

.cv-pdf-object {
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 0.5rem;
}

/* Error state styling */
.cv-error {
  padding: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.cv-error-icon {
  color: #dc2626;
  margin-bottom: 1rem;
}

.cv-error-icon svg {
  width: 4rem;
  height: 4rem;
}

.cv-error-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.cv-error-message {
  color: #6b7280;
  margin: 0 0 1rem 0;
}

.cv-retry-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-weight: 500;
}

.cv-retry-btn:hover {
  background: #2563eb;
}

.cv-retry-btn:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Loading state styling */
.cv-loading {
  padding: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.cv-spinner {
  width: 2rem;
  height: 2rem;
  border: 4px solid #3b82f6;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.cv-loading-text {
  color: #6b7280;
  margin: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Fallback styling */
.cv-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f3f4f6;
  border-radius: 0.5rem;
}

.cv-fallback-content {
  text-align: center;
  padding: 2rem;
}

.cv-fallback-icon {
  width: 4rem;
  height: 4rem;
  color: #9ca3af;
  margin: 0 auto 1rem auto;
}

.cv-fallback-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.cv-fallback-message {
  color: #6b7280;
  margin: 0 0 1rem 0;
}

.cv-fallback-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 0.375rem;
  transition: background-color 0.2s ease;
  font-weight: 500;
  font-size: 0.875rem;
}

.cv-fallback-btn:hover {
  background: #2563eb;
}

.cv-fallback-btn:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.cv-fallback-btn-icon {
  width: 1rem;
  height: 1rem;
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
.cv-pdf-hidden {
  opacity: 0;
  pointer-events: none;
}
</style>