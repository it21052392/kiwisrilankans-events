# Event Conflict Detection System

## Overview

This system prevents event conflicts by checking for overlapping events of the same category in the same city at the same time. It implements comprehensive conflict detection with time buffers, multi-day event support, and alternative suggestions.

## Rules Implemented

### Core Conflict Rules

1. **Same Category + Same City + Same Date + Same Time = BLOCKED**
2. **Different Category + Same City + Same Date + Same Time = ALLOWED**
3. **60-minute buffer time** between events for setup/cleanup
4. **All-day events** block entire day for same category
5. **Multi-day events** check each day for conflicts

### Event Statuses That Block New Events

- `draft` - Event being created (blocks other events)
- `published` - Live events
- `pencil_hold` - Temporarily held events
- `pencil_hold_confirmed` - Confirmed pencil hold events
- `pending_approval` - Submitted and waiting for admin approval

### Event Statuses That DON'T Block New Events

- `rejected` - Admin rejected
- `unpublished` - Admin unpublished
- `cancelled` - Event cancelled
- `completed` - Event finished
- `deleted` - Soft deleted

## Backend Implementation

### Files Added/Modified

#### 1. Conflict Detection Service

- **File**: `src/services/conflictDetection.service.js`
- **Purpose**: Core conflict detection logic
- **Features**:
  - Time overlap detection with buffer
  - All-day event handling
  - Multi-day event support
  - Alternative suggestions generation

#### 2. Events Service Updates

- **File**: `src/services/events.service.js`
- **Changes**: Added conflict checking to `createEvent`, `updateEvent`, and `updateEventByOrganizer`
- **Error Handling**: Returns 409 status code with conflict details

#### 3. Events Controller Updates

- **File**: `src/controllers/events.controller.js`
- **Changes**: Added conflict error handling and new `checkEventConflicts` endpoint
- **New Endpoint**: `POST /api/events/check-conflicts`

#### 4. Routes Updates

- **File**: `src/routes/events.routes.js`
- **Changes**: Added conflict checking route

### API Endpoints

#### Check for Conflicts

```http
POST /api/events/check-conflicts
Authorization: Bearer <token>
Content-Type: application/json

{
  "category": "event_category_id",
  "location": {
    "city": "Auckland"
  },
  "startDate": "2024-12-31T10:00:00Z",
  "endDate": "2024-12-31T18:00:00Z",
  "startTime": "10:00",
  "endTime": "18:00"
}
```

**Response (Conflict Found)**:

```json
{
  "success": true,
  "data": {
    "hasConflict": true,
    "conflicts": [
      {
        "event": {
          "title": "Existing Event",
          "startDate": "2024-12-31T10:00:00Z",
          "endDate": "2024-12-31T18:00:00Z",
          "category": { "name": "Music" }
        },
        "conflictType": "time_overlap",
        "message": "Time conflict with existing Music event: Existing Event"
      }
    ],
    "conflictType": "time_overlap",
    "message": "Found 1 time conflict(s) with existing events",
    "suggestions": {
      "alternativeTimes": ["09:00 - 11:00", "11:00 - 13:00"],
      "alternativeDates": ["2024-01-01", "2024-01-02"],
      "alternativeLocations": ["Community Center"],
      "nearbyVenues": ["Library Hall", "School Auditorium"]
    }
  }
}
```

**Response (No Conflict)**:

```json
{
  "success": true,
  "data": {
    "hasConflict": false,
    "conflicts": [],
    "conflictType": null,
    "message": "No conflicts found",
    "suggestions": {
      "alternativeTimes": [],
      "alternativeDates": [],
      "alternativeLocations": [],
      "nearbyVenues": []
    }
  }
}
```

## Frontend Implementation

### Files Added

#### 1. Conflict Detection Hook

- **File**: `frontend/src/hooks/useConflictDetection.ts`
- **Purpose**: React hook for conflict detection
- **Features**: Auto-checking, debouncing, state management

#### 2. Conflict Display Component

- **File**: `frontend/src/components/events/ConflictDisplay.tsx`
- **Purpose**: UI component to display conflicts and suggestions
- **Features**: Visual conflict display, alternative suggestions, action buttons

#### 3. Event Conflict Checker Component

- **File**: `frontend/src/components/events/EventConflictChecker.tsx`
- **Purpose**: Wrapper component with auto-checking and manual checking
- **Features**: Debounced checking, alternative selection handling

#### 4. Events Service Updates

