# multi-language Specification

## Purpose
TBD - created by archiving change add-baseline-specs. Update Purpose after archive.
## Requirements
### Requirement: Language Selection
The system SHALL support six languages: English, Hindi, Chinese, French, Spanish, and German.

#### Scenario: Primary language configuration
- **WHEN** a user opens the settings page for the first time
- **THEN** the system SHALL detect the system language
- **AND** the system SHALL set it as the primary language
- **AND** the system SHALL persist the selection in localStorage

#### Scenario: Secondary language configuration
- **WHEN** a user selects a secondary language in settings
- **THEN** the system SHALL persist the selection in localStorage
- **AND** the system SHALL enable language toggling on the main page

#### Scenario: Language toggle
- **WHEN** a user has configured a secondary language
- **AND** clicks the language toggle button
- **THEN** the system SHALL switch between primary and secondary languages
- **AND** the system SHALL update all UI text immediately

### Requirement: UI Translation
The system SHALL translate all user interface elements to the selected language.

#### Scenario: Static UI translation
- **WHEN** the language is changed
- **THEN** the system SHALL translate all static UI elements (buttons, labels, headers)
- **AND** the system SHALL use the translation key system defined in `lib/translations.ts`

### Requirement: Dynamic Content Translation
The system SHALL translate AI-generated analysis results to the selected language.

#### Scenario: Analysis result translation
- **WHEN** analysis results are received in English
- **AND** the current language is not English
- **THEN** the system SHALL use Gemini AI to translate the results
- **AND** the system SHALL preserve the structure of the JSON response
- **AND** the system SHALL maintain numerical values unchanged

#### Scenario: Translation failure fallback
- **WHEN** translation fails
- **THEN** the system SHALL display the original English results
- **AND** the system SHALL log the error to console

### Requirement: Language Metadata
The system SHALL provide language metadata for each supported language.

#### Scenario: Language display information
- **WHEN** displaying language options
- **THEN** the system SHALL show the language name in English
- **AND** the system SHALL show the native language name
- **AND** the system SHALL show the appropriate flag emoji

### Requirement: Text-to-Speech Language Support
The system SHALL use appropriate language codes for text-to-speech functionality.

#### Scenario: TTS language mapping
- **WHEN** text-to-speech is activated
- **THEN** the system SHALL map the current language to the correct TTS language code
- **AND** the system SHALL use language-specific voice synthesis

