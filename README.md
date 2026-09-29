# OmniMarketX

### Market Discovery & Creation Platform

OmniMarketX is a full-stack MERN application that discovers potential prediction-market events from public RSS feeds, extracts structured market candidates, validates them, detects duplicates, and sends approved candidates through a market-creation workflow.

The system is designed around a **human review gate**: discovered candidates are never automatically published as markets. A reviewer must explicitly approve a valid candidate before the system attempts to create the market.

---

## 🚀 Live Demo

**Frontend:**
https://omni-market-x-rust.vercel.app
**Backend API:**
https://omni-market-x-1.onrender.com

**API Health Check:**
https://omni-market-x-1.onrender.com/api/health

---

## ✨ Features

* 📰 RSS-based market discovery
* 🤖 Rule-based candidate extraction
* 📅 Automatic date extraction using `chrono-node`
* ✅ Candidate validation system
* ⚠️ Error, warning, and information validation issues
* 🔍 Duplicate detection using Jaccard similarity
* 👤 Human reviewer approval workflow
* 🚫 Blocking validation errors before approval
* 🔄 Retryable market creation
* 🔐 Reviewer-key authentication for mutations
* 📊 Discovery run statistics
* 🛟 Fallback sample data when feeds fail
* 🔁 Idempotent market creation
* 🗄️ MongoDB persistence
* ⚛️ React + Vite frontend
* 🎨 Tailwind CSS UI
* 🧪 Vitest unit tests
* 🌐 Production deployment with Vercel + Render
* ☁️ MongoDB Atlas database

---

# 🧠 How It Works

The application follows this workflow:

```text
Public RSS Feeds
       ↓
   Discovery
       ↓
Candidate Extraction
       ↓
   Validation
       ↓
Duplicate Detection
       ↓
   Review Queue
       ↓
Human Reviewer
    ↙       ↘
 Reject     Approve
              ↓
       Market Creation API
              ↓
        Created Market
```

### Human Review Gate

A candidate always starts as:

```text
pending_review
```

It cannot become a market automatically.

The reviewer can:

* Review the candidate
* Edit the candidate
* Reject the candidate
* Approve the candidate if validation passes

After approval, the system attempts to create the market through the market API.

---

# 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │      RSS Sources     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Discovery Service     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Candidate Extraction  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Validation + Dedupe   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Review Queue       │
                    └──────────┬───────────┘
                               │
                         Human Review
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Market Creation API   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     MongoDB Atlas     │
                    └──────────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

* React
* React Router
* Vite
* Tailwind CSS

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* RSS Parser
* Chrono Node
* Zod
* Helmet
* CORS
* Express Rate Limit

## Testing

* Vitest

## Deployment

* Vercel — frontend
* Render — backend
* MongoDB Atlas — database

---

# 📁 Project Structure

```text
omni-market-x/
│
├── package.json
├── README.md
├── .gitignore
│
├── server/
│   ├── package.json
│   ├── .env.example
│   │
│   ├── src/
│   │   ├── index.js
│   │   ├── app.js
│   │   ├── config.js
│   │   │
│   │   ├── config/
│   │   │   └── sources.js
│   │   │
│   │   ├── models/
│   │   │   ├── Candidate.js
│   │   │   ├── Market.js
│   │   │   └── DiscoveryRun.js
│   │   │
│   │   ├── services/
│   │   │   ├── rss.js
│   │   │   ├── extractor.js
│   │   │   ├── validator.js
│   │   │   ├── dedupe.js
│   │   │   ├── discovery.js
│   │   │   ├── marketApi.js
│   │   │   └── marketCreation.js
│   │   │
│   │   ├── routes/
│   │   │   ├── candidates.js
│   │   │   ├── discovery.js
│   │   │   ├── markets.js
│   │   │   └── mockMarketApi.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── error.js
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   └── asyncHandler.js
│   │   │
│   │   └── seed/
│   │       └── sampleArticles.js
│   │
│   └── tests/
│       ├── extractor.test.js
│       ├── validator.test.js
│       └── dedupe.test.js
│
└── client/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    │
    └── src/
        ├── main.jsx
        ├── index.css
        ├── App.jsx
        ├── api.js
        │
        ├── components/
        │   ├── StatusBadge.jsx
        │   └── IssueList.jsx
        │
        └── pages/
            ├── Queue.jsx
            ├── CandidateDetail.jsx
            └── Markets.jsx
```

---

# ⚙️ Local Setup

## Requirements

* Node.js 18+
* MongoDB Atlas account or local MongoDB
* Git

Node.js 18 or newer is required because the backend uses the built-in `fetch` API.

---

## 1. Clone the repository

```bash
git clone https://github.com/alwahab20089-crypto/omni-market-x.git

cd omni-market-x
```

---

## 2. Install dependencies

From the project root:

```bash
npm run install:all
```

This installs dependencies for:

* Root
* Server
* Client

---

## 3. Configure environment variables

Create:

```text
server/.env
```

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
REVIEWER_KEY=your_secure_reviewer_key
CLIENT_ORIGIN=http://localhost:5173
USE_SAMPLE_DATA=false
```

Do not commit `.env` to GitHub.

---

## 4. Start the application

From the root:

```bash
npm run dev
```

The application will run at:

```text
Frontend:
http://localhost:5173

