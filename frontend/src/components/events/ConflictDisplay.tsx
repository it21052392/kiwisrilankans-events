import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { ConflictDetails } from '@/hooks/useConflictDetection';

interface ConflictDisplayProps {
  conflictDetails: ConflictDetails;
  onSelectAlternative?: (type: 'time' | 'date' | 'location', value: string) => void;
  onDismiss?: () => void;
}

export const ConflictDisplay: React.FC<ConflictDisplayProps> = ({
  conflictDetails,
  onSelectAlternative,
  onDismiss
}) => {
  if (!conflictDetails.hasConflict) {
    return null;
  }

  const { conflicts, message, suggestions } = conflictDetails;

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Event Conflict Detected!</strong>
          <p className="mt-1">{message}</p>
        </AlertDescription>
      </Alert>

      {/* Conflicting Events */}
      {conflicts.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Conflicting Events:</h4>
          {conflicts.map((conflict, index) => (
            <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Calendar className="h-4 w-4 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">
                    {conflict.event.title}
                  </p>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-red-700">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(conflict.event.startDate).toLocaleDateString()} at{' '}
                        {conflict.event.startTime || 'All day'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{conflict.event.location.name}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {conflict.event.category.name}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alternative Suggestions */}
      {(suggestions.alternativeTimes.length > 0 || 
        suggestions.alternativeDates.length > 0 || 
        suggestions.alternativeLocations.length > 0) && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Alternative Options:</h4>
          
          {/* Alternative Times */}
          {suggestions.alternativeTimes.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-gray-700 mb-2">Available Times:</h5>
              <div className="flex flex-wrap gap-2">
                {suggestions.alternativeTimes.map((time, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectAlternative?.('time', time)}
                    className="text-xs"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Alternative Dates */}
          {suggestions.alternativeDates.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-gray-700 mb-2">Alternative Dates:</h5>
              <div className="flex flex-wrap gap-2">
                {suggestions.alternativeDates.map((date, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectAlternative?.('date', date)}
                    className="text-xs"
                  >
                    {new Date(date).toLocaleDateString()}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Alternative Locations */}
          {suggestions.alternativeLocations.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-gray-700 mb-2">Alternative Locations:</h5>
              <div className="flex flex-wrap gap-2">
                {suggestions.alternativeLocations.map((location, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectAlternative?.('location', location)}
                    className="text-xs"
                  >
                    {location}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Nearby Venues */}
          {suggestions.nearbyVenues.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-gray-700 mb-2">Nearby Venues:</h5>
              <div className="flex flex-wrap gap-2">
                {suggestions.nearbyVenues.map((venue, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectAlternative?.('location', venue)}
                    className="text-xs"
                  >
                    {venue}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dismiss Button */}
      {onDismiss && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );
};
