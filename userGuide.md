# SatireScope User Guide

## Website Information

**Purpose:** SatireScope automatically fetches the latest news, generates witty satirical commentary using AI, creates custom images, and posts them to your X (Twitter) account every hour.

**Access:** Login required (Manus OAuth authentication)

---

## Powered by Manus

SatireScope is built with cutting-edge technology:

**Frontend:** React 19 + TypeScript + Tailwind CSS 4 with shadcn/ui components for a modern, responsive interface.

**Backend:** Node.js with Express and tRPC providing type-safe API communication and real-time data synchronization.

**Database:** PostgreSQL with Drizzle ORM for secure credential storage and posting history management.

**AI & Automation:** Manus LLM API for intelligent content generation, Manus Image Generation for satirical images, and X API v2 for automated posting.

**Deployment:** Auto-scaling infrastructure with global CDN ensuring 99.9% uptime and instant content delivery worldwide.

---

## Using Your Website

### 1. Configure Your Twitter Account

Navigate to **"Settings"** from the top menu. Click **"Register Credentials"** and enter your X (Twitter) API credentials:

- **API Key** - Your X API key
- **API Key Secret** - Your API key secret
- **Access Token** - Your access token
- **Access Token Secret** - Your access token secret

Click **"Show credentials"** to verify your input is correct. Your credentials are encrypted with bcrypt and stored securely. Click **"Save Credentials"** to complete setup.

### 2. Manage Automated Posting

Once configured, your Twitter account appears in the Settings page. Use the **toggle switch** next to your configuration to enable or disable automated posting. When enabled, SatireScope will automatically post satirical news every hour.

You can add multiple Twitter accounts by clicking **"Add Another Configuration"** to post to different accounts simultaneously.

### 3. View Posted Tweets

Click **"Posted Tweets"** in the top menu to see your posting history. Select a configuration from the dropdown to view all tweets posted from that account. Each tweet displays:

- **Posted date and time** - When the tweet was posted
- **Tweet content** - The full satirical commentary
- **Satirical image** - The AI-generated image accompanying the tweet
- **Source link** - Click to read the original news article

---

## Managing Your Website

### Settings Panel

Access the **Settings** panel from the top navigation to:

- **Register new Twitter credentials** - Add X API keys for automated posting
- **Toggle active status** - Enable/disable posting for each configuration
- **Update credentials** - Modify existing Twitter account settings
- **Delete configurations** - Remove a Twitter account from automation

### Dashboard

The **Dashboard** (available in Management UI) shows:

- Total posts made
- Active configurations
- Posting frequency
- System health status

### Database

The **Database** panel in Management UI provides:

- Direct access to your data
- Ability to view posting history
- Configuration management
- User data overview

Enable SSL when connecting to the database for security.

### Notifications

Configure notification settings in **Settings → Notifications** to receive alerts for:

- Failed posting attempts
- Configuration changes
- System errors

---

## How It Works

**Step 1: Fetch News** → SatireScope retrieves latest headlines from major news sources every hour.

**Step 2: Generate Content** → AI analyzes each article and creates a witty satirical tweet (under 140 characters) plus a short commentary.

**Step 3: Create Images** → The system generates a custom satirical image based on the news topic using AI image generation.

**Step 4: Post to X** → The tweet with image and source link automatically posts to your configured Twitter account.

---

## Next Steps

Talk to Manus AI anytime to request changes or add features. You can ask for:

- Additional news sources or filtering options
- Custom posting schedules (e.g., post every 2 hours instead of 1)
- Different image styles or satirical tones
- Analytics dashboard for engagement tracking
- Multi-language support
- Integration with other social media platforms

Ready to amplify your satirical voice? Your first automated post will go live within the next hour. Monitor your X account to see SatireScope in action!