- **File**: `frontend/src/services/events.service.ts`
- **Changes**: Added `checkEventConflicts` method

### Usage Examples

#### Basic Usage in Event Creation Form

```tsx
import { EventConflictChecker } from '@/components/events/EventConflictChecker';
import { CreateEventData } from '@/services/events.service';

const CreateEventForm = () => {
  const [eventData, setEventData] = useState<CreateEventData>({
    // ... form data
  });

  const handleConflictChange = (hasConflict: boolean) => {
    if (hasConflict) {
      // Disable submit button or show warning
      console.log('Conflict detected!');
    }
  };

  const handleSelectAlternative = (
    type: 'time' | 'date' | 'location',
    value: string
  ) => {
    // Update form data based on selected alternative
    if (type === 'time') {
      // Parse time and update startTime/endTime
    } else if (type === 'date') {
      setEventData(prev => ({ ...prev, startDate: value }));
    } else if (type === 'location') {
      setEventData(prev => ({
        ...prev,
        location: { ...prev.location, name: value },
      }));
    }
  };

  return (
    <form>
      {/* Your form fields */}

      <EventConflictChecker
        eventData={eventData}
        onConflictChange={handleConflictChange}
        onSelectAlternative={handleSelectAlternative}
        autoCheck={true}
        debounceMs={1000}
      />

      <button type="submit" disabled={hasConflict}>
        Create Event
      </button>
    </form>
  );
};
```

#### Manual Conflict Checking

```tsx
import { useConflictDetection } from '@/hooks/useConflictDetection';

const EventForm = () => {
  const { checkConflicts, isChecking, conflictDetails } =
    useConflictDetection();

  const handleCheckConflicts = async () => {
    const result = await checkConflicts(eventData);
    if (result.hasConflict) {
      // Handle conflict
      console.log('Conflicts found:', result.conflicts);
    }
  };

  return (
    <div>
      <button onClick={handleCheckConflicts} disabled={isChecking}>
        {isChecking ? 'Checking...' : 'Check for Conflicts'}
      </button>

      {conflictDetails && <ConflictDisplay conflictDetails={conflictDetails} />}
    </div>
  );
};
```

## Configuration

### Buffer Time

The default buffer time is 60 minutes. To change it, modify the `BUFFER_MINUTES` constant in `src/services/conflictDetection.service.js`:

```javascript
static BUFFER_MINUTES = 60; // Change to desired minutes
```

### Active Statuses

To modify which statuses block events, update the `ACTIVE_STATUSES` array in `src/services/conflictDetection.service.js`:

```javascript
static ACTIVE_STATUSES = [
  'published',
  'pencil_hold',
  'pencil_hold_confirmed',
  'pending_approval'
];
```

## Error Handling

### Backend Errors

- **409 Conflict**: When conflicts are detected
- **500 Server Error**: When conflict checking fails
- **400 Bad Request**: When invalid data is provided

### Frontend Error Handling

The conflict detection hook automatically handles errors and provides fallback behavior. Check the `conflictDetails` for error information.

## Testing

### Test Conflict Detection

1. Create an event with category "Music" in "Auckland" on "2024-12-31" from "10:00" to "18:00"
2. Try to create another "Music" event in "Auckland" on "2024-12-31" from "14:00" to "20:00"
3. Should get conflict error with suggestions

### Test Different Categories

1. Create a "Music" event
2. Create a "Cultural" event at same time/location
3. Should be allowed (different categories)

### Test Buffer Time

1. Create event from "10:00" to "12:00"
2. Try to create event from "11:30" to "13:30"
3. Should get conflict (30-minute overlap + 60-minute buffer = 90 minutes total)

## Future Enhancements

1. **Admin Override**: Allow admins to override conflicts for special circumstances
2. **Advanced Suggestions**: Use geolocation for better venue suggestions
3. **Conflict Notifications**: Email notifications when conflicts are detected
4. **Conflict Analytics**: Track common conflict patterns
5. **Recurring Events**: Better support for recurring event conflicts
6. **Resource Conflicts**: Check for equipment/resource conflicts

## Troubleshooting

### Common Issues

1. **Conflicts not detected**: Check if event status is in `ACTIVE_STATUSES`
2. **False positives**: Verify buffer time settings
3. **Performance issues**: Consider adding database indexes on frequently queried fields
4. **Frontend not updating**: Ensure proper state management in React components

### Debug Mode

Enable debug logging by setting the log level to 'debug' in your logger configuration.
