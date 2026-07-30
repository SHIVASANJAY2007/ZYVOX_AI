# TravelZyvox — Complete UI Design Documentation

> **Stack:** React + Vite · TailwindCSS v4 · Framer Motion · GSAP + ScrollTrigger · Clerk Auth · React Router

---

## 🎨 Design System

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| Brand Orange | `#ff6d38` | CTA buttons, AI avatar, accent borders |
| Brand Purple | `#7c3aed` / `#7B61FF` | Destinations section BG, pricing accent |
| Brand Lavender | `#7c7fff` / `#8B8Aff` | Hero card, runner text overlay |
| Brand Green | `#00a859` / `#16A34A` | Hero Budget card, workflow card |
| Acid Green | `#B6FF33` | Pricing popular badge, yearly toggle |
| Amber | `#ffc107` / `#FACC15` | Hero Gems card, footer arrow |
| Sky Blue | `#4a90e2` / `#3B82F6` | Hero Booking card, workflow |
| Indigo | `#6366F1` | Footer arrow 2, CTA card |
| Coral Red | `#D94827` | Footer arrow 1, LAUNCH hover |
| WhatsApp Green | `#25D366` | GetPlan WhatsApp CTA |
| Cream / Parchment | `#F8F6E9` / `#FDF8F3` | Pricing BG, GetPlan BG, SignUp BG |
| Pure Black | `#000000` / `#050505` | Global BG, nav, borders, shadows |
| Pure White | `#ffffff` | Text, cards, active nav pill |

### Typography

- **Font:** System default (no Google Font import found), all-caps utility classes used throughout
- **Weight Scale:** `font-bold` → `font-black` → `font-[1000]` (variable weight)
- **Letter Spacing:** `tracking-tighter` for headlines · `tracking-widest` / `tracking-[2px]` for labels
- **Key Headline Size:** `text-7xl` → `text-[8rem]` → `text-[clamp(3.5rem,7vw,8rem)]`

### Shadow Language (Neo-Brutalist)

```
Hard offset:  shadow-[12px_12px_0px_#000]
Soft glow:    shadow-[0_20px_50px_rgba(0,0,0,0.3)]
Nav shadow:   shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)]
WhatsApp:     shadow-[8px_8px_0px_#25D366]
```

### Border Language

```
Cards:     border-[4px] border-black  (neo-brutalist)
Nav:       border border-white/10     (glassmorphism)
Pricing:   border-[4px] border-black rounded-[32px]
```

---

## 📐 Page Architecture

```
/ (LandingPage)
├── PillNav          ← Fixed floating navigation
├── Hero             ← Full-screen spotlight + animated cards
├── Features         ← Orange pinned section + StickyScrollReveal
├── HowItWorks       ← Black section + horizontal GSAP scroll
├── Destinations     ← Purple section + diagonal wipe transition
├── PricingSection   ← Cream section + 3-tier neo-brutalist cards
└── Footer           ← 500vh cinematic scroll + arrow wipe + CTA

/signup              ← Split screen: logo panel + Google OAuth
/get-plan            ← AI Chatbot (protected) + WhatsApp redirect panel
```

---

## 🧭 1. PillNav — Floating Navigation

**File:** `src/components/PillNav.jsx`

### Behavior
- **Default:** Centered at top, full pill with all nav links visible
- **Scrolled (>100px):** Docks to top-left, collapses to logo icon only (`isDocked`)
- **Hovered while docked:** Expands links back — spring animation

### Structure
```
[Logo Icon 44×44px rounded-full]  [Nav Links]  [Mobile Hamburger]
```

### Nav Items
| Label | Target |
|---|---|
| Explore | `#features` |
| Workflow | `#how-it-works` |
| Destinations | `#destinations` |
| Pricing | `#pricing` |
| Sign Up / Open App | `/signup` or `/get-plan` |

### Active State
- White pill slides behind active label via `layoutId="active-nav-pill"`
- Active text: `text-black` on white pill
- Inactive text: `text-white/60` → `text-white` on hover

### Styling
```css
background: #050505 / 80%
backdrop-filter: blur(24px)
border: 1px solid rgba(255,255,255,0.10)
border-radius: 9999px (pill)
```

### Mobile Menu
- Hamburger triggers `AnimatePresence` overlay
- Full-width links in `rounded-3xl` black card beneath nav

---

## 🦸 2. Hero Section

**File:** `src/components/Hero.jsx`

### Layout
- Full-screen black (`min-h-screen`)
- Centered column: headline → 5 feature cards
- `<Spotlight />` component: radial gradient that follows mouse

