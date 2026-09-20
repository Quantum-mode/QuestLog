This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


About the web application:

QuestLog: RPG-Style Daily Task Management
QuestLog is a full-stack, responsive web application that gamifies everyday productivity. By transforming mundane tasks into RPG "quests," users earn Experience Points (XP), level up, accumulate gold, and customize their profiles with dynamic visual effects.
This document serves as a comprehensive overview of the platform's architecture, functionality, gamification mechanics, and security protocols.

Core Functionality
1. The Quest Board (Task Management)
The core of the application is a daily task tracker that treats to-do items as quests.
 * Smart Difficulty Evaluation: Tasks are automatically parsed using regex keywords to determine difficulty.
   * Hard (50 XP): Keywords like project, exam, presentation, build.
   * Medium (25 XP): Keywords like study, workout, read, cook.
   * Easy (10 XP): Default fallback for standard tasks.
 * Timeline Navigation: Users can navigate between days to view past achievements or plan future quests, though adding tasks to past days is restricted to prevent exploiting the streak system.
 * Interactive UI: Tasks can be reordered seamlessly using drag-and-drop functionality powered by Framer Motion. Completed tasks are visually struck through and moved down the visual hierarchy.
2. RPG Progression System (Profiles)
Every user is a "Hero" whose profile grows as they remain productive.
 * Dynamic Leveling Algorithm: The required XP to reach the next level scales non-linearly using the formula 93 \times \text{Level}^{1.5}.
 * Gold Economy: Leveling up rewards the user with Gold. The higher the level achieved, the higher the gold payout (scaling from 100 to 650+ coins).
 * Active Streaks: The system tracks consecutive days of activity. Failing to log in and complete tasks resets the streak, encouraging daily retention.
 * Level-Up Celebrations: Hitting a new level triggers an immersive UI takeover with canvas confetti, screen dimming, and animated reward reveals.
3. The Marketplace & Customization
Users spend their hard-earned Gold to personalize their presence on the platform.
 * Avatars: Unlockable emoji-based avatars ranging from "Novice" to "Emperor."
 * VFX Borders: Users can purchase complex, animated CSS visual effects to frame their avatars. These range from simple colored rings (Squire Square) to complex CSS animations (Shooting Stars, Black Hole, Atom, and Flow). Custom color pickers allow further personalization for specific borders.
4. Hall of Fame (Global Leaderboard)
A competitive social element that displays the top 10 most productive users globally.
 * Ranking: Users are ranked first by Level, then by total XP.
 * Live Preview: The leaderboard displays each user's current streak, equipped avatar, and custom VFX border in real-time.

Security, Safety Profiles & Authentication
QuestLog is built with a security-first approach, leveraging Supabase Auth to ensure user data remains private and protected.
Authentication & Account Integrity
 * Strict Email Verification: Accounts cannot be accessed until the user verifies their email address. The application actively intercepts unverified logins and forces a redirect.
 * Secure Password Handling: Passwords are never stored in plain text. Supabase handles cryptographic hashing, and the platform supports secure password reset flows via email magic links.
 * Dual-Verification Email Changes: If a user attempts to change their email address, the system requires confirmation links to be clicked from both the old and the new email inboxes before the change is applied, preventing account hijacking.
 * Rate Limiting: Authentication endpoints and email change requests are protected by rate-limiting algorithms to prevent spam and brute-force attacks.
Data Privacy & Safe Deletion
 * Row Level Security (RLS): Database tables (Profiles, Tasks) must be secured via PostgreSQL RLS policies, ensuring that users can only query, update, or delete their own specific user_id rows.
 * The "Danger Zone" (Permanent Deletion): Users maintain full sovereignty over their data. The platform features a secure account deletion protocol. To delete an account, the user must re-authenticate by typing their password. This triggers a custom PostgreSQL RPC (Remote Procedure Call) named delete_user, which bypasses standard soft-deletes and permanently wipes the user's authentication record, profile data, and entire quest history from the database.

Technical Architecture & UI/UX
QuestLog is built on a modern, high-performance web stack designed for fluid interactions and cross-device compatibility. The frontend relies on Next.js (App Router) for React-based UI construction and optimized routing, paired with Supabase on the backend to handle PostgreSQL database management, Row Level Security, and secure authentication. Tailwind CSS drives the utility-first, responsive styling, enabling deep customization for the platform's dual themes. To bring the gamified elements to life, Framer Motion powers fluid drag-and-drop task reordering and modal animations, while pure CSS and Canvas render performant visual effects like animated avatar borders and dynamic level-up confetti.

UI/UX Highlights
 * Fully Responsive: The dashboard layout transitions from a wide-screen multi-column grid into a sleek, vertical stack on mobile devices. Navigation menus automatically collapse into icon-only bottom bars or space-saving sidebars based on screen real estate.
 * Theme Engine: A robust dark/light mode toggle that goes beyond simple background color changes. The theme engine updates shadow intensities, input border transparencies, and background textures to maintain perfect contrast and readability in both environments.
 * Optimistic UI: Actions like checking off a task, purchasing an item, or updating a profile name update the UI instantaneously while the Supabase network requests process in the background, ensuring a zero-latency feel for the user. Loading states ("Sending email...") are reserved only for critical security actions.

