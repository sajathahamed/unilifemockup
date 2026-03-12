# Deployment Guide for Vercel

## Prerequisites
- GitHub repository with your code
- Supabase project set up
- Vercel account

## Steps to Deploy

### 1. Push your code to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Create a Supabase Project
- Go to https://supabase.com
- Create a new project
- Get your credentials from Project Settings → API

### 3. Deploy on Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. In "Environment Variables", add:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (optional)

5. Click "Deploy"

### 4. Database Setup
- Set up your Supabase tables using the schema from `unlife.sql.txt`
- Enable RLS (Row Level Security) on tables as needed
- Configure Google OAuth in Supabase if needed

## Environment Variables Needed

See `.env.example` for all required variables.

### For Local Development
1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials
3. Run `npm run dev`

## Troubleshooting

### Build Fails
- Check that all TypeScript types are correct
- Ensure all imports are valid
- Run `npm run build` locally to test

### Database Connection Issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` and keys are correct
- Check Supabase project is active
- Verify RLS policies allow your operations

### API Route Issues
- Ensure all dynamic routes use bracket notation `[id]`
- Check that server components are properly marked with `'use server'`
- Client components should have `'use client'` directive

## Monitoring
- Monitor Vercel deployments at https://vercel.com/dashboard
- View Supabase logs at https://supabase.com/dashboard
- Use Vercel Analytics for performance monitoring
