# 🏗️ GeoCrop AI v2.0 - Civil Geotechnical & Precision Agriculture Platform

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![Capacitor](https://img.shields.io/badge/Capacitor-Android-green.svg)](https://capacitorjs.com/)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

**GeoCrop AI v2.0** is an advanced, AI-powered dual-domain engineering platform designed for **Civil Geotechnical Engineering** and **Precision Agronomy**. It combines Terzaghi bearing capacity soil mechanics with multi-crop suitability algorithms to deliver instant structural safety simulations, fertilizer dosage calculations, executive PDF reports, and interactive AI assistant guidance.

---

## 🌟 Key Features

### 🏢 1. Civil Geotechnical Engineering
* **17 Soil Parameters Audit**: Specific Gravity ($G_s$), Sand/Silt/Clay %, Bulk Density ($g/cm^3$), Porosity, Moisture %, Permeability, Cohesion ($c$), Friction Angle ($\phi$), Liquid Limit ($LL$), Plastic Limit ($PL$), Foundation Depth ($D_f$), Water Table Depth, and SPT $N$-Value.
* **Terzaghi Bearing Capacity Engine**: Computes Safe Bearing Capacity ($q_{safe}$ in $kN/m^2$) with Factor of Safety $FOS = 3.0$.
* **Hero Building Floor Simulator**: Interactive visual building stacker simulating safe structural floor capacity ($G+N$).
* **Dynamic Foundation Recommendation**: Automatically selects between **Isolated Column Footings**, **Strip Footings**, **Raft/Mat Foundations**, **Deep Piles**, or **Rock Anchor Footings** based on soil shear strength and plasticity.
* **Target Construction Floor Advisor**: Enter any target floor count (e.g. 4 floors) to get custom feasibility certification and specific footing dimensions.

### 🌾 2. Precision Agriculture & Agronomy
* **45+ Plant Database**: Covers 18 Crops, 14 Vegetables, and 13 Fruits (`soilDatabase.js`).
* **NPK Fertilizer Dosage Calculator**: Computes exact Urea (46% N), DAP (18% N, 46% $P_2O_5$), and MOP (60% $K_2O$) bags (50kg) required per hectare.
* **Soil Health Score & Radar Chart**: Visualizes nutrient balance against optimal target curves.
* **Categorized Suitability Rankings**: Ranks top crops, vegetables, and fruits with suitability percentages.

### 🤖 3. AI Assistant with Natural Language Auto-Filling
* **Raw Text Parameter Parser**: Paste unformatted soil test results into the chatbot to automatically populate all application input forms across Geotechnical and Agriculture modules.
* **One-Click Action Buttons**: Direct navigation to Geotechnical tab, Agriculture tab, or PDF report generation directly from chat responses.

### 📄 4. Certified White Executive PDF Report
* Official letterhead layout with GPS location stamp, 17-parameter audit table, geotechnical foundation box, custom target floor advisory, precision fertilizer schedule, and certified sign-off stamp.

### 📱 5. Multi-Platform Support (Web, PWA, Android APK)
* Progressive Web App (PWA) support with offline service workers.
* Integrated **Capacitor Android** configuration for compiling native `.apk` files for Android smartphones.

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0 or higher)
* [npm](https://www.npmjs.com/) (v9.0 or higher)

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/muthu-16/geocrop-ai.git

# 2. Navigate to project directory
cd geocrop-ai

# 3. Install dependencies
npm install
```

### Running Locally
```bash
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** (or `http://localhost:3001/`) in your browser.

---

## 📱 Building Native Android App (.apk)

This project uses **Ionic Capacitor** for cross-platform Android builds:

```bash
# 1. Build web production bundle
npm run build

# 2. Sync web assets with Capacitor Android
npx cap sync android

# 3. Open project in Android Studio to build APK
npx cap open android
```
*(In Android Studio, click **Build > Build Bundle(s) / APK(s) > Build APK(s)** to generate `app-debug.apk`)*

---

## 🛠️ Technology Stack

| Domain | Technology |
| :--- | :--- |
| **Frontend UI** | React 18, Vite 5, Tailwind CSS |
| **Icons & Charts** | Lucide React, Recharts |
| **PDF Engine** | jsPDF, html2canvas |
| **Native Mobile** | Capacitor Android 6 |
| **Localization** | Dual Language (English & தமிழ்) |

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
