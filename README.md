# TypeFlow 🚀

![TypeFlow Banner](public/github-banner.png)

TypeFlow is a professional-grade typing experience built with Next.js, focusing on speed, security, and world-class support for the Khmer language.

## ✨ Key Features

- **⚡ High Performance**: Ultra-fast typing experience with zero latency and batched server-side data fetching.
- **🛡️ Anti-Cheat Security**: Multi-layered protection using event trust validation, consistency entropy analysis, and realistic WPM thresholds.
- **🇰🇭 Elite Khmer Support**: 100% accurate grapheme cluster rendering, caret positioning, and a curated pool of 100+ native words.
- **📊 Real-time Analytics**: Live WPM, accuracy, and consistency tracking with interactive performance charts.
- **🏆 Global Leaderboards**: Categorized rankings (Daily, Weekly, All-Time) with unverified score filtering.
- **🤝 Social Features**: Built-in referral system with unique invite links and achievement tracking.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Auth**: [NextAuth.js](https://next-auth.js.org/)
- **Styling**: Vanilla CSS & TailwindCSS (hybrid)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Store**: [Zustand](https://zustand-demo.pmnd.rs/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Bun](https://bun.sh/) or [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/earhengleap/typeflow.git
   cd typeflow
   ```

2. Install dependencies:
   ```bash
   bun install
   # or
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=your_postgresql_url
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Push the schema:
   ```bash
   bunx drizzle-kit push
   ```

5. Run the development server:
   ```bash
   bun dev
   # or
   npm run dev
   ```

## 🔒 Security

We take platform integrity seriously. Our security engine monitors for:
- Programmatic input (Bots)
- Paste injection
- Impossible typing patterns
- Perfectly consistent rhythms

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
