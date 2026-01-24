# Capability: Deployment

Methods and environments for deploying the application.

## ADDED Requirements

### Requirement: Streamlit Hosting
The application MUST be deployable as a Streamlit application, wrapping the core web experience.

#### Scenario: Running via Streamlit
- **Given** the user has the project files
- **And** Python/Streamlit are installed
- **When** they run `streamlit run streamlit_app.py`
- **Then** the application starts a local web server for the static files
- **And** the Streamlit interface displays the application in an iframe
- **And** the interface is responsive and functional
