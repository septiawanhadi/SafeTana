# PRD Generator Skill

> Generates a **build contract for AI agent coders** — not a business requirements doc for humans.
> Every section must reduce hallucination surface area, not just describe features.

---

## 0. CORE PRINCIPLE

A PRD for an AI agent coder must answer every question the agent might ask **before** it starts coding. If the agent has to guess, it will guess wrong.

**Hallucination surface area** = any detail left unspecified.
Your job is to eliminate it entirely.

---

## 1. INTAKE — EXTRACT FROM INPUTS

Before writing a single line of PRD, extract everything available from the inputs provided. Inputs may include:

- Meeting notes / transcripts (structured or messy)
- Client or product brief (PDF, text, images)
- Reference app URLs or screenshots
- Voice recording transcripts
- Whiteboard photos or sketches
- Prior PRD drafts
- Competitor screenshots

**Extraction checklist — pull from every input:**

```
IDENTITY
  □ App/product name, tagline
  □ Company or team name
  □ Platform (web, iOS, Android, cross-platform, desktop)
  □ Industry / domain
  □ Target users (who will use this app)
  □ Brand personality (enterprise? consumer? playful? minimal?)
  □ Existing brand colors (extract hex if possible)
  □ Logo availability

SCREENS & NAVIGATION
  □ All screens/routes requested
  □ Navigation pattern (tab bar, drawer, stack, sidebar)
  □ Sub-screens / nested routes
  □ Onboarding or auth flow

FEATURES PER SCREEN
  □ Every screen and its purpose
  □ Primary CTA per screen
  □ User inputs (forms, pickers, sliders)
  □ Data displayed (lists, cards, detail views)
  □ Empty states, loading states, error states

FEATURES (CROSS-CUTTING)
  □ Authentication (email, social, magic link, none)
  □ Push notifications
  □ Offline support / caching
  □ Real-time updates (sockets, polling)
  □ File uploads (images, documents)
  □ Payments / in-app purchases
  □ Analytics (Mixpanel, Amplitude, Firebase, etc.)
  □ Search / filtering
  □ Maps / geolocation
  □ Camera / media access
  □ Sharing / deep links

BACKEND / DATA
  □ Backend type (REST API, GraphQL, Firebase, Supabase, custom)
  □ Database (Postgres, Firestore, SQLite, etc.)
  □ Auth provider (Supabase Auth, Firebase Auth, Auth0, custom)
  □ File storage (S3, Cloudinary, Firebase Storage)
  □ Third-party APIs (payment, SMS, email, maps, AI, etc.)

TECH PREFERENCES
  □ Framework (React Native, Flutter, Next.js, Swift, Kotlin, etc.)
  □ Styling (Tailwind, NativeWind, StyleSheet, etc.)
  □ State management (Zustand, Redux, Context, Riverpod, etc.)
  □ Component library (shadcn, NativeBase, MUI, etc.)
  □ Deployment target (App Store, Play Store, Vercel, AWS, etc.)
  □ Language (TypeScript? Dart? Swift? Kotlin?)

BRAND / DESIGN
  □ Color palette
  □ Typography preferences
  □ Visual aesthetic
  □ Dark/light mode support
  □ Reference apps mentioned

CONSTRAINTS
  □ Timeline
  □ Budget signals (affects scope)
  □ Performance targets
  □ Accessibility requirements (WCAG level)
  □ Offline-first requirement
  □ Minimum OS/browser version support
```

**Conflict detection:** If inputs contradict each other, flag it explicitly in the Open Questions section. Do NOT silently pick one.

---

## 2. PRD STRUCTURE — MANDATORY SECTIONS

Generate sections in this exact order. Never skip a section. If information is missing, mark it with `⏳ PENDING` and note what the agent should wait for before building that section.

```
Section 0:   Agent Instructions
Section 1:   Brand & Design System
Section 2:   Project Architecture
Section 3:   Navigation & Global Shell
Section 4+:  Screens (one section per screen)
Section N:   Global Features
Section N+1: Data Schemas & Mock Data
Section N+2: Environment Variables
Section N+3: Build Order (Phase-Locked)
Section N+4: Open Questions
```

---

## 3. AGENT INSTRUCTIONS (Section 0)

This goes FIRST. It is a system prompt for the AI agent that will build from this PRD.

**Always include and customize:**

```
You are a [ROLE] building a [APP TYPE] for [PRODUCT/COMPANY].
Follow this PRD section by section. NEVER skip phases.
NEVER generate placeholder logic — every component must be wired and functional.
ALWAYS use the design tokens defined in Section 1 before writing any UI code.
If a section references a specific library ([LIBRARY]), use that exact
library — do not fabricate a lookalike.
After each phase, output: "✅ Phase [N] complete. Ready for review."
Wait for explicit approval before continuing to the next phase.
```

