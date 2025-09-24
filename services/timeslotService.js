const moment = require('moment');

/**
 * Generates available time slots for a given practitioner on a specific date.
 *
 * @param {Object} practitioner - The practitioner object from the database.
 * @param {string} dateString - The date for which to generate slots (YYYY-MM-DD).
 * @param {Array} existingAppointments - An array of existing appointments for the practitioner on that date.
 * @returns {Array} An array of available time slots.
 */
const generateTimeSlots = (practitioner, dateString, existingAppointments = []) => {
  const slots = [];
  const dayOfWeek = moment(dateString).format('dddd').toLowerCase(); // e.g., 'monday'

  const dayAvailability = practitioner.availability[dayOfWeek];

  if (!dayAvailability || !dayAvailability.isAvailable) {
    return []; // Practitioner not available on this day
  }

  const startOfDay = moment(`${dateString} ${dayAvailability.start}`, 'YYYY-MM-DD HH:mm');
  const endOfDay = moment(`${dateString} ${dayAvailability.end}`, 'YYYY-MM-DD HH:mm');

  let currentTime = startOfDay.clone();

  while (currentTime.isBefore(endOfDay)) {
    const sessionEndTime = currentTime.clone().add(practitioner.sessionDuration, 'minutes');

    // Ensure session does not extend beyond end of day
    if (sessionEndTime.isAfter(endOfDay)) {
      break;
    }

    const isBooked = existingAppointments.some(appointment => {
      const apptStartTime = moment(`${dateString} ${appointment.startTime}`, 'YYYY-MM-DD HH:mm');
      const apptEndTime = moment(`${dateString} ${appointment.endTime}`, 'YYYY-MM-DD HH:mm');

      // Check for overlap
      return (
        (currentTime.isBefore(apptEndTime) && sessionEndTime.isAfter(apptStartTime))
      );
    });

    if (!isBooked) {
      slots.push({
        startTime: currentTime.format('HH:mm'),
        endTime: sessionEndTime.format('HH:mm'),
        duration: practitioner.sessionDuration,
        isAvailable: true
      });
    }

    // Move to the next slot, considering session duration and break time
    currentTime = sessionEndTime.add(practitioner.breakTime, 'minutes');
  }

  return slots;
};

module.exports = {
  generateTimeSlots
};