## Context

The current link handling system intercepts links in multiple ways (window.open override, new-window events, will-navigate events, and anchor click handlers) and shows a dialog asking users how they want to open external links. However, the system currently has inadequate error handling around URL parsing operations, which can cause the entire link interception flow to fail when malformed URLs are encountered.

## Goals / Non-Goals

**Goals:**

- Add robust error handling around all URL parsing operations in link interception code
- Ensure malformed URLs don't prevent the link dialog from appearing
- Maintain existing functionality for valid URLs
- Improve error logging for debugging link handling issues
- Handle edge cases gracefully (e.g., invalid URLs, missing profiles)

**Non-Goals:**

- Change the user interface or behavior of the link choice dialog for valid URLs
- Modify the trusted domain matching logic
- Add new link interception mechanisms
- Change the popup window creation logic

## Decisions

### Error Handling Strategy

**Decision**: Wrap all URL parsing operations in try-catch blocks and implement graceful fallback behavior.

**Rationale**: This prevents exceptions from bubbling up and breaking the entire link handling flow. When a URL cannot be parsed, we can either:

1. Show an error message to the user
2. Fall back to opening in the browser
3. Silently ignore the link (for same-origin navigations)

**Alternatives considered**:

- Let exceptions bubble up: This would cause the link handling to fail completely
- Use URL validation before parsing: More complex and doesn't catch all edge cases
- Centralize URL parsing: Would require significant refactoring

### Logging Strategy

**Decision**: Add detailed logging for all link interception events and errors.

**Rationale**: This will help diagnose issues in production and understand how often malformed URLs are encountered.

**Alternatives considered**:

- Minimal logging: Would make debugging difficult
- User-visible error messages: Could be confusing for non-technical users

### Dialog State Management

**Decision**: Keep the existing global dialogOpen flag but add additional safeguards.

**Rationale**: The current approach works well for the single-window case. Adding complexity for multi-window scenarios would be premature optimization.

**Alternatives considered**:

- Per-window dialog state: More complex and not currently needed
- Dialog queue system: Overkill for current requirements

## Risks / Trade-offs

**[Risk] Malformed URLs might still cause issues in edge cases** → Mitigation: Comprehensive testing with various malformed URL patterns

**[Risk] Increased logging could impact performance** → Mitigation: Use appropriate log levels and only log in debug mode for verbose output

**[Risk] Error handling might mask real bugs** → Mitigation: Include detailed error information in logs and consider adding a "report issue" option for repeated failures

**[Risk] Changes might affect existing link handling behavior** → Mitigation: Extensive testing of existing functionality and gradual rollout
