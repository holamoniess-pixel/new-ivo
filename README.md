<p align="center">
  <img src="src/assets/savvy-logo.png" alt="Savvy Logo" width="80" height="80" />
</p>

<h1 align="center">Savvy — AI-Powered Marketplace</h1>

<p align="center">
  <strong>A modern, full-featured e-commerce marketplace with AI-powered shopping assistance, dual buyer/seller experiences, and a beautiful responsive UI.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Savvy** is an AI-powered e-commerce marketplace that connects buyers and sellers through an intelligent, modern shopping experience. The platform features personalized AI recommendations, smart search, category browsing, real-time messaging, and a full seller dashboard — all wrapped in a polished, responsive UI built with accessibility and performance in mind.

---

## Features

### 🛍️ Buyer Experience
- **Homepage** — Curated trending products, new arrivals, and discounted items
- **AI Assistant** — Conversational AI shopping companion for personalized recommendations
- **Smart Search** — Full-text product search with real-time results
- **Category Browsing** — Organized product categories with dedicated listing pages
- **Product Details** — Rich product pages with images, descriptions, pricing, and seller info
- **Shopping Cart** — Persistent cart with quantity management and checkout flow
- **Order Tracking** — View and track order history and status
- **Messaging** — Direct communication with sellers
- **User Profiles** — Personalized profiles with order history and preferences

### 🏪 Seller Experience
- **Seller Dashboard** — Comprehensive dashboard with sales analytics and product management
- **Store Pages** — Customizable public storefront for each seller
- **Product Management** — Add, edit, and manage product listings
- **Order Management** — Track and fulfill incoming orders

### 🔐 Authentication
- **Dual-Role Registration** — Separate buyer and seller registration flows
- **Role-Aware Login** — Login with role selection and seamless navigation
- **Role Passthrough** — Selected role persists across login ↔ register navigation

### 🎨 UI/UX
- **Responsive Design** — Mobile-first, works seamlessly across all devices
- **Animated Transitions** — Smooth page and component transitions via Framer Motion
- **Product Ad Modals** — Promotional product popups for engagement
- **Design System** — Consistent theming with semantic design tokens and shadcn/ui

---

## Tech Stack

