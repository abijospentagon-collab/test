# Sorted OS 🏫
> Next-generation hands-free Preschool SaaS Panel & Voice Assistant.

**Sorted OS** is a premium school administration dashboard integrated with an advanced Natural Language Processing (NLP) Voice Assistant that supports English, Indian English, and Tamil commands. 

---

## 🌟 Key Features

* **🎙️ Voice Assistant**: Mark attendance, create chores/tasks, and add students hands-free using natural English or Tamil phrases (with spoken Tamil confirmation).
* **📊 Interactive Dashboard**: High-level telemetry covering attendance rates, low inventory warnings, and task progress.
* **📋 Task Boards**: Drag-and-drop styled Kanban board columns (To Do, In Progress, Completed) to delegate housekeeping chores to school support staff.
* **📦 Inventory Ledger**: Live material tracking with automatic red threshold reorder warnings.
* **📚 Curriculum Planner**: Dynamic lesson plan creator with one-click duplication and class filtering (LKG, UKG, Nursery, Play Group).
* **💬 Communication Panel**: Message templates, broadcast alerts to all parents, and active private chat threads.
* **👶 Children Check-Ins**: Interactive daily attendance register showing check-in states (Present, Absent, Half Day, Early Departure) synchronized with today's local date.

---

## 🛠️ Tech Stack

* **Frontend**: Vanilla HTML5, HSL CSS3 Variables, Glassmorphic UI theme, Lucide Icons, Vanilla JavaScript.
* **Backend**: PHP 8.x (Apache / PHP built-in server).
* **Database**: Flat-file JSON database (`db.json`) synced via REST API.
* **NLP AI Engine**: Groq Cloud API running `llama-3.3-70b-versatile` model.
* **TTS / STT**: Browser Web Speech API (`SpeechRecognition` & `SpeechSynthesis`).

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **PHP** installed (normally bundled with XAMPP or standalone).

### 2. Running Locally
Start the PHP server from the `UI` directory:
```bash
php -S localhost:5000
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.

---

## 🎤 Demo Voice Commands to Try:
Click the microphone icon on the bottom right and say:
* `"Abhi irukkan"` *(Marks Abhi Kumar present)*
* `"Aarav absent"` *(Marks Aarav Sharma absent)*
* `"add student Rachel"` *(Enrolls a student to LKG)*
* `"create a task for Ramesh to mop the dining area"` *(Assigns a task to Ramesh)*
* `"mark clean the washroom done"` *(Instantly completes washroom task)*
* `"go to students"` / `"open tasks"` *(Navigates views)*
