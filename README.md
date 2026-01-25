# PDF2Sheet

A powerful, automated invoice extraction platform built with the MERN stack. PDF2Sheet Auto streamlines the accounts payable process by automatically extracting data from PDF invoices and syncing it directly to Google Sheets.

---

## Overview

`PDF2Sheet Auto` is designed to eliminate manual data entry for businesses. Users can:
- **Configure Vendors**: Set up extraction rules for different suppliers using regex and keywords.
- **Process Emails**: Automatically ingest PDF attachments sent via email.
- **Extract Data**: Intelligently identify and extract key fields like Invoice Number, Date, and Total Amount.
- **Sync to Sheets**: Push extracted data directly to a connected Google Sheet row.
- **Visual Mapping**: (In Development) Interactive UI to map PDF fields to data columns.

---

## Feature Highlights
- **Automated Email Processing** — Ingests invoices directly from email attachments using a dedicated webhook endpoint.
- **Smart Data Extraction** — `src/utils/extractData.js` utilizes a hybrid approach with Regex and Keyword matching to identify fields.
- **Google Sheets Integration** — `src/services/sheetsService.js` provides seamless authentication and row appending to user spreadsheets.
- **Vendor Management** — `src/components/vendors/` allows users to create and manage vendor-specific extraction profiles.
- **Confidence Scoring** — Automatically calculates a confidence score for extracted data to determine if manual review is needed.
- **Modern UI** — Built with **React** and **TailwindCSS** for a clean, responsive user experience.

---

## Tech Stack

**Front-End:**
<p>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="react" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="tailwindcss" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="javascript" />
</p>

**Back-End & Core:**
<p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="express" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="mongodb" />
  <img src="https://img.shields.io/badge/Google%20Sheets%20API-34A853?style=for-the-badge&logo=googlesheets&logoColor=white" alt="google sheets" />
  <img src="https://img.shields.io/badge/PDF%20Parse-B31B1B?style=for-the-badge&logo=adobeacrobatreader&logoColor=white" alt="pdf parse" />
</p>

---

## Project Structure

```
src/ (Backend)
 ├─ config/                  # Database and API configurations
 ├─ controllers/             # Request handlers (Email, Invoices, Vendors)
 ├─ middleware/              # Auth and error handling mechanisms
 ├─ models/                  # Mongoose schemas (User, Invoice, VendorMap)
 ├─ routes/                  # API route definitions
 ├─ services/                # Business logic services (Sheets, etc.)
 └─ utils/                   # Helper functions (Extraction, PDF parsing)

src/ (Frontend)
 ├─ active/                  # Active development components
 ├─ components/              # Reusable UI components
 │   ├─ layout/              # Sidebar, Header, Layout wrappers
 │   ├─ vendors/             # Vendor management modals and forms
 │   └─ mapping/             # PDF preview and mapping tools (In Dev)
 ├─ hooks/                   # Custom React hooks (useVendors, useUser)
 ├─ pages/                   # Main application views (Dashboard, Login)
 └─ assets/                  # Static images and icons
```

---

## Getting Started

1. **Install dependencies** (Root, Backend, and Frontend)
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Configure Environment**
   Create `.env` files in both `backend/` and `frontend/` with your API keys and database URI.

3. **Start the Development Servers**
   In one terminal (Backend):
   ```bash
   cd backend
   npm run start
   ```
   In another terminal (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access the App**
   Visit `http://localhost:5173` to view the application.

---

## Available Scripts

### Backend
- `npm run start` — Launch the backend API server.
- `npm run dev` — Launch with nodemon for auto-reloading.

### Frontend
- `npm run dev` — Launch the React development server.
- `npm run build` — Compile the frontend for production.
- `npm run lint` — Run ESLint checks.

---
