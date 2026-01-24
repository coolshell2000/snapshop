# Change: Host Web App in Streamlit

## Why

Streamlit Cloud and similar platforms (HuggingFace Spaces) offer free, easy hosting for Python applications. By wrapping the SnapBeautyShot Next.js application in a Streamlit container, we can leverage these hosting options for demonstrations and portfolio showcasing without needing a Vercel/Netlify setup or for consolidated "AI Demo" environments.

## What Changes

This change introduces a Python-based wrapper to serve the static export of the Next.js application.

1.  **Static Serving Script**: A new `streamlit_app.py` (or `app.py`) that:
    *   Starts a background Python `http.server` to serve the `out/` directory (Next.js static build).
    *   Uses `st.components.v1.iframe` to display the localhost site within the Streamlit interface.
2.  **Dependencies**: A `requirements.txt` file listing `streamlit`.
3.  **Documentation**: Updates to README to explain how to run the Streamlit version.

## Impact

-   **Affected specs**:
    -   NEW: `deployment` (methods of deployment)
-   **Affected code**:
    -   NEW: `streamlit_app.py`
    -   NEW: `requirements.txt`
-   **Breaking changes**: None. The standard Next.js workflow remains primary. This is an additive feature.
-   **Dependencies**: `streamlit` (Python).

## Privacy Considerations

-   The app remains client-side. The Python server simply serves the static files.
-   No data is sent to the Python backend (unless we explicitly add such features later, which is out of scope).
