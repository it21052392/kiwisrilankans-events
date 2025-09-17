import { format } from 'date-fns';

/**
 * Formats event time display using startDate + startTime and endTime
 * @param event - Event object with startDate, startTime, and endTime fields
 * @returns Formatted time string (e.g., "8:00 AM - 12:00 PM")
 */
export function formatEventTime(event: any): string {
  if (!event.startDate) return 'Time TBD';
  
  // If we have separate startTime and endTime fields, use them
  if (event.startTime && event.endTime) {
    const startTime = formatTime(event.startTime);
    const endTime = formatTime(event.endTime);
    return `${startTime} - ${endTime}`;
  }
  
  // Fallback to using startDate and endDate if available
  if (event.endDate) {
    const startTime = format(new Date(event.startDate), 'h:mm a');
    const endTime = format(new Date(event.endDate), 'h:mm a');
    return `${startTime} - ${endTime}`;
  }
  
  // If only startDate is available, format it
  return format(new Date(event.startDate), 'h:mm a');
}

/**
 * Formats a time string (HH:MM) to 12-hour format (h:mm AM/PM)
 * @param timeString - Time in HH:MM format (e.g., "08:00", "14:30")
 * @returns Formatted time string (e.g., "8:00 AM", "2:30 PM")
 */
export function formatTime(timeString: string): string {
  if (!timeString) return '';
  
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  
  return format(date, 'h:mm a');
}

/**
 * Formats event date display
 * @param event - Event object with startDate field
 * @returns Formatted date string (e.g., "Friday, September 20, 2025")
 */
export function formatEventDate(event: any): string {
  if (!event.startDate) return 'Date TBD';
  return format(new Date(event.startDate), 'EEEE, MMMM do, yyyy');
}

/**
 * Formats event date in short format
 * @param event - Event object with startDate field
 * @returns Formatted date string (e.g., "Sep 20, 2025")
 */
export function formatEventDateShort(event: any): string {
  if (!event.startDate) return 'Date TBD';
  return format(new Date(event.startDate), 'MMM do, yyyy');
}
