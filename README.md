
# 🛡️ Privacy Knight

> A Chrome extension that **monitors websites for login forms and privacy-related policies**, giving you real-time insights into how your data might be handled.

---
## 📚 Index

- [🚀 Features](#-features)
- [🔧 How It Works](#-how-it-works)
- [📦 Tech Stack](#-tech-stack)
- [🔧 Installation](#-installation)
  - [📦 Prerequisites](#-prerequisites)
  - [🚀 1. Clone the Project](#-1-Clone-the-Project)
  - [🔄 2. Install Dependencies](#-2-install-dependencies)
  - [🟢 3. Run the Backend](#-3-run-the-backend)
  - [🧩 4. Web Extension Setup](#-4-web-extension-setup)
- [📜 License](#-license)

---
## 🚀 Features

- 🔐 Detects **login forms** across any website
- 📜 Identifies links to **privacy policies**, **terms of service**, and other legal pages
- 📡 Sends this data to a **Go backend server** for processing and analysis
- 📊 Displays live stats inside a slick, popup-based UI
- 🔄 Real-time updates using **Chrome Extension Messaging API**

---

## 🔧 How It Works

1. **Content Script** scans every page you vist for:
   - Login forms (`<input type="password">`)
   - Privacy-related links (e.g., `/privacy`, `/terms`)
2. **Background Service Worker**:
   - It queues and throttles the data from pages you visit
   - Sends it to the Go backend (`/monitor`)
   - Maintains extension state (active/paused)
3. **Go Backend (Gin + Colly)**:
   - removes duplicates entries using policy link hashes
   - Scrapes the text from linked policy pages encountered
   - Maintains a stack of the sites you’ve visited and scanned
4. **Popup UI**:
   - Shows you how many login forms and policy links were found
   - Lets you toggle monitoring on or off
   - Displays the last URL you scanned for quick reference

---

## 📦 Tech Stack

| Layer             | Technology               |
|------------------|--------------------------|
| 🧠 Extension Core | JavaScript (Manifest V3) |
| 🧼 UI             | HTML + CSS (Popup)       |
| 🔙 Backend        | Go (Gin + Colly)         |
| 📡 Messaging      | Chrome Extension APIs    |

---
## 🔧 Installation

### 📦 Prerequisites


- **Go (1.18 or higher)** – [https://golang.org/dl/](https://golang.org/dl/)
- **Google Chrome** or **Chromium**
---

### 🚀 1. Clone the Project
```bash
git clone https://github.com/mathushuthanans/shiny-barnacle.git

git clone https://github.com/mathushuthanans/cybersecurity-project-extension.git

cd shiny-barnacle
```
### 2. Install dependecies
```bash
go mod tidy
```
### 3. Run the backend
```bash
go run main.go
```

### 4. Web extension setup

1.Open Chrome and go to chrome://extensions/

2.Enable Developer mode (top-right toggle)

3.Click Load unpacked

4.Select the folder containing manifest.json