Replace `[ROLE]`, `[APP TYPE]`, `[PRODUCT/COMPANY]`, and `[LIBRARY]` with real values. Never leave generic placeholders.

---

## 4. DESIGN SYSTEM (Section 1)

Eliminates ALL visual hallucination. The agent must never invent colors, fonts, spacing, or animation curves.

### 4.1 Color Tokens

Generate a complete token set. Derive from brand materials, or infer from industry aesthetic:
- Enterprise/SaaS → navy, slate, white, blue accent
- Consumer/social → vibrant accent, white, soft grays
- Health/wellness → green, white, warm neutrals
- Finance → deep blue/green, white, gold accent
- Creative/media → bold accent, near-black, off-white

```ts
colors: {
  // Base palette (4–6 tokens)
  '[prefix]-bg':          '#XXXXXX',  // main background
  '[prefix]-surface':     '#XXXXXX',  // cards, sheets
  '[prefix]-accent':      '#XXXXXX',  // primary CTAs
  '[prefix]-accent-muted':'#XXXXXX',  // hover/pressed states
  '[prefix]-text':        '#XXXXXX',  // primary text
  '[prefix]-text-muted':  '#XXXXXX',  // secondary text

  // Semantic (map to above)
  'bg-primary':   '[value]',
  'bg-surface':   '[value]',
  'text-primary': '[value]',
  'text-muted':   '[value]',
  'accent':       '[value]',
  'accent-muted': '[value]',
  
  // Status colors
  'success': '#XXXXXX',
  'warning': '#XXXXXX',
  'error':   '#XXXXXX',
  'info':    '#XXXXXX',
}
```

Use a short prefix from the product name (e.g. `app-`, `nx-`, `flo-`).

### 4.2 Typography

Always specify:
- Display font (headings, hero): with source (Google Fonts, system, local)
- Body font (paragraphs, UI labels): with source
- Mono font (code, tags, badges): with source
- Font size scale using `clamp()` or named steps (xs → 4xl)
- Line height and letter spacing per scale step

Font aesthetic by brand personality:
- Enterprise/professional → Inter, DM Sans, Plus Jakarta Sans
- Editorial/brand → Playfair Display, Cormorant, DM Serif
- Technical/developer → Space Grotesk, JetBrains Mono, Geist
- Friendly/consumer → Nunito, Poppins, Quicksand
- Bold/creative → Syne, Monument Extended, Cabinet Grotesk

### 4.3 Motion Tokens

Define in `/lib/animations.ts` (web) or `/utils/animations.ts` (native). Never inline animation values.

Minimum required variants:
```ts
fadeUp          // standard entrance from below
fadeIn          // opacity only (overlays, modals)
staggerContainer // parent for staggered children
slideInRight    // horizontal entrance (drawers, sheets)
slideInUp       // bottom sheet / modal entrance
scaleIn         // popover / dropdown entrance
```

Always include `prefers-reduced-motion` handling.

### 4.4 Global Rules

Always state:
- Background alternation pattern (if multi-section layout)
- Max content width + padding values
- Border radius scale (sm, md, lg, full)
- Shadow scale (none, sm, md, lg, xl)
- Never use pure `#000000` or `#FFFFFF` — always use token values
- Image handling rules (aspect ratios, object-fit)
- Primary CTA style (exact classes or style object)
- Secondary/ghost button style

---

## 5. ARCHITECTURE (Section 2)

### 5.1 Folder Structure

Generate the FULL folder tree including:
- All screens / page routes
- All component directories (layout/, screens/, shared/, ui/)
- All lib/utils files (animations, tokens, api client, auth, etc.)
- State management files
- Type definitions
- Config files
- Assets directory

Every file in the tree must have an inline comment explaining its purpose.

**Example (React Native / Expo):**
```
/app
  /(auth)
    login.tsx        # Login screen
    register.tsx     # Registration screen
  /(tabs)
    index.tsx        # Home tab
    explore.tsx      # Explore tab
    profile.tsx      # Profile tab
/components
  /ui                # Base design system components (Button, Card, Input)
  /shared            # Reusable business components
  /screens           # Screen-specific components
/lib
  animations.ts      # All motion variants
  tokens.ts          # Design tokens
  api.ts             # API client singleton
  auth.ts            # Auth helpers
/types
  index.ts           # All TypeScript interfaces
/constants
  config.ts          # App config, feature flags
```

### 5.2 Tech Dependencies

List every package with install commands. Group by:
- Core framework
- Navigation
- State management
- UI components
- Animation
- Backend/API
- Utilities
- Dev tools

For every non-obvious package, add a one-line comment explaining WHY it was chosen for this project.

### 5.3 Special Setup Instructions

For any tool requiring initialization (Supabase, Firebase, Prisma, Stripe, etc.), include the exact CLI commands and what they generate.

