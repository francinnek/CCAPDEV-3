# DLSU Airlines - Project Changes Documentation

## Overview
This document outlines the design changes and improvements made to the DLSU Airlines Online Ticketing System project. The changes focus on ensuring UI consistency, revising page functionalities, and establishing a proper user flow throughout the application.

## Table of Contents
1. [UI Consistency Changes](#ui-consistency-changes)
2. [Admin Page Revision](#admin-page-revision)
3. [Login Page as Central Hub](#login-page-as-central-hub)
4. [Future Considerations](#future-considerations)

## UI Consistency Changes

### Applied Consistent Design Elements Across Pages:
- **Color Scheme**: 
  - Primary color: `#4CAF50` (Green)
  - Secondary color: `#2E7D32` (Dark Green)
  - Light background: `#f8f9fa`
  - Text colors: Black for content, white for buttons/headers

- **Header & Footer**:
  - Consistent header with DLSU Airlines logo and branding
  - Fixed footer with copyright information
  - Green header bar with white text

- **Form Elements**:
  - Standardized input field styling with consistent padding and borders
  - Added green focus states for form controls
  - Applied green borders to container elements

- **Buttons**:
  - Consistent button styling with green background
  - Hover effects with darker green shade
  - Proper spacing and alignment

- **Container Elements**:
  - Added consistent padding and margins
  - Applied green borders to distinguish content sections
  - Used consistent box-shadow styling for depth

### CSS Organization:
- Created CSS variables for consistent colors
- Organized CSS sections by component type
- Fixed specificity issues in style rules
- Corrected syntax errors in CSS files
- Improved spacing and layout for better readability

## Admin Page Revision

The Admin Page (`Admin_page.html`) was revised based on a re-examination of the project requirements:

### Changes Made:
- **Removed Login Button**: Since Admin page should only be accessible after login, this button was redundant
- **Removed Search Bar**: Redundant since there's already a "Search Flight" button
- **Retained My Booking Lists**: For admin/user to view and manage bookings
- **Retained User Profile Details**: For admin/user account management

### Rationale:
- The Admin page serves as a dashboard for administrators after authentication
- Admin users need different access and privileges than regular users
- The page now focuses on administrative functions rather than duplicating user functions

## Login Page as Central Hub

Based on the project specifications, `loginform.html` has been established as the central entry point for the application:

### Implementation:
- **User Authentication Flow**: The login page now serves as the starting point for both users and administrators
- **Redirection Logic**: Added JavaScript to handle redirection to appropriate pages after authentication
- **Styled Consistently**: Applied the same design language as other pages
- **Form Improvements**:
  - Added proper spacing between form elements
  - Horizontally aligned login/register buttons with distinct colors
  - Implemented proper form validation visual cues

## Future Considerations

For Milestone 2, two possible approaches are being considered:

### Option 1: Role-based Authentication
- Create a single login page that recognizes user type (admin or regular user)
- Implement logic to redirect users to the appropriate page based on credentials
- Advantages: Single entry point, cleaner user experience

### Option 2: Separate Authentication Paths
- Create separate login pages for admins and users
- Each path leads to a different set of functionality
- Advantages: Clear separation of concerns, simpler implementation

## Technical Implementation Details

### CSS Variables
```css
:root {
    --primary-color: #4CAF50; 
    --secondary-color: #2E7D32; 
    --light-bg: #f8f9fa;
    --text-color: black; 
    --light-grey: #666; 
}
```

### Responsive Improvements
- Added proper container margins and max-widths
- Implemented responsive form layouts
- Ensured proper spacing on mobile devices

### Footer Positioning
- Fixed footer always visible at bottom of screen
- Added adequate padding to ensure content isn't hidden behind footer

### Flight Seat Layout
- Maintained consistent styling with the rest of the application
- Improved interaction for seat selection
- Added proper spacing between flight layout and other page elements

---

*This documentation covers changes made as of October 21, 2025.*