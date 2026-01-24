## ADDED Requirements

### Requirement: Share Button Visibility
The system SHALL display a share button on the analysis results screen.

#### Scenario: Share button displayed
- **WHEN** skin analysis results are displayed
- **THEN** the system SHALL show a share button
- **AND** the button SHALL be clearly labeled with a share icon
- **AND** the button SHALL be accessible and visible on all screen sizes

### Requirement: Share Modal
The system SHALL provide a modal dialog with multiple sharing options when the share button is clicked.

#### Scenario: Opening share modal
- **WHEN** a user clicks the share button
- **THEN** the system SHALL display a modal with sharing options
- **AND** the modal SHALL include privacy controls
- **AND** the modal SHALL show available share methods based on platform capabilities

### Requirement: Privacy Controls
The system SHALL allow users to control what information is included in shares.

#### Scenario: Privacy options
- **WHEN** the share modal is displayed
- **THEN** the system SHALL provide checkboxes for:
  - Include selfie image (default: OFF)
  - Include skin analysis details (default: ON)
  - Include product recommendations (default: ON)
  - Include app branding (default: ON)
- **AND** the system SHALL update the share preview when options change

#### Scenario: Sensitive data exclusion
- **WHEN** generating shareable content
- **THEN** the system SHALL never include API keys, Amazon Associate tags, or personal identifiers
- **AND** the system SHALL only include user-selected information

### Requirement: Native Mobile Sharing
The system SHALL use native share sheets on mobile devices (iOS/Android).

#### Scenario: Native share on mobile
- **WHEN** running on a mobile device (Capacitor)
- **AND** a user selects "Share" option
- **THEN** the system SHALL invoke the Capacitor Share plugin
- **AND** the system SHALL open the native share sheet
- **AND** the system SHALL pass formatted text and optional image

#### Scenario: Native share success
- **WHEN** native sharing completes successfully
- **THEN** the system SHALL close the share modal
- **AND** the system SHALL display a success message

#### Scenario: Native share cancellation
- **WHEN** a user cancels the native share sheet
- **THEN** the system SHALL return to the share modal
- **AND** the system SHALL not display an error

### Requirement: Web Share API
The system SHALL use the Web Share API on browsers that support it.

#### Scenario: Web Share API available
- **WHEN** running in a browser with Web Share API support
- **AND** a user selects "Share" option
- **THEN** the system SHALL invoke navigator.share()
- **AND** the system SHALL pass formatted text and optional image

#### Scenario: Web Share API unavailable
- **WHEN** running in a browser without Web Share API support
- **THEN** the system SHALL show fallback sharing options
- **AND** the system SHALL not attempt to call navigator.share()

### Requirement: Social Media Direct Links
The system SHALL provide direct sharing links for popular social media platforms.

#### Scenario: Twitter sharing
- **WHEN** a user clicks "Share to Twitter"
- **THEN** the system SHALL open Twitter with pre-filled text
- **AND** the text SHALL include analysis summary and app link
- **AND** the link SHALL open in a new window/tab

#### Scenario: Facebook sharing
- **WHEN** a user clicks "Share to Facebook"
- **THEN** the system SHALL open Facebook with pre-filled content
- **AND** the content SHALL include app link
- **AND** the link SHALL open in a new window/tab

#### Scenario: WhatsApp sharing
- **WHEN** a user clicks "Share to WhatsApp"
- **THEN** the system SHALL open WhatsApp with pre-filled message
- **AND** the message SHALL include formatted analysis and app link
- **AND** the link SHALL open in a new window/tab or WhatsApp app

### Requirement: Download as Image
The system SHALL allow users to download their analysis results as an image.

#### Scenario: Image generation
- **WHEN** a user clicks "Download as Image"
- **THEN** the system SHALL generate a 1080x1080px image using Canvas API
- **AND** the image SHALL include selected content based on privacy controls
- **AND** the image SHALL use app branding and theme colors

#### Scenario: Image download
- **WHEN** the image is generated
- **THEN** the system SHALL trigger a download
- **AND** the filename SHALL be "snapbeautyshot-analysis-[timestamp].png"
- **AND** the system SHALL display a success message

#### Scenario: Image generation failure
- **WHEN** image generation fails
- **THEN** the system SHALL display an error message
- **AND** the system SHALL log the error to console
- **AND** the system SHALL remain in the share modal

### Requirement: Copy to Clipboard
The system SHALL allow users to copy formatted analysis text to clipboard.

#### Scenario: Copy text
- **WHEN** a user clicks "Copy to Clipboard"
- **THEN** the system SHALL format the analysis as text
- **AND** the system SHALL copy it to the clipboard
- **AND** the system SHALL display a "Copied!" confirmation

#### Scenario: Clipboard API unavailable
- **WHEN** the Clipboard API is not available
- **THEN** the system SHALL display the text in a textarea
- **AND** the system SHALL auto-select the text
- **AND** the system SHALL prompt the user to manually copy

### Requirement: Share Content Formatting
The system SHALL format shared content in a readable, engaging way.

#### Scenario: Text formatting
- **WHEN** generating shareable text
- **THEN** the system SHALL use emoji and formatting for readability
- **AND** the system SHALL include skin type, undertone, and concerns
- **AND** the system SHALL include product recommendations if selected
- **AND** the system SHALL include app link at the end
- **AND** the system SHALL respect the user's current language

#### Scenario: Image formatting
- **WHEN** generating a shareable image
- **THEN** the system SHALL use a gradient background matching app theme
- **AND** the system SHALL include app logo/watermark
- **AND** the system SHALL use readable typography
- **AND** the system SHALL optionally include the selfie image in a corner
- **AND** the system SHALL optimize for social media (1080x1080px)

### Requirement: Multi-Language Share Content
The system SHALL generate share content in the user's selected language.

#### Scenario: Localized share text
- **WHEN** generating shareable content
- **THEN** the system SHALL use the current language for all text
- **AND** the system SHALL translate labels and headers
- **AND** the system SHALL maintain the analysis results in their current language

