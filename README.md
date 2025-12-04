# SatireScope - AI-Powered Satirical News Posting to X

## Overview

**SatireScope** is an innovative application that automatically fetches the latest news, generates witty satirical commentary using AI, creates custom AI-generated images, and posts them to your X (Twitter) account on a customizable schedule. The application combines real-time news aggregation, advanced language models, and image generation to create engaging, humorous content that keeps your audience entertained.

## Home Screen

![SatireScope Home Screen](./home-screen.jpg)

The home screen showcases the application's core features with a clean, modern design featuring:
- Prominent call-to-action buttons for configuration and viewing tweets
- Feature highlights explaining automated posting, AI-generated content, and tweet tracking
- Dark theme optimized for readability

### Live Demo

**Public URL:** https://satirescope-eq2k3uhx.manus.space

## Features

### 1. Automated News Fetching
- Integrates with **NewsAPI** to fetch real-time news articles from multiple sources
- Supports multiple news categories: general, business, technology, science, health, and more
- Retrieves actual article URLs for source attribution
- Fallback mechanism for reliable news availability

### 2. AI-Generated Satirical Content
- Uses **Manus LLM API** to generate witty, satirical commentary on news articles
- Creates contextually relevant, humorous takes on current events
- Generates engaging tweet-length content with proper formatting

### 3. AI-Generated Images
- Integrates with **Manus Image Generation API** to create custom satirical images
- Each tweet includes a unique, AI-generated visual that complements the satirical commentary
- Images are automatically uploaded to S3 storage

### 4. Automated Posting to X
- Seamlessly posts generated content to X (Twitter) using the X API v2
- Includes article source links for transparency
- Tracks all posted tweets in the database for analytics

### 5. Customizable Posting Schedule
- **Flexible scheduling:** Configure posting intervals from 15 minutes to 24 hours
- **Time-based restrictions:** Set specific hours for posting (e.g., 9 AM to 5 PM)
- **Active/Inactive toggle:** Easily enable or disable automated posting
- **Real-time updates:** Schedule changes take effect immediately

### 6. Posted Tweets Dashboard
- View complete history of all posted tweets
- Track engagement metrics (likes, retweets, replies)
- Filter and search through posted content
- Source attribution for transparency

### 7. User Authentication
- Secure OAuth-based authentication via Manus OAuth
- Role-based access control (admin/user)
- Session management with encrypted cookies

## Architecture

### Technology Stack

**Frontend:**
- React 19 with TypeScript
- Tailwind CSS 4 for styling
- Wouter for client-side routing
- shadcn/ui components for consistent UI
- tRPC for type-safe API communication

**Backend:**
- Express.js 4 for HTTP server
- tRPC 11 for RPC procedures
- Node-cron for scheduled tasks
- Drizzle ORM for database management
- MySQL/TiDB for data persistence

**External APIs:**
- **NewsAPI:** Real-time news data
- **Manus LLM API:** AI-powered content generation
- **Manus Image Generation API:** Custom image creation
- **X API v2:** Twitter/X integration
- **Manus OAuth:** User authentication

**Infrastructure:**
- AWS S3 for file storage
- MySQL database for application data
- Manus platform for API services

### Project Structure

```
satirescope/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilities (tRPC client)
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   ├── public/               # Static assets
│   └── index.html            # HTML template
├── server/                    # Express backend
│   ├── routers/              # tRPC route definitions
│   ├── modules/              # Business logic
│   │   ├── newsEngine.ts     # News fetching & processing
│   │   ├── twitterPoster.ts  # X API integration
│   │   └── scheduler.ts      # Automated posting scheduler
│   ├── db.ts                 # Database queries
│   ├── crypto.ts             # Encryption utilities
│   ├── _core/                # Core infrastructure
│   │   ├── trpc.ts           # tRPC setup
│   │   ├── context.ts        # Request context
│   │   ├── env.ts            # Environment variables
│   │   ├── llm.ts            # LLM integration
│   │   ├── imageGeneration.ts # Image generation
│   │   └── index.ts          # Server initialization
│   └── storage/              # S3 storage helpers
├── drizzle/                  # Database schema & migrations
│   └── schema.ts             # Table definitions
├── shared/                   # Shared types & constants
└── package.json              # Dependencies
```

### Data Flow

1. **News Fetching:** NewsAPI → newsEngine.ts → Database
2. **Content Generation:** News Article → Manus LLM API → Satirical Commentary
3. **Image Generation:** Satirical Commentary → Manus Image API → AI Image
4. **Posting:** Generated Content + Image → X API → Twitter/X
5. **Tracking:** Posted Tweet → Database → Dashboard

