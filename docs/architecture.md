# System Architecture - PDF2Sheet Auto

## Overview
This document breaks down how I built PDF2Sheet Auto. The goal was to keep things simple but scalable. I needed a way to take a messy PDF file from an email and turn it into a clean row in Google Sheets without the user capturing it manually.

Here is how the pieces fit together.

## Core Components

### 1. The Backend (Node.js & Express)
I chose Node.js because handling file uploads and async tasks (like talking to Google's API) is really straightforward with it.
-   **Server:** Express.js handling REST API routes.
-   **File Handling:** Multer for processing the PDF uploads in memory (fast, no disk storage needed).
-   **Security:** JWT for auth. I wanted it to be stateless so I don't have to manage sessions in the DB.

### 2. The Database (MongoDB)
I went with MongoDB (Mongoose) for one main reason: **Flexibility**.
Invoices don't always look the same. One vendor might have 3 fields, another might have 10. A SQL database would be a pain to migrate every time I added a new mapping rule. With Mongo, I just store the mapping object as JSON.
-   `User`: Stores profile & Google OAuth tokens.
-   `VendorMap`: Stores the logic for how to read a specific vendor's PDF.
-   `Invoice`: A record of what we processed.

### 3. Google Sheets Integration
This was the trickiest part.
-   I used **OAuth 2.0** so I never have to see the user's password.
-   The backend stores a `refresh_token`. This is crucial because it lets the app work in the background even if the user isn't logged in.
-   I built a helper service (`sheetsService.js`) that takes the `spreadsheetId` and just appends a row to the bottom.

## Data Flow: How a PDF becomes a Row

1.  **Input:** The system gets a PDF (via the upload endpoint or email webhook).
2.  **Identity Resolution (The "Email First" Logic):**
    -   We check the **Sender Email** first. If `billing@acme.com` is in our database, we know it is ACME Corp, regardless of what the invoice says. Use the email as the source of truth.
    -   If the email is new, we fallback to searching for the Vendor Name in the PDF text.
3.  **Extraction (The "Dual-Core" Engine):**
    -   **Strategy A (Coordinate Learning):** If we have learned this vendor before, we look at the specific X/Y pixel coordinates. This is 100% accurate.
    -   **Strategy B (Heuristics):** If it is a new vendor, we scan the text for keywords like "Total", "Balance Due", and "Invoice Date" to make an educated guess.
4.  **Validation:**
    -   We calculate a "Confidence Score". If I found the Date, Invoice #, and Amount, that is a high score.
    -   If the score is high enough (>= 80%), I push it to Google Sheets immediately.
    -   If not, I save it as "Review Needed" for the user to fix in the dashboard.

## Why this Stack?
-   **MERN (Mongo, Express, React, Node):** It is efficient. I can use JavaScript on both frontend and backend, which speeded up development.
-   **Tailwind CSS:** I wanted the dashboard to look modern without writing 500 lines of custom CSS.
-   **Regex for Parsing:** It is rudimentary but reliable for structured business documents like invoices.
