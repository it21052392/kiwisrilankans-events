import React, { useEffect, useState } from 'react';
import { useConflictDetection } from '@/hooks/useConflictDetection';
import { ConflictDisplay } from './ConflictDisplay';
import { CreateEventData } from '@/services/events.service';

interface EventConflictCheckerProps {
  eventData: CreateEventData;
  excludeEventId?: string;
  onConflictChange?: (hasConflict: boolean) => void;
  onSelectAlternative?: (type: 'time' | 'date' | 'location', value: string) => void;
  autoCheck?: boolean;
  debounceMs?: number;
}

export const EventConflictChecker: React.FC<EventConflictCheckerProps> = ({
  eventData,
  excludeEventId,
  onConflictChange,
  onSelectAlternative,
  autoCheck = true,
  debounceMs = 1000
}) => {
  const { isChecking, conflictDetails, checkConflicts, clearConflicts } = useConflictDetection();
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Auto-check for conflicts when event data changes
  useEffect(() => {
    if (!autoCheck || !eventData.category || !eventData.location?.city || !eventData.startDate) {
      return;
    }

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer
    const timer = setTimeout(async () => {
      try {
        const result = await checkConflicts(eventData, excludeEventId);
        onConflictChange?.(result.hasConflict);
      } catch (error) {
        console.error('Error checking conflicts:', error);
      }
    }, debounceMs);

    setDebounceTimer(timer);

    // Cleanup timer on unmount
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [eventData, excludeEventId, autoCheck, debounceMs, checkConflicts, onConflictChange]);

  // Manual conflict check function
  const handleManualCheck = async () => {
    try {
      const result = await checkConflicts(eventData, excludeEventId);
      onConflictChange?.(result.hasConflict);
    } catch (error) {
      console.error('Error checking conflicts:', error);
    }
  };

  // Handle alternative selection
  const handleSelectAlternative = (type: 'time' | 'date' | 'location', value: string) => {
    onSelectAlternative?.(type, value);
    clearConflicts(); // Clear conflicts after selection
  };

  return (
    <div className="space-y-4">
      {/* Manual Check Button */}
      {!autoCheck && (
        <div className="flex justify-end">
          <button
            onClick={handleManualCheck}
            disabled={isChecking || !eventData.category || !eventData.location?.city || !eventData.startDate}
            className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? 'Checking...' : 'Check for Conflicts'}
          </button>
        </div>
      )}

      {/* Conflict Display */}
      {conflictDetails && (
        <ConflictDisplay
          conflictDetails={conflictDetails}
          onSelectAlternative={handleSelectAlternative}
          onDismiss={clearConflicts}
        />
      )}
    </div>
  );
};
