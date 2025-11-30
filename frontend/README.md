# Frontend

Next.js frontend for Buffet Restaurant QR Ordering System.

## Setup

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local with your configuration
npm run dev
```

Frontend will run on http://localhost:3001

## Project Structure

```
src/
├── app/                # Next.js App Router
│   ├── admin/         # Admin pages
│   ├── staff/         # Staff pages
│   ├── cashier/       # Cashier pages
│   ├── customer/      # Customer pages (QR access)
│   ├── login/         # Login page
│   └── layout.tsx     # Root layout
├── components/        # Reusable components
│   ├── ui/           # UI components
│   ├── admin/        # Admin components
│   ├── staff/        # Staff components
│   ├── cashier/      # Cashier components
│   └── customer/     # Customer components
├── lib/              # Utilities
│   ├── api/          # API client
│   └── utils.ts      # Helper functions
└── contexts/         # React contexts
    └── auth-context.tsx
```

## Features

- 🎨 Tailwind CSS for styling
- 📱 Responsive design
- 🌐 Thai language support
- 🔐 JWT authentication
- 🔄 Real-time updates with Socket.IO
- 📝 Form validation with React Hook Form

## Build

```bash
npm run build
npm run start
```
