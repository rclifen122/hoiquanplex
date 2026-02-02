---
name: Stripe Webhooks Mastery
description: Complete guide to implementing robust, secure, and reliable Stripe webhook handlers for subscription management
category: payments
---

# 💳 Stripe Webhooks Mastery

> Build production-ready Stripe webhook handlers that never miss an event

## 1. Webhook Fundamentals

### Why Webhooks Matter

Webhooks are **essential** for Stripe integration because:

1. **Real-time updates** - Get notified instantly when events happen
2. **Reliability** - Stripe retries failed webhooks automatically
3. **Security** - Payment flows complete on Stripe's servers, not yours
4. **Accuracy** - Source of truth for subscription status

### Event Flow

```
User subscribes → Stripe processes → Stripe sends webhook → Your API updates database
                                                          ↓
                                                    User sees updated status
```

### Critical Events for HQPSaaS

```typescript
// Subscription lifecycle
'customer.subscription.created'     // New subscription
'customer.subscription.updated'     // Plan change, renewal
'customer.subscription.deleted'     // Cancellation
'customer.subscription.trial_will_end' // 3 days before trial ends

// Payment events
'invoice.paid'                      // Successful payment
'invoice.payment_failed'            // Failed payment
'invoice.upcoming'                  // 7 days before renewal

// Customer events
'customer.created'                  // New customer in Stripe
'customer.updated'                  // Customer details changed
'customer.deleted'                  // Customer removed

// Payment method events
'payment_method.attached'           // Card added
'payment_method.detached'           // Card removed
'payment_method.updated'            // Card updated
```

## 2. Secure Webhook Implementation

### Complete Next.js API Route

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

// CRITICAL: Disable body parsing for webhook signature verification
export const runtime = 'edge' // Optional: Use edge runtime for better performance

