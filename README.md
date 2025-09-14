# CareerWise AI - AI Career Counseling Chat Application

A modern, responsive chat application that provides personalized career guidance through AI-powered conversations. Built with Next.js, TypeScript, and Google Gemini AI.

## 🚀 Features

### Core Functionality
- **AI Career Counselor**: Intelligent career guidance powered by Google Gemini
- **Chat Sessions**: Create, manage, and continue multiple conversation threads
- **Message Persistence**: All conversations are saved and can be resumed anytime
- **Smart Session Titles**: Automatically generated titles based on conversation content
- **Infinite Scroll**: Seamless loading of chat history with pagination

### User Experience
- **Authentication**: Secure login with Google OAuth via NextAuth
- **Dark/Light Mode**: Toggle between themes with system preference detection
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Updates**: Instant message delivery and session updates
- **Loading States**: Smooth loading indicators throughout the app
- **macOS-style Scrollbars**: Invisible scrollbars that appear only when needed

### Advanced Features
- **Session Management**: Edit session titles, delete conversations
- **Context Awareness**: AI maintains conversation context across messages
- **Error Handling**: Graceful fallbacks for API failures
- **Type Safety**: Full TypeScript implementation with strict type checking

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **API**: tRPC with TanStack Query
- **Authentication**: NextAuth.js with Google OAuth
- **AI Integration**: Google Gemini API
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (or Neon account)
- Google OAuth credentials
- Google Gemini API key

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/counsellor-ai.git
cd counsellor-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="your-postgresql-connection-string"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Google Gemini
GEMINI_API_KEY="your-gemini-api-key"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) View database in Prisma Studio
npx prisma studio
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |

## 📊 Database Schema

The application uses the following main entities:

- **User**: Stores user information from OAuth
- **ChatSession**: Individual chat conversations
- **Message**: Individual messages within sessions

Key relationships:
- User → ChatSessions (1:many)
- ChatSession → Messages (1:many)
- User → Messages (1:many)

## 🎨 UI Components

Built with Shadcn/ui components:
- Button, Input, Textarea
- Avatar, Dropdown Menu, Switch
- Toast notifications
- Loading skeletons
- Custom scrollbars

## 🔄 API Routes

### tRPC Routers

- **Chat Router**: Session management, messaging, title editing
- **AI Router**: AI response generation with context management

### Key Endpoints

- `/api/trpc/chat.getSessions` - Get user's chat sessions
- `/api/trpc/chat.createSession` - Create new session
- `/api/trpc/chat.sendMessage` - Send user message
- `/api/trpc/ai.generateResponse` - Generate AI response

## 🎯 Features in Detail

### AI Integration
- Uses Google Gemini 1.5 Flash model
- Maintains conversation context across messages
- Automatic session title generation based on first message
- Graceful error handling with fallback responses

### Session Management
- Infinite scroll for session list
- Inline title editing
- Session deletion with confirmation
- Automatic timestamp updates

### User Experience
- macOS-style invisible scrollbars
- Smooth loading animations
- Responsive design for all screen sizes
- Dark/light theme with system preference detection

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Database Setup (Production)

1. Create a PostgreSQL database on Neon, Supabase, or similar
2. Update `DATABASE_URL` in your Vercel environment variables
3. Run migrations: `npx prisma db push`

## 🧪 Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run type-check

# Linting
npm run lint

# Database operations
npx prisma generate
npx prisma db push
npx prisma studio
```

## 🐛 Known Issues & Future Improvements

### Current Limitations
- AI responses are rate-limited by Gemini free tier
- Session titles are generated only on first message

### Planned Enhancements
- Real-time typing indicators
- Message status indicators (sent/delivered)
- Export chat conversations
- Advanced AI personality customization
- Voice message support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙋‍♂️ Support

For questions or support, please open an issue on GitHub.

---

Built with ❤️ using modern web technologies and AI integration.
