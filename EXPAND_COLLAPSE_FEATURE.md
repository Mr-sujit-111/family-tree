# Expand/Collapse Tree Feature Implementation

## Overview
This document describes the implementation of the expand/collapse functionality for the family tree visualization. The feature allows users to show or hide branches of the family tree by clicking expand/collapse buttons on nodes that have children.

## Key Features Implemented

### 1. Smooth Animated Expand/Collapse Buttons
- Positioned at the top center of each member card (-top-3, left-1/2, -translate-x-1/2)
- Only visible on hover with smooth opacity transition (opacity-0 → group-hover:opacity-100)
- Circular button with primary color and shadow for visual prominence
- Responsive sizing for mobile and desktop views

### 2. Mobile-First Design
- Touch-friendly button sizing (minimum 44px touch target on mobile)
- Proper touch-action attributes for smooth interactions
- WebkitTapHighlightColor set to transparent for better touch experience

### 3. Smooth Animations
- Expand/collapse transitions with opacity and max-height changes
- Connector line fade in/out synchronized with children
- CSS transitions for all interactive elements
- Reduced motion support for accessibility

### 4. Visual Feedback
- Chevron icons change based on expanded state (ChevronRight → ChevronDown)
- Button scales slightly on hover and press for tactile feedback
- Smooth color transitions on hover states

## Technical Implementation

### Components Modified

1. **TreeNode Component** (`components/tree-node.tsx`)
   - Added expand/collapse button positioned at top center of member cards
   - Implemented smooth animations for children visibility
   - Enhanced touch interaction support
   - Added proper event propagation handling

2. **CSS Styles** (`styles/tree-animations.css`)
   - Created custom animations for expand/collapse transitions
   - Added touch-friendly styles and custom scrollbars
   - Implemented responsive design for all screen sizes

3. **Global Styles** (`styles/globals.css`)
   - Imported new animation styles

### Key Changes

1. **Button Positioning**
   ```tsx
   <button
     className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 active:scale-95 transition-all duration-200 ease-in-out opacity-0 group-hover:opacity-100 focus:opacity-100 touch-manipulation flex items-center justify-center z-10 expand-collapse-button"
   >
   ```

2. **Smooth Animations**
   ```tsx
   <div 
     className={`flex flex-col items-center gap-5 sm:gap-6 transition-all duration-300 ease-in-out ${
       isExpanded ? 'opacity-100 max-h-[10000px]' : 'opacity-0 max-h-0 overflow-hidden'
     }`}
   >
   ```

3. **Connector Line Animation**
   ```tsx
   <div className={`h-5 sm:h-6 w-0.5 sm:w-1 bg-primary/40 transition-all duration-300 ease-in-out ${
     isExpanded ? 'opacity-100' : 'opacity-0'
   }`} />
   ```

## Usage

The expand/collapse functionality is automatically available for any family member that has children. Users can:

1. Hover over a member card to see the expand/collapse button
2. Click the button to toggle the visibility of that member's children
3. See smooth animations during the expand/collapse transition
4. Interact seamlessly on both mobile and desktop devices

## Accessibility

- Proper ARIA labels ("Expand" / "Collapse")
- Keyboard focus support
- Reduced motion support for users with motion sensitivity
- Sufficient color contrast for visibility
- Appropriate touch target sizes for mobile users

## Testing

Unit tests have been created to verify:
- Button visibility based on children presence
- Proper event handling and propagation
- Correct rendering of children when expanded
- State management for expanded/collapsed nodes

## Future Enhancements

1. Add keyboard navigation support for expand/collapse actions
2. Implement bulk expand/collapse for entire tree sections
3. Add animation customization options
4. Include expand/collapse state persistence across sessions