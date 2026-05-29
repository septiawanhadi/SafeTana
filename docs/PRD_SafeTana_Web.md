# PRD_SafeTana_Web.md
**Version:** 2.0
**Stack Summary:** React 19.2.0, Vite (rolldown-vite), Tailwind CSS 4.1.18, Leaflet 1.9.4, Firestore, Firebase Cloud Functions, Gemini/Groq Fallback Chain, WebAssembly (NullClawBridge).
**Agent Workflow:** Follow Phase-Locked build orders. Never use placeholder logic.

---

## 0. AGENT INSTRUCTIONS (Section 0)

You are a **Senior React 19 Developer & Security Architect** building **SafeTana**, an AI-Enhanced Disaster Mitigation & Public Health Portal.
*   Follow this PRD section by section. **NEVER skip phases.**
*   **NEVER generate placeholder logic** — every component, hook, context, utility, and API integration must be fully wired and operational.
*   **ALWAYS use the design tokens** defined in Section 1 before writing any UI code.
*   If a section references a specific library (**Leaflet** for maps, **Firebase** for database, **Lucide-React** for icons, **React Player** for media), use that exact library — do not fabricate lookalikes or wrappers.
*   After each phase, output: `"✅ Phase [N] complete. Ready for review."`
*   Wait for explicit approval before continuing to the next phase.

---

## 1. BRAND & DESIGN SYSTEM (Section 1)

### 1.1 Color Tokens
SafeTana uses a dark, high-contrast, premium aesthetic mapped via Tailwind theme custom properties and HSL variables in `index.css` to ensure visibility during power grid failures.

```ts
colors: {
  // Base Palette (st- prefix mapped to MD3 values)
  'st-bg':           '#0b1326',  // Space Cadet Main Dark BG (var(--background))
  'st-surface':      '#131b2e',  // Deep Blue Card Surface (surface-container-low)
  'st-accent':       '#c3c0ff',  // Light Lavender Primary Accent (primary)
  'st-accent-muted': '#4f46e5',  // Indigo Primary Container (primary-container)
  'st-text':         '#dae2fd',  // High-Contrast Off-White (on-surface / var(--on-background))
  'st-text-muted':   '#c7c4d8',  // Muted Slate Blue-Gray (on-surface-variant)

  // Semantic Mappings
  'bg-primary':      '#0b1326',
  'bg-surface':      '#131b2e',
  'text-primary':    '#dae2fd',
  'text-muted':      '#c7c4d8',
  'accent':          '#c3c0ff',
  'accent-muted':    '#4f46e5',
  
  // Status Colors (WCAG AAA compliant contrast ratios on dark background)
  'success':         '#22c55e',  // Vibrant Emerald Green
  'warning':         '#f59e0b',  // Amber Orange
  'error':           '#ffb4ab',  // Soft Crimson Red (error)
  'info':            '#3b82f6',  // Cobalt Blue
}
```

### 1.2 Typography
*   **Display Font (Headings, Heroes)**: *Outfit* via Google Fonts (High visual punch sans-serif).
*   **Headline Font (Section titles)**: *Plus Jakarta Sans* via Google Fonts (Clean geometric shapes).
*   **Body & Label Font (Paragraphs, Forms, Buttons)**: *Inter* via Google Fonts (Neutral, ultra-clear readability at micro-sizes).
*   **Mono Font (Status badges, Coordinates, Logs)**: *JetBrains Mono* (Uniform monospace character widths).
*   **Size Scale**:
    *   `xs`: `0.75rem` / line-height: `1` (Badges, units, fine print)
    *   `sm`: `0.875rem` / line-height: `1.25` (Descriptions, helper text, input labels)
    *   `base`: `1rem` / line-height: `1.5` (Body text, input fields)
    *   `lg`: `1.125rem` / line-height: `1.75` (Card headers, sub-sections)
    *   `xl`: `1.25rem` / line-height: `1.75` (Main card titles, widget headers)
    *   `2xl` to `5xl`: `clamp(1.5rem, 5vw, 3rem)` / line-height: `1` (Display status indicators)
