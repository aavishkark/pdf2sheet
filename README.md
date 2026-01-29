# PDF2Sheet Auto

**Say goodbye to manual data entry.** 
PDF2Sheet Auto connects your email inbox directly to Google Sheets, turning PDF invoices into structured data automatically.

It’s not just a parser—it’s a learning engine. If it gets something wrong, you correct it once, and it prevents that mistake forever.

---

## Why PDF2Sheet?

### It Learns From You
Most tools break when layouts change. PDF2Sheet adapts.
*   **First time:** It guesses the values (Invoice #, Date, Amount) using smart heuristics.
*   **Review:** If it missed something, you simply click the correct value on the PDF.
*   **Forever after:** It remembers *exactly* where that vendor puts their data. Next time, it's automatic.

### Email-First Identity
We know that `billing@company.com` is always the same vendor, even if they change their invoice layout or name.
*   **Smart Detection:** We prioritize the **Sender Email**.
*   **No Duplicates:** The system automatically links invoices from the same email to the same vendor profile, keeping your data clean.

### Your Data, Your Sheet
No locked-in dashboards. All your data syncs instantly to your own Google Sheet. Use your existing financial models, pivot tables, and formulas.

---

## Features at a Glance

*   **Auto-Pilot Mode:** Once a vendor is learned, their emails are processed and synced without you lifting a finger.
*   **Human-in-the-Loop:** Low-confidence scans pause for your review. You're always in control.
*   **Precision Extraction:** We don't just "OCR" the whole page. We find the specific pixels where the data lives.
*   **Data Cleaning:** Automagically fixes common issues like `$1,200.00` vs `1200` or weird date formats.

---

## Tech Stack

Built with love using the **MERN Stack**:
<p>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="react" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="node.js" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="mongodb" />
  <img src="https://img.shields.io/badge/Google%20Sheets-34A853?style=for-the-badge&logo=googlesheets&logoColor=white" alt="google sheets" />
</p>

---

## Getting Started

1.  **Install dependencies**
    ```bash
    npm install
    cd backend && npm install
    cd ../frontend && npm install
    ```


2.  **Configuration**
    Create a `.env` file in `backend/` with the following:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_key
    FRONTEND_URL=http://localhost:5173
    ```

    *(Optional)* Create a `.env` in `frontend/` if you need custom API URLs:
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```

3.  **Run it!**
    *   Backend: `npm run start` (Port 5000)
    *   Frontend: `npm run dev` (Port 5173)

4.  **Visit:** `http://localhost:5173`

---

*Built for efficiency.*
