import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CVViewer from '../components/ui/CVViewer.vue'

// Mock Teleport for testing
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    Teleport: {
      name: 'Teleport',
      props: ['to'],
      setup(props: any, { slots }: any) {
        return () => slots.default?.()
      }
    }
  }
})

describe('CVViewer', () => {
  let wrapper: any

  beforeEach(() => {
    // Mock document.body for teleport
    document.body.innerHTML = '<div id="app"></div>'
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    // Restore body overflow
    document.body.style.overflow = ''
  })

  it('renders when isOpen is true', () => {
    wrapper = mount(CVViewer, {
      props: {
        isOpen: true
      }
    })

    expect(wrapper.find('.fixed.top-0.right-0').exists()).toBe(true)
    expect(wrapper.find('h2').text()).toBe('CV Document')
  })

  it('does not render when isOpen is false', () => {
    wrapper = mount(CVViewer, {
      props: {
        isOpen: false
      }
    })

    expect(wrapper.find('.fixed.top-0.right-0').exists()).toBe(false)
  })

  it('emits close event when close button is clicked', async () => {
    wrapper = mount(CVViewer, {
      props: {
        isOpen: true
      }
    })

    const closeButton = wrapper.find('button[aria-label="Close CV document viewer"]')
    await closeButton.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close event when backdrop is clicked', async () => {
    wrapper = mount(CVViewer, {
      props: {
        isOpen: true
      }
    })

    const backdrop = wrapper.find('.fixed.inset-0.bg-black')
    await backdrop.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('displays default CV path when no assets provided', async () => {
    wrapper = mount(CVViewer, {
      props: {
        isOpen: true,
        defaultCvPath: '/custom/cv.pdf'
      }
    })

    // Wait for loading state to complete and iframe to render
    wrapper.vm.handlePdfLoad()
    await wrapper.vm.$nextTick()

    const iframe = wrapper.find('iframe')
    expect(iframe.attributes('src')).toBe('/custom/cv.pdf')
  })

  it('handles custom CV assets', async () => {
    const cvAssets = [
      { type: 'pdf' as const, src: '/cv/page1.pdf', page: 1 },
      { type: 'pdf' as const, src: '/cv/page2.pdf', page: 2 }
    ]

    wrapper = mount(CVViewer, {
      props: {
        isOpen: true,
        cvAssets
      }
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.vm.totalPages).toBe(2)
    
    const pageSpan = wrapper.find('.text-sm.text-gray-600')
    expect(pageSpan.text()).toContain('Page 1 of 2')
  })

  it('navigates between pages correctly', async () => {
    const cvAssets = [
      { type: 'pdf' as const, src: '/cv/page1.pdf', page: 1 },
      { type: 'pdf' as const, src: '/cv/page2.pdf', page: 2 }
    ]

    wrapper = mount(CVViewer, {
      props: {
        isOpen: true,
        cvAssets
      }
    })

    await wrapper.vm.$nextTick()

    // Test next page - use more specific selector
    const nextButton = wrapper.find('button[aria-label*="Go to next page"]')
    await nextButton.trigger('click')

    expect(wrapper.vm.currentPage).toBe(2)
    
    const pageSpan = wrapper.find('.text-sm.text-gray-600')
    expect(pageSpan.text()).toContain('Page 2 of 2')

    // Test previous page
    const prevButton = wrapper.find('button[aria-label*="Go to previous page"]')
    await prevButton.trigger('click')

    expect(wrapper.vm.currentPage).toBe(1)
    expect(pageSpan.text()).toContain('Page 1 of 2')
  })

  it('disables navigation buttons at boundaries', async () => {
    const cvAssets = [
      { type: 'pdf' as const, src: '/cv/page1.pdf', page: 1 },
      { type: 'pdf' as const, src: '/cv/page2.pdf', page: 2 }
    ]

    wrapper = mount(CVViewer, {
      props: {
        isOpen: true,
        cvAssets
      }
    })

    await wrapper.vm.$nextTick()

    // At first page, previous should be disabled
    const prevButton = wrapper.find('button[aria-label*="Go to previous page"]')
    expect(prevButton.attributes('disabled')).toBeDefined()

    // Navigate to last page
    wrapper.vm.currentPage = 2
    await wrapper.vm.$nextTick()

    // At last page, next should be disabled
    const nextButton = wrapper.find('button[aria-label*="Go to next page"]')
    expect(nextButton.attributes('disabled')).toBeDefined()
  })

  it('shows loading state initially', async () => {
    wrapper = mount(CVViewer, {
      props: {
        isOpen: true
      }
    })

    // The loading state should be set when isOpen becomes true
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.loading).toBe(true)
    expect(wrapper.find('.animate-spin').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading CV document...')
  })

  it('shows error state when PDF fails to load', async () => {
    wrapper = mount(CVViewer, {
      props: {
        isOpen: true
      }
    })

    // Simulate PDF load error
    wrapper.vm.handlePdfError()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Failed to load CV')
    expect(wrapper.text()).toContain('Try Again')
  })

  it('handles retry functionality', async () => {
    wrapper = mount(CVViewer, {
      props: {
        isOpen: true
      }
    })

    // Simulate error state
    wrapper.vm.handlePdfError()
    await wrapper.vm.$nextTick()

    // Call retry method directly since finding the button is complex
    wrapper.vm.retryLoad()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.loading).toBe(true)
    expect(wrapper.vm.error).toBe(null)
  })

  it('prevents body scroll when open', async () => {
    wrapper = mount(CVViewer, {
      props: {
        isOpen: false
      }
    })

    // Open the viewer
    await wrapper.setProps({ isOpen: true })

    expect(document.body.style.overflow).toBe('hidden')

    // Close the viewer
    await wrapper.setProps({ isOpen: false })

    expect(document.body.style.overflow).toBe('')
  })

  it('handles keyboard navigation', () => {
    wrapper = mount(CVViewer, {
      props: {
        isOpen: true,
        cvAssets: [
          { type: 'pdf' as const, src: '/cv/page1.pdf', page: 1 },
          { type: 'pdf' as const, src: '/cv/page2.pdf', page: 2 }
        ]
      }
    })

    // Test Escape key
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
    wrapper.vm.handleKeydown(escapeEvent)
    expect(wrapper.emitted('close')).toBeTruthy()

    // Test Arrow Right key - should call nextPage method
    const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' })
    Object.defineProperty(rightEvent, 'target', { value: document.createElement('div') })
    wrapper.vm.handleKeydown(rightEvent)
    expect(wrapper.vm.currentPage).toBe(2)

    // Test Arrow Left key - should call previousPage method
    const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
    Object.defineProperty(leftEvent, 'target', { value: document.createElement('div') })
    wrapper.vm.handleKeydown(leftEvent)
    expect(wrapper.vm.currentPage).toBe(1)
  })

  it('generates correct PDF URLs with page parameters', () => {
    const cvAssets = [
      { type: 'pdf' as const, src: '/cv/document.pdf', page: 1 },
      { type: 'pdf' as const, src: '/cv/document.pdf', page: 2 }
    ]

    wrapper = mount(CVViewer, {
      props: {
        isOpen: true,
        cvAssets
      }
    })

    // First page should not have page parameter
    expect(wrapper.vm.currentPdfUrl).toBe('/cv/document.pdf')

    // Second page should have page parameter
    wrapper.vm.currentPage = 2
    expect(wrapper.vm.currentPdfUrl).toBe('/cv/document.pdf#page=2')
  })
})