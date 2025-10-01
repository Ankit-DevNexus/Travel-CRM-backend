// services/feedbackService.js
import cron from 'node-cron';
import flightAndHotelBookingModel from '../models/flightAndHotelBookingModel.js';
import { sendFeedbackEmail } from './emailService.js'; // Import from emailService
import SalesDataModel from '../models/SalesDataModel.js';

export const scheduleFeedbackEmails = () => {
  // Schedule job to run daily
  cron.schedule('45 17 * * *', async () => {
    try {
      console.log('Scheduled: Checking for completed trips...');
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
    const completedBookings = await SalesDataModel.find({
      $and: [
        {
          $or: [
            {
              'booking.bookingType.flightBooking.flightDetails.returnDate': {
                $lt: todayString,
              },
            },
            {
              'booking.bookingType.hotelBooking.hotelDetails.checkOutDate': {
                $lt: todayString,
              },
            },
          ],
        },
        { feedbackSent: { $ne: true } },
      ],
    });

    console.log(`Found ${completedBookings.length} completed bookings needing feedback`);

    // Log details of each found booking
    completedBookings.forEach((booking) => {
      const flightReturn = booking.bookingType?.flightBooking?.flightDetails?.returnDate;
      const hotelCheckout = booking.bookingType?.hotelBooking?.hotelDetails?.checkOutDate;
      const email = booking.bookingType?.flightBooking?.passengerDetails?.email || booking.bookingType?.hotelBooking?.guestDetails?.email;

      console.log(`Booking: ${booking.uniqueBookingId}`);
      console.log(`Flight Return: ${flightReturn || 'N/A'}`);
      console.log(`Hotel Checkout: ${hotelCheckout || 'N/A'}`);
      console.log(`Email: ${email || 'No email found'}`);
    });

    let sentCount = 0;
    let errorCount = 0;

    for (const booking of completedBookings) {
      try {
        console.log(`\nAttempting to send email for: ${booking.uniqueBookingId}`);
        await sendFeedbackEmail(booking);

        await SalesDataModel.findByIdAndUpdate(booking._id, {
          feedbackSent: true,
          feedbackSentAt: new Date(),
        });

        console.log(`Successfully sent and marked feedback for: ${booking.uniqueBookingId}`);
        sentCount++;
      } catch (error) {
        console.error(`Failed for ${booking.uniqueBookingId}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n Feedback check completed!`);
    console.log(` Successfully sent: ${sentCount}`);
    console.log(` Failed: ${errorCount}`);
    console.log(` Total processed: ${completedBookings.length}`);
  } catch (error) {
    console.error(' Error in feedback email check:', error);
  }
};

// export const checkAndSendFeedbackEmails = async () => {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   const todayString = today.toISOString().split('T')[0];

//   console.log('Starting feedback email check...');
//   console.log("Today's date:", todayString);

//   try {
//     // Find bookings where trip is completed but feedback not sent
//     const completedBookings = await flightAndHotelBookingModel.find({
//       $or: [
//         {
//           'flightDetails.returnDate': {
//             $lt: today.toISOString().split('T')[0],
//           },
//           feedbackSent: { $ne: true },
//         },
//         {
//           'hotelDetails.checkOutDate': {
//             $lt: today.toISOString().split('T')[0],
//           },
//           feedbackSent: { $ne: true },
//         },
//       ],
//     });

//     console.log(`Found ${completedBookings.length} completed bookings`);

//     for (const booking of completedBookings) {
//       try {
//         await sendFeedbackEmail(booking);

//         // Mark as feedback sent
//         await flightAndHotelBookingModel.findByIdAndUpdate(booking._id, {
//           feedbackSent: true,
//           feedbackSentAt: new Date(),
//         });

//         console.log(
//           `Feedback email sent for booking: ${booking.uniqueBookingId}`
//         );
//       } catch (error) {
//         console.error(
//           `Failed to send email for booking ${booking.uniqueBookingId}:`,
//           error
//         );
//       }
//     }
//   } catch (error) {
//     console.error('Error checking completed trips:', error);
//   }
// };
