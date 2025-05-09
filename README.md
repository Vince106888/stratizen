# P2P Platform V2
🎓 P2P Student Platform v2
A decentralized, offline-resilient peer-to-peer platform empowering students through social learning, micro-mentorship, self-promotion, and community-driven support — built by students, for students.

🌍 Starting with Strathmore University and scaling globally.

🚀 Overview
P2P Student Platform v2 is a reimagined version of our initial MVP — focused on scalability, offline capabilities, decentralized infrastructure, and enriched student experience design. Our mission is to address real pain points students face on campus:

Academic isolation and burnout

Lack of affordable mentorship and learning resources

Financial pressure with few means to earn on campus

Inadequate social discovery and community engagement tools

This project provides:

📚 A platform for peer-to-peer learning and group support

🛒 A student marketplace to sell services/products

💬 A forum system to engage in decentralized problem-solving

👥 A reputation-based social discovery engine

🛰️ A system designed to work offline-first, with data syncing when online

Eventually, it aims to evolve into a DAO-powered ecosystem, with NFT experiences, decentralized credentials, and identity-anchored incentives.

🧱 Tech Stack
A breakdown of the technologies and tools that power the system:

Layer	Tool/Library	Purpose
Frontend	React + Vite + TailwindCSS	Fast UI rendering, component architecture, responsive design
Routing	React Router DOM	SPA-style navigation between components/pages
State Mgmt	React Context + IndexedDB	Local state plus durable, persistent offline storage
Offline DB	Dexie.js (IndexedDB wrapper)	Handles client-side offline storage with syncing capabilities
Auth	Firebase Authentication	Email/password-based login and user sessions
Database	Firestore	NoSQL database for user profiles, forums, and posts
Storage	Firebase Storage	Avatar and file uploads
Hosting	GitHub Pages / Static Hosting	Simple hosting for frontend development and testing
Future	IPFS / Smart Contracts	(Planned) Decentralized identity, content delivery, and campus DAOs

📁 Project Structure
Organized for clean separation between static and dynamic components, making it easier to contribute or scale.

graphql
Copy
Edit
p2p_v2/
│
├── public/                     # Static HTML for fallback or initial load
│   ├── auth.html               # Authentication entry point
│   ├── profile.html            # Profile editing static version
│   ├── dashboard.html          # Static dashboard (fallback)
│
├── src/                        # React source code
│   ├── components/             # UI Components (forms, cards, navs)
│   ├── pages/                  # Route-bound React pages
│   ├── utils/                  # Helper functions, Firebase/Dexie wrappers
│   └── App.jsx                 # Root React Component
│
├── index.html                  # SPA entry
├── vite.config.js              # Vite dev config
├── package.json
└── README.md
🔐 Firebase Configuration
Ensure your Firebase project is set up correctly. Place the following in a .env or firebaseConfig.js file:

js
Copy
Edit
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-msg-id",
  appId: "your-app-id"
};
Firebase Modules Used:
Authentication: Email/Password enabled

Firestore: Used to store user profiles, forums, and marketplace data

Storage: For avatars and student product images

✨ Features
🧑‍🎓 Auth & Profile
Secure sign-up/login via Firebase

Realtime authentication state sync

Custom student profile with bio, course, avatar

Offline data persistence (via IndexedDB)

🗣️ Forum (WIP)
Post questions, ideas, problems

Peer-to-peer upvoting and support

Local cache with online sync

🧑‍🤝‍🧑 Group Learning (Planned)
Study group discovery

Mini classroom/DAOs

Role-based permissions for facilitators

🛍️ Marketplace (Planned)
Sell services (e.g., tutoring, hairdressing)

Buy/sell books and secondhand items

Profile-linked storefronts

🌐 Offline Support (Core Feature)
Powered by Dexie.js + IndexedDB

Local caching for profiles, forums, groups

Seamless sync once online

🛠 Setup Instructions
🧪 Local Development
Clone and run the dev server:

bash
Copy
Edit
git clone https://github.com/Vince106888/p2p_v2.git
cd p2p_v2
npm install
npm run dev
🌐 Static HTML Testing (for offline/fallback HTML)
Use Python or any local server:

bash
Copy
Edit
cd public
python3 -m http.server
Access: http://localhost:8000/profile.html

🧭 Roadmap
Phase	Features
✅ MVP	Auth, Profile Management, IndexedDB integration
🔄 Phase 2	Forum, Study Groups, Local Chat, Avatar Upload Optimization
🔜 Phase 3	Marketplace, Reputation System, Anonymous Peer Help
🔮 Phase 4	Blockchain-based DAOs, NFT Campus Badges, Decentralized ID, AI Tutoring Agents

🤝 Contributors
@Vince106888 — Lead Developer, System Architect

🚀 Seeking contributors in: UI/UX, Firebase, Web3, and Mobile PWA optimization

⚠️ Known Issues
🐢 Avatar upload can be slow on poor connections

🛠 Some IndexedDB sync states under test

🚧 Dashboard logic still integrating groups and forums

📜 License
Released under the MIT License.
Free to use, modify, and contribute. Attribution encouraged.
