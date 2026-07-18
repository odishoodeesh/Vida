# ☁️ Cloudflare Pages Full-Stack Deployment Guide

This project is fully prepared for zero-overhead, ultra-fast global deployment on **Cloudflare Pages**! 

Using Cloudflare's standard Edge runtime, the frontend assets are served instantly from Cloudflare's global CDN, and all backend API routes (`/api/*`) run globally as high-performance, edge-optimized Cloudflare Pages Functions.

---

## 🛠️ Method 1: Continuous Deployment via GitHub (Recommended)

This is the easiest and most robust method. Whenever you push to your GitHub repository, Cloudflare will automatically build and deploy your app.

1. **Push your code to GitHub** (you can export your workspace directly to GitHub from the Settings menu in AI Studio).
2. Go to the **Cloudflare Dashboard** and select **Workers & Pages**.
3. Click **Create** > **Pages** > **Connect to Git**.
4. Select your repository and configure the following build settings:
   - **Framework Preset**: `None` (or `Vite`)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click **Save and Deploy**.

---

## 💻 Method 2: Deployment via Wrangler CLI

If you prefer deploying directly from your command line, you can use wrangler.

1. Install Wrangler globally or run it via npx:
   ```bash
   npx wrangler pages deploy dist
   ```
2. Log in and follow the interactive prompts to create or select a Pages project.

---

## 🔑 Adding Environment Variables

For the full-stack features to function (the AI Skincare Alchemist and S3-compatible image uploads), you must configure your environment variables in the Cloudflare Pages settings:

1. In the Cloudflare Pages dashboard, select your project.
2. Go to **Settings** > **Environment variables**.
3. Click **Add variables** under **Production** (and optionally **Preview**), and add the following keys:

| Variable Name | Description | Example / Value |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `AWS_S3_ACCESS_KEY_ID` | S3 Storage Access Key ID | `8ef9b60801823b2a8cab552d20959f50` |
| `AWS_S3_SECRET_ACCESS_KEY` | S3 Storage Secret Access Key | `f92ed08f6a6185817280441a1f2fc428...` |
| `AWS_S3_ENDPOINT` | S3 Storage Endpoint | `https://jyjtixllqqukiquxdpve.storage.supabase.co/storage/v1/s3` |
| `AWS_S3_REGION` | S3 Storage Region | `ap-south-1` |
| `AWS_S3_BUCKET` | Name of your storage bucket | `vida` |
| `VITE_SUPABASE_URL` | Supabase endpoint URL | `https://jyjtixllqqukiquxdpve.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anon Key (needed for client connections) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

4. Under **Settings** > **Functions**, verify that the **Compatibility Flags** for both Production and Preview include:
   - `nodejs_compat`
5. Click **Save** and trigger a redeploy for the settings to take effect.

---

## ⚡ Benefits of Cloudflare Edge

- **Zero Server Overhead**: No virtual machines or Node.js servers to keep running or pay for.
- **Global Low Latency**: Your static assets and Edge functions are run in hundreds of data centers globally, closest to your visitors.
- **Auto-Scale**: Scalable from 0 to millions of requests automatically.
- **Node.js Compatibility**: The edge APIs leverage modern Workers runtime featuring lightning-fast native Node compatibility bindings!
