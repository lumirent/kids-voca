# Kids Voca App

Kids Voca App is an interactive educational application designed to help children learn English vocabulary through flashcards and quizzes. It features a modern, clean UI with image-based learning, audio pronunciation, and progress tracking.

## 🚀 Features

- **Flashcard Learning**: Browse through vocabulary words with associated images and meanings.
- **Interactive Quiz**: Test knowledge with multiple-choice questions.
- **Spelling Quiz**: Practice typing the English words to reinforce spelling.
- **Review Mode**: Focus on words that were missed during quiz sessions.
- **Statistics**: Track your learning progress and performance over time.
- **Audio Feedback**: Uses the browser's `SpeechSynthesis` API for word pronunciation and quiz feedback.
- **Supabase Integration**: Real-time data fetching and image storage.
- **Progress Tracking**: Visual progress indicators for learning sessions.

## 🛠 Tech Stack

- **Frontend**: React 19, Vite 7, TypeScript
- **Styling**: Tailwind CSS 4, Lucide React (Icons), Radix UI
- **Backend/Database**: Supabase (PostgreSQL + Storage)
- **Linting/Formatting**: Biome
- **Testing**: Vitest, React Testing Library

## 🏁 Getting Started

### Prerequisites

- **Node.js**: Latest LTS recommended.
- **pnpm**: The project uses `pnpm` for package management.
- **Supabase Account**: A Supabase project with:
  - A `words` table.
  - A `flashcards` storage bucket.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/kids-voca.git
   cd kids-voca
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (required for data upload script)
   ```

### Running the App

- Start development server:
  ```bash
  pnpm dev
  ```
- Build for production:
  ```bash
  pnpm build
  ```
- Preview production build:
  ```bash
  pnpm preview
  ```

## 📊 Data Structure

### Supabase 'words' Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | int8 (PK) | Unique identifier |
| `word` | text | The English word |
| `meaning` | text | The Korean meaning |
| `image_url` | text | Public URL to the image in Supabase Storage |

### Storage Bucket
- **Bucket Name**: `flashcards`
- **Path**: `images/{word}.jpg`

## 🧪 Testing & Quality

- **Run Tests**: `pnpm test`
- **Coverage**: `pnpm test:coverage`
- **Linting**: `pnpm lint` (Fix with `pnpm lint:fix`)
- **Formatting**: `pnpm format`
- **Type Checking**: `pnpm typecheck`

## 📂 Project Structure

```text
├── src/
│   ├── components/       # UI Components (Flashcard, Quiz, etc.)
│   │   └── ui/           # Reusable Radix/Shadcn UI components
│   ├── hooks/            # Custom React hooks (vocabulary, stats, etc.)
│   ├── lib/              # Utility functions (utils.ts)
│   ├── types/            # TypeScript definitions
│   ├── supabase.ts       # Supabase client config
│   ├── App.tsx           # Main application entry
│   └── main.tsx          # React application root
├── scripts/              # Utility scripts (e.g., upload_json.js)
├── data/                 # Raw data files (JSON, CSV, concept)
└── .test/                # Test setup and configuration
```

## 🛠 Development Conventions

- **Functional Components**: Use React Functional Components with Hooks.
- **Tailwind CSS**: Follow utility-first patterns for styling.
- **Biome**: Strictly enforced linting and formatting. Run `pnpm lint:fix` before committing.
- **Data Flow**: Vocabulary data is fetched from Supabase on application load.

## 📜 License

This project is private and for educational purposes.
