## ADDED Requirements

### Requirement: API Key Configuration
The system SHALL allow users to configure their Google Gemini API key.

#### Scenario: Setting API key
- **WHEN** a user enters an API key in the settings page
- **AND** clicks save
- **THEN** the system SHALL store the key in localStorage under "gemini_api_key"
- **AND** the system SHALL use this key for all subsequent AI requests

#### Scenario: API key fallback
- **WHEN** no user-provided API key is found in localStorage
- **THEN** the system SHALL attempt to use the environment variable NEXT_PUBLIC_GEMINI_API_KEY
- **AND** if found, the system SHALL store it in localStorage for future use

#### Scenario: Missing API key
- **WHEN** no API key is configured (neither localStorage nor environment)
- **THEN** the system SHALL display a warning on the main page
- **AND** the system SHALL prevent analysis attempts

### Requirement: Amazon Affiliate Configuration
The system SHALL allow users to configure their Amazon Associate tag and preferred region.

#### Scenario: Setting Amazon tag
- **WHEN** a user enters an Amazon Associate tag in settings
- **AND** clicks save
- **THEN** the system SHALL store the tag in localStorage under "amazon_tag"
- **AND** the system SHALL append this tag to all Amazon product links

#### Scenario: Region selection
- **WHEN** a user selects an Amazon region in settings
- **AND** clicks save
- **THEN** the system SHALL store the region code in localStorage under "amazon_region"
- **AND** the system SHALL use the corresponding Amazon domain for product links
- **AND** the system SHALL use the appropriate currency symbol for price estimates

#### Scenario: Automatic region detection
- **WHEN** no region is configured
- **THEN** the system SHALL detect the region based on browser timezone
- **AND** the system SHALL set a default region (US, UK, DE, FR, JP, CA, AU, or IN)
- **AND** the system SHALL persist this selection

### Requirement: Language Preferences
The system SHALL allow users to configure primary and secondary languages.

#### Scenario: Primary language selection
- **WHEN** a user selects a primary language in settings
- **THEN** the system SHALL store it in localStorage under "primary_language"
- **AND** the system SHALL update the UI immediately

#### Scenario: Secondary language selection
- **WHEN** a user selects a secondary language in settings
- **THEN** the system SHALL store it in localStorage under "secondary_language"
- **AND** the system SHALL enable the language toggle button on the main page

#### Scenario: Removing secondary language
- **WHEN** a user sets secondary language to "None"
- **THEN** the system SHALL remove "secondary_language" from localStorage
- **AND** the system SHALL hide the language toggle button

### Requirement: Settings Persistence
The system SHALL persist all settings across browser sessions.

#### Scenario: Settings reload
- **WHEN** a user reopens the application
- **THEN** the system SHALL load all settings from localStorage
- **AND** the system SHALL apply them immediately

### Requirement: Settings Validation
The system SHALL provide feedback when settings are saved.

#### Scenario: Successful save
- **WHEN** settings are saved successfully
- **THEN** the system SHALL display a success alert
- **AND** the system SHALL navigate back to the main page

#### Scenario: Save failure
- **WHEN** settings fail to save (e.g., localStorage error)
- **THEN** the system SHALL display an error alert
- **AND** the system SHALL log the error to console
- **AND** the system SHALL remain on the settings page
