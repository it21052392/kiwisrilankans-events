# Kiwi Sri Lankans Events - Frontend

A modern, responsive React application built with Next.js 14+ for the Kiwi Sri Lankans Events platform.

## 🚀 Features

- **Modern Tech Stack**: Next.js 14+, TypeScript, Tailwind CSS
- **State Management**: Zustand for client state, React Query for server state
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Authentication**: Google OAuth with role-based access control
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Performance**: Code splitting, lazy loading, and caching
- **Type Safety**: Full TypeScript support throughout

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 📦 Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file in the root directory:

   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3000

   # Google OAuth Configuration
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
   NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret_here

   # App Configuration
   NEXT_PUBLIC_APP_NAME="Kiwi Sri Lankans Events"
   NEXT_PUBLIC_APP_URL=http://localhost:5000

   # Environment
   NODE_ENV=development
   ```

3. **Start the development server**:

   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:5000](http://localhost:5000)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable components
│   ├── ui/                # Basic UI components (shadcn/ui)
│   ├── layout/            # Layout components
│   ├── forms/             # Form components
│   └── features/          # Feature-specific components
├── hooks/                 # Custom React hooks
│   └── queries/           # React Query hooks
├── lib/                   # Utility functions and configurations
├── services/              # API service functions
├── store/                 # Zustand stores
├── types/                 # TypeScript type definitions
└── config/                # Configuration files
    └── theme.ts           # Theme configuration
```

## 🎨 Theme System

The application uses a centralized theme system with:

- **Colors**: Primary, secondary, accent, and status colors
- **Typography**: Font families, sizes, weights, and line heights
- **Spacing**: Consistent spacing scale
- **Shadows**: Box shadow utilities
- **Animations**: Custom animation keyframes
- **Breakpoints**: Responsive design breakpoints

## 🔐 Authentication

The app uses Google OAuth for authentication with role-based access control:

- **Organizer Role**: Can create and manage events
- **Admin Role**: Can approve events, manage users, and access admin features

## 📱 Responsive Design

- **Mobile First**: Designed for mobile devices first
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- **Touch Friendly**: Large tap targets and touch gestures
- **Progressive Web App**: Installable and offline-capable

## 🚀 Performance

- **Code Splitting**: Route-based and component-based splitting
- **Lazy Loading**: Images and components loaded on demand
- **Caching**: React Query for server state caching
- **Bundle Optimization**: Tree shaking and dead code elimination

## 🧪 Testing

- **Unit Tests**: Jest + React Testing Library
- **Component Testing**: Storybook
- **E2E Tests**: Cypress (planned)

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🔧 Development

1. **Code Style**: ESLint + Prettier configured
2. **Type Safety**: Strict TypeScript mode enabled
3. **Git Hooks**: Husky for pre-commit checks
4. **Conventional Commits**: Standardized commit messages

## 🌐 Deployment

The application is designed to be deployed on:

- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **Any Node.js hosting platform**

## 📚 Documentation

- [API Documentation](../API_DOCUMENTATION.md)
- [Frontend Documentation](../frontend_documentation.md)
- [Google Auth Setup](../GOOGLE_AUTH_SETUP.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