### Headline
```
YOUR TRAVEL          ← EncryptedText (scramble → reveal, 500ms delay)
RUNS THE WORLD..     ← EncryptedText (scramble → reveal, 800ms delay)
```
- `text-7xl md:text-[8rem]` · `font-bold` · `uppercase` · `tracking-tighter`
- `encryptedClassName="text-neutral-500"` → `revealedClassName="text-white"`

### Feature Cards — 5 items, 180×180px each

| Card | Color | Shape | Icon |
|---|---|---|---|
| Planner / AI Itineraries | `#7c7fff` (lavender) | `rounded-full` | 🎵 |
| Budget / Smart Tracking | `#00a859` (green) | `rounded-[40px]` | 🎬 |
| Support / 24/7 Agent | `#ff6d38` (orange) | `rounded-[40px] rounded-r-[100px]` | 👻 |
| Gems / Hidden Places | `#ffc107` (amber) | `rounded-[40px]` | 🛍️ |
| Booking / Seamless | `#4a90e2` (blue) | `rounded-full` | 👕 |

### Card Animations (GSAP ScrollTrigger)
- **Initial state:** `opacity:0, y:60, rotate:-8, scale:0.8, filter:blur(12px) grayscale(1)`
- **Scroll in:** Each card reveals sequentially, pops to `scale:1.1, brightness:1.2`
- **Settles:** `scale:1` with `power2.inOut`
- **Hover:** `scale-110` + white overlay `bg-white/20` fades in
- **Pin:** Section pins for `+=2000` scroll units (cinematic card reveal)

---

## ✨ 3. Features Section

**File:** `src/components/Features.jsx`

### Background
- `bg-[#ff6d38]` (orange) — full section
- **Edge progress borders:** 12px black bars animate clockwise around viewport as you scroll
- **Warping grid:** `80px` linear-gradient grid, `skewX` + `scale` on scroll
- **Scan lines:** 6 horizontal `#7a78ff` 2px lines drift downward
- **Runner text (dual parallax):**
  - Left: `EXPLORE DISCOVER ADVENTURE IMMERSE NAVIGATE` — `text-[25vw] text-[#7a78ff]`
  - Right: `SERVICES BENEFITS TECH FUTURE LIMITLESS` — `text-[20vw] text-black`
- **Floating elements:** 8 random geometric shapes (FloatingElements component)

### Header
```
THE NEXT
[ERA / GEAR / PHASE]   ← TextType typewriter cycling text
```
- `text-[clamp(3.5rem,7vw,8rem)] font-[1000] uppercase tracking-tighter`
- Mix-blend-difference for the cycling word

### StickyScrollReveal Panel
- `h-[70vh]` rounded-[40px] white card with `border-[6px] border-black shadow-[20px_20px_0px_#000]`
- 4 content items with left text + right image:

| # | Title | Image | Overlay Style |
|---|---|---|---|
| 1 | AI-Powered Itinerary Planning | Local JPG | Gradient top-to-black, label: "Smart Routes" |
| 2 | Global Destination Discovery | Local JPG | Purple `#7a78ff` top gradient, badges: "195 COUNTRIES / 10K+ CITIES" |
| 3 | Seamless Travel Experience | Local JPG | Black 50% overlay, monospace label `UNIFIED_BOOKING_SYSTEM` |
| 4 | Premium Travel Concierge | Local JPG | TR gradient, purple "VIP Access", monospace `CONCIERGE_ACTIVE_247` |

- Images: `grayscale` by default → `grayscale-0` on hover (700ms transition)

### Scroll Hint
- `animate-bounce` arrow `↓` + "Syncing Travel Data" label

---

## 🔄 4. HowItWorks Section

**File:** `src/components/HowItWorks.jsx`

### Layout
- `bg-black h-screen` — full-screen black
- **Horizontal scroll** driven by GSAP ScrollTrigger pin
- 30 white particle dots (`bg-sparkle`) float with random GSAP yoyo animation

### Headline
```
Workflow
Architectures   ← white/10 italic ghost text
```
- `text-[clamp(2.5rem,6vw,9rem)] font-[1000] uppercase`

### Workflow Cards — 5 cards, 380×380px each, horizontal scroll

