# System Architecture - PDF2Sheet Auto

## Overview
This document breaks down how I built PDF2Sheet Auto. The goal was to keep things simple but scalable. I needed a way to take a messy PDF file from an email and turn it into a clean row in Google Sheets without the user capturing it manually.

Here is how the pieces fit together.

## High-Level Diagram

```mermaid
graph TD
    User[User] -->|Upload/Email| Backend[Node.js Backend]
    Backend -->|1. Parse PDF| PDFLib[pdf-parse]
    Backend -->|2. Check Vendor| Mongo[(MongoDB)]
    Backend -->|3. Extract Data| Logic[Extraction Logic]
    
    Logic -->|Confidence Check| Decision{Good Match?}
    
    Decision -->|Yes (>= 70%)| Sheets[Google Sheets API]
    Decision -->|No| Review[Flag for Review]
    
    Dashboard[React Frontend] -->|Manage Settings| Backend
```

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

1.  **Input:** The system gets a PDF (via the upload endpoint).
2.  **Identification:** I look at the `senderEmail` or the `vendorName`.
3.  **The Matching Logic:**
    -   I search the database: *Do we know this sender?*
    -   If yes, I pull their "Extraction Rules" (e.g., look for "Total:" vs "Balance Due:").
4.  **Extraction:**
    -   I convert the PDF to raw text.
    -   I run specific Regex patterns against that text.
5.  **Validation:**
    -   I calculate a "Confidence Score". If I found the Date, Invoice #, and Amount, that's a 100% score.
    -   If the score is high enough, I push it to Google Sheets immediately.
    -   If not, I save it as "Draft" for the user to fix in the dashboard.

## Why this Stack?
-   **MERN (Mongo, Express, React, Node):** It's efficient. I can use JavaScript on both frontend and backend, which speeded up development.
-   **Tailwind CSS:** I wanted the dashboard to look modern without writing 500 lines of custom CSS.
-   **Regex for Parsing:** It's rudimentary but reliable for structured business documents like invoices.
