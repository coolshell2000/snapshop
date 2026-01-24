## ADDED Requirements

### Requirement: Scan History Storage
The system SHALL store up to 20 recent skin analysis scans in browser localStorage.

#### Scenario: Saving a new scan
- **WHEN** a skin analysis completes successfully
- **THEN** the system SHALL create a history item with a unique ID, timestamp, thumbnail image, and analysis results
- **AND** the system SHALL prepend it to the history array
- **AND** the system SHALL limit the array to 20 items (removing oldest if necessary)
- **AND** the system SHALL persist the updated history to localStorage

#### Scenario: Storage quota exceeded
- **WHEN** saving a scan would exceed localStorage quota
- **THEN** the system SHALL attempt to save without the image
- **AND** the system SHALL log the error to console
- **AND** the system SHALL continue operation

### Requirement: History Retrieval
The system SHALL allow users to view their scan history.

#### Scenario: Viewing history list
- **WHEN** a user navigates to the history page
- **THEN** the system SHALL load all saved scans from localStorage
- **AND** the system SHALL display them in reverse chronological order (newest first)
- **AND** the system SHALL show thumbnail, product name, category, reason, and timestamp for each item

#### Scenario: Empty history
- **WHEN** no scans are saved
- **THEN** the system SHALL display an empty state message
- **AND** the system SHALL show a clock icon

### Requirement: History Item Details
The system SHALL allow users to view full details of a saved scan.

#### Scenario: Viewing scan details
- **WHEN** a user clicks on a history item
- **THEN** the system SHALL display the full ProductCard component with all analysis details
- **AND** the system SHALL show the original image (or placeholder if unavailable)
- **AND** the system SHALL provide a back button to return to the list

### Requirement: History Management
The system SHALL allow users to delete individual scans or clear all history.

#### Scenario: Deleting a single scan
- **WHEN** a user clicks the delete button on a history item
- **THEN** the system SHALL remove that item from the history array
- **AND** the system SHALL update localStorage
- **AND** the system SHALL update the UI immediately

#### Scenario: Clearing all history
- **WHEN** a user clicks the clear history button
- **THEN** the system SHALL display a confirmation dialog
- **AND** if confirmed, the system SHALL remove all items from localStorage
- **AND** the system SHALL update the UI to show the empty state

### Requirement: Thumbnail Optimization
The system SHALL create optimized thumbnails for history storage.

#### Scenario: Thumbnail creation
- **WHEN** saving a scan to history
- **THEN** the system SHALL create a thumbnail resized to 150px maximum width
- **AND** the system SHALL maintain aspect ratio
- **AND** the system SHALL compress to 0.8 quality to minimize storage
