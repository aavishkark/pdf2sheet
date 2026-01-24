# API Documentation

## Introduction
This is the backend API for PDF2Sheet Auto. It handles everything from user login to the heavy lifting of parsing PDFs. I built it using Express.js because it's fast and I know it well.

**Base URL:** `http://localhost:5000/api`

---

## 1. Authentication
I used JWT (JSON Web Tokens) here. When you register or login, you get a `token`. You need to put that token in the header of almost every other request like this:
`Authorization: Bearer <your_token>`

### `POST /auth/register`
Creates a new user account.
- **Body:** `{ "firstName": "John", "lastName": "Doe", "email": "john@test.com", "password": "secure123" }`
- **Response:** `{ "token": "...", "user": { ... } }`

### `POST /auth/login`
Logs you in.
- **Body:** `{ "email": "john@test.com", "password": "secure123" }`
- **Response:** `{ "token": "...", "user": { ... } }`

---

## 2. Vendor Management
This is where we teach the system how to read invoices.

### `GET /vendors`
Gets a list of all vendors you've added.
- **Query Params:** None
- **Response:** Array of vendor objects.

### `POST /vendors`
Adds a new vendor mapping.
- **Body:**
  ```json
  {
    "vendorName": "ACME Corp",
    "senderEmail": "billing@acmecorp.com", // Optional, can match by name too
    "fieldMappings": {
      "invoiceNumber": { "extractionRule": "Invoice #(\\d+)" },
      "totalAmount": { "keywords": ["Total", "Balance Due"] }
    }
  }
  ```

---

## 3. Google Sheets Connection
These endpoints handle the OAuth dance with Google.

### `GET /sheets/auth-url`
Gives you the Google URL to redirect the user to.

### `POST /sheets/disconnect`
Use this if the connection gets messed up. It wipes the tokens from the database so you can start fresh.
- **Body:** None (Just needs Auth header)

---

## 4. The "Magic" Endpoint (Testing)
This is what I used to test the whole flow without setting up a real email server.

### `POST /email/test-upload`
Simulates receiving an invoice via email.
- **Type:** `multipart/form-data`
- **Fields:**
    - `invoice`: The PDF file (Binary).
    - `vendorName`: "ACME Corp" (Optional, helps if email matching fails).
    - `vendorEmail`: "billing@acme.com" (Optional).
- **What it does:**
    1.  Reads the PDF.
    2.  Finds the vendor in the specific user's account.
    3.  Extracts data (Date, Total, Invoice #).
    4.  If it's confident (>70%), it **appends a row to Google Sheets**.
