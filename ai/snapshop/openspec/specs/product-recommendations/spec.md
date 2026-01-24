# product-recommendations Specification

## Purpose
TBD - created by archiving change add-baseline-specs. Update Purpose after archive.
## Requirements
### Requirement: Product Recommendations
The system SHALL provide three relevant skincare or makeup product recommendations based on skin analysis results.

#### Scenario: Generating recommendations
- **WHEN** skin analysis completes
- **THEN** the system SHALL request three product recommendations from Gemini AI
- **AND** each recommendation SHALL include product name, estimated price, product type, and reason for recommendation
- **AND** each recommendation SHALL include a likely Amazon ASIN for the user's region

#### Scenario: Product types
- **WHEN** generating recommendations
- **THEN** the system SHALL suggest products appropriate for the identified skin type and concerns
- **AND** product types SHALL include cleansers, moisturizers, serums, sunscreens, or foundation matches
- **AND** recommendations SHALL be specific brand/model names, not generic categories

### Requirement: Amazon Affiliate Links
The system SHALL generate Amazon product links with affiliate tracking.

#### Scenario: Link generation with user tag
- **WHEN** a user has configured an Amazon Associate tag
- **AND** clicks on a product recommendation
- **THEN** the system SHALL construct an Amazon URL with the user's tag
- **AND** the system SHALL use the appropriate regional Amazon domain

#### Scenario: Link generation without user tag
- **WHEN** no Amazon Associate tag is configured
- **AND** a user clicks on a product recommendation
- **THEN** the system SHALL construct an Amazon URL without a tag parameter
- **AND** the system SHALL use the appropriate regional Amazon domain

#### Scenario: ASIN-based links
- **WHEN** a product recommendation includes an ASIN
- **THEN** the system SHALL construct a direct product link using the ASIN
- **AND** the link format SHALL be: `https://{domain}/dp/{asin}?tag={tag}`

#### Scenario: Search-based links
- **WHEN** a product recommendation does not include an ASIN
- **THEN** the system SHALL construct a search link using the product name
- **AND** the link format SHALL be: `https://{domain}/s?k={encoded_name}&tag={tag}`

### Requirement: Regional Product Pricing
The system SHALL display product prices in the appropriate currency for the selected region.

#### Scenario: Currency display
- **WHEN** displaying product recommendations
- **THEN** the system SHALL show prices with the correct currency symbol
- **AND** currency symbols SHALL be: $ (US), £ (UK), € (DE/FR), ¥ (JP), C$ (CA), A$ (AU), ₹ (IN)

### Requirement: External Link Handling
The system SHALL open Amazon links in the system browser for proper affiliate tracking.

#### Scenario: Mobile link opening
- **WHEN** running on a mobile device (Capacitor)
- **AND** a user clicks an Amazon link
- **THEN** the system SHALL open the link in the system browser using `window.open(url, '_system')`
- **AND** this SHALL allow the Amazon app to handle the link if installed

#### Scenario: Web link opening
- **WHEN** running in a web browser
- **AND** a user clicks an Amazon link
- **THEN** the system SHALL open the link in a new tab with `noopener,noreferrer` attributes

### Requirement: Product Display
The system SHALL display product recommendations in an organized, scannable format.

#### Scenario: Product card layout
- **WHEN** displaying recommendations
- **THEN** the system SHALL show each product with its name, type label, price, and reason
- **AND** the system SHALL provide a clear call-to-action button for each product
- **AND** the system SHALL use visual indicators (icons, colors) to distinguish product types

### Requirement: Voice Product Recommendations
The system SHALL include product recommendations in text-to-speech output.

#### Scenario: TTS product reading
- **WHEN** text-to-speech is activated
- **THEN** the system SHALL read the product names and types
- **AND** the system SHALL use the current language for pronunciation

