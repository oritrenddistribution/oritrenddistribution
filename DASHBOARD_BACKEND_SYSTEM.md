# Oritrend Distribution - Dashboard Backend System

## Project Structure

```
oritrend-dashboard/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   ├── env.example
│   │   └── stripe.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Artist.js
│   │   ├── Subscription.js
│   │   ├── Song.js
│   │   └── Upload.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── artists.js
│   │   ├── subscriptions.js
│   │   ├── songs.js
│   │   └── uploads.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── artistController.js
│   │   ├── subscriptionController.js
│   │   ├── songController.js
│   │   └── uploadController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── utils/
│   │   ├── emailService.js
│   │   ├── fileUpload.js
│   │   ├── distributionService.js
│   │   └── analyticsService.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── App.js
│   └── package.json
├── database/
│   ├── migrations/
│   └── seeds/
└── README.md
```

## Tech Stack

### Backend
- **Node.js + Express.js** - Server framework
- **MongoDB** - Database (NoSQL for flexibility)
- **JWT** - Authentication
- **Stripe API** - Payment processing
- **Multer** - File uploads
- **Nodemailer** - Email notifications
- **AWS S3** - Cloud storage for music files

### Frontend
- **React.js** - UI framework
- **Tailwind CSS** - Styling
- **Axios** - API calls
- **React Router** - Navigation
- **Context API** - State management

---

## Core Features

### 1. User Authentication
- Register/Login
- Email verification
- Password reset
- JWT token management
- Role-based access (Artist, Admin)

### 2. Subscription Management
- 3 Tier Plans (Artist, Pro, Label)
- Stripe payment integration
- Automatic renewal reminders
- Invoice generation
- Subscription history

### 3. Artist Dashboard
- Profile management
- Real-time analytics
- Music library
- Release calendar
- Earnings tracker

### 4. Song Upload System
- Drag-and-drop upload
- Metadata editor
- Cover art uploader
- Multiple platform support selection
- Upload progress tracking

### 5. Distribution Management
- Automatic distribution to Spotify, Apple Music, etc.
- Release scheduling
- Status tracking
- Delivery reports
- Retry failed uploads

### 6. Analytics & Reporting
- Stream counts by platform
- Revenue breakdown
- User engagement
- Download statistics
- Monthly reports