export async function POST(req: Request) {
  const body = await req.text() // Get raw body as text
  const signature = headers().get('stripe-signature')

  if (!signature) {
    console.error('Missing stripe-signature header')
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const error = err as Error
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    await handleStripeEvent(event)
    return NextResponse.json({ received: true })
  } catch (err) {
    const error = err as Error
    console.error('Webhook handler error:', error)
    // Return 500 to trigger Stripe retry
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
```

### Event Handler with Idempotency

```typescript
// lib/stripe/webhook-handlers.ts
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export async function handleStripeEvent(event: Stripe.Event) {
  const supabase = createClient()

  // Log all events for debugging
  await supabase.from('webhook_events').insert({
    event_id: event.id,
    event_type: event.type,
    event_data: event.data.object,
    created_at: new Date(event.created * 1000).toISOString(),
  })

  // Check idempotency - prevent duplicate processing
  const { data: existing } = await supabase
    .from('processed_events')
    .select('event_id')
    .eq('event_id', event.id)
    .single()

  if (existing) {
    console.log(`Event ${event.id} already processed, skipping`)
    return
  }

  // Process based on event type
  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
      break

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
      break

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
      break

    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice)
      break

    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
      break

    case 'customer.subscription.trial_will_end':
      await handleTrialWillEnd(event.data.object as Stripe.Subscription)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  // Mark event as processed
  await supabase.from('processed_events').insert({
    event_id: event.id,
    event_type: event.type,
    processed_at: new Date().toISOString(),
  })
}
```

### Individual Event Handlers

```typescript
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const supabase = createClient()

  const { error } = await supabase.from('subscriptions').upsert({
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    stripe_price_id: subscription.items.data[0].price.id,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    created_at: new Date(subscription.created * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error('Failed to create subscription:', error)
    throw error
  }

  // Update customer subscription status
  await supabase
    .from('customers')
    .update({
      subscription_status: subscription.status,
      subscription_id: subscription.id
    })
    .eq('stripe_customer_id', subscription.customer)

  // Send welcome email
  await sendWelcomeEmail(subscription.customer as string)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = createClient()

  // Detect what changed
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('status, stripe_price_id')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  const statusChanged = existing?.status !== subscription.status
  const planChanged = existing?.stripe_price_id !== subscription.items.data[0].price.id

  // Update subscription
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      stripe_price_id: subscription.items.data[0].price.id,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  // Update customer status
  await supabase
    .from('customers')
    .update({ subscription_status: subscription.status })
    .eq('stripe_customer_id', subscription.customer)

  // Send notification emails
  if (statusChanged && subscription.status === 'active') {
    await sendReactivationEmail(subscription.customer as string)
  }

  if (planChanged) {
    await sendPlanChangeConfirmation(subscription.customer as string)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = createClient()

  // Update subscription
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  // Update customer
  await supabase
    .from('customers')
    .update({
      subscription_status: 'canceled',
      subscription_id: null
    })
    .eq('stripe_customer_id', subscription.customer)

  // Send cancellation email
  await sendCancellationEmail(subscription.customer as string)
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const supabase = createClient()

  // Record payment
  await supabase.from('payments').insert({
    stripe_invoice_id: invoice.id,
    stripe_customer_id: invoice.customer as string,
    stripe_subscription_id: invoice.subscription as string,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: 'succeeded',
    paid_at: new Date(invoice.status_transitions.paid_at! * 1000).toISOString(),
  })

  // Send receipt email
  await sendReceiptEmail(invoice.customer as string, invoice.id)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const supabase = createClient()

  // Record failed payment
  await supabase.from('payments').insert({
    stripe_invoice_id: invoice.id,
    stripe_customer_id: invoice.customer as string,
    stripe_subscription_id: invoice.subscription as string,
    amount: invoice.amount_due,
    currency: invoice.currency,
    status: 'failed',
    failure_reason: invoice.last_finalization_error?.message,
  })

  // Update subscription status
  if (invoice.subscription) {
    await supabase
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('stripe_subscription_id', invoice.subscription)

    await supabase
      .from('customers')
      .update({ subscription_status: 'past_due' })
      .eq('stripe_subscription_id', invoice.subscription)
  }

  // Send payment failed email
  await sendPaymentFailedEmail(
    invoice.customer as string,
    invoice.hosted_invoice_url!
  )
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  // Send reminder email 3 days before trial ends
  await sendTrialEndingEmail(
    subscription.customer as string,
    new Date(subscription.trial_end! * 1000)
  )
}
```

## 3. Database Schema for Webhooks

```sql
-- Store all webhook events for debugging
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  processed_at TIMESTAMPTZ
);

-- Idempotency table
CREATE TABLE processed_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX idx_processed_events_event_id ON processed_events(event_id);
CREATE INDEX idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_created ON webhook_events(created_at DESC);
```

## 4. Testing Webhooks Locally

### Using Stripe CLI

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# You'll get a webhook signing secret (whsec_...)
# Add it to .env.local as STRIPE_WEBHOOK_SECRET

# Trigger test events
stripe trigger customer.subscription.created
stripe trigger invoice.paid
stripe trigger invoice.payment_failed
```

### Manual Testing with curl

```bash
# Get a sample event from Stripe dashboard
# Then send it manually
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: <signature>" \
  -d @webhook-payload.json
```

### Automated Tests

```typescript
// __tests__/webhooks/stripe.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { POST } from '@/app/api/webhooks/stripe/route'
import Stripe from 'stripe'

describe('Stripe Webhook Handler', () => {
  it('handles subscription.created event', async () => {
    const event: Stripe.Event = {
      id: 'evt_test_123',
      object: 'event',
      type: 'customer.subscription.created',
      data: {
        object: {
          id: 'sub_123',
          customer: 'cus_123',
          status: 'active',
          // ... other fields
        },
      },
    }

    const signature = generateTestSignature(event)

    const response = await POST(
      new Request('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'stripe-signature': signature },
        body: JSON.stringify(event),
      })
    )

    expect(response.status).toBe(200)

    // Verify database was updated
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', 'sub_123')
      .single()

    expect(data.status).toBe('active')
  })
})
```

## 5. Production Best Practices

### ✅ DO

1. **Always verify webhook signatures** - Never skip this step
2. **Log all events** to `webhook_events` table for debugging
3. **Implement idempotency** to prevent duplicate processing
4. **Return 200 quickly** - Process async if needed
5. **Handle all subscription statuses**: active, past_due, canceled, unpaid
6. **Set up webhook monitoring** - Alert on failures
7. **Use database transactions** for related updates
8. **Test with Stripe CLI** before deploying
9. **Version your webhook handlers** for backward compatibility
10. **Retry failed database operations** with exponential backoff

### ❌ DON'T

1. **Don't trust event data without verification**
2. **Don't expose webhook endpoint publicly without auth**
3. **Don't process events synchronously if slow** (>5s)
4. **Don't ignore Stripe retry attempts** - Fix errors properly
5. **Don't hardcode webhook secrets** - Use environment variables
6. **Don't forget to handle edge cases** (canceled trials, refunds)
7. **Don't skip logging** - You'll need it for debugging
8. **Don't update UI state from webhooks** - Use polling or realtime
9. **Don't assume events arrive in order**
10. **Don't forget to handle deleted customers**

## 6. Monitoring & Debugging

### Stripe Dashboard

```
Developers → Webhooks → Your endpoint
- View recent events
- See delivery attempts
- Resend failed events
- Check response codes
```

### Logging Strategy

```typescript
// Structured logging with context
function logWebhookEvent(event: Stripe.Event, context: any) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event_id: event.id,
    event_type: event.type,
    customer_id: (event.data.object as any).customer,
    ...context,
  }))
}
```

### Error Tracking

```typescript
// app/api/webhooks/stripe/route.ts
import * as Sentry from '@sentry/nextjs'

export async function POST(req: Request) {
  try {
    // ... webhook handling
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        event_type: event.type,
        event_id: event.id,
      },
    })
    throw error
  }
}
```

### Alerting

```typescript
// lib/stripe/monitoring.ts
async function alertOnCriticalEvent(event: Stripe.Event) {
  const criticalEvents = [
    'invoice.payment_failed',
    'customer.subscription.deleted',
  ]

  if (criticalEvents.includes(event.type)) {
    // Send to Slack, email, etc.
    await sendSlackNotification({
      channel: '#payments-alerts',
      text: `🚨 Critical event: ${event.type}`,
      event_id: event.id,
    })
  }
}
```

## 7. Common Issues & Solutions

### Issue: Webhook signature verification fails

```typescript
// Solution: Ensure you're reading raw body as text
const body = await req.text() // ✅ Correct
const body = await req.json() // ❌ Wrong - breaks signature
```

### Issue: Events processed out of order

```typescript
// Solution: Use event timestamps, not arrival time
const eventTimestamp = new Date(event.created * 1000)

// Only update if event is newer
await supabase
  .from('subscriptions')
  .update({ status: subscription.status })
  .eq('stripe_subscription_id', subscription.id)
  .lt('updated_at', eventTimestamp.toISOString()) // Only if newer
```

### Issue: Duplicate events

```typescript
// Solution: Implement idempotency check
const { data } = await supabase
  .from('processed_events')
  .select('event_id')
  .eq('event_id', event.id)
  .single()

if (data) {
  return NextResponse.json({ received: true }) // Already processed
}
```

## Use When

- Implementing Stripe subscription webhooks in HQPSaaS
- Debugging webhook delivery issues
- Setting up payment event handlers
- Ensuring subscription status stays in sync
- Testing webhook flows locally
- Monitoring payment failures
- Implementing idempotent webhook processing