Backend:
http://localhost:5000
```

---

# 🔐 Reviewer Authentication

Mutation endpoints require the reviewer key:

```http
x-reviewer-key: YOUR_REVIEWER_KEY
```

An optional reviewer name can also be provided:

```http
x-reviewer-name: Your Name
```

The reviewer key is configured through:

```env
REVIEWER_KEY=your_secure_key
```

Read endpoints are publicly accessible, while candidate mutations and discovery execution require reviewer authentication.

---

# 🔌 API

## Candidates

### Get candidates

```http
GET /api/candidates
```

Filter by status:

```http
GET /api/candidates?status=pending_review
```

### Get candidate

```http
GET /api/candidates/:id
```

### Edit candidate

```http
PATCH /api/candidates/:id
```

Requires reviewer authentication.

### Approve candidate

```http
POST /api/candidates/:id/approve
```

Requires reviewer authentication.

### Reject candidate

```http
POST /api/candidates/:id/reject
```

Requires reviewer authentication.

---

## Discovery

### Run discovery

```http
POST /api/discovery/run
```

Requires reviewer authentication.

### Discovery history

```http
GET /api/discovery/runs
```

---

## Markets

### Get markets

```http
GET /api/markets
```

---

## Health Check

```http
GET /api/health
```

Response:

```json
{
  "ok": true
}
```

---

# ✅ Validation System

Every discovered candidate is validated before it can be approved.

The validation system checks things such as:

* Question format
* Subjective wording
* Event date
* Closing date
* Resolution source
* Resolution criteria
* Outcomes
* Supporting sources
* Conflicting source dates
* Duplicate candidates

Validation issues are classified as:

```text
error
warning
info
```

Errors block approval.

The validation score starts at `100` and applies penalties based on issue severity.

---

# 🔍 Duplicate Detection

OmniMarketX uses token-based Jaccard similarity to detect similar market questions.

The system handles:

### Exact/repeated source

If the same source URL is discovered again, the existing candidate's discovery count is increased.

### Highly similar candidate

A highly similar candidate can be merged with the existing candidate.

### Possible duplicate

A candidate can also be flagged as a potential duplicate for reviewer inspection.

This helps reduce duplicate markets while still keeping the final decision under human review.

---

# 📰 Discovery Sources

The current discovery configuration includes public RSS feeds such as:

* Federal Reserve Press Releases
* BBC Business
* BBC Sport

Sources are configured in:

```text
server/src/config/sources.js
```

The system can be extended by adding additional RSS sources.

---

# 🛟 Fallback Data

If live RSS feeds are unavailable, the application can fall back to bundled sample articles.

Enable sample data manually with:

```env
USE_SAMPLE_DATA=true
```

If all live feeds fail, the discovery service also automatically uses the sample data fallback.

---

# 🧪 Testing

Run the backend test suite:

```bash
npm test
```

The tests cover:

* Candidate extraction
* Candidate validation
* Duplicate detection

The test suite uses Vitest.

---

# 🚀 Production Deployment

## Frontend — Vercel

The React application is deployed from:

```text
client/
```

Build command:

```bash
npm run build
```

Output:

```text
dist
```

Environment variable:

```env
VITE_API_URL=https://YOUR-RENDER-API.onrender.com
```

---

## Backend — Render

The Express backend is deployed from:

```text
server/
```

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Production environment variables:

```env
PORT=10000
MONGO_URI=your_mongodb_atlas_uri
REVIEWER_KEY=your_secure_reviewer_key
CLIENT_ORIGIN=https://omni-market-x-rust.vercel.app/
USE_SAMPLE_DATA=false
```

---

# ☁️ Production Architecture

```text
                    ┌────────────────────┐
                    │       Vercel       │
                    │   React + Vite     │
                    └─────────┬──────────┘
                              │
                              │ HTTPS / API
                              ▼
                    ┌────────────────────┐
                    │       Render       │
                    │ Node + Express API │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │   MongoDB Atlas    │
                    │      Database      │
                    └────────────────────┘
```

---

# ⚠️ Known Limitations

* Candidate extraction is rule-based and does not understand every headline format.
* Duplicate detection is lexical rather than semantic.
* The current reviewer authentication uses a shared reviewer key rather than individual user accounts.
* Discovery is manually triggered rather than scheduled.
* The current market API is a mock/demo API.
* Resolution-source validation checks URL presence and format rather than independently verifying source reliability.

---

# 🔮 Future Improvements

Possible future improvements include:

* Real authentication and role-based access control
* Scheduled discovery jobs
* More RSS/news sources
* Semantic duplicate detection using embeddings
* LLM-assisted candidate generation
* Advanced reviewer audit logs
* Production market API integration
* More comprehensive integration and end-to-end tests
* Background job processing
* Improved observability and monitoring

---

# 📄 License

This project is currently intended as a portfolio/assignment project.

Add a license here if the repository will be distributed publicly under a specific license.

---

## 👨‍💻 Author

**Abdul Wahab**

GitHub:
https://github.com/alwahab20089-crypto

Repository:
https://github.com/alwahab20089-crypto/omni-market-x
