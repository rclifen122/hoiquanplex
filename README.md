# HoiQuanPlex CRM

Customer Registration & Subscription Management CRM for HoiQuanPlex streaming service.

## 🚀 Quick Start

**New to this project?** Follow our comprehensive setup guides:

1. **[📘 Quick Start Guide](./docs/QUICK_START.md)** - Start here! Complete setup in 30 minutes
2. **[🗄️ Supabase Setup](./docs/SUPABASE_SETUP.md)** - Database configuration & migrations
3. **[🚀 Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Deploy to Vercel & connect domain
4. **[🔐 Environment Variables](./docs/ENVIRONMENT_VARIABLES.md)** - All configuration explained

### Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/hoiquanplex-crm.git
cd hoiquanplex-crm
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```
Edit `.env.local` and fill in your actual values (see [Environment Variables Guide](./docs/ENVIRONMENT_VARIABLES.md)).

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Tech Stack

### Frontend
- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Styling:** Tailwind CSS 3.4+ with shadcn/ui
- **Forms:** React Hook Form + Zod validation
- **Tables:** TanStack Table (React Table v8)
- **Charts:** Recharts
- **State Management:** React Context + Zustand
- **Icons:** Lucide React
- **Notifications:** Sonner

### Backend
- **API:** Next.js API Routes (serverless)
- **Database:** Supabase (PostgreSQL 15+)
- **Authentication:** Supabase Auth
- **Email:** Resend (free tier: 3,000 emails/month)
- **Email Templates:** React Email
- **Payment (v1):** Manual bank transfer verification
- **Payment (v2):** VNPay automatic gateway

### Infrastructure
- **Hosting:** Vercel
- **Database:** Supabase
- **CDN/DNS:** Cloudflare
- **Domain:** hoiquanplex.site

## 📁 Project Structure

```
hoiquanplex-crm/
├── .github/workflows/      # CI/CD pipelines
├── public/                 # Static assets
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (public)/      # Public pages (forms, payment)
│   │   ├── (auth)/        # Auth pages (login)
│   │   ├── (customer)/    # Customer portal
│   │   ├── (admin)/       # Admin CRM dashboard
│   │   ├── api/           # API routes
│   │   └── embed/         # Embeddable forms
│   ├── components/        # React components
│   ├── lib/               # Utilities & configurations
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript types
│   └── styles/            # Global styles
├── supabase/
│   ├── migrations/        # Database migrations
│   └── functions/         # Edge functions
├── emails/                # Email templates
└── tests/                 # Test suites
```

## 🔧 Development

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint errors
pnpm format       # Format code with Prettier
pnpm type-check   # Run TypeScript type checking
pnpm test         # Run unit tests (Vitest)
pnpm test:e2e     # Run E2E tests (Playwright)
```

### Code Quality

- **TypeScript:** Strict mode enabled
- **ESLint:** Next.js + TypeScript configuration
- **Prettier:** Code formatting with Tailwind plugin
- **Husky:** Pre-commit hooks for linting

## 🗄️ Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)

2. Run database migrations:
```bash
cd supabase
supabase db push
```

3. Generate TypeScript types:
```bash
pnpm supabase:generate-types
```

## 🔐 Environment Variables

See `.env.local.example` for all required environment variables.

**Critical variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `RESEND_API_KEY` - Resend email API key
- `BANK_ACCOUNT_NUMBER` - Bank account for manual transfers (v1)

## 📚 Documentation

### Setup Guides (Available Now)
- **[📘 Quick Start Guide](./docs/QUICK_START.md)** - Complete setup from scratch to production
- **[🗄️ Supabase Setup](./docs/SUPABASE_SETUP.md)** - Database configuration with all migrations
- **[🚀 Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Deploy to Vercel & configure domain
- **[🔐 Environment Variables](./docs/ENVIRONMENT_VARIABLES.md)** - All config values explained

### Coming Soon
- Database Schema Reference - Detailed table relationships
- API Documentation - All API endpoints with examples
- Admin Dashboard Guide - How to use the CRM
- Payment Verification Guide - Manual payment process (v1)
- Form Embed Guide - How to embed registration forms

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

### Manual Deployment

```bash
pnpm build
pnpm start
```

## 🧪 Testing

### Unit Tests
```bash
pnpm test
pnpm test:coverage
```

### E2E Tests
```bash
pnpm test:e2e
pnpm test:e2e:ui  # Interactive mode
```

## 📝 License

This project is proprietary software for HoiQuanPlex.

## 🤝 Contributing

This is a private project. Contact the team lead for contribution guidelines.

## 📞 Support

For issues and questions, contact: admin@hoiquanplex.site
