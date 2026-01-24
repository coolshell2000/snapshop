# Change: Add Social Sharing Features

## Why

Users want to share their skin analysis results with friends, on social media, or save them for personal records. Currently, SnapBeautyShot has no way to export or share analysis results beyond the local history feature. This limits user engagement and organic growth through social sharing.

Adding social sharing capabilities will:
- Increase user engagement and app visibility
- Enable users to share skincare journeys with friends
- Provide organic marketing through social media
- Allow users to save results outside the app
- Support privacy-conscious sharing (users control what to share)

## What Changes

This change adds a new **social-sharing** capability with the following features:

1. **Share Button** - Add a share button to the analysis results screen
2. **Privacy Controls** - Allow users to choose what information to include (image, analysis details, product recommendations)
3. **Multiple Share Methods**:
   - Native mobile sharing (iOS/Android share sheet)
   - Web Share API for modern browsers
   - Direct social media links (Twitter, Facebook, WhatsApp)
   - Download as image
   - Copy link to clipboard
4. **Shareable Content Generation** - Create formatted text and images optimized for sharing
5. **Privacy-First Design** - No data sent to servers; all sharing happens client-side

## Impact

- **Affected specs**: 
  - NEW: `social-sharing` (new capability)
  - MODIFIED: `skin-analysis` (add share button to results UI)
- **Affected code**: 
  - `components/ProductCard.tsx` - Add share button and modal
  - `app/page.tsx` - Pass sharing handlers to ProductCard
  - New: `components/ShareModal.tsx` - Share options UI
  - New: `lib/shareUtils.ts` - Share formatting utilities
- **Breaking changes**: None
- **Dependencies**: 
  - Capacitor Share plugin for native sharing
  - Web Share API (progressive enhancement)
  - Canvas API for image generation

## Privacy Considerations

- All sharing is client-side only
- Users explicitly choose what to share
- No analytics or tracking on shared content
- Shared images are generated locally (no server upload)
- Personal data (API keys, Amazon tags) never included in shares
