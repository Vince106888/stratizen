# Stratizen 🧠🔥

**Empower the Campus. Shape the Future.**

Stratizen is a decentralized, offline-first peer-to-peer platform for academic collaboration, peer support, and student-driven innovation at **Strathmore University**.

It’s built to **connect students**, **decentralize resources**, and foster **a thriving campus economy and learning network**.

---

## 📚 Project Overview

Stratizen enables:

- 🔐 **User Authentication and Profile Management** via Firebase.
- 💬 **Real-time and Offline Messaging** using [Socket.io](http://socket.io/) and IndexedDB (Dexie.js).
- 🧠 **Discussion Forums and Study Groups** for academic collaboration.
- 🛒 **Student Marketplace** for services, products, and mentorship.
- 🚀 **Decentralized Innovation Hub** to support student-led projects.
- 🗂️ **Resource Library** for shared academic materials.

---

## 🔧 Tech Stack

- **Framework & Bundler:** React + Vite
- **Styling:** Tailwind CSS
- **Authentication & Data Sync:** Firebase (Auth & Firestore)
- **Offline Storage:** Dexie.js (IndexedDB)
- **Real-Time Communication:** Node.js + [Socket.io](http://socket.io/) (local lab)
- **State Management:** React Context API

---

## 🗂 Repository Structure

```
├── public               # Static assets
│   ├── logo.png
│   └── static/          # Client JS, main bundle, logos
├── src                  # Application source
│   ├── assets           # SVGs and images used in components
│   ├── components       # Reusable UI components (Chat, Sidebar, ResourceCard, etc.)
│   ├── context          # React Context providers (Auth, Theme)
│   ├── layouts          # Page layout structures
│   ├── pages            # Route-able pages (Forum, Marketplace, Mentorship, Dashboard, etc.)
│   ├── services         # Firebase config, Dexie DB, MessageService
│   ├── styles           # Page-specific CSS files
│   ├── App.jsx          # Root component with Router
│   └── main.jsx         # App entry point
├── README.md            # Project documentation
└── tailwind.config.js   # Tailwind CSS configuration
```

## 🚀 Getting Started

1. Clone the Repository
git clone <https://github.com/Vince106888/stratizen.git>
cd stratizen

2. Install Dependencies
npm install

3. Configure Environment
Create a .env file with your Firebase project configuration and socket server URL.

4. Run in Development Mode
npm run dev

5. Build for Production
npm run build

## 🔮 Future Roadmap

✅ Full offline change queueing and conflict resolution
✅ NFT-based campus passes and credentialing
✅ Decentralized event planning and student DAOs
✅ Token-based student marketplace with secure payments
✅ Mobile-friendly PWA deployment
✅ Expansion to other universities (multi-campus support)

## 💡 Project Vision

Stratizen is more than a platform — it’s a student movement.

We aim to:

Decentralize access to academic and economic resources.
Empower students to support each other through peer-driven solutions.
Build a scalable system that can integrate blockchain, tokenized incentives, and decentralized governance (DAOs) in future versions.

Every student is a citizen of Stratizen — a builder, a collaborator, and an innovator.

## 🤝 Contributing

We welcome contributions from the student community!

How to Contribute:
Fork the repository.

Create a feature branch:

git checkout -b feat/my-feature
Commit your changes:

git commit -m "feat: add my new feature"
Push to GitHub:

git push origin feat/my-feature
Open a Pull Request and describe your changes.

### 📄 License

This project is licensed under the MIT License – free to use and build upon.

### 📫 Contact

For collaborations, contributions, or feedback:
Email: vincent.nyamao@strathmore.edu
GitHub: Vince106888
