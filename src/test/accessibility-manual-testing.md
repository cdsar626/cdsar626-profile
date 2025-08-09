# Accessibility Manual Testing Guide

This guide provides step-by-step instructions for manually testing the accessibility features implemented in the portfolio website.

## Prerequisites

- Screen reader software (NVDA, JAWS, VoiceOver, or ORCA)
- Keyboard-only navigation capability
- Browser developer tools
- axe-core browser extension (optional but recommended)

## Testing Checklist

### 1. Keyboard Navigation Testing

#### Header Component
- [ ] **Tab Navigation**: Press Tab to navigate to the CV button
- [ ] **Skip Link**: Press Tab from the address bar - skip link should appear and be focusable
- [ ] **Skip Link Function**: Press Enter on skip link - should jump to main content
- [ ] **CV Button Activation**: Press Enter or Space on CV button - should open CV viewer
- [ ] **Focus Visibility**: All focused elements should have visible focus indicators

#### Project Cards
- [ ] **Tab to Cards**: Tab should navigate to each project card
- [ ] **Card Focus**: Focused cards should show overlay with links
- [ ] **Enter Key**: Press Enter on focused card - should open main project link
- [ ] **Keyboard Shortcuts**:
  - Press 'G' on focused card - should open GitHub link
  - Press 'L' on focused card - should open additional link
  - Press Escape on focused card - should remove focus
- [ ] **Focus Trapping**: Focus should stay within visible interactive elements

#### CV Viewer Modal
- [ ] **Initial Focus**: When opened, focus should move to close button or modal
- [ ] **Tab Navigation**: Tab should cycle through modal controls only
- [ ] **Focus Trapping**: Tab at last element should move to first element
- [ ] **Shift+Tab**: Should navigate backwards through modal controls
- [ ] **Escape Key**: Should close modal and return focus to CV button
- [ ] **Arrow Keys**: Left/Right arrows should navigate pages (if multi-page)
- [ ] **Home/End Keys**: Should jump to first/last page (if multi-page)

### 2. Screen Reader Testing

#### General Structure
- [ ] **Page Title**: Screen reader should announce meaningful page title
- [ ] **Landmarks**: Should announce main landmarks (banner, main, navigation)
- [ ] **Heading Structure**: Should have logical heading hierarchy (H1 → H2 → H3)
- [ ] **Skip Links**: Should announce skip link when focused

#### Profile Section
- [ ] **Section Announcement**: Should announce "Profile section" or similar
- [ ] **Image Description**: Should read meaningful alt text for profile image
- [ ] **Name and Role**: Should read name as main heading and role as description

#### Introduction Section
- [ ] **Hidden Heading**: Should announce "About Me" heading (screen reader only)
- [ ] **Content**: Should read introduction text clearly

#### Projects Section
- [ ] **Section Heading**: Should announce "Featured Projects" as H2
- [ ] **List Structure**: Should announce projects as list with X items
- [ ] **Project Cards**: Each card should be announced as article with title
- [ ] **Technologies**: Should announce technology list with individual items
- [ ] **Links**: Should announce link purposes clearly

#### CV Viewer
- [ ] **Modal Announcement**: Should announce dialog opening
- [ ] **Modal Title**: Should read "CV Document" as dialog title
- [ ] **Navigation**: Should announce page navigation controls
- [ ] **Current Page**: Should announce current page number
- [ ] **Loading States**: Should announce loading and error states
- [ ] **Close Instructions**: Should provide instructions for closing

### 3. ARIA Attributes Testing

Use browser developer tools to verify ARIA attributes:

#### Header
- [ ] `role="banner"` on header element
- [ ] `aria-label="Open CV document viewer"` on CV button
- [ ] `aria-describedby` linking to description
- [ ] `aria-expanded="false"` initially, `"true"` when modal open
- [ ] `aria-haspopup="dialog"` on CV button