*   **Font Weights**: `Light` (300), `Regular` (400), `Medium` (500), `Semi-Bold` (600), `Bold` (700), `Black` (900).

### 1.3 Motion Tokens
All animations are defined inside [index.css](file:///c:/Users/Septiawan%20Hadi/SafeTana/src/index.css) as keyframes or custom Tailwind utility overrides:
*   `fadeIn`: Opacity transitions (`0` to `1`) over `300ms` with `ease-out`. Used on modal overlays.
*   `fadeUp`: Opacity (`0` to `1`) + vertical translation (`20px` to `0`) over `500ms` with `cubic-bezier(0.16, 1, 0.3, 1)`. Used on bento grid entries.
*   `slideInRight`: Horizontal translation (`100%` to `0%`) over `400ms` with custom spring transition. Used on symptom chatbot drawer.
*   `pulse-hazard`: Keyframe `pulse-ring` scaling (`0.95` to `1.0`) + shadow ring expansion (`rgba(245, 158, 11, 0.7)` to `transparent`) over `2s` infinite loops. Used on active hazard warning markers.
*   `pulse-red`: Keyframe `pulse-red` scaling (`0.95` to `1.0`) + shadow expansion (`rgba(220, 38, 38, 0.7)` to `transparent`) over `2s` infinite loops. Used on emergency SOS markers and nav badges.
*   `breathing-aura`: periodic opacity pulse (`0.8` to `1.0`) + glow ring pulse (`rgba(195, 192, 255, 0.4)` to `rgba(195, 192, 255, 0.8)`) over `4s` linear loop. Used on safe zone badges.
*   *Prefers-Reduced-Motion*: All animations fall back immediately to standard static transitions if browser accessibility preferences are active.

### 1.4 Global Rules
*   **Background Alternation**: Alternate layout blocks between `bg-primary` (`#0b1326`) and `bg-surface` (`#131b2e`) to create distinct depth layers.
*   **Max Content Width**: Fixed `max-w-6xl` (`1152px`) with responsive horizontal margins and `px-4 md:px-6` padding.
*   **Border Radius Scale**: `sm` (`4px`), `md` (`8px`), `lg` (`16px`/`1rem`), `xl` (`32px`/`2rem` for cards), `full` (pill buttons).
*   **Shadow Scale**: `none`, `sm` (`0 1px 2px`), `md` (`0 4px 6px`), `lg` (`0 10px 15px`), `xl` (`0 25px 50px` for dialog overlays).
*   **Primary CTA Style**: Glassmorphic styling with gradient border (`background: rgba(195, 192, 255, 0.15); border: 1px solid rgba(195, 192, 255, 0.25); backdrop-filter: blur(12px)`).
*   **Never use pure black (`#000000`) or pure white (`#FFFFFF`)**: Always leverage the token colors (`st-bg` and `st-text`) or MD3 variables.

---

## 2. PROJECT ARCHITECTURE (Section 2)

### 2.1 Complete Directory Mapping
```
/api
  cron-poll.js             # Vercel: Polls BMKG & GDACS data every 3 minutes
  news.js                  # Vercel: Fetches RSS crisis feeds and sanitizes response
  telegram-webhook.js      # Vercel: Handles incoming Telegram warnings and crisis broadcasts
  yt-search.js             # Vercel: Media proxy searching recovery tracks for Vibe Lounge
  /health
    bpjs.js                # Vercel: Checks citizenship NIK against BPJS database
    satusehat.js           # Vercel: Standard FHIR observer API sync to SatuSehat Kemenkes
/functions
  index.js                 # Firebase: Scheduled functions sending push alerts to client SW
  package.json             # Firebase cloud function package manifest
/public
  firebase-messaging-sw.js # FCM: Background service worker listening to push alerts
  logo.png                 # Main high-contrast vector brand logo
  /agents
    nullclaw_agent.wasm    # WebAssembly binary for offline hazard analysis
/src
  /assets                  # Vector SVGs and brand assets
  /components
    /common
      BottomNavBar.jsx     # Navigation bar with dynamic indicators and SOS trigger
      DynamicIsland.jsx    # Notch overlay handling active alarms and audio players
      TopAppBar.jsx        # Telemetry bar with connection indicators and clock
    /health
      HealthAbout.jsx      # Panel explaining SatuSehat FHIR compliance
      HealthAuth.jsx       # Citizen registration & login gate (Firebase Auth)
      HealthChatbot.jsx    # AI medical symptom symptom checker drawer
      HealthDashboard.jsx  # Telemetry cockpit checking BPJS & SatuSehat status
      HealthDictionary.jsx # Medical search index matching terms to AI definitions
      HealthPrivacy.jsx    # User-data security and cryptographic guidelines
      HealthScreening.jsx  # Vital sign wizard generating FHIR observation payloads
      HealthTerms.jsx      # Portal conditions of use and legal clauses
      MoodTracker.jsx      # Mental lounge mood logger & Vibe Lounge audio proxy
      SatuSehatFasyankes.jsx # West Java medical clinic spatial directory and database
    SplashScreen.jsx       # Entry animation with synthesized oscillator chime
    OnboardingScreen.jsx   # Slider explaining app controls and emergency protocol
  /constants
    /health
      counselingPlaylist.js # recovery audio playlist with metadata and IDs
  /contexts
    DynamicIslandContext.jsx # Global audio stream state and active alarm alerts store
  /data
    kabBandungSafeZones.js # GeoJSON points of safe locations in Kab. Bandung
    mockFasyankesJabar.js  # GeoJSON points of West Java medical clinics
    puskesmasJabar.json    # Complete index list of primary clinics in West Java
    safeZones.js           # GeoJSON points of safe locations in Bandung City
  /services
    /health
      NullClawBridge.js    # Simulation bridge initializing local WASM or JS offline triage
      aiService.js         # Symptom analyzer AI client mapping to Gemini REST
      bpjsService.js       # Client connection layer checking NIK status against BPJS proxy
      dataService.js       # Firestore client fetching mood logs and synchronization markers
      satuSehatService.js  # Direct HL7 FHIR compliance mapper and data sync connector
    bmkgService.js         # BMKG disaster parser fetching earthquakes, floods, and ash
    bnpbService.js         # BNPB hazard mapping configurations
    disasterAiService.js   # Triple-tier LLM fallback gateway (Gemini -> Groq -> OpenAI)
    envService.js          # AQI & local environmental variables weather parser
    hazardService.js       # Aggregator polling hazards and calculating proximity warning
  /utils
    audioUtils.js          # Tone synthesizer generating chime sounds and sirens
    geoUtils.js            # Haversine distance calculator and location formatter
    healthUtils.js         # Calculations for BMI, cardiovascular, and diabetes risk
    healthEvaluation.js    # Evaluator confirming calculation formula validity
    healthBenchmark.test.js # Benchmark validation tests
    healthScreening.test.js # Unit test suite validating FHIR calculator outputs
  AdminLogin.jsx           # Gatekeeper admin access form
  AiChatbot.jsx            # Dynamic disaster assistant chat drawer
  App.jsx                  # Main application route shell & polling controller
  eslint.config.js         # Multi-environment ESLint flat configurations
  index.css                # Global styles, Tailwind base directives, and design system variables
  kamusData.json           # Local dictionary index of medical terms
  main.jsx                 # Entry execution wrapper loading App inside StrictMode
  package.json             # Vite application dependencies and compiler properties
  securityUtils.js         # Cryptographic anonymizer and input sanitization layer
  vite.config.js           # Rolldown Vite configurations and React directives
```

### 2.2 Tech Dependencies
*   **Core Framework**: React `^19.2.0` + React DOM `^19.2.4`
*   **Vite Compiler**: `rolldown-vite` `7.2.5` (Optimized ESM compiler replacing default Vite rollup configuration for sub-second hot reloads)
*   **Navigation**: `react-router-dom` `^7.13.1` (Dynamic client router)
*   **Geospatial Maps**: `leaflet` `^1.9.4` & `react-leaflet` `^5.0.0`
*   **AI Models SDK**: `@google/generative-ai` `^0.24.1` (Direct Gemini integration)
*   **Database & Core Auth**: `firebase` `^12.10.0` & `firebase-admin` `^13.8.0`
*   **Media Streaming**: `react-player` `^3.4.0`
*   **Helper Tools**: `lucide-react` `^0.563.0` (Icons), `react-markdown` `^10.1.0` (AI response formatter), `lz-string` `^1.5.0` (Local compression client)
*   **Unit Tests**: `vitest` `^4.1.4`

### 2.3 Special Setup Instructions
*   **Firebase Initializer**: Auth credentials must reside in environmental parameters, establishing connections inside [firebase.js](file:///c:/Users/Septiawan%20Hadi/SafeTana/src/firebase.js):
    ```js
    import { initializeApp } from "firebase/app";
    import { getAuth } from "firebase/auth";
    import { getFirestore } from "firebase/firestore";
    import { getMessaging } from "firebase/messaging";
    ```
*   **Service Worker Config**: `firebase-messaging-sw.js` must be served from root `/public/` directory to satisfy FCM push listener rules.

---

## 3. NAVIGATION & GLOBAL SHELL (Section 3)

### 3.1 Routing & History Masking Matrix
All URL routes (except `/admin` and legal pages `/health/terms`, `/health/privacy`) are programmatically masked from the client browser address bar using `window.history.replaceState` to prevent structure scraping and mitigate clickjacking vectors.
*   `/` -> Default screen displaying Splash/Onboarding first, then transitioning into Bento Dashboard.
*   `/map` -> Full geospatial view mapping Leaflet interface with live incidents and sanctuaries.
*   `/news` -> Real-time disaster feed parser sorting global and regional RSS feeds.
*   `/education` -> Disaster mitigation guidebook and quiz deck.
*   `/health` -> Main SatuSehat & BPJS health cockpit.
*   `/health/auth` -> Firebase auth gateway gate-keeping medical features.
*   `/health/screening` -> Vital screening wizard matching LOINC-compliant metrics.
*   `/health/mood` -> Mental lounge recovery console, mood logger, and audio player.
*   `/health/fasyankes` -> Full directory directory search of West Java clinics.

### 3.2 Main Layout Elements
*   **TopAppBar**: Static telemetry status bar, detailing system clock, active network state indicator (Online/Offline), and proximity threat levels.
*   **BottomNavBar**: Dynamic dock containing five nav links: Home, Maps, News, Education, and Health, with a central red SOS trigger button.
*   **Dynamic Island Notch**: Top floating bar overlaying active states (Current track playing in Vibe Lounge, countdown timers, hazard broadcast alarms).

---

## 4. SCREEN SPECIFICATIONS (Section 4+)

### 4.1 Screen 1: Splash & Onboarding
*   **Route**: `/` (Initial render state block)
*   **Background**: `st-bg` (`#0b1326`)
*   **Layout**: Single-column viewport (`100dvh`), centered layout, safe margins.
*   **Interactive Chime Engine**: On mount, if browser restricts audio autoplay, displays a semi-transparent overlay: "*Tap anywhere to start experience*". Once global screen tap occurs, synthesizes clean oscillator tones (Tones: `A4` [440Hz] -> `C#5` [554.37Hz] -> `E5` [659.25Hz] over a `1.1s` duration) using the Web Audio API, and proceeds to state transitions.
*   **Animation Stages**:
    1.  `enter`: Fade in and scale up the high-contrast SafeTana brand logo.
    2.  `tagline`: Smoothly slide up the tagline text ("*Cerdas berbagi, siap mitigasi & peduli kesehatan*").
    3.  `exit`: Trigger fading of Splash layout to render the Onboarding slider.
*   **Onboarding Slider**: Renders a 3-slide visual onboarding card detailing:
    *   *Slide 1*: Disaster warning & telemetry cockpit instructions.
    *   *Slide 2*: SatuSehat FHIR compliance & privacy regulations.
    *   *Slide 3*: Immediate SOS reporting & offline WASM analysis protocols.
    *   *CTA*: "Mulai Sekarang" pill button transitions user permanently into the Main Bento Dashboard (sets local storage state `safetana_onboarded: true`).

### 4.2 Screen 2: Bento Dashboard Cockpit
*   **Route**: `/` (Post-onboarding dashboard default)
*   **Background**: `st-bg` (`#0b1326`)
*   **Layout**: Responsive Bento-style grid system with TopAppBar and BottomNavBar.
*   **Bento Widget Cards**:
    *   **1. Threat Level Widget (Hero Container)**: If `isSOSActive` is `false`, renders green `breathing-aura` borders ("*KONDISI AMAN - Protokol Alpha*"). If `isSOSActive` is `true`, triggers crimson flashing overlay ("*STATUS DARURAT AKTIF - Evakuasi Segera*") playing continuous alerts.
    *   **2. Live Telemetry Panels**: Three real-time data status badges detailing local AQI index, seismic hazard warnings, and current rain fall levels.
    *   **3. Geospatial Monitor Preview**: A miniature grayscale Leaflet canvas displaying local safe zone coordinates. Hovering maps colorizes the preview immediately. Clicking redirects user to `/map`.
    *   **4. Crisis News Widget**: Renders the 3 most recent RSS alert headers.
    *   **5. Health Portal Shortcut Card**: Direct navigation path to `/health` with custom hover slide scales.
    *   **6. Immediate SOS Trigger**: Large crimson pill button. Tapping starts continuous device vibration (`navigator.vibrate`), plays alarm siren, generates a cryptographic hash NIK, and records the current GPS coordinates under `active_users` inside Firestore in real time.

### 4.3 Screen 3: Geospatial Live Monitor Map
*   **Route**: `/map`
*   **Background**: `st-bg` (`#0b1326`)
*   **Layout**: Full-screen layout (`100dvh`), with sticky layers widget, absolute search panel, and marker legends.
*   **Geospatial Layer Rules**:
    *   *Sanctuary Markers*: Green shield vector icons. Clicking opens metadata info detailing remaining shelter capacity.
    *   *Incident Markers*: Red pulsing warning icons representing user-reported emergencies (fires, floods, earthquakes). Clicking displays the description and time.
    *   *Active SOS Trackers*: Pulsing rings (`pulse-red`) mapping users who triggered the SOS button.
*   **Empty State/Fallback**: If geolocation coordinates fail, falls back to centering coordinates on West Java Provincial Capitol (Gedung Sate: `-6.902481, 107.618810`) and loads local safe zones from static database arrays.

### 4.4 Screen 4: Weather & Geohazards Cockpit
*   **Route**: `/` (Via Tab Nav or bento toggle)
*   **Background**: `st-bg` (`#0b1326`)
*   **Layout**: Scrollable bento grid presenting real-time parsed data from national services.
*   **Sections**:
    *   *Earthquake Section*: Parsed BMKG REST API detailing recent events with magnitude, epicenter depth, and tsunami danger warnings.
    *   *Flood Section*: Parsed GDACS RSS feed displaying alerts, warning coordinates, and water elevation indexes.
    *   *Local Weather Widget*: Formatted weather telemetry displaying temperature, wind velocity, and humidity.
*   **Loading State**: Shimmering glass card skeletons matching widget dimensions.
*   **Error State**: Renders warning cards with an option to trigger manual poll request ("*Gagal memuat telemetry BMKG. Coba lagi.*").

### 4.5 Screen 5: Crisis News Feed
*   **Route**: `/news`
*   **Background**: `st-bg` (`#0b1326`)
*   **Layout**: Scrollable single-column layout containing cards sorted chronologically.
*   **Sections**:
    *   *Crisis Header*: Clean search bar filtering items by keyword.
    *   *RSS Feeds list*: Maps sanitized news containing source, title summary, publishing date, and original link.
*   **Empty State**: Renders visual indicator stating no matches found for the keyword.
*   **Loading State**: Staggered fadeUp skeletons.

### 4.6 Screen 6: Mitigative Education Portal
*   **Route**: `/education`
*   **Background**: `st-bg` (`#0b1326`)
*   **Layout**: Two-tab block splitting content between "Panduan" (mitigation guidebooks) and "Kamus Mandiri" (dictionary definitions).
*   **Interactive Quiz Engine**:
    *   Inline cards posing scenario questions (e.g. "*Apa tindakan pertama saat terjadi gempa bumi di gedung bertingkat?*").
    *   Multiple-choice check buttons updating state immediately with success or failure indicators.
    *   Tracks user's progress score in local storage.

### 4.7 Screen 7: Incident Report Form
*   **Route**: `/map` (via overlay trigger click)
*   **Background**: Glassmorphic sheet overlaying Leaflet monitor.
*   **Forms Fields**:
    *   *Incident Category Selector*: Dropdown containing `Banjir`, `Gempa Bumi`, `Tanah Longsor`, `Kebakaran`, `Puting Beliung`.
    *   *Sanitized Description Box*: Text input enforcing a max length of `280` characters.
    *   *Geotag coordinate indicators*: Displays current GPS coordinate array.
    *   *Incident Image Attachment*: Captures camera stream or files, mapping filename variables.
*   **Submission Handler**: Validates inputs, sanitizes text through [securityUtils.js](file:///c:/Users/Septiawan%20Hadi/SafeTana/src/securityUtils.js), and publishes incident document straight to Firestore `user_reports` collection.

### 4.8 Screen 8: Integrated Healthcare Portal Cockpit
*   **Route**: `/health`
*   **Background**: `st-bg` (`#0b1326`)
*   **Layout**: Clean single-column layout with bento menu links.
*   **Telemetry Badges**:
    *   *SatuSehat status*: Queries sandbox endpoint. If verified, updates indicator to "*Terhubung (Sandbox)*". If unverified, displays grey status "*Belum Terhubung*".
    *   *BPJS status*: Enforces input of NIK. Posts query to `/api/health/bpjs`, outputting a green badge showing eligibility ("*Status: AKTIF*") if validated.
*   **Bento Paths Matrix**:
    *   Link to Vital signs Screening (`/health/screening`).
    *   Link to Symptom Checker Chatbot drawer (`Tanya AI`).
    *   Link to Mental Lounge (`/health/mood`).
    *   Link to Healthcare Clinic Directory (`/health/fasyankes`).

### 4.9 Screen 9: HL7 FHIR Health Screening
*   **Route**: `/health/screening`
*   **Background**: `st-bg` (`#0b1326`)
*   **Layout**: Form wizard step-by-step progress layout.
*   **Form Variables**:
    *   *Identity Section*: Validates NIK string length (16 digits), age, gender.
    *   *Vitals section*: Weight (kg), height (cm), Systolic pressure, Diastolic pressure (mmHg), Heart rate (BPM).
    *   *Lifestyle section*: Smoker status, diet habits, active exercise patterns.
*   **Algorithmic Calculation Engine**:
    *   *BMI/IMT*: Weight / Height^2 (m) showing custom color gauge outputs (Underweight, Normal, Overweight, Obese).
    *   *Hipertensi Risk*: Evaluates pressure readings, marking classifications in compliance with JNC-8.
*   **SatuSehat Compliance FHIR R4 Mapper**: Submission bundles patient answers, translates metrics into typed FHIR `Observation` schemas (Observation LOINC codes: `8302-2` height, `29463-7` weight), and dispatches payload to `/api/health/satusehat`.

### 4.10 Screen 10: Counseling Lounge & Vibe Search Pro
*   **Route**: `/health/mood`
*   **Background**: `st-bg` (`#0b1326`)
*   **Layout**: Double-panel portal. Left side: Audio player with responsive equalizer. Right side: Mood logger.
*   **Vibe Search Pro Engine**:
    *   Text input polls keywords.
    *   Fires proxy request to Vercel `/api/yt-search` (Cascading fetch between Invidious/Piped mirrors).
    *   Renders list tiles showing metadata, album art, and duration.
*   **Self-Healing Playback Engine**:
    *   Checks track progress every `1` second.
    *   If player state is marked `isPlaying === true` but `currentTime` does not modify by more than `0.1s` over a span of `6` seconds, captures stream buffer crash.
    *   Dispatches custom event `safetana:find-alternative`.
    *   Swaps player target index immediately to the next query match from search items seamlessly.

### 4.11 Screen 11: Health AI Chatbot & Dictionary
*   **Route**: `/health` (Floating click modal)
*   **Background**: Glassmorphic sheet (`background: rgba(19, 27, 46, 0.9)`).
*   **Behavior**:
    *   *Tanya AI*: Renders chat container streaming responses from Gemini API. Enforces strict prompt system locks restricting assistant to Indonesian crisis and medical answers.
    *   *Kamus AI Dictionary*: Text input dynamically matches typed keywords against local index variables in `kamusData.json`. Clicking matching word slides up an overlay giving standard definition, cause, treatment, and clinical guidelines.

### 4.12 Screen 12: Admin Command Center
*   **Route**: `/admin` (Redirects to AdminLogin first)
*   **Background**: `st-bg` (`#0b1326`) with deep radial pulse glow.
*   **Layout**: Command Cockpit presenting real-time maps on one side, and telemetry control grids on the other.
*   **Sections**:
    *   *Authentication Gate*: Enforces encrypted passwords validating against Firebase Auth administrative roles.
    *   *Active Citizen Matrix Table*: Virtual list displaying active user locations who triggered SOS alerts.
    *   *Safe Sanctuary Controller*: Inputs coordinates and shelter parameters, and logs values onto map structures.
    *   *Broadcast dispatcher*: Message input box executing cloud function broadcasts to active FCM device listeners.

---

## 5. GLOBAL FEATURES (Section N)

### 5.1 Real-Time Firestore Synchronization
SafeTana establishes direct websocket listeners parsing collections into local array structures, avoiding manual reload steps:
```js
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";

export const listenToIncidents = (callback) => {
  const q = query(collection(db, "user_reports"), orderBy("timestamp", "desc"), limit(50));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};
```

### 5.2 Triple-Tier AI Fallback Chain
Located within [disasterAiService.js](file:///c:/Users/Septiawan%20Hadi/SafeTana/src/services/disasterAiService.js). System processes prompt messages chronologically through high-availability gateways to prevent outages during peak crisis:
1.  **Tier 1**: Gemini 1.5 Flash API REST connection. If fails, routes to:
2.  **Tier 2**: Groq Llama 3.3-70b inference endpoint. If fails, routes to:
3.  **Tier 3**: OpenAI GPT-4o-mini REST proxy. If fails, cascades to local engines.

### 5.3 Local WASM Offline Engine (NullClawBridge)
If browser network checks fail (`navigator.onLine === false`), queries are routed directly to [NullClawBridge.js](file:///c:/Users/Septiawan%20Hadi/SafeTana/src/services/health/NullClawBridge.js):
*   Attempts WebAssembly runtime parsing of `/public/agents/nullclaw_agent.wasm`.
*   If WASM runtime initialization fails, executes local Javascript fallback parser evaluating keyword parameters against offline crisis index databases.

### 5.4 Environment Key Protection
No direct client-side raw credential storage. All tokens traverse the proxy layer, mapped inside `.env`:
```
VITE_FIREBASE_API_KEY           = AIzaSy...       # Public web key
VITE_FIREBASE_PROJECT_ID        = safetana-app    # Public ID
VITE_GEMINI_API_KEY             = AIzaSy...       # Kept server-side / Vercel secrets
TELEGRAM_BOT_TOKEN              = 123456:...      # Server-side only
VITE_SATUSEHAT_ORG_ID           = 10000001        # Sandbox Org ID
```

### 5.5 WebRTC Browser-to-Browser Sync (Phase 6 Roadmap)
Implements offline mesh sharing capabilities:
*   Standard P2P signalling network sharing database tables with adjacent nodes using WebRTC channels.
*   Enforces secure localized storage sync.

---

## 6. DATA SCHEMAS & FHIR R4 MAPPINGS (Section N+1)

### 6.1 Clinical Observation FHIR Schema
Observation metrics are formatted precisely to match HL7 FHIR R4 requirements:
```ts
interface ObservationPayload {
  resourceType: 'Observation'
  status: 'final'
  category: [
    {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/observation-category'
          code: 'vital-signs'
          display: 'Vital Signs'
        }
      ]
    }
  ]
  code: {
    coding: [
      {
        system: 'http://loinc.org'
        code: '8302-2' | '29463-7' | '8480-6' | '8462-4'
        display: string
      }
    ]
  }
  subject: { reference: string }  // Patient reference e.g., Patient/P0203597
  encounter: { reference: string } // Encounter reference
  effectiveDateTime: string        // ISO 8601 string
  valueQuantity: {
    value: number
    unit: string
    system: 'http://unitsofmeasure.org'
    code: string
  }
}
```

### 6.2 Data Model Schema: Active User (SOS Tracking)
```ts
interface ActiveUserSchema {
  id: string              // Unique device-hash
  name: string            // Anonymized display name (NIK hash)
  status: 'Aman' | 'Butuh Evakuasi'
  pos: [number, number]   // Latitude, Longitude array
  lastActive: any         // Firestore ServerTimestamp
}
```

### 6.3 Data Model Schema: User Incident Report
```ts
interface UserReportSchema {
  id: string              // Firestore document identifier
  type: 'Banjir' | 'Gempa Bumi' | 'Tanah Longsor' | 'Kebakaran' | 'Angin Puting Beliung'
  desc: string            // Sanitized user description
  loc: string             // Reverse-geocoded location name
  position: [number, number]
  source: 'Warga'
  photoName: string | null // Attached photo filename in Firestore
  timestamp: any          // Firestore ServerTimestamp
  statusColor: string     // Hex mapping warning levels
}
```

---

## 7. BUILD ORDER & LOCK PLAN (Section N+3)

**⛔ Strict Phase-Locked Execution Flow — AI Agents Must Comply:**
1.  **Phase 1**: Brand & Design System Setup (`index.css` styling variables).
2.  **Phase 2**: Global routing mapping via `react-router-dom` in `App.jsx`.
3.  **Phase 3**: Global Context initialization (`DynamicIslandContext`).
4.  **Phase 4**: Setup Core Service layers (`src/firebase.js` & services).
5.  **Phase 5**: Build Splash & Synthesized audio chimes.
6.  **Phase 6**: Build Bento Dashboard and layout screens.
7.  **Phase 7**: Build Leaflet Maps and marker overlay systems.
8.  **Phase 8**: Build Weather, News, and Education dashboards.
9.  **Phase 9**: Build Integrated Healthcare and FHIR wizards.
10. **Phase 10**: Build Mental Lounge & Vibe Search player with self-healing system.
11. **Phase 11**: Build Admin Command Center and security gates.
12. **Phase 12**: Performance checks, linter validations, and build locks.

**⛔ Compiler & Build Rules:**
*   `npm run lint` must compile with **0 ESLint errors** prior to launching production packaging.
*   Accessing `.current` on a ref inside active render loops is strictly forbidden to prevent lifecycle breaks.
*   Direct state updates in `useEffect` must be wrapped inside `setTimeout` blocks to avoid cascading re-renders.
*   No standard `fetch` in client components — all endpoints must traverse proxy handlers `/api/*`.
*   Virtualized lists are mandatory for any dynamic collection scaling above 20 items.

---

## 8. OPEN QUESTIONS TABLE (Section N+4)

| # | Question | Status | Impact if Unresolved |
|---|----------|--------|----------------------|
| 1 | SatuSehat Production API URLs | ⏳ PENDING | Patient records limited to sandbox endpoint. |
| 2 | NIK validation bypass | ✅ RESOLVED | Handled through encryption proxies utilizing test mock objects if keys are empty. |
| 3 | Background service worker push alerts in iOS | ⚠️ PARTIAL | Enforces manual user click permission requirement. |