## Deployment

### Prerequisites

- Node.js 22.13.0 or later
- pnpm package manager
- MySQL/TiDB database
- Environment variables configured (see below)

### Environment Variables

The application requires the following environment variables:

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Authentication
JWT_SECRET=your_jwt_secret_key
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
VITE_APP_ID=your_app_id

# News API
NEWS_API_KEY=your_newsapi_key

# Manus APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_forge_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_api_key

# User Information
OWNER_NAME=Your Name
OWNER_OPEN_ID=your_open_id

# App Branding
VITE_APP_TITLE=SatireScope
VITE_APP_LOGO=https://your-logo-url.png

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=your_analytics_endpoint
VITE_ANALYTICS_WEBSITE_ID=your_website_id
```

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tomoto0/satirescope.git
   cd satirescope
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Set up database:**
   ```bash
   pnpm db:push
   ```

5. **Start development server:**
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

### Production Deployment

1. **Build the application:**
   ```bash
   pnpm build
   ```

2. **Start production server:**
   ```bash
   pnpm start
   ```

3. **Configure reverse proxy** (nginx/Apache) to forward requests to the Node.js server

4. **Set up SSL certificates** for HTTPS

5. **Configure environment variables** for production

6. **Run database migrations:**
   ```bash
   pnpm db:push
   ```

### Deployment on Manus Platform

1. Connect your GitHub repository to Manus
2. Configure environment variables in Manus dashboard
3. Deploy using Manus publish interface
4. Access your application via the provided public URL

## Usage Guide

### Initial Setup

1. **Log in** with your Manus OAuth account
2. **Navigate to Settings** → **Configure Twitter**
3. **Enter X API credentials:**
   - API Key
   - API Key Secret
   - Access Token
   - Access Token Secret

### Configuring Automated Posting

1. Go to **Settings** page
2. Select your Twitter configuration
3. **Posting Schedule** section:
   - Set posting interval (15 min - 24 hours)
   - Set start hour (0-23)
   - Set end hour (0-23)
4. Click **Save** to apply changes
5. Toggle **Automated Posting** to **Active**

### Manual Posting

1. On the home page, click **Post Now**
2. The system will:
   - Fetch a random news article
   - Generate satirical commentary
   - Create an AI image
   - Post to X
3. Check **Posted Tweets** to view the result

### Viewing Posted Tweets

1. Navigate to **Posted Tweets** page
2. View all posted tweets with:
   - Generated commentary
   - AI-generated images
   - Source article links
   - Engagement metrics

## Key Implementation Details

### News Article Processing

- Fetches articles from NewsAPI with real source URLs
- Processes article title, description, and source information
- Generates contextually relevant satirical commentary
- Ensures each article has a unique, traceable source link

### Scheduler Implementation

- Uses Node-cron for reliable task scheduling
- Supports dynamic schedule updates without server restart
- Implements Active/Inactive toggle with proper scheduler lifecycle management
- Respects time-based restrictions (start/end hours)

### Security Features

- Encrypted storage of X API credentials
- Role-based access control
- Secure session management with JWT
- OAuth-based user authentication
- Environment variable isolation

## Troubleshooting

### Automated Posting Not Working

1. Verify X API credentials are correct
2. Check that **Automated Posting** is set to **Active**
3. Ensure posting schedule is configured correctly
4. Check server logs for errors: `pnpm logs`

### News Articles Not Fetching

1. Verify NewsAPI key is valid
2. Check API rate limits (NewsAPI has monthly limits)
3. Ensure internet connectivity
4. Check server logs for API errors

### Images Not Generating

1. Verify Manus Image Generation API credentials
2. Check API rate limits
3. Ensure sufficient API quota
4. Review error logs in server console

## Future Enhancements

- **Category filtering:** Allow users to select news categories
- **Engagement analytics:** Display X metrics (likes, retweets, replies)
- **Tweet preview:** Preview generated content before posting
- **Custom tone settings:** Adjust satirical tone level
- **Multi-account support:** Manage multiple X accounts
- **Content moderation:** Review and approve content before posting

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or feature requests, please create an issue on GitHub:
https://github.com/tomoto0/satirescope/issues

## Author

**tomoto0** - GitHub: https://github.com/tomoto0

## Acknowledgments

- Manus platform for OAuth, LLM, and image generation APIs
- NewsAPI for real-time news data
- X API v2 for Twitter integration
- React and Node.js communities for excellent tools and libraries

---

**Last Updated:** December 2024

**Version:** 1.0.0

**Live Demo:** https://satirescope-eq2k3uhx.manus.space
