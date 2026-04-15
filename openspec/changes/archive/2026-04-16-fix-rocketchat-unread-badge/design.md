## Context

The application currently supports unread badges for Teams but the RocketChat integration is missing this functionality. The RocketChat API provides endpoints for retrieving unread message counts, but these are not currently being utilized in the frontend. The existing Teams implementation can serve as a reference for the expected behavior and UI patterns.

## Goals / Non-Goals

**Goals:**

- Implement RocketChat unread badge functionality that displays accurate unread message counts
- Maintain consistency with the existing Teams unread badge UI and behavior
- Add proper error handling for API failures and network issues
- Implement efficient polling mechanism to keep unread counts updated

**Non-Goals:**

- Redesign the existing unread badge UI components
- Implement real-time updates via WebSockets (polling is sufficient for this phase)
- Add notification sounds or other alert mechanisms beyond visual badges

## Decisions

**API Integration:**

- Use RocketChat's REST API `/api/v1/im.counters` endpoint to fetch unread counts
- Implement exponential backoff for API request retries on failure
- Cache results for 30 seconds to reduce API calls while maintaining reasonable freshness

**Polling Strategy:**

- Poll every 60 seconds when the application is active and RocketChat is connected
- Pause polling when application is in background or RocketChat is disconnected
- Use 5-second initial delay after connection to avoid race conditions

**Error Handling:**

- Show empty badge (no error indicators) for API failures to avoid visual clutter
- Log errors to console for debugging purposes
- Implement circuit breaker pattern after 3 consecutive failures to prevent excessive retries

**UI Integration:**

- Reuse existing badge component used by Teams
- Position RocketChat badge consistently with Teams badge in the sidebar
- Use same color scheme and styling as Teams badge for visual consistency

## Risks / Trade-offs

**API Rate Limiting:**

- Risk: RocketChat server might rate limit frequent polling requests
- Mitigation: Implement 60-second polling interval and respect RateLimit headers if present

**Performance Impact:**

- Risk: Multiple simultaneous badge updates could cause UI jank
- Mitigation: Batch updates and use requestAnimationFrame for DOM updates

**Inconsistent State:**

- Risk: Race conditions between polling and user actions (marking as read)
- Mitigation: Use optimistic updates for user actions and refresh on next poll

**Offline Handling:**

- Risk: Bad experience when offline with no connectivity
- Mitigation: Show cached values with subtle visual indication of stale data

## Migration Plan

1. Implement RocketChat API service with polling mechanism
2. Integrate with existing badge component
3. Add configuration options for polling interval
4. Test with various RocketChat server configurations
5. Monitor API usage and adjust polling as needed

## Open Questions

- Should we implement a "mark all as read" functionality for RocketChat?
- Do we need to handle workspace/sidebars differently for RocketChat vs Teams?
- Should there be user-configurable polling intervals?