| Layer            | Technology                                                       |
| ---------------- | ---------------------------------------------------------------- |
| **Framework**    | [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| **Build Tool**   | [Vite 5](https://vitejs.dev)                                    |
| **Styling**      | [Tailwind CSS 3](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| **Routing**      | [React Router v6](https://reactrouter.com)                      |
| **State/Data**   | [TanStack React Query](https://tanstack.com/query)              |
| **Animations**   | [Framer Motion](https://www.framer.com/motion/)                 |
| **Forms**        | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| **Charts**       | [Recharts](https://recharts.org)                                |
| **Icons**        | [Lucide React](https://lucide.dev)                              |
| **Notifications**| [Sonner](https://sonner.emilkowal.dev)                          |
| **Testing**      | [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   App Shell                      │
│  ┌─────────────┐  ┌──────────┐  ┌────────────┐  │
│  │ AuthProvider │  │  Router  │  │ QueryClient│  │
│  └──────┬──────┘  └────┬─────┘  └─────┬──────┘  │
│         │              │               │         │
│  ┌──────▼──────────────▼───────────────▼──────┐  │
│  │               Page Components              │  │
│  │  Index · Login · Register · ProductDetails │  │
│  │  Cart · Search · Categories · Orders       │  │
│  │  AiAssistant · Messages · Profile          │  │
│  │  SellerDashboard · SellerStore             │  │
│  └──────────────────┬────────────────────────┘  │
│                     │                            │
│  ┌──────────────────▼────────────────────────┐  │
│  │           Shared Components               │  │
│  │  Navbar · ProductCard · ProductGrid       │  │
│  │  CategoryCard · LoadingSpinner            │  │
│  │  shadcn/ui (40+ components)               │  │
│  └──────────────────┬────────────────────────┘  │
│                     │                            │
│  ┌──────────────────▼────────────────────────┐  │
│  │             API Layer (lib/api.ts)        │  │
│  │  userApi · sellerApi · productApi         │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (or **bun** / **pnpm**)

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/savvy.git
cd savvy

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Project Structure

```
savvy/
├── public/                    # Static assets (favicon, robots.txt)
├── src/
│   ├── assets/                # Images & brand assets
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives (40+ components)
│   │   ├── Navbar.tsx         # Global navigation bar
│   │   ├── ProductCard.tsx    # Reusable product card
│   │   ├── ProductGrid.tsx    # Product grid layout
│   │   ├── CategoryCard.tsx   # Category display card
│   │   ├── ProductAdModal.tsx # Promotional ad modal
│   │   ├── LoadingSpinner.tsx # Loading state indicator
│   │   └── NavLink.tsx        # Navigation link component
│   ├── contexts/
│   │   └── AuthContext.tsx     # Authentication state & methods
│   ├── hooks/
│   │   ├── use-mobile.tsx     # Mobile breakpoint detection
│   │   └── use-toast.ts       # Toast notification hook
│   ├── lib/
│   │   ├── api.ts             # API client & endpoint definitions
│   │   ├── sampleData.ts      # Sample/mock product data
│   │   └── utils.ts           # Utility functions (cn, etc.)
│   ├── pages/
│   │   ├── Index.tsx          # Homepage (hero, trending, deals)
│   │   ├── Login.tsx          # Login with role selection
│   │   ├── Register.tsx       # Registration (buyer/seller flows)
│   │   ├── ProductDetails.tsx # Single product page
│   │   ├── Cart.tsx           # Shopping cart
│   │   ├── Search.tsx         # Product search
│   │   ├── Categories.tsx     # Category listing
│   │   ├── CategoryProducts.tsx # Products by category
│   │   ├── SellerStore.tsx    # Public seller storefront
│   │   ├── SellerDashboard.tsx # Seller management dashboard
│   │   ├── Orders.tsx         # Order history
│   │   ├── AiAssistant.tsx    # AI shopping assistant
│   │   ├── Messages.tsx       # Messaging interface
│   │   ├── Profile.tsx        # User profile
│   │   └── NotFound.tsx       # 404 page
│   ├── test/
│   │   ├── setup.ts           # Test configuration
│   │   └── example.test.ts    # Example test
│   ├── App.tsx                # Root component & routing
│   ├── App.css                # Global styles
│   ├── index.css              # Tailwind directives & design tokens
│   └── main.tsx               # Application entry point
├── index.html                 # HTML template
├── tailwind.config.ts         # Tailwind configuration
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── vitest.config.ts           # Test configuration
└── package.json               # Dependencies & scripts
```

---

## Available Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start development server on port 5173    |
| `npm run build`   | Production build to `dist/`              |
| `npm run build:dev` | Development build with source maps     |
| `npm run preview` | Preview production build locally         |
| `npm run lint`    | Run ESLint across the codebase           |
| `npm run test`    | Run tests once with Vitest               |
| `npm run test:watch` | Run tests in watch mode               |

---

## Environment Variables

Create a `.env` file in the project root for any required configuration:

```env
# API Base URL (required for backend connectivity)
VITE_API_BASE_URL=https://your-api-url.com

# Optional: Analytics, feature flags, etc.
VITE_APP_ENV=production
```

> **Note:** All client-side environment variables must be prefixed with `VITE_`.

---

## Deployment

### Build for Production

```bash
npm run build
```

This generates an optimized bundle in the `dist/` directory, ready for deployment to any static hosting provider.

### Recommended Hosting

- **[Lovable](https://lovable.dev)** — One-click publish from the editor
- **[Vercel](https://vercel.com)** — Connect your GitHub repo for automatic deployments
- **[Netlify](https://netlify.com)** — Drag & drop the `dist/` folder or connect GitHub
- **[Cloudflare Pages](https://pages.cloudflare.com)** — Fast global CDN hosting

### Docker (Optional)

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix     | Purpose                        |
| ---------- | ------------------------------ |
| `feat:`    | New feature                    |
| `fix:`     | Bug fix                        |
| `docs:`    | Documentation changes          |
| `style:`   | Code style (formatting, etc.)  |
| `refactor:`| Code refactoring               |
| `test:`    | Adding or updating tests       |
| `chore:`   | Maintenance tasks              |

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ using <a href="https://lovable.dev">Lovable</a>
</p>
