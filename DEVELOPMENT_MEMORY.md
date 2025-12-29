# HoiQuanPlex CRM - Development Memory & Context

**Last Updated:** 2025-12-29
**Status:** Production Ready ✅
**Latest Commit:** 06ed990

---

## 🎯 Project Overview

HoiQuanPlex CRM is a customer registration and subscription management system for a Vietnamese streaming service. The system includes:
- Public-facing marketing homepage with pricing plans
- Customer registration and payment processing
- Customer portal for account management
- Admin portal for managing customers, subscriptions, and payments
- Manual payment verification system (Phase 1 MVP)

---

## 🔧 Recent Critical Fixes (2025-12-29)

### Issue #1: Infinite Redirect Loop on Login Pages
**Symptoms:**
- Users couldn't access `/admin/login` or `/customer/login`
- Browser error: "redirected you too many times"
- Had to delete cookies to attempt access

**Root Cause:**
The parent layouts (`/admin/layout.tsx` and `/customer/layout.tsx`) were applying authentication checks to ALL routes under their path, including the login pages themselves. This created an infinite loop:
1. User visits `/admin/login`
2. Parent layout checks authentication → user not logged in
3. Redirects to `/admin/login`
4. Loop repeats infinitely

**Solution:**
Created dedicated login layouts that override the parent authentication check:
- `src/app/(admin)/admin/login/layout.tsx` - Bypasses admin auth
- `src/app/(customer)/customer/login/layout.tsx` - Bypasses customer auth

In Next.js App Router, the most specific layout wins, so these login-specific layouts prevent the parent auth check from running.

**Files Changed:**
- Created: `src/app/(admin)/admin/login/layout.tsx`
- Created: `src/app/(customer)/customer/login/layout.tsx`
- Modified: `src/app/(admin)/admin/layout.tsx` (simplified)
- Modified: `src/app/(customer)/customer/layout.tsx` (simplified)

---

### Issue #2: Post-Login Redirect Loop & Navigation Throttling
**Symptoms:**
- Login page worked, but after successful login showed blank page
- Browser console error: "Throttling navigation to prevent the browser from hanging"
- Multiple rapid `history.replaceState()` calls

**Root Cause:**
Attempted to use `x-pathname` header from middleware to determine current route in layouts. This was unreliable during client-side navigation, causing race conditions and redirect loops after login.

**Solution:**
Removed all pathname header logic. Instead, rely on Next.js's layout hierarchy:
- Login pages have their own layouts (no auth check)
- Dashboard pages are protected by parent layouts (auth check)
- Middleware only handles session refresh, not redirects

**Files Changed:**
- Modified: `src/middleware.ts` - Removed pathname header logic
- Modified: `src/app/(admin)/admin/layout.tsx` - Removed header checks
- Modified: `src/app/(customer)/customer/layout.tsx` - Removed header checks

---

### Issue #3: Customer Authentication Field Mismatch
**Symptoms:**
- Customer portal showed blank pages after login
- Supabase queries returned no results for authenticated customers

**Root Cause:**
The `getCustomer()` function was querying the wrong database field:
- Incorrect: `customers.id = auth_user.id`
- Correct: `customers.auth_user_id = auth_user.id`

**Solution:**
Fixed database query in `customer-auth-helpers.ts` to use correct foreign key field.

**Files Changed:**
- Modified: `src/lib/auth/customer-auth-helpers.ts` (line 30)

---

### Issue #4: Homepage Not Loading / Too Simple
**Symptoms:**
- Homepage was just a simple card layout with login links
- No marketing content or pricing information
- Not professional for a production service

**Solution:**
Complete homepage redesign with:
- Professional header with login button in top right
- Hero section with compelling value proposition
- Features section highlighting key benefits
- Pricing section with 3 tiers (Free, Pro, Plus)
- Professional footer with navigation

**Files Changed:**
- Modified: `src/app/page.tsx` - Complete redesign

---

## 🏗️ Current Architecture

### Authentication Flow

#### Public Routes (No Auth Required)
- `/` - Homepage (marketing, pricing)
- `/register/form-a` - Registration form
- `/admin/login` - Admin login page
- `/customer/login` - Customer login page

