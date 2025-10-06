// services/feedbackService.js
import cron from 'node-cron';
import { sendFeedbackEmail } from './emailService.js'; // Import from emailService
import SalesDataModel from '../models/SalesDataModel.js';

export const scheduleFeedbackEmails = () => {
  // Schedule job to run daily
  cron.schedule(
    '50 11 * * *',
    async () => {
      try {
        console.log('Scheduled: Checking for completed trips...');
        await checkAndSendFeedbackEmails();
      } catch (error) {
        console.error('Error in feedback email scheduler:', error);
      }
    },
    {
      scheduled: true,
      timezone: 'Asia/Kolkata',
    },
  );
};

export const checkAndSendFeedbackEmails = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log('Starting feedback email check...');
  console.log("Today's date:", today.toISOString().split('T')[0]);

  try {
    // Get bookings where feedback not sent
    const pendingBookings = await SalesDataModel.find({
      'booking.feedbackSent': { $ne: true },
    });

    console.log(`Found ${pendingBookings.length} bookings to check`);

    let sentCount = 0;
    let errorCount = 0;

    for (const booking of pendingBookings) {
      try {
        // Get the latest from booking
        const latestDate = getLatestCompletionDate(booking);

        console.log(
          `Booking: ${booking.uniqueBookingId || booking.booking?.uniqueBookingId}`,
          'Latest Completion Date:',
          latestDate ? latestDate.toISOString().split('T')[0] : 'N/A',
        );

        if (latestDate && latestDate < today) {
          // Past booking, send feedback email
          const email = getClientEmail(booking);

          console.log(`Attempting to send email to ${email || 'No email'}...`);
          await sendFeedbackEmail(booking);

          await SalesDataModel.findByIdAndUpdate(
            booking._id,
            {
              $set: {
                'booking.feedbackSent': true,
                'booking.feedbackSentAt': new Date(),
              },
            },
            { new: true }, // return updated document
          );

          console.log(`Feedback sent for: ${booking.uniqueBookingId || booking.booking?.uniqueBookingId}`);
          sentCount++;
        } else {
          console.log(`Skipping: Trip not yet completed or no valid date`);
        }
      } catch (error) {
        console.error(`Failed for ${booking.uniqueBookingId || booking.booking?.uniqueBookingId}:`, error.message);
        errorCount++;
      }
    }

    console.log('\nFeedback check completed!');
    console.log(`Successfully sent: ${sentCount}`);
    console.log(`Failed: ${errorCount}`);
    console.log(`Total processed: ${pendingBookings.length}`);
  } catch (error) {
    console.error('Error in feedback email check:', error);
  }
};

const getLatestCompletionDate = (booking) => {
  const dates = [];

  // Format 1 - bookingType based
  if (booking.booking?.bookingType?.flightBooking?.flightDetails?.returnDate) {
    dates.push(new Date(booking.booking.bookingType.flightBooking.flightDetails.returnDate));
  }
  if (booking.booking?.bookingType?.hotelBooking?.hotelDetails?.checkOutDate) {
    dates.push(new Date(booking.booking.bookingType.hotelBooking.hotelDetails.checkOutDate));
  }

  // Format 2 - direct flightBooking/hotelBooking
  if (booking.booking?.flightBooking?.arrivalDate) {
    dates.push(new Date(booking.booking.flightBooking.arrivalDate));
  }
  if (booking.booking?.hotelBooking?.checkOutDate) {
    dates.push(new Date(booking.booking.hotelBooking.checkOutDate));
  }

  // Return the latest date or null
  return dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null;
};

const getClientEmail = (booking) => {
  if (booking.booking?.bookingType?.flightBooking?.passengerDetails?.email) {
    return booking.booking.bookingType.flightBooking.passengerDetails.email;
  }
  if (booking.booking?.bookingType?.hotelBooking?.guestDetails?.email) {
    return booking.booking.bookingType.hotelBooking.guestDetails.email;
  }
  if (booking.booking?.querySource?.guestDetails?.email) {
    return booking.booking.querySource.guestDetails.email;
  }
  if (booking.booking?.flightBooking?.passengerDetails?.email) {
    return booking.booking.flightBooking.passengerDetails.email;
  }
  if (booking.booking?.hotelBooking?.guestDetails?.email) {
    return booking.booking.hotelBooking.guestDetails.email;
  }
  return null;
};
