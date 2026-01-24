## Context

Social sharing is a common feature in beauty and skincare apps, allowing users to share their results and recommendations with friends. SnapBeautyShot currently lacks this capability, which limits organic growth and user engagement.

### Constraints
- **Privacy-first**: No server-side processing; all sharing happens client-side
- **Cross-platform**: Must work on web (PWA), Android, and iOS
- **Progressive enhancement**: Graceful degradation for older browsers
- **No external dependencies**: Avoid third-party sharing services
- **Localization**: Share content must respect user's language preference

### Stakeholders
- **Users**: Want easy sharing without compromising privacy
- **Marketing**: Want organic social media reach
- **Developers**: Want maintainable, platform-agnostic solution

## Goals / Non-Goals

### Goals
- Enable users to share analysis results via native share sheets (mobile) or Web Share API (web)
- Provide fallback options for browsers without Web Share API
- Allow users to control what information is shared (privacy controls)
- Support downloading results as an image
- Maintain zero-server architecture (client-side only)

### Non-Goals
- Server-side image generation or hosting
- Analytics/tracking of shared content
- Social media login/integration
- Automated posting to social media
- Sharing to cloud storage services

## Decisions

### Decision 1: Use Capacitor Share Plugin + Web Share API
**Rationale**: 
- Capacitor Share provides native share sheets on mobile (iOS/Android)
- Web Share API provides similar UX on modern browsers
- Both are well-supported and maintained
- No external dependencies or privacy concerns

**Alternatives considered**:
- Custom share buttons for each platform → More code, worse UX
- Third-party sharing service → Privacy concerns, external dependency
- Server-side image generation → Violates privacy-first principle

### Decision 2: Client-Side Image Generation
**Rationale**:
- Use HTML Canvas API to generate shareable images
- Keeps all data on device (privacy)
- Works offline
- No server costs

**Alternatives considered**:
- Server-side rendering → Privacy concerns, requires backend
- Screenshot API → Limited browser support, quality issues

### Decision 3: Privacy Controls via Checkboxes
**Rationale**:
- Users explicitly choose what to include in shares
- Simple, clear UI
- Default to privacy-safe options (exclude sensitive data)

**Options**:
- Include selfie image (default: OFF for privacy)
- Include skin analysis details (default: ON)
- Include product recommendations (default: ON)
- Include app branding/watermark (default: ON)

### Decision 4: Share Format
**Text format**:
```
✨ My SnapBeautyShot Skin Analysis

🔍 Skin Type: [type]
💡 Undertone: [undertone]
⚠️ Concerns: [concerns]

💄 Recommended Products:
1. [product 1]
2. [product 2]
3. [product 3]

Try SnapBeautyShot: [app link]
```

**Image format**:
- 1080x1080px square (Instagram-optimized)
- Gradient background matching app theme
- Optional selfie in corner
- Analysis details in readable typography
- App logo/watermark

## Risks / Trade-offs

### Risk 1: Browser Compatibility
**Risk**: Web Share API not supported in older browsers
**Mitigation**: Provide fallback with direct social media links and clipboard copy

### Risk 2: Image Quality
**Risk**: Canvas-generated images may not match design quality
**Mitigation**: Use high-quality fonts, test on multiple devices, allow download for manual editing

### Risk 3: Privacy Leaks
**Risk**: Users accidentally share sensitive information
**Mitigation**: 
- Default to privacy-safe options
- Clear warnings before sharing
- Never include API keys or personal identifiers

### Trade-off: Simplicity vs Features
**Trade-off**: More share options = more complexity
**Decision**: Start with core features (native share, web share, image download), add more based on user feedback

## Migration Plan

No migration needed - this is a new feature with no breaking changes.

### Rollout
1. Add share button to results screen (visible to all users)
2. Progressive enhancement: native share on mobile, Web Share API on web, fallbacks everywhere
3. Monitor usage (client-side only, no tracking)

### Rollback
If issues arise, simply hide the share button via feature flag or remove the component.

## Open Questions

1. **Should we add a "Share to Stories" feature for Instagram/Snapchat?**
   - Requires specific image dimensions and formats
   - May need additional UI/UX design
   - Defer to post-MVP based on user demand

2. **Should shared images include affiliate links or QR codes?**
   - Could drive traffic back to app
   - May clutter the design
   - Defer to post-MVP

3. **Should we track share analytics (client-side)?**
   - Could inform feature improvements
   - Adds complexity
   - Defer to post-MVP, maintain privacy-first approach
