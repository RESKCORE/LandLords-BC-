# BC Landlord Advocacy (Landlords BC)

A modern, authoritative digital platform for British Columbia rental-property owners operating under the **BC Residential Tenancy Act (RTA)** and **Residential Tenancy Branch (RTB)** framework.

Includes live Stripe CAD payments, Google Identity authentication, statutory RTA knowledge guides, official RTB forms library, and confidential tenancy intake.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env.local
```
Fill in `.env.local` (see [.env.example](.env.example) for reference):
* `STRIPE_SECRET_KEY` & `VITE_STRIPE_PUBLISHABLE_KEY` — [Stripe Dashboard](https://dashboard.stripe.com)
* `VITE_GOOGLE_CLIENT_ID` — [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
* `HOST_EMAIL` & `SMTP_*` — Google App Password or transactional email service

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Git Upload Instructions

Initialize your remote repository and push:

```bash
# 1. Stage all tracked project files
git add .

# 2. Commit the initial release
git commit -m "feat: initial release of BC Landlord Advocacy platform"

# 3. Ensure branch is main
git branch -M main

# 4. Link your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 5. Push to GitHub
git push -u origin main
```

> **Note:** `.env*` files are strictly excluded via `.gitignore` to protect all API secrets and SMTP credentials.

---

## 🌐 Deployment Guide

### Option 1: Vercel / Netlify (Recommended)
1. Push to GitHub, then import the repository into **Vercel**.
2. **Build Settings:**
   * Framework Preset: `Vite`
   * Build Command: `npm run build`
   * Output Directory: `dist`
   * Install Command: `npm install`
3. **Environment Variables in Vercel:**
   * `STRIPE_SECRET_KEY` — Your Stripe Secret Key (`sk_test_...`) to enable serverless dynamic checkout redirection to your live deployed domain.
   * `VITE_STRIPE_PUBLISHABLE_KEY` — Your Stripe Publishable Key (`pk_test_...`).
   * `VITE_GOOGLE_CLIENT_ID` — Google OAuth Client ID.
   * `HOST_EMAIL` — Host administrator email.
4. **Stripe Payment Link Configuration (Fallback):**
   * If using static Stripe Payment Links (`buy.stripe.com/test_...`), go to **Stripe Dashboard > Payment Links > Edit > Confirmation Page**, select "Don't show confirmation page", and set the redirect URL to:
     `https://<your-deployed-domain>.vercel.app/?status=success`
5. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), add your production domain to **Authorized JavaScript origins**.

### Option 2: Render / Railway / VPS (Full-Stack with Node Backend)
1. Deploy as a Node.js web service.
2. **Build Command:** `npm install && npm run build`
3. **Start Command:** `npm start`
4. Provide all environment variables from `.env.example`.

---

## 💳 Stripe Sandbox Testing

* **Card Number:** `4242 4242 4242 4242`
* **Expiry:** Any future date (e.g. `12/28`)
* **CVC:** Any 3 digits (`123`)
* **Postal Code:** `V6B 2W9` (Vancouver) or `90210`

---

## 📋 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite dev server with Stripe & Intake API middleware |
| `npm run build` | Builds optimized production static bundle into `/dist` |
| `npm run lint` | Runs TypeScript compilation check without emitting files |
| `npm start` | Starts Node/Express production server via `tsx server.js` |