#### Protected Routes - Admin
All routes under `/admin/*` (except `/admin/login`) require admin authentication:
- `/admin` - Dashboard
- `/admin/customers` - Customer management
- `/admin/subscriptions` - Subscription management
- `/admin/payments` - Payment verification
- `/admin/forms` - Form submissions
- `/admin/analytics` - Analytics dashboard

**Auth Guard:** `src/app/(admin)/admin/layout.tsx`
- Calls `getAdminUser()` to check authentication
- Redirects to `/admin/login` if not authenticated

#### Protected Routes - Customer
All routes under `/customer/*` (except `/customer/login`) require customer authentication:
- `/customer` - Customer dashboard
- `/customer/profile` - Profile management
- `/customer/subscription` - Subscription details
- `/customer/payments` - Payment history

**Auth Guard:** `src/app/(customer)/customer/layout.tsx`
- Calls `getCustomer()` to check authentication
- Redirects to `/customer/login` if not authenticated

### Database Schema

**Key Tables:**
- `admin_users` - Admin accounts
  - `id` (UUID) - Links to `auth.users.id`
  - `email`, `role`, `status`

- `customers` - Customer accounts
  - `id` (UUID) - Primary key
  - `auth_user_id` (UUID) - Foreign key to `auth.users.id` ⚠️ IMPORTANT
  - `email`, `full_name`, `phone`, `tier`, `status`

- `subscriptions` - Customer subscriptions
  - Links to customers via `customer_id`
  - Tracks plan, status, dates

- `payments` - Payment records
  - Manual bank transfer tracking
  - Links to customers and subscriptions

### Payment System (Phase 1 - Manual)

**Current Implementation:**
- Bank transfer with unique payment codes
- Manual verification by admin
- QR code generation for easy payment
- Payment status polling (10-second intervals)

**Admin Workflow:**
1. Customer initiates payment → Receives bank details + QR code
2. Customer transfers money → Includes payment code in description
3. Admin checks bank account → Finds transfer with payment code
4. Admin verifies payment in CRM → System creates subscription
5. Customer receives confirmation email → Account activated

**Future Enhancement:** VNPay integration when reaching 50+ payments/week (see `payment-implementation-roadmap.md`)

---

## 📂 Important Files & Their Purpose

### Authentication
- `src/lib/auth/auth-helpers.ts` - General auth functions (getCurrentUser, getAdminUser)
- `src/lib/auth/customer-auth-helpers.ts` - Customer-specific auth (getCustomer, hasActiveSubscription)
- `src/lib/auth/actions.ts` - Server actions for login/logout
- `src/middleware.ts` - Session refresh via Supabase

### Layouts (Critical for Auth Flow)
- `src/app/(admin)/admin/layout.tsx` - Protects all admin routes
- `src/app/(admin)/admin/login/layout.tsx` - Bypasses auth for admin login
- `src/app/(customer)/customer/layout.tsx` - Protects all customer routes
- `src/app/(customer)/customer/login/layout.tsx` - Bypasses auth for customer login

### Pages
- `src/app/page.tsx` - Marketing homepage with pricing
- `src/app/(admin)/admin/login/page.tsx` - Admin login form
- `src/app/(customer)/customer/login/page.tsx` - Customer login form
- `src/app/(admin)/admin/page.tsx` - Admin dashboard
- `src/app/(customer)/customer/page.tsx` - Customer dashboard

### Components
- `src/components/auth/login-form.tsx` - Admin login form
- `src/components/auth/customer-login-form.tsx` - Customer login form
- `src/components/layout/admin-dashboard-layout.tsx` - Admin UI wrapper
- `src/components/layout/customer-dashboard-layout.tsx` - Customer UI wrapper

---

## ⚠️ Common Pitfalls & Solutions

### 1. Redirect Loops
**Problem:** Adding auth checks to routes that should be public
**Solution:** Always create a dedicated layout for login pages that bypasses parent auth

### 2. Customer Not Found After Login
**Problem:** Querying wrong database field
**Solution:** Always use `auth_user_id` field, not `id`, when looking up customers by auth user

### 3. Stale Session Data
**Problem:** Changes to user data not reflected immediately
**Solution:** Use `revalidatePath('/', 'layout')` after mutations

### 4. Navigation Throttling
**Problem:** Too many rapid redirects or navigation events
**Solution:** Avoid calling `router.refresh()` immediately after `router.push()`

