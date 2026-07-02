Hiring Outcome Dashboard
🚀 Live Demo
Check out the live dashboard: https://hiring-outcome-dashboard.onrender.com

A production-ready Full Stack hiring analytics dashboard with real SQLite data, live metrics, trust verification, and an executive dashboard.

📊 Dashboard Preview
The live dashboard shows real-time hiring analytics including:

Metric	Value
Total Candidates	35
Total Hired	3
Offers Generated	18
Offers Signed	15
Hiring Rate	8.57%
Offer Acceptance	83.33%
Average Salary	$112,333
Average Hiring Time	28 days
✨ Features
📈 Real-time KPIs
Total Candidates, Hired, Offers, Acceptance Rate, and more

All metrics pulled directly from SQLite database

Auto-refresh every 30 seconds

Animated KPI cards with hover effects

Color-coded metrics for easy scanning

📊 Interactive Charts
Hiring Outcome Pie Chart - Visual distribution of candidate statuses

Candidate Status Bar Chart - Detailed breakdown by status

Department Hiring Chart - Hiring performance by department

Offer Funnel Chart - Track candidates through the hiring pipeline

Daily Hiring Trend Line Chart - Track hiring over time

Salary Distribution Chart - Average salaries by department

🔐 Trust Verification
SHA-256 hash verification for signed offers

Verify offer authenticity with candidate ID

Real-time verification status updates

Detailed error messages for failed verifications

List of candidates with signed offers

🧠 Decision Engine
Auto-generated recommendations based on metrics

Priority-based suggestions (High, Medium, Low)

Actionable insights for improvement

Categories: Hiring Process, Compensation, Compliance, Follow-up, Screening, Candidate Experience, Sourcing, Budget

🔍 Search & Filters
Search candidates by name or email

Filter by department

Filter by status

Click on any candidate in the list to verify

Sticky table header for easy navigation

📤 Export & Print
CSV Export - Download dashboard metrics

Print Dashboard - Print-friendly version

Clean print layout with all charts and metrics

🎨 Executive Theme
Professional dark blue design (#0a1628)

Smooth hover animations

Responsive for all devices

Loading animations with spinner

Freshness indicator (Green = updated within 24 hours, Red = stale)

Glassmorphism card effects

🛠️ Tech Stack
Backend
Node.js - JavaScript runtime

Express.js - Web framework

SQLite3 - Lightweight database

Helmet - Security middleware

Express Rate Limiter - API rate limiting

Frontend
Vanilla HTML - Structure

Vanilla CSS - Styling with custom properties and animations

Vanilla JavaScript - Client-side logic

Chart.js - Interactive charts

Bootstrap Icons - Icon library

Bootstrap 5 - Grid system and components

Development
Nodemon - Auto-reload during development

CORS - Cross-origin resource sharing

📦 Installation
Prerequisites
Node.js (v14 or higher)

npm (v6 or higher)

Steps
bash
# Clone the repository
git clone https://github.com/gokulakb/hiring-outcome-dashboard.git

# Navigate to project directory
cd hiring-outcome-dashboard

# Install dependencies
npm install

# Start the production server
npm start

# Or start in development mode with auto-reload
npm run dev
Access the Application
Open your browser and navigate to:

text
http://localhost:10000
🚀 Deployment on Render
This application is deployed on Render with these settings:

yaml
Build Command: npm install
Start Command: npm start
Environment: Node.js
Deployment Steps:
Push your code to GitHub

Create a new Web Service on Render

Connect your GitHub repository

Configure build settings:

Build Command: npm install

Start Command: npm start

Add environment variables (optional):

PORT: 10000

NODE_ENV: production

Deploy!

📊 API Endpoints
Dashboard
Method	Endpoint	Description
GET	/api/dashboard	Complete dashboard data (KPIs, timeline, recommendations)
GET	/api/dashboard/kpis	KPI metrics only
GET	/api/dashboard/timeline	Hiring timeline data
GET	/api/dashboard/recommendations	AI-generated recommendations
Analytics
Method	Endpoint	Description
GET	/api/analytics/hiring	Hiring analytics (pie, status, departments)
GET	/api/analytics/funnel	Offer funnel data and recent activities
GET	/api/analytics/departments	Department-wise hiring and salaries
GET	/api/analytics/trends	Daily trends and salary distribution
Verification
Method	Endpoint	Description
POST	/api/verify/:id	Verify an offer by candidate ID
GET	/api/verify/status/:id	Get verification status
GET	/api/verify/signed-offers	List all candidates with signed offers
GET	/api/verify/candidates/all	List all candidates with verification status
POST	/api/verify/fix-hashes	Fix missing verification hashes
Health
Method	Endpoint	Description
GET	/api/health	Health check endpoint
📁 Project Structure
****
hiring-outcome-dashboard/
├── controllers/
│   ├── analyticsController.js    # Analytics endpoints logic
│   ├── dashboardController.js    # Dashboard endpoints logic
│   └── verificationController.js # Verification endpoints logic
├── models/
│   ├── analyticsModel.js         # Analytics database queries
│   ├── dashboardModel.js         # Dashboard database queries
│   └── verificationModel.js      # Verification database queries
├── routes/
│   ├── analyticsRoutes.js        # Analytics API routes
│   ├── dashboardRoutes.js        # Dashboard API routes
│   └── verificationRoutes.js     # Verification API routes
├── database/
│   ├── database.js               # Database initialization and seeding
│   └── hiring.db                 # SQLite database file (auto-created)
├── middleware/
│   └── logger.js                 # Request logging middleware
├── utils/
│   ├── hash.js                   # Hash generation utilities
│   └── csvExport.js              # CSV export utilities
├── public/
│   ├── index.html                # Main HTML page
│   ├── style.css                 # Custom styles
│   └── script.js                 # Client-side JavaScript
├── logs/
│   ├── access.log                # All requests log
│   └── api.log                   # API requests log
├── package.json                  # Dependencies and scripts
├── server.js                     # Application entry point
├── .env                          # Environment variables
├── .gitignore                    # Git ignore file
└── README.md                     # Project documentation

📝 Commands
Command	Description
npm install	Install all dependencies
npm start	Start production server
npm run dev	Start development server with auto-reload
npm audit	Check for security vulnerabilities
npm audit fix	Fix security vulnerabilities
🗄️ Database Schema
Candidates Table
sql
CREATE TABLE candidates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  salary REAL,
  status TEXT NOT NULL,
  offerSent BOOLEAN DEFAULT 0,
  offerSigned BOOLEAN DEFAULT 0,
  verificationHash TEXT,
  offerDate TEXT,
  hireDate TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
)
Events Table
sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  candidateId INTEGER,
  eventType TEXT NOT NULL,
  description TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidateId) REFERENCES candidates (id)
)
Candidate Statuses
Applied

