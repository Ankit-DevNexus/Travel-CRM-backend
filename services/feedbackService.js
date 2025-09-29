// services/feedbackService.js
import cron from 'node-cron';
import flightAndHotelBookingModel from '../models/flightAndHotelBookingModel.js';
import { sendFeedbackEmail } from './emailService.js';

// Schedule job to run daily at 9 AM
export const scheduleFeedbackEmails = () => {
  cron.schedule('0 9 * * *', async () => {
    try {
      console.log('Checking for completed trips...');
      await checkAndSendFeedbackEmails();
    } catch (error) {
      console.error('Error in feedback email scheduler:', error);
    }
  });
};

export const checkAndSendFeedbackEmails = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split('T')[0];

  console.log('Starting feedback email check...');
  console.log("Today's date:", todayString);

  try {
    // Find bookings where trip is completed but feedback not sent
    const completedBookings = await flightAndHotelBookingModel.find({
      $or: [
        {
          'flightDetails.returnDate': {
            $lt: today.toISOString().split('T')[0],
          },
          feedbackSent: { $ne: true },
        },
        {
          'hotelDetails.checkOutDate': {
            $lt: today.toISOString().split('T')[0],
          },
          feedbackSent: { $ne: true },
        },
      ],
    });

    console.log(`Found ${completedBookings.length} completed bookings`);

    for (const booking of completedBookings) {
      try {
        await sendFeedbackEmail(booking);

        // Mark as feedback sent
        await flightAndHotelBookingModel.findByIdAndUpdate(booking._id, {
          feedbackSent: true,
          feedbackSentAt: new Date(),
        });

        console.log(
          `Feedback email sent for booking: ${booking.uniqueBookingId}`
        );
      } catch (error) {
        console.error(
          `Failed to send email for booking ${booking.uniqueBookingId}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error('Error checking completed trips:', error);
  }
};
