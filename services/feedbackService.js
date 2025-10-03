// services/feedbackService.js
import cron from 'node-cron';
import { sendFeedbackEmail } from './emailService.js'; // Import from emailService
import SalesDataModel from '../models/SalesDataModel.js';

export const scheduleFeedbackEmails = () => {
  // Schedule job to run daily
  cron.schedule(
    '25 10 * * *',
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
  const todayString = today.toISOString().split('T')[0];

  console.log('Starting feedback email check...');
  console.log("Today's date:", todayString);

  try {
    const completedBookings = await SalesDataModel.find({
      $and: [
        {
          $or: [
            // First response format (nested bookingType)
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
            // Second response format (direct flightBooking/hotelBooking)
            {
              'booking.flightBooking.arrivalDate': {
                $lt: todayString,
              },
            },
            {
              'booking.hotelBooking.checkOutDate': {
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
      const flightReturn = getFlightReturnDate(booking);
      const hotelCheckout = getHotelCheckoutDate(booking);
      const email = getClientEmail(booking);

      console.log(`Booking: ${booking.uniqueBookingId || booking.booking?.uniqueBookingId}`);
      console.log(`Flight Return: ${flightReturn || 'N/A'}`);
      console.log(`Hotel Checkout: ${hotelCheckout || 'N/A'}`);
      console.log(`Email: ${email || 'No email found'}`);
    });

    let sentCount = 0;
    let errorCount = 0;

    for (const booking of completedBookings) {
      try {
        const uniqueBookingId = booking.uniqueBookingId || booking.booking?.uniqueBookingId;
        console.log(`\nAttempting to send email for: ${uniqueBookingId}`);

        await sendFeedbackEmail(booking);

        await SalesDataModel.findByIdAndUpdate(booking._id, {
          feedbackSent: true,
          feedbackSentAt: new Date(),
        });

        console.log(`Successfully sent and marked feedback for: ${uniqueBookingId}`);
        sentCount++;
      } catch (error) {
        const uniqueBookingId = booking.uniqueBookingId || booking.booking?.uniqueBookingId;
        console.error(`Failed for ${uniqueBookingId}:`, error.message);
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

// Helper functions to handle both response formats
const getFlightReturnDate = (booking) => {
  // First format: booking.bookingType.flightBooking.flightDetails.returnDate
  if (booking.booking?.bookingType?.flightBooking?.flightDetails?.returnDate) {
    return booking.booking.bookingType.flightBooking.flightDetails.returnDate;
  }
  // Second format: booking.flightBooking.arrivalDate
  if (booking.booking?.flightBooking?.arrivalDate) {
    return booking.booking.flightBooking.arrivalDate;
  }
  return null;
};

const getHotelCheckoutDate = (booking) => {
  // First format: booking.bookingType.hotelBooking.hotelDetails.checkOutDate
  if (booking.booking?.bookingType?.hotelBooking?.hotelDetails?.checkOutDate) {
    return booking.booking.bookingType.hotelBooking.hotelDetails.checkOutDate;
  }
  // Second format: booking.hotelBooking.checkOutDate
  if (booking.booking?.hotelBooking?.checkOutDate) {
    return booking.booking.hotelBooking.checkOutDate;
  }
  return null;
};

const getClientEmail = (booking) => {
  // First format emails
  if (booking.booking?.bookingType?.flightBooking?.passengerDetails?.email) {
    return booking.booking.bookingType.flightBooking.passengerDetails.email;
  }
  if (booking.booking?.bookingType?.hotelBooking?.guestDetails?.email) {
    return booking.booking.bookingType.hotelBooking.guestDetails.email;
  }

  // Second format emails
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

// // services/feedbackService.js
// import cron from 'node-cron';
// import { sendFeedbackEmail } from './emailService.js'; // Import from emailService
// import SalesDataModel from '../models/SalesDataModel.js';

// export const scheduleFeedbackEmails = () => {
//   // Schedule job to run daily
//   cron.schedule('45 17 * * *', async () => {
//     try {
//       console.log('Scheduled: Checking for completed trips...');
//       await checkAndSendFeedbackEmails();
//     } catch (error) {
//       console.error('Error in feedback email scheduler:', error);
//     }
//   });
// };

// export const checkAndSendFeedbackEmails = async () => {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   const todayString = today.toISOString().split('T')[0];

//   console.log('Starting feedback email check...');
//   console.log("Today's date:", todayString);

//   try {
//     const completedBookings = await SalesDataModel.find({
//       $and: [
//         {
//           $or: [
//             {
//               'booking.bookingType.flightBooking.flightDetails.returnDate': {
//                 $lt: todayString,
//               },
//             },
//             {
//               'booking.bookingType.hotelBooking.hotelDetails.checkOutDate': {
//                 $lt: todayString,
//               },
//             },
//           ],
//         },
//         { feedbackSent: { $ne: true } },
//       ],
//     });

//     console.log(`Found ${completedBookings.length} completed bookings needing feedback`);

//     // Log details of each found booking
//     completedBookings.forEach((booking) => {
//       const flightReturn = booking.bookingType?.flightBooking?.flightDetails?.returnDate;
//       const hotelCheckout = booking.bookingType?.hotelBooking?.hotelDetails?.checkOutDate;
//       const email = booking.bookingType?.flightBooking?.passengerDetails?.email || booking.bookingType?.hotelBooking?.guestDetails?.email;

//       console.log(`Booking: ${booking.uniqueBookingId}`);
//       console.log(`Flight Return: ${flightReturn || 'N/A'}`);
//       console.log(`Hotel Checkout: ${hotelCheckout || 'N/A'}`);
//       console.log(`Email: ${email || 'No email found'}`);
//     });

//     let sentCount = 0;
//     let errorCount = 0;

//     for (const booking of completedBookings) {
//       try {
//         console.log(`\nAttempting to send email for: ${booking.uniqueBookingId}`);
//         await sendFeedbackEmail(booking);

//         await SalesDataModel.findByIdAndUpdate(booking._id, {
//           feedbackSent: true,
//           feedbackSentAt: new Date(),
//         });

//         console.log(`Successfully sent and marked feedback for: ${booking.uniqueBookingId}`);
//         sentCount++;
//       } catch (error) {
//         console.error(`Failed for ${booking.uniqueBookingId}:`, error.message);
//         errorCount++;
//       }
//     }

//     console.log(`\n Feedback check completed!`);
//     console.log(` Successfully sent: ${sentCount}`);
//     console.log(` Failed: ${errorCount}`);
//     console.log(` Total processed: ${completedBookings.length}`);
//   } catch (error) {
//     console.error(' Error in feedback email check:', error);
//   }
// };