| # | Title | Subtext | Color | Shape | Icon |
|---|---|---|---|---|---|
| 1 | Planner | AI Itineraries | `#8B8Aff` lavender | Circle (50%) | Music |
| 2 | Budget | Smart Tracking | `#16A34A` green | Square (60px radius) | Clapperboard |
| 3 | Support | 24/7 Agent | `#F97316` orange | D-shape `80px 220px 220px 80px` | Ghost |
| 4 | Gems | Hidden Places | `#FACC15` yellow | Square | ShoppingBag |
| 5 | Booking | Seamless | `#3B82F6` blue | Circle | Shirt |

### Card Interactions (Framer Motion)
- `whileHover={{ scale: 1.05, rotate: ±2 }}` (alternates direction by index)
- `border-4 border-black/5`
- `shadow-[0_20px_50px_rgba(0,0,0,0.3)]`

### Ambient Labels
- Right edge: `SYSTEM_DEPLOYMENT` rotated 90° in `text-white/5`
- Bottom center: "Swipe to Explore the Loop" — `animate-pulse opacity-20`

---

## 🌍 5. Destinations Section

**File:** `src/components/Destinations.jsx`

### Background
- `bg-[#7c3aed]` (deep purple) — full section
- SVG wave shapes in `#5b21b6` and `#4c1d95`

### Diagonal Wipe Transition (SectionWipe)
- 5 colored panels swipe diagonally across as you scroll into section
- Colors: `#7B61FF`, `#B6FF33`, `#FFC700`, `#A0D7FB`, `#F8F6E9`
- Uses `clipPath: 'polygon(0% 0%, 85% 0%, 100% 100%, 0% 100%)'` + `rotate(-15deg)`
- Driven by Framer Motion `useScroll` + `useTransform`

### Layout — 2-column grid (lg)

**Left Column:**
- Label: `YOUR NAVIGATOR` — `text-white/60 tracking-[0.4em]`
- Headline (DecryptedText animated reveal):
  ```
  Exploring shouldn't
  [cost your privacy.]   ← white bg, black text
  Zyvox is your guard.
  ```
- Progress Card (`bg-[#fbbf24]` amber, neo-brutalist `shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`):
  - Counter animates `0% → 94%` on scroll
  - Progress bar fills black
  - Label: "Save your time..."

**Right Column — Destination Cards (scroll-parallax, moves up -400px)**

| Destination | Unsplash Image |
|---|---|
| Tokyo | `photo-1540959733332-eab4deabeeaf` |
| Santorini | `photo-1570077188670-e3a8d69ac5ff` |
| New York | `photo-1496442226666-8d4d0e62e6e9` |
| Bali | `photo-1537996194471-e657df975ab4` |
| Paris | `photo-1502602898657-3e91760cbb34` |
| Kyoto | `photo-1493976040374-85c8e12f0c0e` |

- Card style: `border-[4px] border-black rounded-3xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]`
- Hover: `-translate-y-2 -translate-x-2` + bigger shadow
- Image label: italic uppercase, `text-white`; sub-label: "Limited Availability"

---

## 💰 6. Pricing Section

**File:** `src/components/PricingSection.jsx`

### Background
- `bg-[#F8F6E9]` cream/parchment
- `border-t-[6px] border-black`

### Headline
```
Plan your next
Adventure   ← #7B61FF purple
```
- `text-[8vw] font-[1000] uppercase tracking-tighter`

### Billing Toggle
- Monthly / Yearly toggle — `rounded-full bg-white border-[3px] border-black shadow-[6px_6px_0px_#000]`
- Active: `bg-[#111111] text-white`
- Yearly shows `(-30%)` in `#B6FF33`

### Pricing Cards — 3 columns

| Plan | Price (mo) | Price (yr) | CTA Color | Popular |
|---|---|---|---|---|
| Basic | ₹0 | ₹0 | `#A0D7FB` sky | No |
| Explorer Plus | ₹499 | ₹1,499 | `#B6FF33` acid green | **Yes** |
| Global Voyager | ₹1,999 | ₹6,999 | `#FFC700` amber | No |

**Card Styling:** `rounded-[32px] border-[4px] border-black bg-white shadow-[12px_12px_0px_#000]`

**Popular badge:** `bg-[#B6FF33] border-2 border-black` pill above card — "Most Popular"

**Features:**

*Basic:* Basic itinerary planning · Destination guides · 1 active trip · Community support

*Explorer Plus:* Curated itineraries · Priority booking · 5 active trips · 24/7 Chat support · Travel insurance assistance

*Global Voyager:* Luxury concierge · Private airport transfers · Unlimited trips · VIP lounge access · Personal travel manager

**Animations:** `whileHover={{ y:-10, rotate: ±1 }}` · ScrollReveal on entry

---

## 🦶 7. Footer Section

