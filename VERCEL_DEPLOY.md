# Vercel Deployment Guide

## Build Status
The project builds successfully with `npm run build`.

## Required Environment Variables

Add these in your Vercel project settings (Settings → Environment Variables):

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | For admin operations (if used) |
| `GOOGLE_MAPS_API_KEY` | Optional | For places/search features |
| `WOOSMAP_API_KEY` | Optional | Alternative places API (if used) |

## Deploy Steps

1. Push your code to GitHub (or connect your repo to Vercel)
2. Import the project in Vercel
3. Add environment variables (see above)
4. Deploy — Vercel will run `npm run build` automatically

## Notes

- The **middleware deprecation warning** ("proxy" instead of "middleware") is from Next.js 16; the app still works.
- Ensure Supabase allows your Vercel domain in Authentication → URL Configuration (add your `*.vercel.app` URL).
- Supabase free tier projects may pause after inactivity; wake it before testing.
