# Kiwi Sri Lankans Events

A comprehensive event management platform for the Kiwi Sri Lankan community.

## Features

- User authentication and authorization
- Event creation and management
- Category management
- Pencil holds for events
- Email subscriptions and notifications
- Push notifications
- File uploads to AWS S3
- Admin dashboard
- Automated reminders

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Google OAuth
- **File Storage**: AWS S3
- **Email**: Resend
- **Push Notifications**: Web Push
- **Validation**: Zod
- **Testing**: Jest, Supertest
- **Code Quality**: ESLint, Prettier, Husky

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- AWS S3 account
- Resend account for email

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration

5. Run the application:

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

### Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## API Documentation

[API documentation will be added here]

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

Private - All rights reserved
