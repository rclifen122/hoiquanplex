---
name: HQPSaaS Development Patterns
description: Best practices and patterns for the HoiQuanPlex CRM system using Next.js 14, Supabase, and Stripe
category: development
---

# 🎬 HQPSaaS Development Patterns

> Comprehensive development guide for the HoiQuanPlex Customer Registration & Subscription Management CRM

## 1. Project Architecture

### Tech Stack Overview
```typescript
// Core Framework
- Next.js 14 (App Router)
- React 18
- TypeScript 5.5+

// Backend & Database
- Supabase (PostgreSQL + Auth + Storage)
- Supabase SSR for server-side authentication

// Payment Processing
- Stripe (subscriptions, payments, webhooks)

// State Management & Data Fetching
- TanStack Query (React Query) v5
- Zustand for global state
- React Hook Form + Zod for forms

// UI Components
- Radix UI primitives
- Tailwind CSS + tailwindcss-animate
- Lucide React icons
- Sonner for toast notifications

// Testing
- Vitest (unit/integration tests)
- Playwright (E2E tests)
- Testing Library (React)
```

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth routes group
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Radix UI components
│   ├── forms/            # Form components
│   ├── dashboard/        # Dashboard-specific
│   └── shared/           # Shared components
├── lib/                   # Utility libraries
│   ├── supabase/         # Supabase clients & utilities
│   ├── stripe/           # Stripe utilities
│   └── utils/            # General utilities
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
│   └── database.ts       # Supabase generated types
└── config/               # Configuration files
```

## 2. Supabase Integration Patterns

### Client Setup (Server vs Client)

```typescript
// lib/supabase/server.ts - For Server Components & API Routes
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component - ignore cookie writes
          }
        },
      },
    }
  )
}

// lib/supabase/client.ts - For Client Components
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Authentication Patterns

```typescript
// Server-side auth check
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <Dashboard user={user} />
}

// Client-side auth with React Query
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useUser() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    },
  })
}
```

### Database Queries with Type Safety

```typescript
// Always use generated types from database.ts
import { Database } from '@/types/database'

type Customer = Database['public']['Tables']['customers']['Row']
type CustomerInsert = Database['public']['Tables']['customers']['Insert']
type CustomerUpdate = Database['public']['Tables']['customers']['Update']

// Query with type safety
const { data, error } = await supabase
  .from('customers')
  .select('*')
  .eq('subscription_status', 'active')
  .returns<Customer[]>()

// Insert with type safety
const { data, error } = await supabase
  .from('customers')
  .insert({
    email: 'user@example.com',
    full_name: 'John Doe',
  } satisfies CustomerInsert)
```

### Real-time Subscriptions

```typescript
// Set up real-time listener in useEffect
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeCustomers() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('customers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
        },
        () => {
          // Invalidate and refetch
          queryClient.invalidateQueries({ queryKey: ['customers'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, supabase])
}
```

## 3. Stripe Integration Patterns

### Webhook Handling

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createClient()

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription
      await supabase
        .from('subscriptions')
        .upsert({
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
      break

    case 'customer.subscription.deleted':
      const deletedSub = event.data.object as Stripe.Subscription
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', deletedSub.id)
      break
  }

  return NextResponse.json({ received: true })
}
```

### Payment Intent Creation

```typescript
// app/api/create-payment-intent/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { amount, currency = 'usd' } = await req.json()

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata: {
      user_id: user.id,
    },
  })

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
  })
}
```

## 4. Form Patterns with React Hook Form + Zod

### Form Schema Definition

```typescript
// lib/validations/customer.ts
import { z } from 'zod'

export const customerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  subscription_plan: z.enum(['basic', 'premium', 'enterprise']),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
})

export type CustomerFormData = z.infer<typeof customerSchema>
```

### Form Component Implementation

```typescript
// components/forms/CustomerForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { customerSchema, type CustomerFormData } from '@/lib/validations/customer'
import { createClient } from '@/lib/supabase/client'

