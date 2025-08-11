# Stratizen 🧠🔥

**Empower the Campus. Shape the Future.**

Stratizen is a **decentralized, offline-first peer-to-peer platform** for academic collaboration, peer support, and student-driven innovation at **Strathmore University**.

It’s built to **connect students**, **decentralize resources**, and foster **a thriving campus economy and learning network**.

---

## 📚 Project Overview

Stratizen enables:

* 🔐 **User Authentication & Profile Management** — Secure sign-in and personalized profiles.
* 💬 **Real-time & Offline Messaging** — Chat and collaborate anytime.
* 🧠 **Discussion Forums & Study Groups** — Q\&A and knowledge sharing.
* 🛒 **Student Marketplace** — Buy, sell, and trade services & products.
* 🚀 **Innovation Hub** — Support for student-led projects.
* 🗂️ **Resource Library** — Shared academic materials.

---

## 🎯 Current MVP (v1.0)

**Live in `release/mvp-v1` branch & student testing**

This version includes:

* 🔐 **Firebase Auth** (Email/Password)
* 🧠 **StudyHub** — Forum & Q\&A
* 🛒 **Marketplace** — Basic listings
* 💬 **Messages** — Direct chat
* 🗂️ **Resource Library** — Upload & view files
* 📱 **Responsive UI** (desktop + mobile)

> Decentralization, DAO governance, NFT-based passes, and tokenized rewards are **planned for future releases**.

---

## 🔧 Tech Stack

* **Frontend:** React + Vite
* **Styling:** Tailwind CSS
* **Backend/Auth/DB:** Firebase (Auth, Firestore, Storage)
* **Offline:** Dexie.js (IndexedDB)
* **Real-Time Messaging:** Socket.io (lab testing)
* **State Management:** React Context API

---

## 🗂 Repository Structure

```
├── public               # Static assets
├── src                  # Application source
│   ├── assets           # SVGs/images
│   ├── components       # Reusable UI parts
│   ├── context          # State providers
│   ├── layouts          # Layouts
│   ├── pages            # Page views
│   ├── services         # Firebase/Dexie/Socket
│   ├── styles           # CSS files
│   ├── App.jsx          # Root component
│   └── main.jsx         # App entry
├── README.md            # Project documentation
└── tailwind.config.js   # Tailwind CSS config
```

---

## 🚀 Getting Started

**Clone & Install**

```bash
git clone https://github.com/Vince106888/stratizen.git
cd stratizen
npm install
```

**Configure Environment**

```env
# .env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_SOCKET_SERVER_URL=http://localhost:5000
```

**Run in Dev**

```bash
npm run dev
```

**Build for Production**

```bash
npm run build
```

---

## 🧪 How to Test Stratizen MVP

1. Visit: [https://stratizen.web.app](https://stratizen.web.app) *(after deployment)*
2. Sign up with your **Strathmore email**
3. Test features:

   * Post in StudyHub
   * Upload a resource
   * Add a marketplace listing
   * Send a message
4. Give feedback via the [Feedback Form](#)

---

## 🔮 Roadmap

📅 **Next Releases**

* IPFS storage for decentralized resources
* DAO governance & tokenized rewards
* NFT-based campus passes
* Mobile-first PWA deployment
* Multi-campus network

---

## 💡 Vision

Stratizen is more than a platform — it’s a **student movement** to:

* Decentralize access to academic & economic resources
* Enable peer-driven problem solving
* Build scalable, self-governing student communities

---

## 🤝 Contributing

We welcome contributions from students & the open-source community!

**Branching Model**

* `main` — Development
* `release/mvp-v1` — Stable release for testing
* `feature/*` — New features

---

## 📄 License

MIT License — free to use, build, and improve.

---

## 📫 Contact

* **Email:** [vincent.nyamao@strathmore.edu](mailto:vincent.nyamao@strathmore.edu)
* **GitHub:** [Vince106888](https://github.com/Vince106888)
