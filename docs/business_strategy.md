# Business Strategy - PDF2Sheet

## 1. Pricing Strategy: Why $29/month?
I settled on **$29 per month** for the "Pro" plan. Here is my thinking:

1.  **Value Based:** A typical office manager (earning ~$25/hour) spends about 5 hours a week on data entry. That's $125/week or **$500/month** of wasted time. Paying $29 to save $500 is a no-brainer decision for a small business owner.
2.  **Cost Coverage:**
    -   Server costs (Heroku/DigitalOcean): ~$10/mo
    -   Database (MongoDB Atlas): ~$0 (Free tier) -> $20/mo (Scale)
    -   Email Service (SendGrid/Mailgun): ~$15/mo
    -   Even with just 10 customers, the $29 price point covers all my infrastructure costs immediately.
3.  **Target Revenue:** To reach $5,000 MRR (a solid sustainable business), I only need:
    `$5000 / $29 = ~172 customers`.
    Finding 172 contractors or small shops in the whole country seems very achievable.

## 2. Customer Acquisition Plan
I'm not going to spend money on ads yet. I want to reach real people directly.

### Channel A: Cold Emailing Local Trades
I will write a script to find local plumbers, electricians, and HVAC companies on Google Maps.
**Subject:** Quick question about your supplier invoices
**Body:**
> "Hi [Name],
> I'm a developer building a tool to help contractors stop typing invoice data into Excel manually.
>
> Does your office manager hate data entry day? I built a simple tool where you forward the PDF, and it pops into your spreadsheet automatically.
>
> Can I show you a 5-min demo? No sales pressure, just want feedback.
>
> Thanks,
> [My Name]"

### Channel B: The "Accountant Referral"
Bookkeepers hate waiting for clients to send organized data. I will contact local accounting firms and say: *"Give this tool to your messy clients, and you'll get their data cleaner and faster."*

## 3. Competitive Analysis

### Competitor 1: Hubdoc / Dext
*   **Them:** Huge, expensive, sophisticated. They integrate with Xero/Quickbooks.
*   **Me:** Simple. I integrate with **Google Sheets**.
*   **My Edge:** A lot of small businesses don't use Xero. They basically run their whole life on a simple Excel sheet. Hubdoc is overkill for them; PDF2Sheet is perfect.

### Competitor 2: "Manual Entry" (The real enemy)
*   **Them:** Free, but slow and error-prone.
*   **Me:** $29, but instant and accurate.
*   **My Edge:** I effectively sell "buying back your Sunday afternoon."

## 4. Risks
-   **Google API Changes:** If Google changes their Sheets API, I have to update code fast.
-   **PDF Layouts:** Some invoices are scanned images (not text). I might need to add OCR (Tesseract.js) later, which adds cost. I'll stick to text-PDFs for the MVP.
