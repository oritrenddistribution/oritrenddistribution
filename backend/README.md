# Oritrend Distribution - Dashboard Backend API

The backend API for Oritrend's music distribution platform with artist dashboard, file uploads, and payment processing.

## Features

- 👤 User authentication (JWT)
- 🎵 Artist profile management
- 💰 Subscription/billing with Stripe
- 📤 Audio file uploads to AWS S3
- 🎨 Cover art management
- 📊 Analytics and streaming data
- 📧 Email notifications
- 🔒 Security & rate limiting

## Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- AWS S3 account
- Stripe account
- Gmail account (for emails)

## Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```bash
   cp config/env.example .env
   ```
   
   Fill in your credentials:
   - MongoDB connection string
   - JWT secret
   - Stripe keys
   - AWS credentials
   - Email settings

4. **Start the server**
   ```bash
   npm run dev
   ```

   Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Artists
- `GET /api/artists/profile` - Get artist profile
- `PUT /api/artists/profile` - Update profile
- `GET /api/artists/dashboard` - Get dashboard data

### Subscriptions
- `GET /api/subscriptions/plans` - Get subscription plans
- `POST /api/subscriptions/checkout` - Create checkout session
- `GET /api/subscriptions/current` - Get current subscription
- `POST /api/subscriptions/cancel` - Cancel subscription

### Songs
- `GET /api/songs` - Get all songs
- `POST /api/songs` - Create new song
- `GET /api/songs/:id` - Get song details
- `PUT /api/songs/:id` - Update song
- `DELETE /api/songs/:id` - Delete song
- `POST /api/songs/:id/publish` - Publish song

### Uploads
- `POST /api/uploads/audio` - Upload audio file
- `POST /api/uploads/cover` - Upload cover art
- `GET /api/uploads/:id` - Get upload status

### Analytics
- `GET /api/analytics/overview` - Dashboard overview
- `GET /api/analytics/streams` - Stream data
- `GET /api/analytics/earnings` - Earnings data

## Database Models

- **User** - Authentication & account info
- **Artist** - Artist profile & metadata
- **Subscription** - Billing & plan info
- **Song** - Song metadata & distribution
- **Upload** - File upload tracking

## Environment Variables

See `config/env.example` for all required variables.

## Testing

```bash
npm test
```

## Development

Use nodemon for auto-reload:
```bash
npm run dev
```

## Deployment

### Heroku
```bash
heroku create oritrend-api
git push heroku main
```

### AWS EC2
Follow AWS documentation for Node.js deployment.

### DigitalOcean
Use App Platform for easy deployment.

## Documentation

Full API documentation in `DASHBOARD_BACKEND_SYSTEM.md`

## Support

Email: dev@oritrenddistribution.com

## License

MIT
