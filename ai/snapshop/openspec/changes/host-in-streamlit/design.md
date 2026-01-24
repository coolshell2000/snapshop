# Design: Host in Streamlit

## Context

We want to deploy the SnapBeautyShot PWA/Web App on platforms designed for Python/Data Science apps (like Streamlit Cloud). Since the app is built in Next.js, we need a "bridge" to run it within a Python environment.

### Constraints
-   **Environment**: Must run in a standard Python environment (e.g., typically Linux container).
-   **Performance**: The static file serving must be fast enough for the iframe.
-   **Security**: Must expose the port correctly within the restricted Streamlit environment.

## Decisions

### Decision 1: Serve Static Files via Background Thread
**Rationale**:
Streamlit blocks the main thread. To serve the Next.js app (which consists of HTML/JS/CSS files in `out/`), we need a web server.
We will use Python's built-in `http.server` running in a `threading.Thread`.

**Implementation details**:
-   Build the Next.js app (`npm run build`). This creates the `out/` directory.
-   In `streamlit_app.py`, check if `out/` exists.
-   Start `http.server` on a free port (e.g., 8501 or dynamic, but Streamlit uses 8501, so maybe 3000 or 8000).
-   Use `st.components.v1.iframe` to point to `http://localhost:<port>`.

**Trade-offs**:
-   **Complexity**: Adds a Python layer to a JS app.
-   **Benefit**: Easy deployment on pure Python platforms.

### Decision 2: Iframe Integration
**Rationale**:
Rewriting the app in native Streamlit would lose all the PWA, Capacitor, and Framer Motion benefits. Embedding via iframe preserves the exact high-quality UI.

**Risks**:
-   **Responsive Design**: Iframes can sometimes mess with viewport sizing on mobile. We need to set the iframe to 100% width/height.
-   **Permissions**: Camera access inside an iframe might be blocked depending on the host's Content Security Policy (CSP).
    -   *Mitigation*: Streamlit Cloud usually allows camera access, but we must verify `allow="camera; microphone"` attributes on the iframe if possible (Streamlit's iframe component might limit this).

## Open Questions

1.  **Camera Permissions**: Will the iframe allow camera access?
    -   *Plan*: Test manually. If it fails, fallback to file upload (which is already supported in the app).

2.  **Port Collisions**: What if the port is taken?
    -   *Plan*: Use a fixed non-standard port (e.g. 5678) or dynamic port selection.
