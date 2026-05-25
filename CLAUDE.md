# Pathfinder

AI-powered career guidance app for students in Germany (16+). A conversational interface that asks about interests, work style, and values, then recommends personalised career paths from the German system.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- **AI**: Claude API (`claude-sonnet-4-6`) with streaming + prompt caching
- **i18n**: next-intl v4 — German (`/de`) and English (`/en`)
- **Deployment**: Vercel (GitHub repo: `vikaskapoor757/pathfinder`)

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout — owns <html> and <body>
│   ├── page.tsx                    # Redirects / → /de
│   ├── [locale]/
│   │   ├── layout.tsx              # NextIntlClientProvider wrapper (no html/body)
│   │   ├── page.tsx                # Landing page
│   │   └── chat/page.tsx           # Chat page (client component)
│   └── api/chat/route.ts           # Streaming Claude API endpoint
├── components/
│   └── ChatInterface.tsx           # Full chat UI with streaming + message bubbles
├── data/
│   └── career-paths.ts             # 23 German career paths + buildSystemPrompt()
└── i18n/
    ├── routing.ts                  # Locale config (de, en — default: de)
    └── request.ts                  # next-intl server config
messages/
├── de.json                         # German UI strings
└── en.json                         # English UI strings
middleware.ts                       # next-intl locale routing middleware
```

## Key Decisions Made

- **Age 16+**: avoids GDPR parental consent requirement (under-16 needs parental consent in Germany)
- **Germany-first**: all 23 career paths reflect the German system specifically
- **B2C first**, B2B (schools) later
- **Root layout owns `<html><body>`**: Next.js 16 requires this — locale layout is provider-only
- **Prompt caching**: system prompt sent with `cache_control: ephemeral` to reduce API costs
- **Streaming**: SSE-based streaming from `/api/chat` route, rendered in real-time in the UI

## German Career Paths (23 total)

Ausbildung, Duales Studium, Universität, Fachhochschule/HAW, Meister, Staatlich geprüfter Techniker, Fachwirt/Betriebswirt (IHK), Erzieher/-in, Pflegefachmann/-frau, FSJ, FÖJ, BFD, Europäisches Solidaritätskorps, weltwärts, Work & Travel, Au Pair, Sprachkurs im Ausland, Bundeswehr, Polizei/Feuerwehr, Selbstständigkeit/Gründung, Fernstudium, Gap Year, Zweiter Bildungsweg

## AI Conversation Flow

The system prompt (`buildSystemPrompt()` in `src/data/career-paths.ts`) instructs Claude to:
1. Open with a friendly question about leisure interests
2. Explore work style (hands-on vs. theoretical, alone vs. with people)
3. Explore values (security, freedom, creativity, money, helping others, adventure)
4. Optionally ask about school qualification and geographic flexibility
5. After 5–8 exchanges: recommend 2–3 paths with explicit reasoning why they fit

Claude detects language from user input and responds in German or English automatically.

## Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...
```

Create `.env.local` in the project root with this variable. Never commit this file (already in `.gitignore`).

## Running Locally

```bash
npm install
npm run dev
# → http://localhost:3000  (redirects to /de automatically)
```

## Deployment

Hosted on Vercel. Every `git push` to `main` triggers an automatic redeploy.

```bash
git add .
git commit -m "your change"
git push
```

## Planned Next Steps

- User accounts (Supabase auth) — save conversation results
- Subscription payments (Stripe, with SEPA support for Germany)
- Expo mobile app (iOS + Android) sharing the same API
- B2B school licenses
- More career path detail pages with links to official resources
