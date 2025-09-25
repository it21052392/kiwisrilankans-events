import { Event } from '../models/event.model.js';
import { logger } from '../config/logger.js';

class ConflictDetectionService {
  // Buffer time in minutes for setup/cleanup
  static BUFFER_MINUTES = 60;

  // Active statuses that should block other events
  static ACTIVE_STATUSES = [
    'draft',
    'published',
    'pencil_hold',
    'pencil_hold_confirmed',
    'pending_approval',
  ];

  /**
   * Check for time conflicts between two events
   * @param {Date} start1 - Start time of first event
   * @param {Date} end1 - End time of first event
   * @param {Date} start2 - Start time of second event
   * @param {Date} end2 - End time of second event
   * @param {number} bufferMinutes - Buffer time in minutes
   * @returns {boolean} - True if there's a conflict
   */
  hasTimeConflict(
    start1,
    end1,
    start2,
    end2,
    bufferMinutes = this.constructor.BUFFER_MINUTES
  ) {
    // Convert buffer to milliseconds
    const bufferMs = bufferMinutes * 60 * 1000;

    // Add buffer to end of first event and start of second event
    const end1WithBuffer = new Date(end1.getTime() + bufferMs);
    const start2WithBuffer = new Date(start2.getTime() - bufferMs);

    // Check for overlap with buffer
    return start2WithBuffer < end1WithBuffer && end2 > start1;
  }

  /**
   * Check if two dates are on the same day
   * @param {Date} date1 - First date
   * @param {Date} date2 - Second date
   * @returns {boolean} - True if same day
   */
  isSameDay(date1, date2) {
    return date1.toDateString() === date2.toDateString();
  }

  /**
   * Check if an event is all-day
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {boolean} - True if all-day event
   */
  isAllDayEvent(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if event spans 24 hours or more
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours >= 24;
  }

  /**
   * Get all days between start and end date (for multi-day events)
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Date[]} - Array of dates
   */
  getEventDays(startDate, endDate) {
    const days = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Add start day
    days.push(new Date(start));

    // Add all days in between
    const current = new Date(start);
    while (current < end) {
      current.setDate(current.getDate() + 1);
      if (current <= end) {
        days.push(new Date(current));
      }
    }

    return days;
  }

