# 🚀 SMART_FIX

SmartFix transforms traditional maintenance systems into intelligent, AI-powered service platforms.  
By simply uploading an image, users can instantly detect issues and get connected with the right technician—eliminating delays, reducing manual effort, and delivering faster, smarter service experiences.

---

## 🛠️ Requirements

- **OS:** Windows 10/11 (macOS/Linux supported with equivalent commands)
- **Git:** 2.40+
- **Node.js:** v20 LTS (recommended)
- **npm:** Comes with Node.js
- **Python:** 3.11.x (recommended)
- **MongoDB Server:** 8.2.x (Community Edition)

---

## 🤖 AI Service Dependencies

Install the following Python packages:

```bash
pip install flask==3.1.0 tensorflow==2.21.0 pillow==11.1.0 numpy
```

---

## 📦 Project Setup & Run

### 🔹 1. Backend (Terminal 1)

```bash
cd /d "...\SMART FIX\smartfix\backend"
copy .env.example .env
npm install
npm run dev
```

---

### 🔹 2. AI Service (Terminal 2)

```bash
cd /d "...\SMART FIX\smartfix\ai-service"
python -m venv .venv
.\.venv\Scripts\activate

pip install --upgrade pip
pip install flask==3.1.0 tensorflow==2.21.0 pillow==11.1.0 numpy

python app.py
```

---

### 🔹 3. Frontend (Terminal 3)

```bash
cd /d "...\SMART FIX\smartfix\frontend"
python -m http.server 5500
```

---

## 🌐 Run the Application

Open your browser and go to:

```
http://localhost:5500/index.html
```

---

## ⚡ Features

- 📸 Image-based issue detection using AI  
- 🔍 Instant problem identification  
- 🧑‍🔧 Smart technician matching  
- ⚡ Faster and automated service workflow  

---

## 🧠 Tech Stack

- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js, Express  
- **AI Service:** Flask, TensorFlow  
- **Database:** MongoDB  

---

## 📌 Notes

- Ensure MongoDB server is running before starting the backend.
- Use Node.js v20 LTS for best compatibility.
- Python virtual environment is recommended for AI service.

---
