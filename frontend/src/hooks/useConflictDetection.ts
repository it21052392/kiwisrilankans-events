import { useState, useCallback } from 'react';
import { eventsService } from '@/services/events.service';
import { CreateEventData } from '@/services/events.service';

export interface ConflictDetails {
  hasConflict: boolean;
  conflicts: Array<{
    event: any;
    conflictType: string;
    message: string;
  }>;
  conflictType: string | null;
  message: string;
  suggestions: {
    alternativeTimes: string[];
    alternativeDates: string[];
    alternativeLocations: string[];
    nearbyVenues: string[];
  };
}

export const useConflictDetection = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [conflictDetails, setConflictDetails] = useState<ConflictDetails | null>(null);

  const checkConflicts = useCallback(async (
    eventData: CreateEventData, 
    excludeEventId?: string
  ): Promise<ConflictDetails> => {
    setIsChecking(true);
    setConflictDetails(null);

    try {
      const response = await eventsService.checkEventConflicts(eventData, excludeEventId);
      
      const details: ConflictDetails = {
        hasConflict: response.data.hasConflict,
        conflicts: response.data.conflicts || [],
        conflictType: response.data.conflictType,
        message: response.data.message,
        suggestions: response.data.suggestions || {
          alternativeTimes: [],
          alternativeDates: [],
          alternativeLocations: [],
          nearbyVenues: []
        }
      };

      setConflictDetails(details);
      return details;
    } catch (error) {
      console.error('Error checking conflicts:', error);
      const errorDetails: ConflictDetails = {
        hasConflict: false,
        conflicts: [],
        conflictType: null,
        message: 'Failed to check for conflicts',
        suggestions: {
          alternativeTimes: [],
          alternativeDates: [],
          alternativeLocations: [],
          nearbyVenues: []
        }
      };
      setConflictDetails(errorDetails);
      return errorDetails;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const clearConflicts = useCallback(() => {
    setConflictDetails(null);
  }, []);

  return {
    isChecking,
    conflictDetails,
    checkConflicts,
    clearConflicts
  };
};
