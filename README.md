# 🚀 Feedana - Anonymous Feedback Platform

<div align="center">


[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Solana](https://img.shields.io/badge/Solana-Blockchain-green.svg)](https://solana.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-orange.svg)](https://supabase.com/)
[![IPFS](https://img.shields.io/badge/IPFS-Distributed_Storage-yellow.svg)](https://ipfs.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-38B2AC.svg)](https://tailwindcss.com/)

![Feedana Preview](./public/assets/images/readme.png)
**Anonymous feedback collection without the politics - no registration, no retaliation**

[🌐 Live Demo](https://feedana.top) | [📚 Documentation](#🎨-architecture) | [🤝 Contributing](#🤝-contributing)

</div>

---

## 📖 Table of Contents

- [🌟 Overview](#🌟-overview)
- [✨ Key Features](#✨-key-features)
- [🏗️ Architecture](#🎨-architecture)
- [🛠️ Tech Stack](#🛠️-tech-stack)
- [🤝 Contributing](#🤝-contributing)
- [📄 License](#📄-license)

---

## 🌟 Overview

**Feedana** is a decentralized feedback platform that empowers users to collect valuable feedback effortlessly. Built on the Solana blockchain with IPFS for distributed storage, it ensures complete anonymity and censorship resistance while maintaining data integrity.

### 🎯 Mission

Create a feedback ecosystem where honest opinions can be shared without fear of retaliation, enabling organizations and individuals to receive authentic insights for continuous improvement.

---

## ✨ Key Features

### 🔒 **Complete Anonymity**
- No user registration required
- Anonymous feedback submissions
- Privacy-first design philosophy
- Zero personal data collection

### ⚡ **Lightning Fast**
- Built on Solana for sub-second transactions
- Real-time feedback updates
- Instant board creation and sharing
- Live feedback counter system

### 🌍 **Decentralized & Censorship-Resistant**
- IPFS for distributed data storage
- Blockchain-based board ownership
- No single point of failure
- Immutable feedback records

### 🎨 **Beautiful & Intuitive**
- Modern, responsive design
- Interactive animations with GSAP
- Glass morphism UI elements
- Mobile-first approach

---

## 🏗️ Architecture

### System Overview

```mermaid
flowchart TB
    subgraph Frontend["Frontend Layer"]
        UI[React Application]
        Wallet[Solana Wallet Adapter]
    end
    
    subgraph Blockchain["Blockchain Layer"]
        Solana[Solana Network]
        Anchor[Anchor Program]
        PDA[Program Derived Accounts]
    end
    
    subgraph Storage["Storage Layer"]
        IPFS[IPFS Network]
        Supabase[Supabase Database]
    end
    
    subgraph Services["Services"]
        API[Supabase API]
        IPFS_Service[IPFS Service]
        Anchor_Service[Anchor Service]
    end
    
    UI --> Wallet
    UI --> API
    UI --> IPFS_Service
    UI --> Anchor_Service
    
    Wallet --> Anchor
    Anchor_Service --> Anchor
    
    API -.->|Board Metadata| Supabase
    IPFS_Service -.->|Board Data and Feedbacks| IPFS
    Anchor -.->|Transactions| Solana
    Anchor -.->|Board Metadata| PDA
```

### Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Wallet
    participant IPFS
    participant Solana
    participant Supabase
    
    Note over User, Supabase: Board Creation Flow
    User->>Frontend: Create Board
    Frontend->>Wallet: Request Connection
    Wallet->>Frontend: Wallet Connected
    Frontend->>IPFS: Create Board File
    IPFS->>Frontend: Board Created
    IPFS->>Frontend: IPFS CID
    Frontend->>Solana: Add Board Metadata Onchain
    Solana->>Frontend: Transaction Successful
    Frontend->>Supabase: Store Board Metadata in DB
    Supabase->>Frontend: Board Saved
    
    Note over User, Supabase: Feedback Submission Flow
    User->>Frontend: Submit Feedback
    Frontend->>IPFS: Fetch Board Data
    IPFS->>Frontend: Current Data
    Frontend->>IPFS: Upload Updated Data
    IPFS->>Frontend: New CID
    Frontend->>Solana: Update CID Onchain
    Solana->>Frontend: Transaction Successful
    Frontend->>Supabase: Update Board CID
    Supabase->>Frontend: Updated
```

Feedana follows a decentralized architecture with three core layers:

### Frontend Layer
- **React Application** - Modern React 18 with hooks and component-based architecture
- **Wallet Integration** - Solana wallet adapter for seamless Web3 connectivity
- **State Management** - Redux Toolkit for global application state

### Blockchain Layer
- **Solana Network** - High-performance blockchain for board ownership and transactions
- **Anchor Program** - Smart contract framework for program logic
- **Program Derived Addresses (PDAs)** - Deterministic accounts for board management

### Storage Layer
- **IPFS Network** - Distributed storage for feedback data and board content
- **Pinata Service** - Reliable IPFS pinning for data availability
- **Supabase Database** - Real-time database for metadata and board indexing

### Service Integration
The application integrates these layers through dedicated service modules:
- `supabaseApi.js` - Database operations and board management
- `ipfsService.js` - IPFS operations for distributed storage
- `anchorService.js` - Solana blockchain interactions

---

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0** - Modern React with hooks and concurrent features
- **Vite** - Lightning-fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **GSAP** - Professional-grade animations
- **React Router** - Client-side routing
- **React Hook Form** - Performant forms with easy validation

### Blockchain & Web3
- **Solana Web3.js** - Solana blockchain interaction
- **Anchor Framework** - Solana program development
- **Wallet Adapter** - Universal wallet connection
- **@coral-xyz/anchor** - TypeScript client for Anchor programs

### Storage & Backend
- **Supabase** - PostgreSQL database with real-time subscriptions
- **IPFS** - Distributed file storage

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### Contribution Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure responsive design

### Areas for Contribution
- 🐛 Bug fixes and improvements
- ✨ New features and enhancements
- 📚 Documentation improvements
- 🎨 UI/UX enhancements
- 🔧 Performance optimizations

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for the future of anonymous feedback**

[⭐ Star this repo](https://github.com/0xsouravm/feedana-ui) | [🐛 Report Bug](https://github.com/0xsouravm/feedana-ui/issues) | [💡 Request Feature](https://github.com/0xsouravm/feedana/issues)

</div>
