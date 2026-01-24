## 1. Implementation

- [ ] 1.1 Create `requirements.txt` with `streamlit`
- [ ] 1.2 Create `streamlit_app.py` with static file serving logic
- [ ] 1.3 Add `documentation` to README about how to run with Streamlit
- [ ] 1.4 Verify `npm run build` produces `out/` correctly (ensure `output: export` is in next.config)

## 2. Testing

- [ ] 2.1 Build the app (`npm run build`)
- [ ] 2.2 Run `streamlit run streamlit_app.py`
- [ ] 2.3 Verify the app loads in the Streamlit iframe
- [ ] 2.4 Verify navigation works (it's a SPA, so it should stay within the iframe)
- [ ] 2.5 Test camera permission (if blocked, verify fallback works)

## 3. Validation

- [ ] 3.1 Run `openspec validate host-in-streamlit --strict`
