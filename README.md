# Hiring Outcome Dashboard

A **production-ready Full Stack Hiring Analytics Dashboard** built with **Node.js, Express.js, SQLite, Vanilla JavaScript, and Chart.js**. The application tracks the complete hiring lifecycle, provides real-time hiring analytics, verifies signed offers using **SHA-256 hashing**, and delivers an executive dashboard for data-driven hiring decisions.

---

## 🚀 Live Demo

**Live Dashboard:**  
https://hiring-outcome-dashboard.onrender.com

---

## 📊 Dashboard Overview

| Metric | Value |
|--------|-------|
| Total Candidates | 35 |
| Total Hired | 3 |
| Offers Generated | 18 |
| Offers Signed | 15 |
| Hiring Rate | 8.57% |
| Offer Acceptance Rate | 83.33% |
| Average Salary | $112,333 |
| Average Hiring Time | 28 Days |

---

## ✨ Features

### 📈 Real-Time KPIs

- Total Candidates
- Total Hired
- Offers Generated
- Offers Signed
- Hiring Rate
- Offer Acceptance Rate
- Verification Success Rate
- Average Hiring Time
- Average Salary

**Highlights**

- Real SQLite-backed metrics
- Auto refresh every 30 seconds
- Animated KPI cards
- Responsive dashboard
- Color-coded indicators

---

### 📊 Interactive Charts

- Hiring Outcome Pie Chart
- Candidate Status Bar Chart
- Department Hiring Chart
- Offer Funnel Chart
- Daily Hiring Trend
- Salary Distribution Chart

---

### 🔐 Trust Verification

- SHA-256 hash generation
- Offer verification API
- Tamper detection
- Verification status updates
- Signed offer listing

---

### 🧠 Decision Engine

Automatically generates recommendations such as:

- Increase interview capacity
- Review compensation strategy
- Audit signed offers
- Follow up pending candidates
- Improve screening process

---

### 🔍 Search & Filters

- Search candidates by name or email
- Department filter
- Status filter
- Sticky table header
- Candidate verification from dashboard

---

### 📤 Export & Print

- CSV Export
- Print Dashboard
- Print-friendly layout

---

### 🎨 Executive Dashboard

- Professional Dark Blue Theme
- Glassmorphism Cards
- Responsive Design
- Hover Animations
- Loading Spinner
- Freshness Indicator

---

## 🛠 Tech Stack

### Backend

- Node.js
- Express.js
- SQLite3
- Helmet
- Express Rate Limiter

### Frontend

- HTML5
- CSS3
- JavaScript (ES6)
- Chart.js
- Bootstrap Icons
- Bootstrap 5

### Development

- Nodemon
- CORS

---

## 📦 Installation

### Clone Repository

```bash
git clone https://github.com/gokulakb/hiring-outcome-dashboard.git
cd hiring-outcome-dashboard
```

### Install Dependencies

```bash
npm install
```

### Run the Application

Production

```bash
npm start
```

Development

```bash
npm run dev
```

Open the application:

```text
http://localhost:10000
```

---

## 🚀 Deployment (Render)

**Build Command**

```text
npm install
```

**Start Command**

```text
npm start
```

Environment Variables

```text
PORT=10000
NODE_ENV=production
```

---

## 📊 API Endpoints

### Dashboard APIs

| Method | Endpoint |
|--------|----------|
| GET | `/api/dashboard` |
| GET | `/api/dashboard/kpis` |
| GET | `/api/dashboard/timeline` |
| GET | `/api/dashboard/recommendations` |

### Analytics APIs

| Method | Endpoint |
|--------|----------|
| GET | `/api/analytics/hiring` |
| GET | `/api/analytics/funnel` |
| GET | `/api/analytics/departments` |
| GET | `/api/analytics/trends` |

### Verification APIs

| Method | Endpoint |
|--------|----------|
| POST | `/api/verify/:id` |
| GET | `/api/verify/status/:id` |
| GET | `/api/verify/signed-offers` |
| GET | `/api/verify/candidates/all` |
| POST | `/api/verify/fix-hashes` |

### Health Check

| Method | Endpoint |
|--------|----------|
| GET | `/api/health` |

---

## 📁 Project Structure

```text
hiring-outcome-dashboard/
│
├── controllers/
│   ├── analyticsController.js
│   ├── dashboardController.js
│   └── verificationController.js
│
├── models/
│   ├── analyticsModel.js
│   ├── dashboardModel.js
│   └── verificationModel.js
│
├── routes/
│   ├── analyticsRoutes.js
│   ├── dashboardRoutes.js
│   └── verificationRoutes.js
│
├── database/
│   ├── database.js
│   ├── createDatabase.js
│   └── hiring.db
│
├── middleware/
│   └── logger.js
│
├── utils/
│   ├── hash.js
│   └── csvExport.js
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── logs/
│   ├── access.log
│   └── api.log
│
├── package.json
├── server.js
├── .env
├── .gitignore
└── README.md
```

---

## 📝 Commands

| Command | Description |
|----------|-------------|
| `npm install` | Install dependencies |
| `npm start` | Start production server |
| `npm run dev` | Start development server |
| `npm audit` | Check vulnerabilities |
| `npm audit fix` | Fix vulnerabilities |

---

## 🗄 Database Schema

### Candidates Table

- id
- name
- email
- role
- department
- salary
- status
- offerSent
- offerSigned
- verificationHash
- offerDate
- hireDate
- createdAt

### Events Table

- id
- candidateId
- eventType
- description
- createdAt

### Candidate Statuses

- Applied
- Interview Scheduled
- Interview Completed
- Offer Generated
- Offer Sent
- Offer Viewed
- Offer Signed
- Offer Verified
- Hired
- Rejected
- Withdrawn

---

## 🔐 Security Features

- Helmet.js Security Headers
- Express Rate Limiting
- CORS Protection
- Input Validation
- Parameterized SQL Queries
- SHA-256 Trust Verification

---

## 📊 KPI Calculations

| KPI | Formula |
|------|----------|
| Hiring Rate | (Total Hired / Total Candidates) × 100 |
| Offer Acceptance Rate | (Offers Signed / Offers Generated) × 100 |
| Verification Success Rate | (Verified Offers / Offers Signed) × 100 |
| Average Salary | AVG(Salary) |
| Average Hiring Time | AVG(Hire Date − CreatedAt) |

---

## 🧪 Testing

### Dashboard

```text
http://localhost:10000
```

### Example API Requests

```bash
curl http://localhost:10000/api/dashboard

curl http://localhost:10000/api/dashboard/kpis

curl http://localhost:10000/api/analytics/hiring

curl -X POST http://localhost:10000/api/verify/4

curl http://localhost:10000/api/health
```

---

## 🚧 Future Improvements

- User Authentication
- Role-Based Access Control
- Email Notifications
- Advanced Search & Filters
- Date Range Analytics
- HRMS Integration
- Mobile Application
- Excel & PDF Export
- Scheduled Reports
- AI Recommendations
- Real-Time Notifications
- Custom Dashboard Widgets
- Multi-language Support
- Dark/Light Theme Toggle
- Performance Optimization
- CI/CD Integration

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push to GitHub.
5. Open a Pull Request.

---

## 📄 License

This project is developed for **educational and portfolio purposes**.