**File:** `src/components/Footer.jsx`

### Architecture — 500vh Sticky Scroll (3 phases)

The footer is a `500vh` div. Content is `position:sticky top:0 h-screen`.

#### Phase 1 — Hero Text (scroll 0→40%)
```
Designing
Your Next
Odyssey
```
- `text-7xl md:text-9xl font-black uppercase`
- **Scales up** from `scale:1 → scale:12` as user scrolls
- **Fades out** at 35–45%

**Floating Badges (parallax):**
- Red `#D94827`: "G.A.T.E.S." (Layout icon) — moves up `-200px`
- Indigo `#6366F1`: "ACTIVE_SYNC" (Activity icon) — moves down `+150px`
- Yellow `#FACC15`: "CONNECTIONS" (Link icon) — static

**Subtext:** "Join a community building the next era of autonomous travel experiences."

#### Phase 2 — Arrow Wipe (scroll 30→80%)
3 giant arrow shapes sweep RIGHT-TO-LEFT across viewport:
- `#D94827` (red) — top third — enters at 30%, exits at 60%
- `#6366F1` (indigo) — middle third — enters at 40%, exits at 70%
- `#FACC15` (yellow) — bottom third — enters at 50%, exits at 80%
- `clipPath: 'polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%)'` (arrow shape)

#### Phase 3 — Final Content (scroll 70→90%)
White full-screen reveal with 2-column grid:

**Left:** Travel photo (grayscale → color on hover, 1000ms)

**Right CTA Card** (`bg-[#6366F1]` indigo):
```
Ready to
Depart?
```
- Body: "Join the community of travelers reshaping global exploration..."
- CTA Button: Black rounded-full → hover `#D94827`
- `→ LAUNCH` with User icon

**Footer Bar** (4 columns):
- Experience: Destinations link
- Connect: Subscribe button (`hover:bg-[#D94827]`) + Bell icon
- Socials: X · Discord · Instagram pill buttons
- Copyright: `© 2025 ANTIGRAVITY_TRAVEL_AGENT`

**Subscription Toast:**
- Appears on subscribe click, auto-dismisses in 4s
- `bg-[#B6FF33]` check icon · progress bar timer
- `shadow-[8px_8px_0px_#000]` neo-brutalist

---

## 🔐 8. SignUp Page

**File:** `src/components/SignUp.jsx`  
**Route:** `/signup`

### Layout — Split Screen, `bg-[#fdf8f3]`

**Left Panel (hidden on mobile):**
- `w-1/2` dark card `bg-[#0a0a0a] border-2 border-black rounded-[40px]`
- Zyvox logo centered (`w-3/4`)
- Gradient overlay `from-transparent to-black/20`

**Right Panel:**
- Headline: `Sign Up to Zyvox AI` — `text-6xl font-black tracking-tighter`
- Sub: "Join the community of explorers."
- **Google OAuth Button:**
  - White, `border-2 border-gray-200`, rounded-full
  - Google color SVG icon + "Continue with Google"
  - Loading state: "Connecting..." + `opacity-50`
- Footer: Terms of use + Privacy Policy links

### Auth Flow
- Clerk `signIn.authenticateWithRedirect` → Google OAuth
- `redirectUrl: '/sso-callback'` → `redirectUrlComplete: '/get-plan'`
- If already signed in → auto-redirect to `/get-plan`

---

## 🤖 9. GetPlan — AI Concierge (Protected)

**File:** `src/components/GetPlan.jsx`  
**Route:** `/get-plan` (requires Clerk auth)

### Layout — 2-column, `bg-[#FDF8F3]`

#### Left (60%): AI Chat Interface

**Header Bar:**
- Bot avatar: `bg-[#ff6d38] rounded-2xl border-2 border-black`
- "Zyvox AI Agent" `font-black uppercase`
- Online indicator: `w-2 h-2 bg-green-500 animate-pulse`

**Messages Area:** `bg-[#FDF8F3]`
- Bot bubbles: `bg-white rounded-2xl rounded-tl-none border border-black/5`
- User bubbles: `bg-black text-white rounded-2xl rounded-tr-none`
- Animated with Framer Motion `AnimatePresence`

**Special Message Types:**
1. **`plan` type** — Travel plan card:
   - Orange `⚡ Plan Generated` label
   - "The Zenith Odyssey" — 12 Days / $12,400pp
   - 2-col grid: Duration + Est. Cost in `bg-gray-50` tiles
   - `✓ Luxury Stays & VIP Transfers Included`

