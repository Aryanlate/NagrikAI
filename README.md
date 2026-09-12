# 🏛️ NagrikAI — AI-Powered Civic Complaint Intelligence

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

**NagrikAI** is a smart civic complaint management platform designed to bridge the gap between citizens and local government. Built during a 24-hour hackathon, it uses an AI-driven intake system (acting as the "Brain") to extract actionable data from natural language complaints, route them to the correct department, and enforce Service Level Agreements (SLAs) through a dedicated staff command center.

---

## 🚀 Key Features

### 👤 For Citizens (AI Intake Assistant)
*   **Natural Language Processing:** Citizens simply describe their issue in plain text.
*   **Smart Clarification Loop:** The AI detects missing critical information (like location) and actively asks the citizen for clarification before submitting.
*   **Instant Categorization:** Automatically assigns the correct department, urgency level, and expected resolution timeframe (SLA).

### 👨‍💼 For Municipal Staff (Command Center)
*   **Triage Dashboard:** A data-dense, real-time view of all active civic issues.
*   **Urgency Routing:** Strict traffic-light color coding (Red = Critical, Amber = High/Medium, Green = Low).
*   **Automated SLA Tracking:** Simulates SLA deadlines, automatically flagging breached tickets in red and unlocking escalation actions.

### 🧠 Backend AI & Logic (The Brain)
*   **Automated SLA Enforcement:** Uses mapped categories to calculate SLA deadlines. Tickets past their deadline are flagged for frontend escalation.
*   **Edge Case Handling:** Prompt logic is designed to navigate multi-issue complaints, handle vague/sarcastic tones, and automatically boost urgency if escalation language is detected.

---

## 🏗️ Architecture & Tech Stack

NagrikAI is built on a decoupled architecture, separating the client-side interface from the AI processing engine.

*   **Frontend:** React, Vite, Tailwind CSS, Lucide Icons, Chart.js
*   **Backend:** FastAPI, Python
*   **Database:** SQLite (Lightweight, zero-config for rapid prototyping)
*   **AI Engine:** Google Gemini API (Information extraction and classification)

---

## 📂 Backend Project Structure

Based on our separation of concerns, the backend is modularized into four core files:
*   `main.py`: The FastAPI application server, CORS configuration, and route definitions.
*   `ai_engine.py`: Contains the extraction prompts and the Google Gemini API call functions.
*   `database.py`: Handles the SQLite connection and the `insert_ticket()` execution.
*   `constants.py`: Stores the ticket JSON schema and the `DEPARTMENTS` dictionary (mapping fixed categories to departments and SLA hours).

---

## 🔌 API Contract

The frontend and backend communicate exclusively through these three core endpoints:

| Method | Endpoint | Request Body | Response / Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/analyze` | `{"text": "..."}` | Analyzes a new complaint. Returns a finalized ticket JSON. If critical info is missing, returns a `clarification_question`. |
| `POST` | `/api/clarify` | `{"original_text": "...", "reply": "..."}` | Merges original text with user's reply, re-runs extraction, and returns updated ticket JSON. |
| `GET` | `/api/tickets` | N/A | Fetches the array of active tickets from the SQLite database, including SLA status, for the staff dashboard. |

---

## 🛠️ Local Setup & Installation

To run NagrikAI locally, you will need two terminal windows to run the frontend and backend concurrently.

### 1. Prerequisites
*   Python 3.8+
*   Node.js & npm (or yarn/pnpm)

### 2. Start the FastAPI Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install fastapi uvicorn google-generativeai
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