#### Project Cards
- [ ] `role="article"` on each project card
- [ ] `aria-labelledby` linking to project title
- [ ] `tabindex="0"` for keyboard accessibility
- [ ] `aria-hidden="true"` on decorative overlays
- [ ] `role="list"` and `role="listitem"` for technologies

#### Projects Section
- [ ] `aria-labelledby` linking to section heading
- [ ] `role="list"` on projects grid
- [ ] `role="listitem"` on each project container

#### CV Viewer
- [ ] `role="dialog"` on modal container
- [ ] `aria-modal="true"` on modal
- [ ] `aria-labelledby` linking to modal title
- [ ] `aria-describedby` linking to modal description
- [ ] `aria-live` regions for dynamic content

### 4. Visual Accessibility Testing

#### Focus Indicators
- [ ] **Visibility**: All focusable elements have visible focus indicators
- [ ] **Contrast**: Focus indicators have sufficient contrast (3:1 minimum)
- [ ] **Consistency**: Focus indicators are consistent across components

#### Color and Contrast
- [ ] **Text Contrast**: All text meets WCAG AA contrast requirements (4.5:1)
- [ ] **Interactive Elements**: Buttons and links meet contrast requirements
- [ ] **Focus States**: Focus indicators meet contrast requirements

#### Responsive Design
- [ ] **Mobile Touch Targets**: Interactive elements are at least 44px × 44px
- [ ] **Mobile Navigation**: Touch interactions work properly
- [ ] **Zoom Support**: Page works at 200% zoom level

### 5. Error Handling and Edge Cases

#### CV Viewer Errors
- [ ] **Load Failure**: Error message is announced to screen readers
- [ ] **Retry Function**: Retry button is accessible via keyboard
- [ ] **Fallback**: Graceful fallback when CV viewer fails

#### Empty States
- [ ] **No Projects**: Empty state message is accessible
- [ ] **Loading States**: Loading indicators are announced

#### Network Issues
- [ ] **Offline**: Graceful degradation when offline
- [ ] **Slow Loading**: Appropriate loading states and timeouts

## Testing Tools

### Automated Testing
1. **axe-core**: Browser extension for automated accessibility testing
2. **Lighthouse**: Built-in Chrome accessibility audit
3. **WAVE**: Web accessibility evaluation tool

### Screen Readers
- **Windows**: NVDA (free) or JAWS
- **macOS**: VoiceOver (built-in)
- **Linux**: Orca (built-in)
- **Mobile**: TalkBack (Android) or VoiceOver (iOS)

### Browser Testing
Test in multiple browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Edge

## Common Issues to Watch For

1. **Focus Management**: Focus should never be lost or trapped inappropriately
2. **Keyboard Traps**: Users should always be able to navigate away from elements
3. **Missing Labels**: All interactive elements should have accessible names
4. **Poor Heading Structure**: Headings should follow logical hierarchy
5. **Insufficient Contrast**: Text and backgrounds should meet contrast requirements
6. **Missing Alt Text**: Images should have meaningful alternative text
7. **Inaccessible Forms**: Form controls should be properly labeled
8. **Dynamic Content**: Changes should be announced to screen readers

## Reporting Issues

When reporting accessibility issues, include:
1. **Browser and Version**: Which browser and version you're using
2. **Assistive Technology**: Screen reader or other tools being used
3. **Steps to Reproduce**: Clear steps to reproduce the issue
4. **Expected Behavior**: What should happen
5. **Actual Behavior**: What actually happens
6. **Severity**: How much this impacts users

## Success Criteria

The implementation should meet:
- [ ] **WCAG 2.1 AA compliance**: All Level A and AA success criteria
- [ ] **Keyboard Accessibility**: All functionality available via keyboard
- [ ] **Screen Reader Support**: All content accessible to screen readers
- [ ] **Focus Management**: Proper focus handling throughout the application
- [ ] **Semantic HTML**: Proper use of HTML elements and ARIA attributes
- [ ] **Error Handling**: Accessible error messages and recovery options