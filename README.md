## P2P Platform v2 (p2p\_v2)

A decentralized, offline-first peer‑to‑peer platform for academic collaboration among students at Strathmore University.

---

### 📚 Project Overview

**P2P Platform** is a React + Vite application that enables:

* Real‑time and offline messaging using Socket communication and IndexedDB (via Dexie.js).
* Discussion forums for peer support and group study sessions.
* A decentralized marketplace for student services, goods, and mentorship.
* User authentication and data sync through Firebase, with debug logging.

### 🔧 Tech Stack

* **Framework & Bundler:** React, Vite
* **Styling:** Tailwind CSS
* **Authentication & Sync:** Firebase Auth & Firestore
* **Offline Storage:** Dexie.js (IndexedDB)
* **Socket Communication:** Node.js socket.io (lab environment)
* **State Management:** React Context API

### 🗂 Repository Structure

```
├── public               # Static assets
│   ├── logo.png
│   └── static/          # Client JS, main bundle, logos
├── src                  # Application source
│   ├── assets           # SVGs and images used in components
│   ├── components       # Reusable UI components (Chat, Sidebar, UI kit)
│   ├── context          # React Context providers (Auth, Theme)
│   ├── layouts          # Layout wrappers (MainLayout)
│   ├── pages            # Route-able pages (Forum, Marketplace, Mentorship, etc.)
│   ├── services         # Firebase config, Dexie DB, MessageService
│   ├── styles           # Component/page-specific CSS
│   ├── App.jsx          # Root component with Router
│   └── main.jsx         # Entry point
├── README.md            # Project documentation
└── tailwind.config.js   # Tailwind CSS configuration
```

### 🚀 Getting Started

1. **Clone the repo**

   ```bash
   git clone https://github.com/Vince106888/p2p_v2.git
   cd p2p_v2
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   * Copy `.env.example` to `.env` and fill in your Firebase config and socket server URL.

4. **Run in development mode**

   ```bash
   npm run dev
   ```

5. **Build for production**

   ```bash
   npm run build
   ```

---

### 🔮 Future Roadmap

* Implement full offline change queueing and conflict resolution.
* Integrate NFT-based campus passes and credentialing.
* Add decentralized event planning (student DAOs).
* Enhance marketplace with secure payments or token-based system.
* Mobile-friendly PWA support.

---

### 🤝 Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feat/my-feature`).
3. Commit your changes (`git commit -m "feat: add ..."`).
4. Push to the branch (`git push origin feat/my-feature`).
5. Open a Pull Request and describe your changes.

---

### 📄 License

This project is licensed under the MIT License.
