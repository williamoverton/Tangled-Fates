# Tangled Fates

> An AI-powered multiplayer choose-your-own-adventure game where every choice shapes reality and your discoveries become part of a living, shared universe.

## 🌟 Features

### 🤖 AI-Powered Storytelling

- **Dynamic Narratives**: Claude Haiku 4.5 powers intelligent, context-aware storytelling that adapts to your choices
- **Consistent World Building**: AI maintains story consistency by searching through existing knowledge before generating new content
- **Real-time Chat Interface**: Stream responses with typing indicators and smooth animations

### 🌍 Shared Living Worlds

- **Multiplayer Worlds**: Create and join persistent game worlds with unique lore and settings
- **Character Management**: Create multiple characters per world, each with their own backstory and journey
- **Persistent State**: Your progress and discoveries are saved and influence the world for all players

### 📚 Collaborative Wiki System

- **Auto-Generated Knowledge Base**: AI automatically extracts and catalogs discoveries from your adventures
- **Rich Content Types**: Characters, locations, items, events, and players are all tracked and searchable
- **Vector Search**: Powered by pgvector for intelligent content discovery and retrieval

### 🔍 Advanced Search & Discovery

- **Semantic Search**: Find relevant content using natural language queries
- **Context-Aware Tools**: AI has access to comprehensive world knowledge through specialized search tools
- **Event Tracking**: Recent events and discoveries are surfaced in the sidebar for easy reference

## 🏗️ Architecture

### Frontend

- **Next.js 16** with App Router and Turbopack for blazing-fast development
- **React 19** with modern hooks and concurrent features
- **Tailwind CSS 4** for responsive, beautiful UI components
- **shadcn/ui** components for accessible, customizable interfaces
- **AI SDK** for seamless chat integration with streaming responses

### Backend & AI

- **Claude Haiku 4.5** for intelligent story generation and knowledge extraction
- **Vector Embeddings** using OpenAI's text-embedding-3-small model
- **Workflow Engine** for automated knowledge base updates
- **Bot Detection** to prevent automated abuse

### Database & Infrastructure

- **PostgreSQL** with pgvector extension for vector similarity search
- **Drizzle ORM** for type-safe database operations
- **Docker Compose** for local development environment
- **Clerk Authentication** for secure user management

### Knowledge Management

- **Automated Archiving**: AI workflows extract and categorize discoveries from chat history
- **Duplicate Prevention**: Smart detection prevents duplicate entries in the knowledge base
- **Relationship Mapping**: Events link to locations, characters, players, and items
- **Update Tracking**: Existing knowledge is updated rather than duplicated when new information emerges

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL with pgvector extension

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd choose-your-own-adventure-multiplayer
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys and database URL
   ```

4. **Start the database**

   ```bash
   npm run db:up
   ```

5. **Run database migrations**

   ```bash
   npm run db:migrate
   ```

6. **Start the development server**

   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Management

```bash
# Start database
npm run db:up

# Stop database
npm run db:down

# Run migrations
npm run db:migrate

# Push schema changes
npm run db:push

# Open database studio
npm run db:studio
```

## 🎮 How It Works

### 1. **World Creation**

- Create or join existing game worlds with unique settings and lore
- Each world maintains its own knowledge base of characters, locations, items, and events

### 2. **Character Creation**

- Create multiple characters per world with custom names and descriptions
- Each character has their own adventure thread and chat history

### 3. **Interactive Storytelling**

- Chat with the AI dungeon master to progress your story
- Make choices that shape your character's journey
- Discover new locations, meet characters, and find items

### 4. **Knowledge Discovery**

- AI automatically extracts noteworthy discoveries from your conversations
- New characters, locations, items, and events are added to the world's wiki
- Your discoveries become part of the shared knowledge base for all players

### 5. **Wiki Exploration**

- Browse the collaborative wiki to learn about the world
- View recent events, character profiles, and location descriptions
- Discover what other players have found and experienced

## 🛠️ Development

### Project Structure

```
├── app/                    # Next.js app router pages
│   ├── [world_slug]/      # World-specific pages
│   ├── api/               # API routes
│   └── worlds/            # World listing
├── components/            # React components
│   ├── ai-elements/      # AI-specific UI components
│   ├── ui/               # Reusable UI components
│   └── wiki/             # Wiki-related components
├── lib/                   # Core application logic
│   ├── ai/               # AI integration and tools
│   ├── db/               # Database schema and client
│   └── actions/          # Server actions
├── workflows/            # Automated workflows
└── drizzle/              # Database migrations
```

### Key Technologies

- **AI Integration**: Anthropic Claude, OpenAI embeddings, AI SDK
- **Database**: PostgreSQL with pgvector for semantic search
- **Authentication**: Clerk for user management
- **Styling**: Tailwind CSS with custom design system
- **Type Safety**: TypeScript throughout with Drizzle ORM

## 📝 Environment Variables

```bash
# Postgres connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/choose-your-own-adventure-multiplayer"

# Vercel AI SDK key
AI_GATEWAY_API_KEY=""

# Vercel blob storage
BLOB_READ_WRITE_TOKEN=""

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [Anthropic Claude](https://www.anthropic.com/)
- Vector search with [pgvector](https://github.com/pgvector/pgvector)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Authentication by [Clerk](https://clerk.com/)

---

**Ready to begin your adventure?** Create your first character and start exploring the living, breathing worlds of Tangled Fates!