---

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  name: String,
  verified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Artists Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  artistName: String,
  bio: String,
  profileImage: String,
  genres: [String],
  socialLinks: {
    spotify: String,
    instagram: String,
    twitter: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Subscriptions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  plan: String (artist|pro|label),
  price: Number,
  status: String (active|canceled|expired),
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  startDate: Date,
  endDate: Date,
  autoRenew: Boolean,
  uploads: {
    used: Number,
    limit: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Songs Collection
```javascript
{
  _id: ObjectId,
  artistId: ObjectId (ref: Artists),
  title: String,
  artists: [String],
  genre: String,
  releaseDate: Date,
  duration: Number,
  metadata: {
    isrc: String,
    iswc: String,
    credits: String
  },
  platforms: [String] (spotify|apple|youtube|etc),
  status: String (draft|pending|live|failed),
  s3Path: String,
  coverArtPath: String,
  streamCount: Number,
  downloads: Number,
  earnings: Number,
  createdAt: Date,
  distributedAt: Date,
  updatedAt: Date
}
```

### Uploads Collection
```javascript
{
  _id: ObjectId,
  artistId: ObjectId (ref: Artists),
  songId: ObjectId (ref: Songs),
  fileName: String,
  fileSize: Number,
  uploadedAt: Date,
  s3Key: String,
  status: String (uploading|completed|failed),
  progress: Number (0-100),
  errorMessage: String (if failed)
}
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new artist
- `POST /api/auth/login` - Login artist
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh-token` - Refresh JWT
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Artists
- `GET /api/artists/profile` - Get artist profile
- `PUT /api/artists/profile` - Update profile
- `GET /api/artists/dashboard` - Get dashboard data
- `POST /api/artists/verify-email` - Verify email

### Subscriptions
- `GET /api/subscriptions/plans` - Get all plans
- `POST /api/subscriptions/create-checkout` - Create Stripe checkout
- `GET /api/subscriptions/current` - Get current subscription
- `POST /api/subscriptions/cancel` - Cancel subscription
- `GET /api/subscriptions/invoices` - Get invoices

### Songs
- `GET /api/songs` - Get all songs for artist
- `POST /api/songs/create` - Create new song (metadata)
- `GET /api/songs/:id` - Get song details
- `PUT /api/songs/:id` - Update song metadata
- `DELETE /api/songs/:id` - Delete song
- `GET /api/songs/:id/analytics` - Get song analytics
- `POST /api/songs/:id/publish` - Publish to platforms

### Uploads
- `POST /api/uploads/audio` - Upload audio file
- `POST /api/uploads/cover-art` - Upload cover art
- `GET /api/uploads/status/:uploadId` - Check upload status
- `DELETE /api/uploads/:uploadId` - Cancel upload

### Analytics
- `GET /api/analytics/overview` - Dashboard overview
- `GET /api/analytics/streams` - Stream analytics
- `GET /api/analytics/earnings` - Earnings breakdown
- `GET /api/analytics/export` - Export monthly report

---

## Security Features

1. **Password Security** - Bcrypt hashing (10 salt rounds)
2. **JWT Tokens** - Expiring tokens with refresh mechanism
3. **CORS** - Restrict API access
4. **Rate Limiting** - Prevent abuse (100 requests/15 min)
5. **Input Validation** - Sanitize all inputs
6. **File Validation** - Check file types and sizes
7. **SQL Injection Prevention** - Parameterized queries (MongoDB)
8. **SSL/TLS** - HTTPS only
9. **Environment Variables** - Keep secrets secure
10. **Audit Logging** - Track user actions

---

## Deployment Architecture

```
┌─────────────────────┐
│   Frontend (React)  │
│  (Vercel/Netlify)   │
└──────────┬──────────┘
           │ HTTPS
┌──────────▼──────────┐
│  Backend (Node.js)  │
│  (Heroku/AWS)       │
└──────────┬─────��────┘
           │
┌──────────▼──────────┐
│    MongoDB Cloud    │
│    (Atlas)          │
└─────────────────────┘
           │
┌──────────▼──────────┐
│    AWS S3           │
│  (File Storage)     │
└─────────────────────┘
           │
┌──────────▼──────────┐
│  Stripe             │
│  (Payments)         │
└─────────────────────┘
           │
┌──────────▼──────────┐
│  Distribution APIs  │
│  (Spotify, Apple)   │
└─────────────────────┘
```

---

## Implementation Timeline

**Phase 1: Foundation (Weeks 1-2)**
- [ ] Set up Node.js + Express backend
- [ ] Configure MongoDB
- [ ] Implement authentication (JWT)
- [ ] Create basic user models

**Phase 2: Payment Integration (Weeks 3-4)**
- [ ] Integrate Stripe API
- [ ] Create subscription plans
- [ ] Build checkout flow
- [ ] Webhook handling

**Phase 3: Upload System (Weeks 5-6)**
- [ ] Configure AWS S3
- [ ] Build file upload endpoints
- [ ] Implement progress tracking
- [ ] Create metadata editor

**Phase 4: Distribution (Weeks 7-8)**
- [ ] Integrate Spotify API
- [ ] Integrate Apple Music API
- [ ] Build distribution scheduler
- [ ] Status tracking system

**Phase 5: Analytics (Weeks 9-10)**
- [ ] Stream counting system
- [ ] Earnings calculator
- [ ] Dashboard visualizations
- [ ] Report generation

**Phase 6: Frontend (Weeks 11-12)**
- [ ] React dashboard UI
- [ ] Upload interface
- [ ] Analytics pages
- [ ] User settings

**Phase 7: Testing & Launch (Weeks 13-14)**
- [ ] Unit tests
- [ ] Integration tests
- [ ] Security audit
- [ ] Beta launch

---

## Next Steps

1. Choose hosting provider (Heroku, AWS, DigitalOcean)
2. Set up MongoDB Atlas (cloud database)
3. Create Stripe account & API keys
4. Set up AWS S3 bucket
5. Create GitHub repository
6. Begin Phase 1 implementation

Would you like me to create the actual code files for any specific component?