Interview Scheduled

Interview Completed

Offer Generated

Offer Sent

Offer Viewed

Offer Signed

Offer Verified

Hired

Rejected

Withdrawn

🔐 Security Features
Helmet.js: Secure HTTP headers

Rate Limiting: 500 requests per 15 minutes

CORS: Cross-origin resource sharing protection

Input Validation: Sanitization and validation

SQL Injection Prevention: Parameterized queries

SHA-256 Hashing: Trust verification

🎯 KPIs Calculated
KPI	Formula
Hiring Rate	(Total Hired / Total Candidates) × 100
Offer Acceptance Rate	(Offers Signed / Offers Generated) × 100
Verification Success Rate	(Verified Offers / Offers Signed) × 100
Average Salary	AVG(Salary) of hired candidates
Average Hiring Time	AVG(Hire Date - Created At)
🧪 Testing the Application
Test API with cURL
bash
# Get dashboard data
curl http://localhost:10000/api/dashboard

# Get KPIs only
curl http://localhost:10000/api/dashboard/kpis

# Get recommendations
curl http://localhost:10000/api/dashboard/recommendations

# Get analytics
curl http://localhost:10000/api/analytics/hiring

# Verify an offer (replace 4 with actual candidate ID)
curl -X POST http://localhost:10000/api/verify/4

# Health check
curl http://localhost:10000/api/health
Test in Browser
Open http://localhost:10000

Check KPI cards for live data

Click "Show Candidates with Signed Offers"

Click on any candidate row to verify

Try search and filters

Export CSV

Print dashboard

🚧 Future Improvements
User authentication and authorization

Role-based access control (Admin, Manager, Viewer)

Email notifications for key events

Advanced filtering and search capabilities

Custom date range selection

More detailed analytics and insights

Integration with external HR systems (Greenhouse, Lever)

Mobile application (React Native)

Data export to Excel and PDF

Scheduled report generation

Real-time WebSocket notifications

Advanced AI recommendations

Custom dashboard widgets

Multi-language support

Dark/light theme toggle

Performance optimization and caching

CI/CD pipeline integration

🤝 Contributing
Contributions are welcome! Please follow these steps:

Fork the repository

Create a feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

Code Style
Use consistent indentation (2 spaces)

Follow JavaScript ES6+ standards

Write meaningful commit messages

Add comments for complex logic

📄 License
This project is developed for educational and portfolio purposes.