export function CustomerForm({ customerId }: { customerId?: string }) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      subscription_plan: 'basic',
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const { error } = await supabase
        .from('customers')
        .insert(data)

      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Customer created successfully')
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      form.reset()
    },
    onError: (error) => {
      toast.error(`Failed to create customer: ${error.message}`)
    },
  })

  return (
    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
      {/* Form fields using Radix UI components */}
    </form>
  )
}
```

## 5. Data Fetching with TanStack Query

### Query Patterns

```typescript
// hooks/useCustomers.ts
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useCustomers(filters?: { status?: string }) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['customers', filters],
    queryFn: async () => {
      let query = supabase.from('customers').select('*')

      if (filters?.status) {
        query = query.eq('subscription_status', filters.status)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Mutation pattern
export function useCreateCustomer() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (data: CustomerInsert) => {
      const { data: customer, error } = await supabase
        .from('customers')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return customer
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}
```

### Server Components with Prefetching

```typescript
// app/dashboard/customers/page.tsx
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/server'
import { CustomerList } from './CustomerList'

export default async function CustomersPage() {
  const queryClient = new QueryClient()
  const supabase = createClient()

  // Prefetch on server
  await queryClient.prefetchQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CustomerList />
    </HydrationBoundary>
  )
}
```

## 6. Testing Patterns

### Unit Tests with Vitest

```typescript
// __tests__/utils/formatters.test.ts
import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1000, 'USD')).toBe('$10.00')
  })

  it('handles zero amount', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00')
  })
})
```

### Component Tests

```typescript
// __tests__/components/CustomerForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi } from 'vitest'
import { CustomerForm } from '@/components/forms/CustomerForm'

describe('CustomerForm', () => {
  it('validates email field', async () => {
    const queryClient = new QueryClient()
    const user = userEvent.setup()

    render(
      <QueryClientProvider client={queryClient}>
        <CustomerForm />
      </QueryClientProvider>
    )

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })
  })
})
```

### E2E Tests with Playwright

```typescript
// e2e/customer-management.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Customer Management', () => {
  test('should create a new customer', async ({ page }) => {
    await page.goto('/dashboard/customers')

    await page.click('button:has-text("Add Customer")')
    await page.fill('input[name="full_name"]', 'John Doe')
    await page.fill('input[name="email"]', 'john@example.com')
    await page.selectOption('select[name="subscription_plan"]', 'premium')

    await page.click('button:has-text("Create")')

    await expect(page.locator('text=Customer created successfully')).toBeVisible()
    await expect(page.locator('text=John Doe')).toBeVisible()
  })
})
```

## 7. Best Practices & Anti-Patterns

### ✅ DO

1. **Always use type-safe database queries** with generated Supabase types
2. **Implement proper error handling** at every data boundary
3. **Use React Query for all async state management** (avoid useState for server data)
4. **Validate all forms** with Zod schemas before submission
5. **Separate server and client Supabase clients** - never mix them
6. **Handle Stripe webhooks idempotently** - use unique IDs to prevent duplicates
7. **Invalidate queries after mutations** to keep UI in sync
8. **Use Server Components by default**, only use 'use client' when needed
9. **Implement proper loading and error states** for all async operations
10. **Write tests for critical business logic** (payments, subscriptions, auth)

### ❌ DON'T

1. **Don't expose Stripe secret keys** in client-side code
2. **Don't trust client-side validation alone** - always validate on server
3. **Don't store sensitive data in localStorage** - use httpOnly cookies
4. **Don't use default error messages** - provide user-friendly feedback
5. **Don't skip webhook signature verification** - always verify Stripe webhooks
6. **Don't mutate React Query cache directly** - use invalidation or optimistic updates
7. **Don't hardcode Stripe product IDs** - use environment variables
8. **Don't forget to clean up Supabase realtime subscriptions**
9. **Don't use `any` type** - leverage TypeScript's type system
10. **Don't skip email verification** for new user registrations

## 8. Common Workflows

### Adding a New Feature

```bash
# 1. Create database migration (if needed)
supabase migration new add_feature_table

# 2. Regenerate types
pnpm run supabase:generate-types

# 3. Create API route (if needed)
touch src/app/api/feature/route.ts

# 4. Create components
mkdir -p src/components/feature
touch src/components/feature/FeatureForm.tsx

# 5. Create validation schema
touch src/lib/validations/feature.ts

# 6. Create hooks
touch src/hooks/useFeature.ts

# 7. Write tests
touch __tests__/feature.test.tsx

# 8. Run tests
pnpm test
```

### Debugging Supabase Issues

```typescript
// Enable detailed logging
const { data, error } = await supabase
  .from('table')
  .select('*')

console.log('Query result:', { data, error })

// Check auth state
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)

// Test RLS policies
const { data, error } = await supabase.rpc('test_policy', { user_id: '...' })
```

### Stripe Testing

```bash
# Use Stripe CLI for webhook testing
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test with Stripe test cards
# Success: 4242 4242 4242 4242
# Decline: 4000 0000 0000 0002
# 3D Secure: 4000 0025 0000 3155
```

## 9. Environment Variables Template

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Use When

- Developing features for the HQPSaaS CRM system
- Setting up Supabase authentication or database queries
- Implementing Stripe payment flows
- Creating forms with validation
- Writing tests for the application
- Debugging integration issues
- Following project-specific coding standards
