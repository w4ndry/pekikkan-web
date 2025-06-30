# Pekikkan - Inspire the World Through Words

[![Built with Bolt](https://img.shields.io/badge/Built%20with-Bolt-6C63FF?style=flat-square)](https://bolt.new)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

**Pekikkan** is a modern, mobile-first social platform designed to inspire the world through powerful words. Discover, share, and save motivational quotes that transform lives, featuring an intuitive swipe-based interface and a vibrant community of word enthusiasts.

## ✨ Key Features

### 🎯 Core Functionality
- **Swipe-Based Quote Discovery** - Tinder-style interface for browsing inspirational quotes
- **Smart Search & Exploration** - Find quotes by content, author, or category
- **Social Interactions** - Like, save, and share meaningful quotes
- **User-Generated Content** - Post and share your favorite quotes
- **Trending Content** - Discover popular quotes and authors
- **Category Browsing** - Explore quotes by themes (Motivation, Love, Wisdom, etc.)

### 🔊 Advanced Features
- **Text-to-Speech** - Listen to quotes with ElevenLabs integration
- **Real-time Analytics** - Google Analytics integration for insights
- **Progressive Web App** - Install and use offline
- **Responsive Design** - Optimized for mobile and desktop
- **SEO Optimized** - Dynamic meta tags and structured data

### 🛡️ Security & Performance
- **Row Level Security** - Secure data access with Supabase RLS
- **Authentication System** - Email/password signup with confirmation
- **Report System** - Community moderation tools
- **Performance Monitoring** - Core Web Vitals tracking
- **Hardware Acceleration** - Smooth animations and interactions

## 🛠️ Technologies & Dependencies

### Frontend Stack
- **React 18.3.1** - Modern React with hooks and concurrent features
- **TypeScript 5.5.3** - Type-safe development
- **Vite 5.4.2** - Fast build tool and dev server
- **Tailwind CSS 3.4.1** - Utility-first CSS framework

### UI & Animation
- **Framer Motion 10.16.16** - Smooth animations and gestures
- **Lucide React 0.344.0** - Beautiful icon library
- **React Tinder Card 1.6.4** - Swipe gesture components
- **React Hot Toast 2.4.1** - Elegant notifications

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Row Level Security** - Database-level security policies
- **Real-time subscriptions** - Live data updates

### Additional Services
- **ElevenLabs API** - Text-to-speech functionality
- **Google Analytics** - User behavior tracking
- **React Helmet Async** - Dynamic SEO meta tags

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- ElevenLabs API key (optional, for text-to-speech)
- Google Analytics ID (optional, for analytics)

### Step-by-Step Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pekikkan-social-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Supabase Configuration (Required)
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

   # ElevenLabs Configuration (Optional)
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

   # Google Analytics Configuration (Optional)
   VITE_GA_MEASUREMENT_ID=G-LYC8GQ1NZK

   # Environment Configuration
   VITE_APP_ENV=development
   VITE_APP_URL=http://localhost:5173
   VITE_APP_TITLE="Pekikkan - Inspire the world through words"
   VITE_APP_DESCRIPTION="Inspire the world through words. Discover, share, and save powerful quotes that motivate and transform lives."
   ```

4. **Set up Supabase database**
   
   Run the migrations in your Supabase dashboard or using the Supabase CLI:
   ```bash
   # If using Supabase CLI
   supabase db reset
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📱 Usage

### Basic Navigation

```typescript
// Home page - Swipe through quotes
// Use arrow keys or swipe gestures to navigate
// Tap the heart to like, bookmark to save

// Explore page - Search and discover
// Use the search bar to find specific quotes
// Browse by categories or popular authors

// Post page - Share quotes (requires authentication)
// Fill in quote content and author
// Submit to share with the community

// Profile page - Manage your account
// View saved and liked quotes
// Access account settings
```

### Authentication Flow

```typescript
// Sign up with email and password
const { signUp } = useAuth();
await signUp(email, password, {
  username: 'your_username',
  full_name: 'Your Full Name'
});

// Sign in
const { signIn } = useAuth();
await signIn(email, password);

// Sign out
const { signOut } = useAuth();
await signOut();
```

### Quote Interactions

```typescript
// Like a quote
const { likeQuote } = useQuotes();
await likeQuote(quoteId);

// Save a quote
const { saveQuote } = useQuotes();
await saveQuote(quoteId);

// Report inappropriate content
const { reportQuote } = useQuotes();
await reportQuote(quoteId);
```

## ⚙️ Configuration

### Supabase Setup

1. Create a new Supabase project
2. Run the provided migrations in `/supabase/migrations/`
3. Enable Row Level Security on all tables
4. Configure authentication settings:
   - Enable email/password authentication
   - Disable email confirmation for development
   - Set up redirect URLs

### ElevenLabs Integration (Optional)

1. Sign up for ElevenLabs account
2. Get your API key from the dashboard
3. Add `VITE_ELEVENLABS_API_KEY` to your `.env` file
4. Text-to-speech will be automatically enabled

### Google Analytics (Optional)

1. Create a Google Analytics 4 property
2. Get your Measurement ID
3. Add `VITE_GA_MEASUREMENT_ID` to your `.env` file
4. Analytics tracking will be automatically enabled

## 📊 Database Schema

### Core Tables

```sql
-- Users table (extends Supabase auth.users)
users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quotes table
quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  author text NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  like_count integer DEFAULT 0,
  save_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User interactions
interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  quote_id uuid REFERENCES quotes(id) ON DELETE CASCADE,
  type interaction_type NOT NULL, -- 'like', 'save', 'report'
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, quote_id, type)
);
```

## 🤝 Contributing

We welcome contributions to Pekikkan! Here's how you can help:

### Development Process

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed
4. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
5. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Code Style Guidelines

- Use TypeScript for all new code
- Follow React hooks patterns
- Use Tailwind CSS for styling
- Implement proper error handling
- Add JSDoc comments for complex functions
- Ensure mobile-first responsive design

### Testing

```bash
# Run tests
npm run test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- **Built with [Bolt](https://bolt.new)** - AI-powered development platform
- **Powered by [Supabase](https://supabase.com)** - Open source Firebase alternative
- **Voice by [ElevenLabs](https://elevenlabs.io)** - AI voice generation
- **Icons by [Lucide](https://lucide.dev)** - Beautiful & consistent icons
- **Animations by [Framer Motion](https://www.framer.com/motion/)** - Production-ready motion library

## 📞 Contact & Support

- **Website**: [https://pekikkan.com](https://pekikkan.com)
- **Documentation**: [Project Wiki](https://github.com/your-username/pekikkan/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/pekikkan/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/pekikkan/discussions)

## 🚀 Deployment

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy!

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

**Made with ❤️ to inspire the world through words**

*Pekikkan - Where every word has the power to transform lives*