# Project Context

## Purpose

SnapBeautyShot is an AI-powered skin analysis web and mobile application that provides personalized skincare recommendations. The app uses Google's Gemini 2.0 Flash AI to analyze selfies and deliver comprehensive skin type assessments, concern identification, undertone analysis, and product recommendations through Amazon affiliate links.

**Core Value Proposition**: Democratize professional-level skin analysis through AI, making personalized skincare guidance accessible to everyone through a simple selfie.

## Tech Stack

### Frontend
- **Next.js 16.1.3** (App Router) - React framework with static export for PWA/mobile
- **React 19.2.3** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first styling with custom design tokens
- **Framer Motion 12** - Animations and transitions
- **Lucide React** - Icon system

### AI & Analysis
- **Google Generative AI (Gemini 2.0 Flash)** - Skin analysis and multi-language translation
- **@capacitor-community/text-to-speech** - Voice feedback for analysis results

### Mobile & PWA
- **Capacitor 8** - Cross-platform mobile wrapper (Android/iOS)
- **Serwist 9** - Service worker for PWA offline capabilities
- **react-webcam** - Camera capture functionality

### Build & Development
- **Webpack** - Module bundler (via Next.js)
- **ESLint 9** - Code linting
- **PostCSS** - CSS processing

## Project Conventions

### Code Style
- **Language**: TypeScript with strict type checking
- **Component Pattern**: Functional components with hooks (React 19)
- **File Naming**: 
  - Components: PascalCase (e.g., `ProductCard.tsx`)
  - Pages: lowercase with kebab-case for routes
  - Utilities: camelCase (e.g., `translations.ts`)
- **State Management**: React hooks (useState, useEffect, useContext)
- **Styling**: Tailwind utility classes with custom CSS for complex animations
- **Client/Server**: Explicit `"use client"` directive for client components

### Architecture Patterns
- **App Router Structure**: Next.js 14+ app directory pattern
- **Context API**: Used for global state (LanguageContext)
- **Component Composition**: Atomic design with reusable components
- **Data Flow**: 
  - Props for component communication
  - localStorage for persistent user data (API keys, settings, history)
  - Environment variables for sensitive defaults (.env.local)
- **Mobile-First**: Responsive design with Capacitor for native features
- **Static Export**: `output: 'export'` for PWA and mobile builds

### API Integration
- **Gemini API**: Client-side calls with user-provided or env-fallback API keys
- **Image Processing**: Base64 encoding with client-side compression (800px max, 0.8 quality)
- **Error Handling**: Try-catch with user-friendly alerts and console logging
- **Rate Limiting**: None implemented (relies on Gemini API limits)

### Testing Strategy
- **Current State**: No automated tests implemented
- **Manual Testing**: Browser-based verification and mobile device testing
- **Build Verification**: `npm run build` before deployment

### Git Workflow
- **Branching Strategy**: Feature branches (`feat-*`, `makeup-analysis`)
- **Commit Convention**: Conventional commits (`feat:`, `fix:`, `merge:`)
- **Main Branches**:
  - `main` - Production-ready code
  - `feat-simple-skin` - SnapBeautyShot rebrand and skin-only focus
  - `makeup-analysis` - Multi-language and TTS features

## Domain Context

### Skin Analysis Domain
- **Skin Types**: Oily, Dry, Combination, Sensitive, Normal
- **Undertones**: Warm, Cool, Neutral
- **Common Concerns**: Acne, wrinkles, dark spots, sensitivity, oiliness, dryness
- **Product Categories**: Cleansers, moisturizers, serums, sunscreens, foundations

### Multi-Language Support
- **Supported Languages**: English, Hindi (हिन्दी), Chinese (中文), French (Français), Spanish (Español), German (Deutsch)
- **Translation Strategy**: 
  - UI translations via static translation files
  - AI results translated on-the-fly using Gemini API
  - TTS uses native language codes for voice synthesis

### Amazon Affiliate Integration
- **Regions Supported**: US, UK, DE, FR, JP, CA, AU, IN
- **ASIN Handling**: AI-generated product ASINs (best-effort guessing)
- **Monetization**: User-configurable Amazon Associate tags

## Important Constraints

### Security & Privacy
- **API Key Storage**: localStorage (client-side) with .env.local fallback
- **No Backend**: Fully client-side application (no server-side data storage)
- **User Data**: All history and settings stored locally in browser
- **Git Security**: `.env.local` in `.gitignore` to prevent API key exposure

### Performance
- **Image Optimization**: Client-side compression before AI analysis
- **History Limits**: Maximum 20 scans stored locally
- **Quota Management**: Fallback to save without images if localStorage quota exceeded

### Platform Limitations
- **iOS Build**: Requires macOS for Xcode compilation
- **Android Build**: Requires Android SDK and Java
- **PWA Limitations**: Camera access requires HTTPS in production
- **Mobile Permissions**: Camera and storage permissions required

### AI Constraints
- **Model**: Gemini 2.0 Flash (multimodal vision + text)
- **Disclaimer**: Analysis is cosmetic only, NOT medical advice
- **Accuracy**: AI-generated ASINs may not always be valid
- **Language Quality**: Translation quality depends on Gemini API

## External Dependencies

### Critical APIs
- **Google Generative AI (Gemini)**: 
  - Endpoint: Via `@google/generative-ai` SDK
  - Authentication: API key (user-provided or env variable)
  - Usage: Skin analysis, translation, product recommendations

### Affiliate Services
- **Amazon Associates**: 
  - Product links with user-configured associate tags
  - Region-specific domains (amazon.com, amazon.co.uk, etc.)
  - No API integration (direct URL construction)

### Mobile Platforms
- **Capacitor Plugins**:
  - `@capacitor/core` - Core mobile functionality
  - `@capacitor/android` - Android platform
  - `@capacitor/ios` - iOS platform
  - `@capacitor/browser` - In-app browser
  - `@capacitor-community/text-to-speech` - Voice synthesis

### Build & Deployment
- **Node.js**: 18+ required
- **Android SDK**: For mobile builds (path: `/mnt/nvme0n1p1/software/android_sdk`)
- **GitHub**: Repository at `coolshell2000/snapshop`

## Development Notes

### Environment Setup
- Create `.env.local` with `NEXT_PUBLIC_GEMINI_API_KEY` for default API key
- Android builds use automated script: `./build-android.sh`
- Dev server: `npm run dev` (runs on port 3000)

### Key Files
- `app/page.tsx` - Main application logic and UI
- `lib/translations.ts` - Multi-language support
- `contexts/LanguageContext.tsx` - Language state management
- `capacitor.config.ts` - Mobile app configuration
- `build-android.sh` - Automated Android build script