---

## 🚀 Deployment Checklist

### Environment Variables Required
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Bank Details (for manual payment)
BANK_NAME=
BANK_CODE=
BANK_ACCOUNT_NUMBER=
BANK_ACCOUNT_NAME=
BANK_BRANCH= (optional)

# Email Service
RESEND_API_KEY= (or SENDGRID_API_KEY)

# Cron Jobs (for scheduled tasks)
CRON_SECRET=
```

### Pre-Deployment
1. ✅ Run `npm run build` - Must succeed without errors
2. ✅ Test login flow - Both admin and customer
3. ✅ Test registration flow - Complete end-to-end
4. ✅ Test payment flow - Create, verify, check status
5. ✅ Verify environment variables in Vercel

### Post-Deployment Testing
1. Homepage loads correctly
2. Login buttons work (admin and customer)
3. Registration form submits successfully
4. Payment creation works
5. Admin can verify payments
6. Customer dashboard loads after login
7. Admin dashboard loads after login

---

## 🐛 Known Issues & Future Work

### Known Non-Critical Issues
1. **Console statements in API routes** - 15 warnings
   - Impact: None (useful for debugging)
   - Action: Clean up in future refactor

2. **Type import suggestions** - 4 warnings
   - Impact: None (code works correctly)
   - Action: Optimize in next code quality pass

3. **Image component warning** - 1 warning in avatar upload
   - Impact: Minor performance
   - Action: Convert to Next.js Image component

### Future Enhancements
1. **VNPay Integration** (when reaching 50+ payments/week)
   - See: `payment-implementation-roadmap.md`
   - Automatic payment processing
   - Instant subscription activation

2. **Email Notifications**
   - Payment pending notifications
   - Payment verified confirmations
   - Subscription renewal reminders

3. **Analytics Dashboard**
   - Real-time customer metrics
   - Revenue tracking
   - Conversion funnel analysis

4. **Mobile App**
   - Customer mobile app for content viewing
   - Push notifications for account updates

---

## 📝 Development Notes

### Next.js App Router Specifics
- Layouts apply to all routes in their directory tree
- More specific layouts override parent layouts
- Server Components by default (use 'use client' only when needed)
- Middleware runs on every request (keep it lightweight)

### Supabase Auth
- Session stored in cookies (managed by middleware)
- `getUser()` returns current user from session
- Always refresh session in middleware before auth checks
- Row Level Security (RLS) policies should mirror auth logic

### TypeScript
- Strict mode enabled
- All API responses should be typed
- Use Zod for runtime validation

### Best Practices Followed
- Separation of concerns (auth helpers, actions, components)
- Server-side auth checks in layouts
- Client-side forms with server actions
- Optimistic UI updates where appropriate
- Proper error handling and user feedback

---

## 🔗 Related Documentation

- `hoiquanplex-crm-prompt.md` - Original implementation requirements
- `payment-implementation-roadmap.md` - Payment system strategy (manual → automatic)
- `README.md` - Setup and installation instructions (if exists)

---

## 📞 Support & Maintenance

### If Login Issues Occur:
1. Check browser console for specific errors
2. Verify Supabase connection (check environment variables)
3. Check that dedicated login layouts exist
4. Ensure middleware is refreshing sessions

### If Payment Issues Occur:
1. Check bank details in environment variables
2. Verify payment code generation (unique codes)
3. Check database for payment records
4. Verify Supabase service role key permissions

### If Dashboard Shows Blank:
1. Check authentication (getAdminUser/getCustomer returns data)
2. Verify database queries (correct field names)
3. Check for JavaScript errors in console
4. Verify layout is rendering children

---

## ✅ Current Status Summary

**Build:** ✅ Successful (all 22 routes)
**Authentication:** ✅ Working (admin & customer)
**Homepage:** ✅ Professional marketing page
**Payment System:** ✅ Manual verification functional
**Deployment:** ✅ Ready for production

**Last Verified:** 2025-12-29
**Git Commit:** 06ed990
**GitHub:** https://github.com/rclifen122/hoiquanplex

---

*This file serves as a living document. Update it whenever significant changes are made to the architecture, authentication flow, or major bugs are fixed.*
