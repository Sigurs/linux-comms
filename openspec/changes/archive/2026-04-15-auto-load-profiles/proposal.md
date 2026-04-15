## Why

When the application starts, all profile tabs are empty until the user manually clicks each one to load it. This forces unnecessary interaction before the user can begin working, and means notifications and content won't appear until the profile is manually activated.

## What Changes

- All configured profiles load automatically on application startup without requiring a user click
- The active/selected profile is displayed immediately; background profiles load concurrently
- No new user-facing setting is needed — auto-load is the expected default behavior

## Capabilities

### New Capabilities
- `profile-auto-load`: Profiles are loaded automatically when the app starts, not on first user click

### Modified Capabilities

## Impact

- `src/renderer/` — shell renderer logic that controls when webviews are created/loaded
- Profile tab components — currently defer loading until tab is activated
