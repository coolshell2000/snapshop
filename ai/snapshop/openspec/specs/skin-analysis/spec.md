# skin-analysis Specification

## Purpose
TBD - created by archiving change add-baseline-specs. Update Purpose after archive.
## Requirements
### Requirement: AI-Powered Skin Analysis
The system SHALL analyze selfie images using Google Gemini 2.0 Flash AI to identify skin type, undertone, and concerns.

#### Scenario: Successful skin analysis
- **WHEN** a user uploads a valid selfie image
- **THEN** the system SHALL return skin type (Oily, Dry, Combination, Sensitive, or Normal)
- **AND** the system SHALL return undertone (Warm, Cool, or Neutral)
- **AND** the system SHALL return a list of skin concerns
- **AND** the system SHALL provide personalized skincare advice

#### Scenario: Missing API key
- **WHEN** a user attempts analysis without a configured Gemini API key
- **THEN** the system SHALL display an alert prompting the user to configure their API key in settings
- **AND** the system SHALL not proceed with analysis

#### Scenario: Analysis failure
- **WHEN** the AI analysis fails due to network or API errors
- **THEN** the system SHALL display an error message to the user
- **AND** the system SHALL return to the idle state

### Requirement: Image Optimization
The system SHALL optimize images before sending to the AI for analysis to improve performance and reduce costs.

#### Scenario: Image resizing
- **WHEN** an image is captured or uploaded
- **THEN** the system SHALL resize the image to a maximum width of 800 pixels
- **AND** the system SHALL maintain aspect ratio
- **AND** the system SHALL compress the image to 0.8 quality (JPEG)

### Requirement: Multi-Language Analysis
The system SHALL support skin analysis results in the user's selected language.

#### Scenario: Non-English analysis
- **WHEN** the user's current language is not English
- **THEN** the system SHALL request analysis results in that language from the AI
- **AND** the system SHALL display all skin analysis fields in the selected language

### Requirement: Analysis State Management
The system SHALL provide visual feedback during the analysis process.

#### Scenario: Analysis in progress
- **WHEN** an image is being analyzed
- **THEN** the system SHALL display an "analyzing" state with a loading indicator
- **AND** the system SHALL show a blurred preview of the captured image
- **AND** the system SHALL display localized "The Eye is Seeing..." text

#### Scenario: Analysis complete
- **WHEN** analysis completes successfully
- **THEN** the system SHALL transition to the "results" state
- **AND** the system SHALL scroll to the top of the page
- **AND** the system SHALL display the full analysis results

