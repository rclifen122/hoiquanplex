---
name: Supabase Row Level Security (RLS)
description: Comprehensive guide to implementing secure Row Level Security policies in Supabase for multi-tenant applications
category: security
---

# 🔒 Supabase Row Level Security (RLS)

> Master Row Level Security to build secure, multi-tenant Supabase applications

## 1. RLS Fundamentals

### What is RLS?

Row Level Security is PostgreSQL's built-in security mechanism that allows you to define policies controlling which rows users can access in database tables. RLS policies are evaluated **before** every query, ensuring data isolation at the database level.

### Why RLS Matters

```
Without RLS:
User A queries customers table → Gets ALL customers (security breach!)

With RLS:
User A queries customers table → Gets ONLY their customers (secure!)
```

### Core Principles

1. **Deny by default** - When RLS is enabled, no rows are accessible until policies explicitly allow it
2. **Policy-based access** - Define separate policies for SELECT, INSERT, UPDATE, DELETE
3. **PostgreSQL functions** - Use `auth.uid()`, `auth.jwt()` for user context
4. **Performance** - Policies run on every query, so optimize them

## 2. Essential RLS Patterns

### Pattern 1: User-Owned Resources

```sql
-- Enable RLS on the table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Pattern 2: Organization/Tenant-Based Access

```sql
-- Table structure
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper function to get user's organization
CREATE OR REPLACE FUNCTION auth.user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id
  FROM user_organizations
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- RLS Policy
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their organization's customers"
  ON customers
  FOR ALL
  USING (organization_id = auth.user_organization_id());
```

### Pattern 3: Role-Based Access Control (RBAC)

```sql
-- User roles table
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'viewer')),
  organization_id UUID NOT NULL,
  PRIMARY KEY (user_id, organization_id)
);

-- Helper function to check user role
CREATE OR REPLACE FUNCTION auth.has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = auth.uid()
      AND role = required_role
  );
$$ LANGUAGE sql STABLE;

-- Policy: Only admins can delete customers
CREATE POLICY "Admins can delete customers"
  ON customers
  FOR DELETE
  USING (auth.has_role('admin'));

-- Policy: Managers and admins can update
CREATE POLICY "Managers can update customers"
  ON customers
  FOR UPDATE
  USING (
    auth.has_role('admin') OR auth.has_role('manager')
  );

-- Policy: All authenticated users can view
CREATE POLICY "All users can view customers"
  ON customers
  FOR SELECT
  USING (
    organization_id = auth.user_organization_id()
  );
```

### Pattern 4: Public Read, Authenticated Write

```sql
-- Blog posts that anyone can read, but only authenticated users can write
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read
CREATE POLICY "Public can view published posts"
  ON blog_posts
  FOR SELECT
  USING (published = true);

-- Authenticated users can insert their own posts
CREATE POLICY "Authenticated users can create posts"
  ON blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own posts
CREATE POLICY "Authors can update own posts"
  ON blog_posts
  FOR UPDATE
  USING (auth.uid() = author_id);
```

### Pattern 5: Time-Based Access

```sql
-- Subscription-based access
CREATE POLICY "Active subscribers can view content"
  ON premium_content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM subscriptions
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND current_period_end > NOW()
    )
  );
```

## 3. Advanced RLS Techniques

### Composite Policies with OR Conditions

```sql
-- Users can see their own data OR data shared with them
CREATE POLICY "Users can view owned or shared data"
  ON documents
  FOR SELECT
  USING (
    owner_id = auth.uid()
    OR id IN (
      SELECT document_id
      FROM document_shares
      WHERE shared_with_user_id = auth.uid()
    )
  );
```

### Using JWT Claims

```sql
-- Access custom claims from JWT token
CREATE OR REPLACE FUNCTION auth.user_email()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'email',
    (SELECT email FROM auth.users WHERE id = auth.uid())
  );
$$ LANGUAGE sql STABLE;

-- Policy using email from JWT
CREATE POLICY "Allow access based on email domain"
  ON internal_docs
  FOR SELECT
  USING (
    auth.user_email() LIKE '%@company.com'
  );
```

### Performance Optimization with Indexes

```sql
-- Create indexes on columns used in RLS policies
CREATE INDEX idx_customers_org_id ON customers(organization_id);
CREATE INDEX idx_customers_created_by ON customers(created_by_user_id);
CREATE INDEX idx_user_orgs_user_id ON user_organizations(user_id);

-- Analyze query performance
EXPLAIN ANALYZE
SELECT * FROM customers WHERE organization_id = '...';
```

## 4. HQPSaaS-Specific RLS Implementation

### Customers Table

```sql
-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins have full access to customers"
  ON customers
  FOR ALL
  USING (auth.has_role('admin'));

-- Staff can view and update
CREATE POLICY "Staff can view and update customers"
  ON customers
  FOR SELECT
  USING (auth.has_role('staff') OR auth.has_role('admin'));

CREATE POLICY "Staff can update customer details"
  ON customers
  FOR UPDATE
  USING (auth.has_role('staff') OR auth.has_role('admin'));

-- Insert only by authenticated staff
CREATE POLICY "Staff can create customers"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.has_role('staff') OR auth.has_role('admin'));
```

### Subscriptions Table

```sql
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
  ON subscriptions
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR auth.has_role('admin')
    OR auth.has_role('staff')
  );