2. **`whatsapp` type** — Booking redirect:
   - `#25D366/10` green tinted box
   - "Initiate Booking Flow" → `wa.me/15551382180`

**Input Bar:**
- `bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl`
- Black send button `w-14 h-14 rounded-2xl` → `hover:scale-105`
- Disabled after plan is generated

#### Right (40%): WhatsApp Panel — `bg-[#F8F6E9]`

- `#25D366` rounded `[35%]` icon square — Phone icon
- Headline: `Take it to WhatsApp` — `#25D366` colored
- CTA: `shadow-[8px_8px_0px_#25D366]` neo-brutalist black button
- Ambient: `opacity-20` Video Call + More Tools icons

### Menu System (MENU_STRUCTURE)

```
Main Menu
├── 1) Explore Destinations
│   ├── 1) Europe → Paris / London / Santorini / Switzerland
│   ├── 2) Asia → Tokyo / Bali
│   ├── 3) Americas
│   ├── 4) Tropical (Maldives)
│   └── 5) Middle East (Dubai)
├── 2) Travel Logistics & FAQs
│   ├── 1) Visa Consultation
│   ├── 2) Flight Tracking
│   ├── 3) Hotel Partnerships
│   └── 4) Payments & Refunds
├── 3) Exclusive Membership
│   ├── 1) Perks & Upgrades
│   ├── 2) Human Concierge Access
│   └── 3) Privacy Standards
├── 4) Safety & Insurance
│   ├── 1) Emergency Support
│   ├── 2) Travel Advisories
│   └── 3) Insurance Coverage
└── 5) ⚡ Generate My Plan → triggers plan card + WhatsApp CTA
```

---

## 🎬 Animation & Motion Inventory

| Component | Library | Technique |
|---|---|---|
| Hero cards reveal | GSAP ScrollTrigger | Pin + sequential scrub |
| Hero headline | Custom EncryptedText | Character scramble → reveal |
| Features border | GSAP ScrollTrigger | Clockwise progress bars |
| Features runner text | GSAP ScrollTrigger | Dual parallax xPercent |
| Features grid | GSAP ScrollTrigger | skewX + scale warp |
| HowItWorks | GSAP ScrollTrigger | Horizontal scroll pin |
| HowItWorks particles | GSAP | Random yoyo float |
| Workflow cards | Framer Motion | whileHover scale+rotate |
| Destinations wipe | Framer Motion useScroll | 5-layer diagonal panel sweep |
| Destinations counter | GSAP | CountTo 0→94% |
| Destination cards | GSAP ScrollTrigger | Vertical parallax -400px |
| Pricing cards | Framer Motion useInView | Fade+slide on entry |
| Footer phase 1 | Framer Motion useScroll | Text scale 1→12 |
| Footer arrows | Framer Motion useScroll | Right→Left sweep |
| Footer content | Framer Motion useScroll | Opacity+Y fade-in |
| Nav collapse | Framer Motion layout | Spring dock/expand |
| Nav active pill | Framer Motion layoutId | Sliding white pill |
| Chat messages | Framer Motion AnimatePresence | Scale+fade in |
| Toast notification | Framer Motion AnimatePresence | Slide up + progress bar |

---

## 📁 Asset Structure

```
public/
├── assets/
│   ├── logo/
│   │   └── logo.png              ← Zyvox brand logo (used in nav + signup)
│   └── features/
│       ├── 1_MtZ0n0nFFWmebZTncI2sqA.jpg    ← Feature 1: AI Planning
│       ├── 360_F_614228326_*.jpg            ← Feature 2: Global Destinations
│       ├── photo-1544620347-c4fd4a3d5957.jpg ← Feature 3: Seamless Travel
│       ├── wp4782898.jpg                    ← Feature 4: VIP Concierge
│       └── wp4069431.jpg                    ← Footer CTA image
```

---

## 🔑 Key Design Principles

1. **Neo-Brutalist Foundation** — Hard black borders, offset shadows, thick outlines
2. **Cinematic Scroll** — Every section is a "scene" with pinned GSAP animations
3. **Color Section Theming** — Each section has a distinct background color identity
4. **Glassmorphism Navigation** — `backdrop-blur` pill nav floats above all content
5. **Typography as Art** — Massive ultra-bold type (`font-[1000]`) used decoratively
6. **Motion Hierarchy** — Macro transitions (section wipes) + micro (hover effects)
7. **Privacy-First Messaging** — "Exploring shouldn't cost your privacy. Zyvox is your guard."
8. **WhatsApp Handoff** — AI chat culminates in human agent handoff via WhatsApp
