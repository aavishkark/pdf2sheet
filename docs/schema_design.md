# Database Schema Design

## Why NoSQL?
I chose MongoDB because invoice data is naturally unstructured. One vendor might have a "Tax ID" field, another might not. Trying to force this into a SQL table with rigid columns would have been a nightmare of `ALTER TABLE` commands. With Mongo, I just store the extracting rules as a JSON object.

## Collections

### 1. `users`
This is pretty standard. It holds the login info and the tokens we need to talk to Google Sheets.

```javascript
{
  "_id": ObjectId("..."),
  "firstName": "John",
  "email": "john@test.com",
  "password": "...", // Hashed with bcrypt (I never store plain text!)
  
  // Here is where the magic happens
  "googleTokens": {
    "access_token": "...",
    "refresh_token": "..." // This is the key to offline access
  },
  
  "settings": {
    "spreadsheetId": "1BxiMV...", // The sheet we write to
    "notifyOnLowConfidence": true
  }
}
```

### 2. `vendormaps`
This is the heart of the system. It connects a specific email sender to a set of rules.

```javascript
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."), // Link to the user
  "vendorName": "ACME Corp",
  
  // Detection Logic
  "senderEmail": "billing@acmecorp.com", 
  "senderDomain": "acmecorp.com",

  // How to read their PDF
  "fieldMappings": {
    "invoiceNumber": { 
        "extractionRule": "Invoice #(\\d+)",  // Regex pattern
        "sheetColumn": "A"
    },
    "totalAmount": { 
        "keywords": ["Balance Due", "Total"],
        "sheetColumn": "D"
    }
  },

  "confidence": {
    "successRate": 95, // We track how often this works
    "totalProcessed": 42
  }
}
```

### 3. `invoices`
A log of everything we've processed. Useful for history and debugging.

```javascript
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."),
  "vendorName": "ACME Corp",
  "status": "processed", // or "review_needed"
  
  "extractedData": {
    "invoiceNumber": "INV-2024-001",
    "totalAmount": "1500.00",
    "invoiceDate": "01/15/2026"
  },
  
  "confidenceScore": 100, // 0 to 100
  "processedAt": ISODate("2026-01-24T...")
}
```

## Indexing Strategy
To make it fast, I added indexes on:
1.  `email` in `users` (Unique lookup).
2.  `senderEmail` + `userId` in `vendormaps` (So looking up a vendor when an email arrives is instant).
3.  `generatedAt` in `invoices` (For sorting history quickly).