  /**
   * Check for conflicts with existing events
   * @param {Object} eventData - Event data to check
   * @param {string} excludeEventId - Event ID to exclude (for editing)
   * @returns {Object} - Conflict detection result
   */
  async checkEventConflicts(eventData, excludeEventId = null) {
    try {
      const { category, location, startDate, endDate, startTime, endTime } =
        eventData;

      const city = location.city;
      const eventStartDate = new Date(startDate);
      const eventEndDate = new Date(endDate);

      // Build query for existing events
      const query = {
        category: category,
        'location.city': city,
        status: { $in: this.constructor.ACTIVE_STATUSES },
        isDeleted: false,
      };

      // Exclude current event if editing
      if (excludeEventId) {
        query._id = { $ne: excludeEventId };
      }

      // Check for all-day events first
      if (this.isAllDayEvent(eventStartDate, eventEndDate)) {
        // All-day event blocks entire day for same category
        query.$or = [
          {
            startDate: { $lte: eventEndDate },
            endDate: { $gte: eventStartDate },
          },
        ];

        const allDayConflicts = await Event.find(query);

        if (allDayConflicts.length > 0) {
          return {
            hasConflict: true,
            conflicts: allDayConflicts,
            conflictType: 'all_day',
            message: `All-day event conflicts with existing ${allDayConflicts[0].category.name} events in ${city}`,
          };
        }
      }

      // Check for multi-day events
      const eventDays = this.getEventDays(eventStartDate, eventEndDate);
      const conflicts = [];

      for (const day of eventDays) {
        // Query events for this specific day
        const dayQuery = {
          ...query,
          $or: [
            { startDate: { $lte: day }, endDate: { $gte: day } },
            {
              startDate: {
                $gte: new Date(
                  day.getFullYear(),
                  day.getMonth(),
                  day.getDate()
                ),
                $lt: new Date(
                  day.getFullYear(),
                  day.getMonth(),
                  day.getDate() + 1
                ),
              },
            },
          ],
        };

        const dayEvents = await Event.find(dayQuery).populate(
          'category',
          'name'
        );

        for (const existingEvent of dayEvents) {
          // Skip if not same day
          if (!this.isSameDay(new Date(existingEvent.startDate), day)) {
            continue;
          }

          // Check time conflicts
          const existingStart = new Date(existingEvent.startDate);
          const existingEnd = new Date(existingEvent.endDate);

          // If existing event has times, use them
          let existingStartTime = existingStart;
          let existingEndTime = existingEnd;

          if (existingEvent.startTime) {
            const [hours, minutes] = existingEvent.startTime.split(':');
            existingStartTime = new Date(existingStart);
            existingStartTime.setHours(
              parseInt(hours),
              parseInt(minutes),
              0,
              0
            );
          }

          if (existingEvent.endTime) {
            const [hours, minutes] = existingEvent.endTime.split(':');
            existingEndTime = new Date(existingEnd);
            existingEndTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          }

          // Calculate new event times
          let newStartTime = eventStartDate;
          let newEndTime = eventEndDate;

          if (startTime) {
            const [hours, minutes] = startTime.split(':');
            newStartTime = new Date(eventStartDate);
            newStartTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          }

          if (endTime) {
            const [hours, minutes] = endTime.split(':');
            newEndTime = new Date(eventEndDate);
            newEndTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          }

          // Check for time conflict
          if (
            this.hasTimeConflict(
              existingStartTime,
              existingEndTime,
              newStartTime,
              newEndTime
            )
          ) {
            conflicts.push({
              event: existingEvent,
              conflictType: 'time_overlap',
              message: `Time conflict with existing ${existingEvent.category.name} event: ${existingEvent.title}`,
            });
          }
        }
      }

      if (conflicts.length > 0) {
        return {
          hasConflict: true,
          conflicts: conflicts,
          conflictType: 'time_overlap',
          message: `Found ${conflicts.length} time conflict(s) with existing events`,
        };
      }

      return {
        hasConflict: false,
        conflicts: [],
        conflictType: null,
        message: 'No conflicts found',
      };
    } catch (error) {
      logger.error('Error checking event conflicts:', error);
      throw new Error('Failed to check event conflicts');
    }
  }

  /**
   * Get alternative suggestions for conflicted events
   * @param {Object} eventData - Event data
   * @param {Array} conflicts - Array of conflicts
   * @returns {Object} - Alternative suggestions
   */
  async getAlternativeSuggestions(eventData, _conflicts) {
    const { category, location, startDate, endDate } = eventData;
    const city = location.city;
    const eventStartDate = new Date(startDate);
    const eventEndDate = new Date(endDate);

    const suggestions = {
      alternativeTimes: [],
      alternativeDates: [],
      alternativeLocations: [],
      nearbyVenues: [],
    };

    try {
      // Find available time slots for the same day
      const sameDayQuery = {
        category: category,
        'location.city': city,
        status: { $in: this.constructor.ACTIVE_STATUSES },
        isDeleted: false,
        $or: [
          {
            startDate: { $lte: eventEndDate },
            endDate: { $gte: eventStartDate },
          },
        ],
      };

      const _sameDayEvents = await Event.find(sameDayQuery)
        .select('startDate endDate startTime endTime')
        .sort({ startDate: 1 });

      // Generate time suggestions (simplified - in real implementation, you'd calculate gaps)
      suggestions.alternativeTimes = [
        '09:00 - 11:00',
        '11:00 - 13:00',
        '13:00 - 15:00',
        '15:00 - 17:00',
        '17:00 - 19:00',
      ];

      // Find alternative dates (next 7 days)
      for (let i = 1; i <= 7; i++) {
        const altDate = new Date(eventStartDate);
        altDate.setDate(altDate.getDate() + i);
        suggestions.alternativeDates.push(altDate.toISOString().split('T')[0]);
      }

      // Find nearby venues (simplified - in real implementation, you'd use geolocation)
      suggestions.nearbyVenues = [
        'Community Center',
        'Library Hall',
        'School Auditorium',
        'Park Pavilion',
      ];

      return suggestions;
    } catch (error) {
      logger.error('Error generating alternative suggestions:', error);
      return suggestions;
    }
  }
}

const conflictDetectionService = new ConflictDetectionService();
export { conflictDetectionService };
