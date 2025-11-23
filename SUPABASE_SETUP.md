# Supabase Setup Guide

This guide will help you configure the Bitcoin POS system to use Supabase instead of local PostgreSQL.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: bitcoin-pos (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to you
5. Click "Create new project"
6. Wait for the project to be created (takes 1-2 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection string** section
3. Copy the **URI** connection string (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)
4. Replace `[YOUR-PASSWORD]` with the password you set when creating the project
5. The final connection string should look like:
   ```
   postgresql://postgres:yourpassword@db.xxxxx.supabase.co:5432/postgres
   ```

## Step 3: Configure Your .env File

1. Open `backend/.env` file
2. Replace the `DATABASE_URL` with your Supabase connection string:

```env
# Database - Supabase
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# JWT Secret (change this in production!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server Port
PORT=3001

# Environment
NODE_ENV=development
```

**Important Notes:**
- Replace `YOUR_PASSWORD` with your actual Supabase database password
- Replace `db.xxxxx.supabase.co` with your actual Supabase host
- The `?pgbouncer=true&connection_limit=1` parameters help with connection pooling

## Step 4: Run Database Migrations

After setting up your `.env` file, run:

```bash
cd backend
npm run db:generate
npm run db:migrate
npm run db:seed  # Optional: seed demo data
```

## Step 5: Start the Application

You no longer need Docker! Just run:

```bash
cd backend
npm run dev
```

And in another terminal:

```bash
cd vendor-dashboard
npm run dev
```

## Troubleshooting

### Connection Issues

If you get connection errors:
1. Make sure your Supabase project is active (not paused)
2. Check that your password in the connection string is correct
3. Verify the host URL is correct
4. Check Supabase dashboard → Settings → Database for the correct connection string

### Migration Issues

If migrations fail:
1. Make sure your Supabase project is fully created
2. Check that the database password is correct
3. Try running `npm run db:migrate` again

### Connection Pooling

For production, consider using Supabase's connection pooling:
- Use port `6543` instead of `5432` for pooled connections
- Connection string: `postgresql://postgres:password@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true`

## Demo Accounts (after seeding)

- **Vendor**: `vendor@example.com` / `password123`
- **Customer**: `customer@example.com` / `password123`

