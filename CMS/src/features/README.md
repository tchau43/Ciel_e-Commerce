# Features Directory Structure

This directory contains all the feature modules for the CMS application.

## Core Features

### Admin Module (`admin/`)

- `pages/` - Admin pages (Dashboard, User Management, Product Management, Invoice Management)
- `components/` - Admin-specific components
- `AdminLayout.tsx` - Main layout for admin pages

### Authentication (`auth/`)

- `pages/` - Login and Register pages
- `components/` - Authentication related components

### Landing (`landing/`)

- `pages/` - Landing page for the CMS

## Utility Modules

These modules provide shared functionality across features:

- `utils/` - Utility functions (e.g., authentication utilities)
- `types/` - TypeScript type definitions
- `lib/` - Shared libraries and configurations
- `hooks/` - Custom React hooks

## Directory Clean-up Instructions

1. Keep only the following directories:

   - admin/
   - auth/
   - landing/
   - utils/
   - types/
   - lib/
   - hooks/

2. Remove all other directories as they are related to customer functionality:
   - stripe/
   - review/
   - recommendations/
   - products/
   - payment/
   - pages/
   - invoices/
   - faq/
   - customer/
   - components/
   - category/
   - carts/

## Note

This structure maintains only the admin-related functionality while removing all customer-facing features. The remaining code is focused on CMS functionality for administrators.
