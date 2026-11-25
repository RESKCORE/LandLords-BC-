# Landlords BC — Legal Defense & Statutory Compliance Portal

[![React 19](https://img.shields.io/badge/React-19.0.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4.3-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Stripe CAD](https://img.shields.io/badge/Stripe-CAD%20Billing-635BFF?logo=stripe&logoColor=white)](https://stripe.com/)
[![Jurisdiction](https://img.shields.io/badge/Jurisdiction-British%20Columbia%20(RTA)-2e6b3b)](https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02078_01)
[![License](https://img.shields.io/badge/License-Proprietary%20Member%20Charter-3b2116)](#disclaimer--legal-notice)

A modern, privacy-first statutory compliance portal, legal defense passport, and documentation vault engineered specifically for British Columbia residential rental housing providers operating under the **BC Residential Tenancy Act [SBC 2002] c. 78 (RTA)** and the **Residential Tenancy Branch (RTB)** arbitration framework.

---

## 📑 Table of Contents

- [Executive Overview & Purpose](#-executive-overview--purpose)
- [Key Features & System Architecture](#-key-features--system-architecture)
  - [1. Public Advocacy & Intake Portal](#1-public-advocacy--intake-portal)
  - [2. Member Association Dashboard (`/dashboard`)](#2-member-association-dashboard-dashboard)
  - [3. Interactive In-Page "Mini Screens" (Modals)](#3-interactive-in-page-mini-screens-modals)
  - [4. Zero-Disclosure Privacy Charter & Device Encryption](#4-zero-disclosure-privacy-charter--device-encryption)
  - [5. CRA Real Estate Rental Tax Compliance (Form T776)](#5-cra-real-estate-rental-tax-compliance-form-t776)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [API Reference & Serverless Endpoints](#-api-reference--serverless-endpoints)
- [Quick Start (Local Development)](#-quick-start-local-development)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Installation](#2-installation)
  - [3. Environment Configuration](#3-environment-configuration)
  - [4. Run Local Dev Server](#4-run-local-dev-server)
- [Available Scripts](#-available-scripts)
- [Stripe Sandbox Testing](#-stripe-sandbox-testing)
- [Production Deployment Guide](#-production-deployment-guide)
  - [Option A: Vercel (Recommended Serverless Deployment)](#option-a-vercel-recommended-serverless-deployment)
  - [Option B: Render / Railway / Docker / VPS (Node.js Server)](#option-b-render--railway--docker--vps-nodejs-server)
- [Statutory Legislation & Citations](#-statutory-legislation--citations)
- [Disclaimer & Legal Notice](#-disclaimer--legal-notice)

---

## 🏛️ Executive Overview & Purpose

Navigating British Columbia's residential tenancy regulations requires strict adherence to statutory timelines, unedited government forms, and evidentiary standards. Procedural defects—such as an incorrect service buffer date under Section 90 or an omitted condition inspection report under Section 23—routinely result in RTB arbitrators dismissing landlord claims or invalidating legal notices.

**Landlords BC** bridges this gap by delivering:
- **Instant Statutory Document Access:** Direct downloads of verified, unedited RTB notices and agreements paired with procedural guidance.
- **Evidentiary Rigor:** Formatted dispute dossiers that satisfy the RTB's evidence upload rules (indexed filenames, signed declarations, timestamped photos).
- **Automated Statutory Calculations:** Live lead-time calculations for deemed service dates and allowable annual rent increases (3.0% cap for 2026).
- **Absolute Privacy (Zero-Disclosure):** Encrypted local client storage ensuring private property and dispute records never leak to public registries or tenant blacklists.
- **CRA Audit Compliance:** Form T776 tax deduction receipting classifying annual association dues as 100% tax-deductible rental business expenses.

---

## ⚡ Key Features & System Architecture

### 1. Public Advocacy & Intake Portal
* **Golden Luxury & Glass UI Aesthetic:** Warm, authoritative design system (`#f6f0e7`, `#3b2116`, `#2a1a12`) built with CSS backdrop blur filters, smooth Lenis scrolling, and responsive layouts.
* **Dual-Tier Annual Membership:**
  * **Individual Landlord Membership (`$290 CAD / year`):** Full statutory RTA defense coverage, unedited RTB form access, and priority advisor helpline access.
  * **Property Manager Membership (`$590 CAD / year`):** Multi-unit property ledger support, commercial-scale dispute dossiers, and expedited advisor routing.
* **Confidential Tenancy Experience Intake:** Secure submission form allowing rental owners to submit anonymized dispute experiences, automatically dispatched to the association host inbox via SMTP.
* **Priority Advisor Helpline:** Integrated telephone hotline (**1-888-330-6707**, Mon–Fri, 9:00 AM – 4:30 PM PT).
* **Instant Authentication & Identity Sync:** Google Identity Services (OAuth) integration combined with instant Stripe CAD checkout and session verification.

---

### 2. Member Association Dashboard (`/dashboard`)
The member portal features a 5-card Bento Grid layout:

```
┌───────────────────────────────────────┬───────────────────────────────────────┬───────────────────────────────────────┐
│ Card 1: Member Protection Passport    │ Card 2: Official RTB Forms Gateway    │ Card 3: Billing & CRA Tax Invoices    │
│ • Identity: BC-MEM-8421 ✓             │ • RTB-30, RTB-27, RTB-7, RTB-33       │ • Invoice: LBC-INV-8421-2026          │
│ • Tier: Individual / Property Manager │ • Deemed Service Rules (Sec 88/90)    │ • $290.00 CAD Total (GST/PST Exempt)  │
│ • Legal Defense Kit Download          │ • Proof of Service Checklist (RTB-34) │ • Stripe Portal ↗ & Tax Receipt ↓     │
├───────────────────────────────────────┴───────────────────────────────────────┴───────────────────────────────────────┤
│ Card 4: Private Property Vault & Unit Ledger  │ Card 5: 2026 Statutory Rent Increase Engine                           │
│ • Unit records, move-in dates & trust ledger  │ • Real-time 3.0% allowable increase calculation                       │
│ • 15-day deposit return countdown alerts      │ • Section 42 3-full-rental-month lead time & service buffer dates     │
│ • Export RTB Dispute Evidence Dossier         │ • Pre-filled Form RTB-7 schedule generator & copy/download            │
└───────────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────┘
```

* **Card 1: Member Protection & Legal Defense Passport**
  * Displays active member ID (`BC-MEM-XXXX`), verified RTA defense status, and active plan tier.
  * Frosted glass action button to download the complete **2026 Statutory Legal Defense Kit**.
  * Quick shortcut to Stripe Customer Portal and invoices.
* **Card 2: Official RTB Statutory Gateway**
  * Quick-access buttons for mandatory BC government tenancy forms (`RTB-30`, `RTB-27`, `RTB-7`, `RTB-33`).
  * Deemed Service Timing bar citing RTA Sections 88 and 90 (In person = same day; Door/Box = +3 days; Registered mail = +5 days).
  * Direct access to the Form RTB-34 Proof of Service checklist.
* **Card 3: Membership Billing & CRA Tax Invoices (Replaces radial gauge)**
  * Displays full itemized invoice details directly on the card:
    * Invoice Reference: `LBC-INV-XXXX-2026`
    * Member Email & Account ID
    * Annual Membership Fee: `$290.00 CAD` (or `$590.00 CAD`)
    * GST (5% Non-Profit Exempt): `$0.00 CAD`
    * PST (Provincial Sales Tax Exempt): `$0.00 CAD`
    * **Total Paid (Annual Subscription):** `$290.00 CAD` (or `$590.00 CAD`)
  * Displays CRA Form T776 Line 8810 / Line 8871 100% tax-deductible rental business expense classification.
  * Glass UI action buttons: `Stripe Portal ↗` and `Tax Receipt ↓`.
* **Card 4: Private Property Vault & Unit Ledger**
  * Tracks individual units (`Vancouver Suite #204`, `Kelowna Duplex Unit B`, etc.) with move-in dates, tenant names, and trust accounts.
  * **Statutory 15-Day Security Deposit Return Countdown:** Monitors RTA Section 38(1) deadlines once a forwarding address is received, warning owners of Section 38(6) double-deposit penalties if overdue.
  * Tracks Form RTB-27 move-in/out condition report execution and annual smoke/CO safety inspections.
  * One-click **Export RTB Dossier ↓** generating a formatted, arbitrator-admissible evidence package.
* **Card 5: 2026 Statutory Rent Increase Engine**
  * Calculates statutory 3.0% maximum annual rent increases in real time.
  * Service method dropdown (In Person, Door Posting +3d, Registered Mail +5d) automatically calculating the **Earliest Lawful Effective Date** and **Latest Recommended Service Date** under Section 42 (3 full rental payment months).
  * 12-Month Rule compliance validator.
  * Structured Form RTB-7 schedule copy to clipboard and downloadable `.txt` document.

---

### 3. Interactive In-Page "Mini Screens" (Modals)
Clicking on any Bento card (or its `Mini Screen ↗` badge) opens a comprehensive, in-depth modal right in the page:
1. **Passport Mini Screen:** Details the 4 Statutory Defense Pillars (RTA Sec 5 Non-Contracting Out, RTB-30 Expedited Notice Defense, RTB-27 Condition Inspection Shield, RTB-7 Rent Regulation Cap), hotline PIN routing, and complete defense kit download.
2. **Forms Gateway Mini Screen:** Searchable catalogue of all 12+ official forms and practical templates with instant text dossier download or official government PDF link.
3. **Billing & Tax Mini Screen:** Line-by-line accounting statement, Canada Revenue Agency Guide T4036 rental deduction guide, 6-year retention compliance notice, Stripe Customer Portal launcher, and CRA tax receipt download.
4. **Property Vault Mini Screen:** Full ledger table of all rental suites, active deposit countdown watches, inspection status, unit creation (`+ Add Unit Record`), and individual RTB dispute dossier exports.
5. **Calculator Mini Screen:** Advanced rent increase calculator with 12-month rule check, Section 42 calendar lead times, interactive preview box, copy to clipboard, and downloadable RTB-7 notice schedule.

> **UX Refinements:** All inner buttons, text inputs, date pickers, selects, and links invoke `e.stopPropagation()` so interacting with controls will never accidentally trigger the parent card's modal. Pressing `Esc` closes any active mini screen.

---

### 4. Zero-Disclosure Privacy Charter & Device Encryption
* **Client-Sealed Data:** Property records, tenant names, and inspection observations are stored exclusively in the browser's local sandbox (`localStorage`).
* **No Centralized Tenant Blacklists:** Landlords BC strictly refuses to operate public tenant registries or share member case logs with external third parties.
* **Arbitration Confidentiality:** Evidence exports are generated on-the-fly client-side as plain text or formatted files ready for upload to the RTB Dispute Access Portal.

---

### 5. CRA Real Estate Rental Tax Compliance (Form T776)
Pursuant to Canada Revenue Agency (CRA) guidelines in **Guide T4036 (Rental Income)** and **Form T776 (Statement of Real Estate Rentals)**:
* Annual membership fees and legal defense subscriptions incurred to earn rental property income are **100% tax-deductible** from gross rental revenues.
* **Recommended Tax Return Line Items:**
  * **Part 4, Line 8810:** *"Legal, accounting and other professional fees"* (for individual landlords).
  * **Part 4, Line 8871:** *"Management and administration fees"* (for property managers and corporate housing operators).
* **Audit Retention Requirement:** Receipts must be retained for at least **6 taxation years** in accordance with CRA compliance rules.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) (`^19.0.1`), [React DOM 19](https://react.dev/) |
| **Language & Typing** | [TypeScript 7](https://www.typescriptlang.org/) (`^7.0.2`), Strict mode enabled |
| **Build Tool & Bundler** | [Vite 8](https://vitejs.dev/) (`^8.3.0`) with `@vitejs/plugin-react` |
| **Styling & Design System** | [Tailwind CSS v4](https://tailwindcss.com/) (`^4.3.3`), Autoprefixer, Custom Glass UI |
| **Motion & Scroll Physics** | [Lenis](https://lenis.darkroom.engineering/) (`^1.3.27`), [Motion](https://motion.dev/) (`^12.23.24`) |
| **Icons & Typography** | [Lucide React](https://lucide.dev/) (`^0.546.0`), Inter Tight & Serif typography |
| **Payments & Billing** | [Stripe Node SDK](https://stripe.com/docs/api) (`^23.2.0`), [@stripe/stripe-js](https://stripe.com/docs/js) (`^10.3.0`) |
| **Authentication** | Google Identity Services (OAuth 2.0 Web Client), Local Session Token Storage |
| **Transactional Email** | [Nodemailer](https://nodemailer.com/) (`^10.6.1`) with SMTP TLS |
| **Backend / Serverless** | Express middleware (`server/stripeMiddleware.ts`) for local dev; Vercel Serverless Functions (`/api/*.js`) for production |

---

## 📁 Project Directory Structure

```
Landlords/
├── api/                               # Production Vercel Serverless Functions
│   ├── check-membership.js            # Validates active Stripe subscription by email
│   ├── create-checkout-session.js     # Creates Stripe dynamic checkout session in CAD
│   ├── create-portal-session.js       # Launches Stripe Customer Billing Portal
│   ├── send-welcome-receipt.js        # Dispatches transactional welcome receipt via SMTP
│   └── submit-testimony.js            # Forwards confidential intake testimony to host
├── dist/                              # Compiled production static bundle (Vite build)
├── public/                            # Static public assets
│   ├── assets/landlord/               # Architecture artwork & SVG graphics
│   │   ├── landlord-profile.svg       # Animated stylish BC landlord character
│   │   ├── penthouse-living.svg       # Penthouse architectural illustration
│   │   ├── staged-kitchen.svg         # Property condition inspection documentation
│   │   └── sunlit-facade.svg          # Sunlit heritage apartment building facade
│   └── favicon.ico                    # Application favicon
├── server/                            # Local Development Server & Express Middleware
│   ├── data/                          # Local persisted member & testimony storage
│   ├── emailService.ts                # Nodemailer email dispatch service
│   └── stripeMiddleware.ts            # Vite Express middleware mirroring production serverless APIs
├── src/                               # Application Frontend Source Code
│   ├── components/                    # UI Components
│   │   ├── MemberDashboardPage.tsx    # Complete Bento Grid Dashboard & 5 Mini Screen Modals
│   │   ├── ResourcesModal.tsx         # Public Statutory Resources & Documentation modal
│   │   └── ...                        # Core page components, modals, and navigation
│   ├── data/                          # Statutory Datasets & Knowledge Base
│   │   ├── constants.ts               # Contact details, helpline phone, hours, and pricing
│   │   └── forms.ts                   # All 12+ Official RTB forms catalogue with descriptions
│   ├── styles/                        # Style definitions
│   │   └── main.css                   # Bento grid layout, frosted glass styling, and animations
│   ├── App.tsx                        # Root router, view switcher & Google auth handler
│   ├── index.css                      # Global Tailwind and font declarations
│   └── main.tsx                       # React 19 root bootstrap
├── .env.example                       # Reference environment variables template
├── package.json                       # Dependencies and project run scripts
├── tsconfig.json                      # Strict TypeScript compiler options
├── vercel.json                        # Vercel deployment routes and serverless configuration
└── vite.config.ts                     # Vite build, React plugin, and Stripe middleware config
```

---

## 🔌 API Reference & Serverless Endpoints

All endpoints support both local Vite development (via `server/stripeMiddleware.ts`) and production Vercel deployment (via `/api/*.js`):

### 1. `POST /api/create-checkout-session`
Initializes a Stripe Checkout Session for annual membership in Canadian Dollars (`CAD`).
* **Request Body:**
  ```json
  {
    "plan": "Individual Membership ($290 CAD / year)",
    "email": "landlord@example.bc.ca",
    "name": "Jane Doe",
    "returnUrl": "https://landlordsbc.org"
  }
  ```
* **Response:**
  ```json
  {
    "id": "cs_test_a1b2c3...",
    "url": "https://checkout.stripe.com/c/pay/cs_test_..."
  }
  ```

### 2. `POST /api/create-portal-session`
Generates an authenticated session URL redirecting the member to the **Stripe Customer Portal** to manage payment methods, download invoices, or update subscriptions.
* **Request Body:**
  ```json
  {
    "email": "landlord@example.bc.ca",
    "returnUrl": "https://landlordsbc.org/?page=dashboard"
  }
  ```
* **Response:**
  ```json
  {
    "url": "https://billing.stripe.com/p/session/test_..."
  }
  ```

### 3. `POST /api/check-membership`
Queries Stripe customer records to determine if an email has an active, paid membership.
* **Request Body:**
  ```json
  {
    "email": "landlord@example.bc.ca"
  }
  ```
* **Response:**
  ```json
  {
    "isMember": true,
    "plan": "Individual Membership ($290 CAD / year)",
    "customerId": "cus_test_...",
    "memberId": "BC-MEM-8421"
  }
  ```

### 4. `POST /api/send-welcome-receipt`
Dispatches an official welcome email and CRA tax deductible receipt copy to a newly confirmed member.
* **Request Body:**
  ```json
  {
    "email": "landlord@example.bc.ca",
    "plan": "Individual Membership ($290 CAD / year)"
  }
  ```

### 5. `POST /api/submit-testimony`
Accepts confidential intake testimonies from BC rental owners and forwards them directly to the association host inbox via SMTP while preserving member privacy.
* **Request Body:**
  ```json
  {
    "name": "Anonymous Property Owner",
    "email": "owner@example.bc.ca",
    "propertyType": "Duplex / Secondary Suite",
    "testimony": "Tenancy concluded with $4,200 in unpaid rent. RTB hearing wait times exceeded 4 months..."
  }
  ```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Git**

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/RESKCORE/LandLords-BC-.git
cd Landlords
npm install
```

### 3. Environment Configuration
Copy `.env.example` to create your local `.env.local`:
```bash
cp .env.example .env.local
```

Configure your credentials inside `.env.local`:
```env
# Stripe Configuration (from Stripe Dashboard > Developers > API keys)
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY

# Google Identity Services (from Google Cloud Console > APIs & Credentials)
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Host Email for confidential tenancy testimonies
HOST_EMAIL=host@landlordsbc.org

# SMTP Configuration (Gmail App Password, AWS SES, SendGrid, or Mailgun)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@landlordsbc.org
SMTP_PASS=your_smtp_app_password
SMTP_FROM=Landlords BC Intake <notifications@landlordsbc.org>

# Port (Optional, defaults to 3000)
PORT=3000
```

> **Security Note:** `.env*` files are strictly excluded from source control in `.gitignore`. Never commit API secret keys or passwords.

### 4. Run Local Dev Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.
To inspect the member dashboard directly, navigate to **[http://localhost:3000/?page=dashboard](http://localhost:3000/?page=dashboard)**.

---

## 📋 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Launches Vite local development server with integrated Stripe & intake middleware on port 3000 |
| `npm run build` | Compiles optimized, minified static production bundle into `/dist` using TypeScript compiler & Vite |
| `npm run lint` | Runs strict TypeScript type-checking without emitting files (`tsc --noEmit`) |
| `npm run preview` | Previews the compiled `/dist` production build locally |
| `npm start` | Launches full Express Node.js server via `tsx server.js` (for VPS or containerized environments) |

---

## 💳 Stripe Sandbox Testing

When testing membership purchases or Customer Portal sessions in Stripe test mode, use the following test card credentials:

| Parameter | Test Value |
| :--- | :--- |
| **Card Number** | `4242 •••• •••• 4242` |
| **Expiry Date** | Any future date (e.g. `12/28`) |
| **CVC / CVV** | Any 3 digits (e.g. `123`) |
| **Billing Country** | `Canada` |
| **Postal Code** | `V6B 2W9` (Vancouver) or `V8W 1P6` (Victoria) |

### Stripe Customer Portal Activation
To enable the **Stripe Portal ↗** feature:
1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/test/settings/billing/portal).
2. Navigate to **Settings > Billing > Customer Portal**.
3. Activate the Customer Portal and check the options to allow customers to view invoices, update payment methods, and manage subscriptions.
4. Save changes.

---

## 🌐 Production Deployment Guide

### Option A: Vercel (Recommended Serverless Deployment)

1. Push your code to your GitHub repository:
   ```bash
   git push origin main
   ```
2. Log in to [Vercel](https://vercel.com/) and click **Add New > Project**, then import your `LandLords-BC-` repository.
3. **Configure Build Settings:**
   * **Framework Preset:** `Vite`
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
   * **Install Command:** `npm install`
4. **Configure Environment Variables in Vercel:**
   * `STRIPE_SECRET_KEY` = `sk_live_...` (or `sk_test_...`)
   * `VITE_STRIPE_PUBLISHABLE_KEY` = `pk_live_...` (or `pk_test_...`)
   * `VITE_GOOGLE_CLIENT_ID` = `your_production_google_client_id`
   * `HOST_EMAIL` = `host@landlordsbc.org`
   * `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
5. **Google Cloud Console Update:**
   * Add your live production domain (e.g. `https://your-domain.vercel.app`) to **Authorized JavaScript origins** in your Google Cloud OAuth Client credentials.
6. Click **Deploy**. Vercel will automatically deploy both the Vite static bundle and the serverless functions in `/api`.

---

### Option B: Render / Railway / Docker / VPS (Node.js Server)

1. Set up a Node.js web service on Render, Railway, DigitalOcean, or an Ubuntu VPS.
2. **Build Command:** `npm install && npm run build`
3. **Start Command:** `npm start`
4. Provide all environment variables from `.env.example` in the host dashboard.
5. Point your custom DNS domain with an SSL certificate.

---

## ⚖️ Statutory Legislation & Citations

All procedural tools, deemed service schedules, and notice templates comply with codified British Columbia tenancy legislation:

- **Primary Legislation:** [Residential Tenancy Act [SBC 2002] c. 78](https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02078_01)
  - **Section 5:** Prohibits contracting out of the Act; statutory terms prevail over conflicting tenancy agreement terms.
  - **Section 19:** Limits security deposits and pet damage deposits to a maximum of one-half of one month's rent each.
  - **Section 23 & 35:** Mandates landlord and tenant move-in and move-out condition inspections (Form RTB-27).
  - **Section 38:** Mandates repayment of deposits or filing an RTB dispute application within 15 days of tenancy end and receipt of written forwarding address; Section 38(6) doubles deposit liabilities for non-compliance.
  - **Section 42 & 43:** Sets rules for statutory rent increases, requiring at least 3 full rental payment months' notice on Form RTB-7 capped at the annual allowable percentage (3.0% in 2026).
  - **Section 46:** 10-Day Notice to End Tenancy for Unpaid Rent or Utilities (Form RTB-30).
  - **Section 88 & 90:** Deemed service timelines (Same day in person; 3 days posted to door/mailbox; 5 days sent by registered mail).
- **Subordinate Regulation:** [Residential Tenancy Regulation [B.C. Reg. 477/2003]](https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/477_2003)
- **Dispute Resolution Branch:** [BC Residential Tenancy Branch (RTB)](https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies)
- **Tax Legislation:** [Canada Revenue Agency (CRA) Form T776 / Guide T4036](https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/t4036.html)

---

## 🔒 Disclaimer & Legal Notice

Landlords BC is a professional member association and educational platform dedicated to advancing lawful compliance and financial security for residential property owners across British Columbia. 

The software, calculators, evidence checklists, and documentation dossiers provided through this platform are designed for statutory procedural compliance under the *Residential Tenancy Act [SBC 2002] c. 78*. They do not constitute formal legal advice or substitute for consultation with a licensed legal practitioner or designated RTB dispute advisor. All unit documentation, inspection notes, and dispute dossiers are sealed on device under our **Zero-Disclosure Charter**.

© 2026 Landlords BC Member Association. All rights reserved.
