# 🚀 CodeStatic — Supreme AI Code Architect

**Production-grade AI system for static code analysis, automated correction, and interview-level evaluation.**

🔗 **Live Demo:** [https://codestatic-tft0.onrender.com](https://codestatic-tft0.onrender.com)

CodeStatic is a **full-stack AI-powered code assessment platform** designed to mirror **real technical interview and senior-level code review workflows** .



It performs deep static analysis, identifies and explains errors, auto-corrects code, evaluates quality and integrity, detects plagiarism signals, and generates professional reports — all within a single, scalable system.

---

## 🧠 Why This Project Stands Out (Recruiter View)

✔ Solves a real engineering problem (not a demo or CRUD app)
✔ End-to-end ownership: UI → API → AI → DB → Reporting
✔ Mirrors real interview evaluation pipelines
✔ Clean, modular, production-minded architecture
✔ Practical AI system design (not prompt wrappers)

---

## ✨ Core Capabilities

### 🔍 Static Code Analysis Engine

* Syntax, logical, runtime, and edge-case detection
* Line-level error pinpointing with explanations
* Automatic programming language mismatch detection

### 🛠️ Automated Code Fixing & Standardization

* Generates corrected, compilable solutions
* Translates code into selected target languages
* Outputs interview-ready, standardized code

### 📊 Quality, Compliance & Integrity Checks

* Code Quality Score (0–100)
* Time & Space Complexity analysis
* Best-practice compliance validation
* Plagiarism and AI-generation risk indicators

### 🧠 Context-Aware AI Code Assistant

* Conversational AI bound to current code context
* Persistent chat history (DB-backed)
* Functions like a real interview mentor

### 🗂️ Project & Session Management

* Save, load, favorite, and delete projects
* SQLite-backed persistent storage
* Resume work across sessions

### 📄 Professional PDF Evaluation Reports

* One-click downloadable reports
* Includes:

  * Original submission
  * Fixed & standardized code
  * Critical error log
  * Complexity analysis
  * Line-by-line explanation

---

## 🖥️ Frontend Engineering

### Tech Stack

* HTML5
* TailwindCSS + Custom CSS
* Vanilla JavaScript
* FontAwesome

### UX Highlights

* Split-screen editor (submission vs analysis)
* Synchronized line numbers
* Dark / Light mode
* Resizable panels (desktop-grade UX)
* Real-time loading & evaluation states
* Interview-style evaluation dashboard

### Key Files

```
index.html   → Product landing page
tool.html    → Core assessment interface
style.css    → Custom theming & animations
script.js    → Editor logic & API orchestration
```

---

## ⚙️ Backend Architecture

### Stack

* Python (Flask)
* Google Gemini API (multi-model fallback)
* SQLite (thread-safe persistence)
* FPDF2 (professional report generation)

### Responsibilities

* AI orchestration with intelligent model fallback
* Secure REST API handling
* Persistent project & chat storage
* PDF report generation
* Static asset & template serving

### Key File

```
app.py → Complete backend (AI + DB + APIs + PDF engine)
```

---

## 🗃️ Database Design (SQLite)

### Tables

* `code_history` — Auto-saved code sessions
* `projects` — Named projects with favorites
* `ai_chat` — Persistent AI conversation logs

Designed with thread-safety and production stability in mind.

---

## 🔌 API Surface (High Level)

```
/                → Landing page
/logicprobe      → Code assessment tool
/process_code    → AI analysis pipeline
/ai_chat         → Context-aware AI assistant
/save-project    → Persist project
/projects        → Fetch saved projects
/generate_pdf    → Download evaluation report
```

---

## 📦 Setup & Installation

### 1️⃣ Clone Repository

```
git clone https://github.com/your-username/CodeStatic.git
cd CodeStatic
```

### 2️⃣ Install Dependencies

```
pip install -r requirements.txt
```

### 3️⃣ Configure Environment

Create `.env`:

```
GEMINI_API_KEY=your_api_key_here
```

### 4️⃣ Run Locally

```
python app.py
```

Open:

```
http://localhost:5000
```

---

## 🧪 What Interviewers Notice Immediately

✅ Strong system design thinking
✅ Real-world AI application (not wrappers)
✅ Production-ready frontend & backend
✅ Clean data flow & persistence
✅ Clear problem–solution alignment

This project demonstrates **how modern engineers build AI-driven systems**, not just how they call APIs.

---

## 🏁 Final Note

CodeStatic is **not a tutorial project**.
It is a **portfolio-grade engineering system** aligned with real hiring standards.

> “This is the kind of project that drives deep technical discussion in interviews.”

---

## 👤 Author

**Aayush Thakur**
Full-Stack Engineer | AI-Focused Systems

---

⭐ If this repository impressed you or added value, consider starring it.