-- Only admins can modify subscriptions
CREATE POLICY "Only admins can modify subscriptions"
  ON subscriptions
  FOR UPDATE
  USING (auth.has_role('admin'));

-- System can insert (via service role)
-- No policy needed - service role bypasses RLS
```

### Payments Table

```sql
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
  ON payments
  FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
    OR auth.has_role('admin')
    OR auth.has_role('staff')
  );

-- No direct INSERT/UPDATE - only through webhooks (service role)
```

## 5. Testing RLS Policies

### Test as Specific User

```sql
-- Set the role to test as a specific user
SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "user-uuid-here", "role": "authenticated"}';

-- Run test queries
SELECT * FROM customers; -- Should only return user's customers

-- Reset
RESET ROLE;
```

### Using Supabase Dashboard

```javascript
// In the SQL Editor, use auth.uid() simulation
SET request.jwt.claims = '{"sub": "test-user-id"}';

SELECT * FROM customers WHERE organization_id = auth.user_organization_id();
```

### Automated Tests

```typescript
// Test RLS in Vitest
import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

describe('RLS Policies', () => {
  it('prevents users from seeing other users data', async () => {
    const user1Client = createClient(url, key, { auth: { user: user1 } })
    const user2Client = createClient(url, key, { auth: { user: user2 } })

    // User 1 creates a customer
    await user1Client.from('customers').insert({ full_name: 'Test' })

    // User 2 tries to see it
    const { data } = await user2Client.from('customers').select('*')

    expect(data).toHaveLength(0) // Should not see user1's data
  })
})
```

## 6. Common RLS Pitfalls & Solutions

### Pitfall 1: Forgetting to Enable RLS

```sql
-- ❌ BAD: Table created but RLS not enabled
CREATE TABLE sensitive_data (id UUID, data TEXT);
-- Anyone can access all data!

-- ✅ GOOD: Always enable RLS immediately
CREATE TABLE sensitive_data (id UUID, data TEXT);
ALTER TABLE sensitive_data ENABLE ROW LEVEL SECURITY;
```

### Pitfall 2: Overly Complex Policies

```sql
-- ❌ BAD: Complex nested queries in every policy
CREATE POLICY "complex"
  ON table1
  FOR SELECT
  USING (
    id IN (
      SELECT t1_id FROM table2
      WHERE id IN (
        SELECT t2_id FROM table3
        WHERE user_id = auth.uid()
      )
    )
  );

-- ✅ GOOD: Create helper functions
CREATE OR REPLACE FUNCTION user_has_access(table1_id UUID)
RETURNS BOOLEAN AS $$
  -- Complex logic here, cached
$$ LANGUAGE sql STABLE;

CREATE POLICY "simple"
  ON table1
  FOR SELECT
  USING (user_has_access(id));
```

### Pitfall 3: Not Using Indexes

```sql
-- ❌ BAD: Policy without index on filter column
CREATE POLICY "filter_by_org"
  ON customers
  USING (organization_id = auth.user_organization_id());
-- Slow table scan on every query!

-- ✅ GOOD: Add index first
CREATE INDEX idx_customers_org_id ON customers(organization_id);
CREATE POLICY "filter_by_org"
  ON customers
  USING (organization_id = auth.user_organization_id());
```

### Pitfall 4: Service Role Confusion

```typescript
// ❌ BAD: Using service role in client-side code
const supabase = createClient(url, SERVICE_ROLE_KEY) // Bypasses RLS!

// ✅ GOOD: Service role only on server, never in client
// Server-side only (API routes)
const adminClient = createClient(url, SERVICE_ROLE_KEY)

// Client-side always uses anon key
const supabase = createClient(url, ANON_KEY)
```

## 7. Debugging RLS Issues

### Enable Detailed Logging

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- View all policies
SELECT *
FROM pg_policies
WHERE tablename = 'customers';

-- Check policy definitions
\d+ customers
```

### Test Policy Logic

```typescript
// Client-side debugging
const { data, error } = await supabase
  .from('customers')
  .select('*')

console.log('Data:', data)
console.log('Error:', error)

// If error.code === '42501' → RLS is blocking access
// If data === [] → Policy is working but no rows match
```

### Common Error Codes

- `42501` - Insufficient privilege (RLS blocking)
- `42P01` - Table doesn't exist
- `23505` - Unique violation
- `23503` - Foreign key violation

## 8. Best Practices Checklist

- [ ] Enable RLS on all tables containing user data
- [ ] Create separate policies for SELECT, INSERT, UPDATE, DELETE
- [ ] Use `STABLE` or `IMMUTABLE` functions for better performance
- [ ] Add indexes on columns used in policy conditions
- [ ] Test policies with different user roles
- [ ] Document policy logic in comments
- [ ] Use helper functions for complex conditions
- [ ] Never expose service role key to client
- [ ] Regular security audits of policies
- [ ] Monitor query performance impact

## Use When

- Setting up secure data access in Supabase
- Implementing multi-tenant applications
- Configuring role-based access control
- Securing customer data in HQPSaaS
- Debugging access permission issues
- Optimizing database query performance with RLS
- Conducting security reviews
