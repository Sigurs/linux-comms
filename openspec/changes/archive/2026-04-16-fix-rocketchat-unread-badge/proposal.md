## Why

The Teams unread badge is working correctly, but the RocketChat unread badge is not displaying unread message counts. This creates inconsistency in the user experience and makes it difficult for users to track unread messages across different communication platforms.

## What Changes

- Fix RocketChat unread badge functionality to properly display unread message counts
- Ensure consistency with Teams unread badge implementation
- Add proper error handling and fallback mechanisms

## Capabilities

### New Capabilities

- `rocketchat-unread-badge`: Fix and implement proper unread badge functionality for RocketChat

### Modified Capabilities

- None (this is a new capability, no existing specs are being modified)

## Impact

- RocketChat integration code
- Unread badge display logic
- User interface components showing unread counts
- API calls to RocketChat for unread message data
