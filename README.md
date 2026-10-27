# 🏗️🌾 GeoCrop AI

> **An AI-powered platform that combines Civil Geotechnical Engineering and Precision Agriculture in one bilingual (English / தமிழ்) app: web, PWA and Android.**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite&logoColor=white)](https://github.com/WiseLibs/better-sqlite3)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-Android-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#-license)

---

## 📖 Overview

**GeoCrop AI** takes a handful of soil, climate and site parameters and turns them into two kinds of decisions:

- **For civil engineers:** how much load the ground can safely carry, what foundation to use, and how many floors a plot can support.
- **For farmers and agronomists:** which crops suit the soil and weather, and exactly how much fertilizer to apply.

Predictions come from **three lightweight Artificial Neural Networks (ANNs) that run entirely in the browser** (pure JavaScript forward pass, no ML server needed), backed by classical formulas such as **Terzaghi's bearing capacity** equation. A built-in **AI assistant** can read raw soil-test text, fill in the forms for you and answer questions in English or Tamil. Finished analyses can be exported as a professional **PDF audit report**.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Machine Learning Models](#-machine-learning-models)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Security](#-security)
- [Deployment](#-deployment)
- [Building the Android App](#-building-the-android-app)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 🌟 Key Features

### 🏢 1. Civil Geotechnical Module
- **Soil parameter audit:** specific gravity (Gs), sand / silt / clay %, bulk density, porosity, moisture, permeability, cohesion (c), friction angle (φ), liquid and plastic limits, foundation depth, water table depth and SPT N-value.
- **Terzaghi bearing capacity engine:** computes safe bearing capacity (kN/m²) with a Factor of Safety of 3.0.
- **ANN soil strength prediction:** estimates **CBR** and **Safe Bearing Capacity** from moisture content and dry density.
- **Foundation recommendation:** the ANN classifies the best foundation type (Isolated, Combined, Raft or Pile) for your soil and building height.
- **Floor simulator and target-floor advisor:** see the maximum safe floors (G+N) for a plot, or enter a target floor count to get a feasibility verdict.
- **Soil texture and plasticity classification:** Clay, Silt, Sand, Loam variants, and Low / Medium / High plasticity.
- **10 Indian soil types** with English and Tamil names: Alluvial, Black Cotton (Regur), Red & Yellow, Laterite, Arid / Desert, Forest & Mountain, Peaty / Marsh, Rock, Sandy and Clayey.

### 🌾 2. Precision Agriculture Module
- **Crop suitability ranking:** ANN-based ranking across **11 crops** from rainfall, temperature, humidity, soil moisture, density and pH.
- **Plant database (45+ plants):** crops, vegetables and fruits, each with target N-P-K, ideal pH, EC and moisture ranges, suitable soils, water requirement and season.
- **Fertilizer calculator:** converts nutrient deficits into **Urea, DAP and MOP** bags (50 kg) per hectare, accounting for the nitrogen already supplied by DAP.
- **Soil health score and radar chart:** visualizes nutrient balance against the crop's target.
- **Micronutrient inputs:** Fe, Zn, Mn, Cu and B.

### 🤖 3. AI Assistant (Chatbot)
- Answers geotechnical, agricultural and general construction questions in **English or Tamil**.
- **Natural-language auto-fill:** paste unformatted soil-test text and the assistant extracts parameters into both modules.
- **Voice-style shortcuts:** ask it to "go to agriculture" or "generate report" and it navigates for you.
- Uses **Google Gemini** (`gemini-1.5-flash`) when an API key is configured, and falls back to the built-in rule-based knowledge engine (`aiEngine.js`) when it is not.

### 📄 4. PDF Audit Reports
- Letterhead layout with GPS location stamp, parameter audit table, foundation recommendation, target-floor advisory and fertilizer schedule.
- Generated with `jsPDF` and `html2canvas`, and can be **archived to the database** and listed later.

### 🔐 5. Secure Authentication
- Registration with **email OTP verification**
- Login with **account lockout** after repeated failures
- **Forgot / reset password** via OTP
- **JWT**-protected routes and `bcrypt`-hashed passwords

### 📱 6. Multi-Platform
- Responsive web app
- **PWA** with service worker and manifest
- **Native Android** app via Capacitor (`com.geocrop.ai`)
- Full **English / தமிழ்** localization

---

## 🧠 Machine Learning Models

All models are small feed-forward networks with **tanh** activations. Their weights are stored as JSON in `src/engine/` and evaluated in `annModel.js`, so inference is instant and works offline.

| Model | Inputs | Output | Architecture | Training data | Performance |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Soil Strength** (regression) | Moisture content, dry density | CBR, Safe Bearing Capacity | 2 → 12 → 8 → 2 | 400 samples | R²: **0.987** (CBR), **0.961** (SBC) |
| **Crop Suitability** (classification) | Rainfall, temperature, humidity, moisture, density, pH | 11 crops: Banana, Blackgram / Pulses, Coconut, Cotton, Groundnut, Maize, Paddy, Ragi, Sorghum, Sugarcane, Turmeric | 6 → 20 → 14 → 11 | 1,144 train / 286 test | Accuracy **85.3%**, macro-F1 **0.851** |
| **Foundation Type** (classification) | CBR, SBC, soil texture, storeys | Combined, Isolated, Pile or Raft foundation | 4 → 16 → 10 → 4 | 800 train / 200 test | Accuracy **93.5%**, macro-F1 **0.941** |

> ⚠️ **Disclaimer:** GeoCrop AI is a decision-support and learning tool. Outputs are estimates and **must not replace** a site investigation, a lab soil test or the judgment of a licensed structural / geotechnical engineer or agronomist.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, Recharts, Lucide React |
| **Backend** | Node.js, Express 5, better-sqlite3 (SQLite) |
| **Auth and Security** | JWT, bcryptjs, Helmet, HPP, express-rate-limit, input sanitization |
| **Email** | Nodemailer (Gmail SMTP) |
| **AI** | In-browser ANNs, Google Generative AI (Gemini), rule-based assistant |
| **Reports** | jsPDF, html2canvas |
| **Mobile** | Capacitor (Android), PWA |
| **Hosting** | Vercel (frontend + serverless API) |

---

## 📂 Project Structure

```text
geocrop-ai/
├── android/                  # Capacitor Android project
├── api/
│   └── index.js              # Vercel serverless auth API
├── public/
│   ├── manifest.json         # PWA manifest
│   └── sw.js                 # Service worker (offline support)
├── server/                   # Express backend (local / self-hosted)
│   ├── config/env.js         # Environment config loader
│   ├── controllers/          # authController.js (auth + reports)
│   ├── db/database.js        # SQLite schema and initialization
│   ├── middleware/           # auth, rate limiter, security
│   ├── routes/               # authRoutes.js, geminiRoutes.js
│   ├── utils/emailSender.js  # OTP emails
│   ├── resetUsers.js         # Utility to clear users
│   └── server.js             # Server entry point
├── src/
│   ├── components/           # UI: Geotechnical, Agriculture, Dashboard,
│   │   └── auth/             #     Chatbot, PDF generator, auth forms
│   ├── context/              # LanguageContext (EN / TA)
│   ├── engine/               # Calculation and ML logic
│   │   ├── annModel.js       # ANN forward pass
│   │   ├── *_weights.json    # Trained model weights
│   │   ├── geotechnicalEngine.js
│   │   ├── agricultureEngine.js
│   │   ├── soilDatabase.js   # Soil and plant databases
│   │   └── aiEngine.js       # Rule-based assistant
│   ├── locales/              # en.js, ta.js
│   ├── App.jsx
│   └── main.jsx
├── capacitor.config.json
├── vercel.json
├── vite.config.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) **v18 or higher**
- npm v9 or higher
- A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833) (for OTP emails)
- *(Optional)* a [Google Gemini API key](https://aistudio.google.com/app/apikey)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/muthu-16/geocrop-ai.git
cd geocrop-ai

# 2. Install dependencies
npm install

# 3. Create your environment file (see the next section)
cp .env.example .env     # then edit the values
```

### Running Locally

The frontend and backend run as two separate processes. Open two terminals:

```bash
# Terminal 1: backend API (default: http://localhost:5000)
npm run server

# Terminal 2: frontend (http://localhost:3000)
npm run dev
```

The Vite dev server proxies `/api/*` requests to `http://localhost:5000`, so no extra CORS setup is needed.

### Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the Vite dev server |
| `npm run server` | Start the Express + SQLite backend |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run reset-users` | Clear registered users from the database |

---

## 🔑 Environment Variables

Create a `.env` file in the project root. **Never commit it.**

```env
# Server
PORT=5000
JWT_SECRET=replace_with_a_long_random_string

# OTP and login protection
OTP_EXPIRY_MINUTES=5
OTP_RESEND_COOLDOWN_SECONDS=60
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_MINUTES=15
RATE_LIMIT_PER_SEC=10

# SMTP (Gmail App Password, not your normal password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_app_password
EMAIL_FROM="GeoCrop AI <your_email@gmail.com>"

# Optional: enables the Gemini-powered assistant
GEMINI_API_KEY=your_gemini_api_key
```

Generate a strong JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## 📡 API Reference

Base URL (local): `http://localhost:5000`

### Authentication: `/api/auth`

| Method | Endpoint | Auth | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/register` | ❌ | Start registration and send an email OTP |
| `POST` | `/verify-otp` | ❌ | Verify the OTP and activate the account |
| `POST` | `/resend-otp` | ❌ | Resend the OTP (cooldown applies) |
| `POST` | `/login` | ❌ | Log in and receive a JWT |
| `POST` | `/forgot-password` | ❌ | Send a password-reset OTP |
| `POST` | `/reset-password` | ❌ | Set a new password using the OTP |
| `GET` | `/profile` | ✅ | Get the logged-in user's profile |
| `POST` | `/save-report` | ❌ | Archive a generated audit report |
| `GET` | `/reports` | ❌ | List archived reports |

### AI Assistant: `/api/ai`

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `POST` | `/chat` | Send `{ query, geoState, agriState, lang }`; returns `{ answer, extractedParams, navigate }` |

### System

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/api/health` | Health check |

All auth routes are rate limited (default **10 requests/second**).

---

## 🛡️ Security

- **Helmet** secure HTTP headers, `x-powered-by` disabled
- **HPP** protection against HTTP parameter pollution
- **Input sanitization** strips script tags, `javascript:` URLs and SQL comment markers
- **Rate limiting** on authentication routes
- **Payload limit** of 100 KB to reduce DoS risk
- **bcrypt** password hashing and **JWT** sessions
- **Brute-force lockout:** 5 failed attempts triggers a 15-minute lockout (configurable)
- **Short-lived OTPs** (5 minutes) with resend cooldown

> 🔒 **Never commit** `.env` files, API keys, SMTP passwords or database files. Make sure `.env` and `*.db*` are listed in `.gitignore`.

---

## ☁️ Deployment

### Vercel
The repo includes `vercel.json`, which routes `/api/*` to the serverless function in `api/index.js` and everything else to the SPA.

1. Import the repository in [Vercel](https://vercel.com/).
2. Add the environment variables from the section above in **Project Settings → Environment Variables**.
3. Deploy.

> ℹ️ The Vercel serverless function (`api/index.js`) keeps users and OTPs **in memory**, so data resets when the function restarts. For production use, connect a persistent database (for example PostgreSQL, MongoDB Atlas or Turso).

### Self-hosted
Run `npm run build`, serve `dist/` with any static server, and run `npm run server` behind a reverse proxy such as Nginx.

---

## 📱 Building the Android App

```bash
# 1. Build the web bundle
npm run build

# 2. Sync assets into the Android project
npx cap sync android

# 3. Open in Android Studio
npx cap open android
```

In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

---

## 🗺️ Roadmap

- [ ] Persistent cloud database for the Vercel deployment
- [ ] Protect `/save-report` and `/reports` with JWT authentication
- [ ] Unit tests for the geotechnical and agriculture engines
- [ ] More crops in the suitability model
- [ ] Live weather and soil-data integration
- [ ] Screenshots and demo video in this README

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome.

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. Add a `LICENSE` file to the repository root with the standard MIT text to make this official.

---

## 👤 Author

**Muthu B**: Full Stack Developer (MERN) and final-year CSE student

[![GitHub](https://img.shields.io/badge/GitHub-muthu--16-181717?logo=github)](https://github.com/muthu-16)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Muthu%20B-0A66C2?logo=linkedin)](https://linkedin.com/in/muthu-b-577271309)
[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-00C7B7?logo=netlify&logoColor=white)](https://bright-granita-44977a.netlify.app)
[![Email](https://img.shields.io/badge/Email-muthu1616mg%40gmail.com-D14836?logo=gmail&logoColor=white)](mailto:muthu1616mg@gmail.com)

---

<p align="center">⭐ If you found this project useful, please give it a star!</p>