---

## 6. SCREEN SECTIONS (Section 4+)

Each screen gets its own numbered section. Within each screen, each UI region gets its own subsection.

**Per screen, always specify:**

```
ROUTE/PATH:    the route string or screen name
BACKGROUND:    which color token
LAYOUT:        describe scroll behavior, safe areas, keyboard avoidance
HEADER:        title, left action, right action (or "none")
SECTIONS:      list all visual regions top to bottom
CTAs:          button text, style variant, action/destination
LOADING STATE: skeleton or spinner behavior
EMPTY STATE:   what to show with no data
ERROR STATE:   what to show on failure
ANIMATION:     which motion variant, trigger type
DATA SOURCE:   which API endpoint or store selector
```

For interactive elements (modals, bottom sheets, pickers, carousels):
```
LIBRARY:    which library handles this
BEHAVIOR:   describe interaction in plain English
EDGE CASES: empty, loading, error, mobile keyboard overlap
```

---

## 7. GLOBAL FEATURES (Section N)

### 7.1 Navigation Shell
- Navigator type (Stack, Tab, Drawer, or combination)
- Tab bar items (icon, label, route)
- Header behavior (transparent on scroll, sticky, hidden on scroll)
- Back button / gesture behavior
- Deep link structure

### 7.2 Authentication Flow
- Screens in auth flow (splash → onboarding → login → register → forgot password)
- Session persistence strategy
- Token storage (secure storage, keychain)
- Redirect logic after login/logout

### 7.3 Forms & Validation
For every form: field list, validation rules, submission handler, success/error states, where data goes.

### 7.4 API Integration
Always generate the API client utility:
```ts
// /lib/api.ts — SINGLE SOURCE OF TRUTH for all API calls
const BASE_URL = process.env.EXPO_PUBLIC_API_URL

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T>
```
Define all API endpoints as typed constants. Never hardcode URLs in components.

### 7.5 State Management
- Which state manager and why
- Global store shape (typed)
- Which state is local vs global
- Persistence strategy (AsyncStorage, MMKV, etc.)

### 7.6 Push Notifications (if present)
- Provider (FCM, APNs, Expo Notifications)
- Permission request timing
- Notification types and payloads
- Deep link behavior on tap

### 7.7 Analytics & Tracking
- Events to track (screen views, button taps, conversions)
- Event naming convention
- User properties to set
- Provider SDK setup

### 7.8 Performance
Always include:
- Target load time for primary screen (ms)
- Image optimization strategy (lazy load, caching, CDN)
- List virtualization rule (FlatList/FlashList for any list > 20 items)
- Bundle size targets if applicable
- Background/foreground state handling

### 7.9 Accessibility
- Minimum tap target size (44×44pt)
- Screen reader support requirements
- Color contrast minimums
- Dynamic type / font scaling support

---

## 8. DATA SCHEMAS (Section N+1)

For every data type in the project:

```ts
interface [Type] {
  id: string           // always include id
  createdAt: string    // ISO 8601
  updatedAt: string    // ISO 8601
  // all other fields with types
  // optional fields marked with ?
  // arrays typed explicitly
}
```

Always provide mock data seeds — minimum counts to render the UI without looking empty:
- Lists / feeds: minimum 10 items
- Grid views: minimum 9 items (3×3)
- Detail + related items: minimum 3 related
- Notifications: minimum 5
- Search results: minimum 8

---

## 9. ENVIRONMENT VARIABLES (Section N+2)

List every env var with:
- Variable name
- Example value or description
- Which service provides it
- Whether it's public or server-only
- What breaks if it's missing

```
EXPO_PUBLIC_API_URL          = https://api.yourapp.com    # API base URL (public)
EXPO_PUBLIC_SUPABASE_URL     = https://xxx.supabase.co    # Supabase project URL (public)
SUPABASE_SERVICE_ROLE_KEY    = eyJ...                      # Server-only, never expose
STRIPE_SECRET_KEY            = sk_live_...                 # Payments, server-only
EXPO_PUBLIC_MAPS_API_KEY     = AIza...                     # Google Maps (public)
```

---

## 10. BUILD ORDER — PHASE-LOCKED (Section N+3)

**Most critical section for preventing AI agent failure.**

Rules:
1. Design tokens ALWAYS Phase 1 — no exceptions
2. Project scaffold ALWAYS Phase 2
3. Navigation shell ALWAYS Phase 3
4. Auth flow before any authenticated screens
5. Screens from simplest to most complex
6. Backend integrations after all UI phases are approved
7. Performance audit ALWAYS last

