# UniLife - University Management System

A comprehensive Next.js application for managing university operations including student dashboards, lecturer schedules, vendor management, and administrative controls.

## Features

- **User Authentication** - Secure login with Supabase Auth
- **Role-Based Access Control** - Students, Lecturers, Vendors, Delivery, Admin, Super Admin
- **Admin Dashboard** - User management, create/edit/delete operations
- **Lecturer Schedule Management** - Manage and view class timetables
- **Database Integration** - Supabase PostgreSQL backend
- **Responsive Design** - Tailwind CSS + Framer Motion animations

## Tech Stack

- **Framework**: Next.js 16.1.6
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Google OAuth
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts

## Quick Start - Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd unilifemockup
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (optional)
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `unlife.sql.txt`:
   - Go to Supabase Dashboard → SQL Editor
   - Create a new query
   - Paste the contents of `unlife.sql.txt`
   - Execute the query

3. Enable RLS (Row Level Security) policies if needed
4. Set up Google OAuth in Supabase Dashboard

## Deployment to Vercel

### Step 1: Prepare Your Repository
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your GitHub repository
4. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` 
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (optional, for server-side operations)
5. Click "Deploy"

The app will be live at `https://<your-project>.vercel.app`

### Important Notes for Vercel
- All environment variables are automatically loaded from Vercel project settings
- The `NEXT_PUBLIC_` prefix makes variables available to the browser
- Keep sensitive keys (service role) private by setting them on Vercel only
- Middleware.ts is fully compatible with Vercel Edge Runtime
- All API routes are serverless functions on Vercel

## Available Routes

### Public Routes
- `/login` - Login page
- `/signup` - Sign up page
- `/forgot-password` - Forgot password page

### Protected Routes (Role-Based)

**Student**
- `/student/dashboard` - Student dashboard

**Lecturer**
- `/lecturer/dashboard` - Lecturer dashboard
- `/lecturer/schedule` - Class schedule management

**Admin**
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management

**Super Admin**
- `/super-admin/dashboard` - System dashboard
- `/super-admin/users` - All system user management
- Can access all admin pages

**Vendor**
- `/vendor/dashboard` - Vendor dashboard
- `/vendor/orders` - Order management

**Delivery**
- `/delivery/dashboard` - Delivery dashboard

## API Routes

### Admin Operations
- `GET /api/admin/users` - Fetch all users
- `DELETE /api/admin/users/[id]` - Delete user

### Lecturer Operations
- `GET /api/lecturer/schedule` - Fetch timetable
- `POST /api/lecturer/schedule` - Create schedule entry
- `PUT /api/lecturer/schedule/[id]` - Update schedule
- `DELETE /api/lecturer/schedule/[id]` - Delete schedule
- `GET /api/lecturer/courses` - Fetch courses

## Building for Production

```bash
npm run build
npm run start
```

## Environment Variables

See `.env.example` for all available variables. Critical variables for Vercel:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key for client-side auth
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side only, for admin operations

## Troubleshooting

### Build Errors
- Run `npm run build` locally first
- Check all TypeScript errors with `npm run lint`
- Ensure Node.js version is compatible (18+)

### Database Connection Issues
- Verify credentials in `.env`
- Check Supabase project status
- Ensure database tables exist

### Authentication Issues
- Verify Google OAuth credentials in Supabase
- Check auth callback URL matches your domain
- Clear browser cookies/cache

### Preview vs Production
- Vercel creates preview deployments for each PR
- Only production environment syncs with main branch
- Set environment variables per deployment environment

## Performance Optimization

- Image optimization via Next.js Image component
- Code splitting and lazy loading
- Middleware for auth optimization
- Supabase query optimization with selects

## Security Considerations

- All sensitive operations use server actions
- RLS policies protect database access
- Environment variables never exposed to client (except NEXT_PUBLIC_)
- CSRF protection via Next.js built-in middleware
- SQL injection prevention via Supabase parameterized queries

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally with `npm run dev`
4. Build with `npm run build`
5. Push to GitHub
6. Create a Pull Request

## Support

For issues or questions:
1. Check existing GitHub issues
2. Review Supabase documentation
3. Check Vercel deployment logs
4. Contact the development team

## License

MIT

## Deployment Status

- **Live Demo**: [Your Vercel URL]
- **Status**: Ready for production
- **Last Updated**: 2026-02-28