Format:
```
Phase 1:  Design tokens + global styles         ← Nothing renders without these
Phase 2:  Project scaffold + folder structure   ← Architecture locked before code
Phase 3:  Navigation shell + tab structure      ← All routes wired before screens
Phase 4:  Auth screens (Login, Register)        ← Gate all protected screens
Phase 5:  [Screen A] — simplest screen          ← Build confidence with easy win
Phase 6:  [Screen B] — moderate complexity
Phase 7:  [Screen C] — most complex screen
Phase 8:  API integration + real data
Phase 9:  Push notifications + deep links
Phase 10: Performance audit + accessibility pass

⛔ RULE: Do NOT start Phase N+1 until Phase N is visually approved.
⛔ RULE: Never hardcode any color hex — use token values only.
⛔ RULE: Use /lib/animations.ts variants only — never inline animation values.
⛔ RULE: Every list with potential for >20 items must use FlatList or FlashList.
⛔ RULE: Every API call goes through /lib/api.ts — never fetch() directly in components.
⛔ RULE: Never store sensitive tokens in AsyncStorage — use SecureStore or Keychain.
```

Add 2–3 project-specific rules based on the chosen tech stack.

---

## 11. OPEN QUESTIONS TABLE (Section N+4)

| # | Question | Status | Impact if Unresolved |
|---|----------|--------|----------------------|
| 1 | [Question] | ⏳ PENDING | [What breaks or gets blocked] |
| 2 | [Question] | ✅ RESOLVED | [Answer] |
| 3 | [Question] | ⚠️ PARTIAL | [What's known, what's still missing] |

Populate from:
- Any `⏳ PENDING` markers placed during intake
- Conflicts detected between input sources
- Missing content (copy, assets, credentials, API docs)
- Decisions that affect architecture (backend choice, auth, payments)

---

## 12. QUALITY GATES

Before outputting the PRD, self-check:

```
□ Agent Instructions present and customized (not generic)?
□ Every color token has a real hex value (no "TBD")?
□ Every font has a named source (Google Fonts, system, local)?
□ Every animation variant defined in /lib/animations.ts?
□ Every screen has an explicit section breakdown?
□ Every form has field list + validation + submission handler?
□ Every 3rd-party component named exactly (not "a picker component")?
□ Every data type has a TypeScript interface?
□ Mock data seed counts specified for every list/grid?
□ Environment variables listed with sources + risk if missing?
□ Build order has phase-locked ⛔ rules?
□ Open questions table populated?
□ Conflicts between inputs flagged (not silently resolved)?
□ Real product copy used where available (not Lorem Ipsum)?
□ File naming conventions specified?
□ Loading, empty, and error states defined for every data screen?
□ Accessibility minimums stated (tap target, contrast, font scaling)?
```

If any box is unchecked, fill it before outputting.

---

## 13. OUTPUT FORMAT

- Output as a single Markdown file
- Filename: `PRD_[AppName]_[Platform].md`
- Version header: `**Version:** 1.0`
- Stack summary: list all major tech choices in the header
- Include a one-line "Agent Workflow" summary in the header
- Use `##` for main sections, `###` for subsections, `####` for sub-subsections
- Use fenced code blocks with language tags for all code
- Use tables for structured data (open questions, env vars, schemas)
- Use `⛔` for hard rules, `✅` for resolved items, `⏳` for pending, `⚠️` for conflicts

---

## 14. VERSIONING

After initial PRD output, if the user provides additional inputs (new screens, corrections, client feedback):

1. Identify which sections are affected
2. Use surgical edits — do NOT regenerate the whole PRD
3. Update the version number (1.0 → 1.1 → 1.2)
4. Add a footer note describing what changed and why
5. Flag any new conflicts or pending items introduced by the new information

---

## 15. WHAT MAKES THIS PRD DIFFERENT FROM A FEATURE LIST

**A feature list:** "Add a profile screen with edit functionality"

**This PRD:**
```ts
// ProfileScreen — /app/(tabs)/profile.tsx
//
// Layout: ScrollView, no header title, safe area insets
// Sections:
//   1. AvatarSection     — user photo (circle, 80px), tap to open ImagePicker
//   2. DisplayNameField  — inline editable text, saves on blur
//   3. BioField          — multiline, max 160 chars, char counter
//   4. AccountSection    — email (read-only), change password link
//   5. DangerZone        — "Delete Account" destructive button (confirmation sheet)
//
// Data: useProfileStore() → { user, updateUser, deleteAccount }
// API:  PATCH /users/:id, DELETE /users/:id
// Loading state: skeleton for avatar + name + bio
// Error state:   toast "Failed to save. Try again."
// Success state: toast "Profile updated ✓"
// Empty avatar:  initials avatar from display name

⛔ RULE: Never call API directly from component — use store actions only.
⛔ RULE: Image uploads go through /lib/storage.ts uploadAvatar() only.
```

**Every feature must be specified to this level of detail.**
If you can't write the implementation note, the feature is underspecified — go back to intake and extract more information.
