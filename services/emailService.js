// services/emailService.js
import nodemailer from 'nodemailer';

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendFeedbackEmail = async (booking) => {
  const clientEmail = getClientEmail(booking);

  if (!clientEmail) {
    throw new Error('No email found for client');
  }

  const clientName = getClientName(booking);
  const tripDetails = getTripDetails(booking);
  const uniqueBookingId = booking.uniqueBookingId || booking.booking?.uniqueBookingId;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: clientEmail,
    subject: 'How was your trip? - Share Your Feedback',
    html: generateFeedbackEmailTemplate(clientName, tripDetails, uniqueBookingId),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Recipient:', clientEmail);
    console.log('Sent at:', new Date());
    console.log('Booking ID:', uniqueBookingId);

    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Helper function to get client email from both formats
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

  return null;
};

// Helper function to get client name from both formats
const getClientName = (booking) => {
  // First format names
  if (booking.booking?.bookingType?.flightBooking?.passengerDetails?.firstName) {
    return booking.booking.bookingType.flightBooking.passengerDetails.firstName;
  }
  if (booking.booking?.bookingType?.hotelBooking?.guestDetails?.firstName) {
    return booking.booking.bookingType.hotelBooking.guestDetails.firstName;
  }

  // Second format names
  if (booking.booking?.querySource?.guestDetails?.name) {
    return booking.booking.querySource.guestDetails.name.split(' ')[0]; // Get first name
  }

  return 'Valued Customer';
};

const getTripDetails = (booking) => {
  let destination = 'Your destination';
  let travelDates = {
    departure: null,
    return: null,
    checkIn: null,
    checkOut: null,
  };

  // First format
  const flight1 = booking.booking?.bookingType?.flightBooking?.flightDetails;
  const hotel1 = booking.booking?.bookingType?.hotelBooking?.hotelDetails;

  // Second format
  const flight2 = booking.booking?.flightBooking;
  const hotel2 = booking.booking?.hotelBooking;

  // Determine destination
  if (flight1?.destination) destination = flight1.destination;
  else if (hotel1?.city) destination = hotel1.city;
  else if (flight2?.destination) destination = flight2.destination;
  else if (hotel2?.destination) destination = hotel2.destination;
  else if (booking.booking?.querySource?.destination) destination = booking.booking.querySource.destination;

  // Determine travel dates
  if (flight1) {
    travelDates.departure = flight1.departureDate;
    travelDates.return = flight1.returnDate;
  }
  if (hotel1) {
    travelDates.checkIn = hotel1.checkInDate;
    travelDates.checkOut = hotel1.checkOutDate;
  }
  if (flight2) {
    travelDates.departure = flight2.departureDate;
    travelDates.return = flight2.arrivalDate; // Note: second format uses arrivalDate instead of returnDate
  }
  if (hotel2) {
    travelDates.checkIn = hotel2.checkInDate;
    travelDates.checkOut = hotel2.checkOutDate;
  }

  return {
    destination,
    travelDates,
  };
};

const generateFeedbackEmailTemplate = (clientName, tripDetails, bookingId) => {
  let datesText = '';

  if (tripDetails.travelDates.departure && tripDetails.travelDates.return) {
    datesText = `<p><strong>Travel Dates:</strong> ${formatDate(tripDetails.travelDates.departure)} to ${formatDate(
      tripDetails.travelDates.return,
    )}</p>`;
  } else if (tripDetails.travelDates.checkIn && tripDetails.travelDates.checkOut) {
    datesText = `<p><strong>Stay Dates:</strong> ${formatDate(tripDetails.travelDates.checkIn)} to ${formatDate(
      tripDetails.travelDates.checkOut,
    )}</p>`;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .button { 
          background: #007bff; 
          color: white; 
          padding: 12px 30px; 
          text-decoration: none; 
          border-radius: 5px; 
          display: inline-block;
          margin: 20px 0;
        }
        .footer { 
          background: #f8f9fa; 
          padding: 20px; 
          text-align: center; 
          font-size: 12px; 
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Share Your Experience</h1>
        </div>
        <div class="content">
          <h2>Dear ${clientName},</h2>
          <p>We hope you had a wonderful trip to <strong>${tripDetails.destination}</strong>!</p>
          <p>Your feedback is incredibly valuable to us. It helps us improve our services and assist future travelers in making their journeys memorable.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.FEEDBACK_URL || 'https://yourwebsite.com/feedback'}?bookingId=${bookingId}" class="button">
              Share Your Feedback
            </a>
          </div>
          
          <p><strong>Booking Reference:</strong> ${bookingId}</p>
          <p><strong>Destination:</strong> ${tripDetails.destination}</p>
          ${datesText}
          
          <p>It will only take 2-3 minutes to complete the survey.</p>
          <p>Thank you for choosing us for your travel needs!</p>
        </div>
        <div class="footer">
          <p>Best regards,<br>The Travel Team</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>© ${new Date().getFullYear()} Your Travel Company. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return dateString;
  }
};

// Test email connection (optional)
export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('Email server connection verified');

    const today = new Date();
    console.log('Current date (IST):', today.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));

    return true;
  } catch (error) {
    console.error('Email server connection failed:', error);
    return false;
  }
};

// ------------------------------------------------------------------------------------------------
// // services/emailService.js
// import nodemailer from 'nodemailer';

// // Configure nodemailer
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

// export const sendFeedbackEmail = async (booking) => {
//   const clientEmail = booking.bookingType?.flightBooking?.passengerDetails?.email || booking.bookingType?.hotelBooking?.guestDetails?.email;

//   if (!clientEmail) {
//     throw new Error('No email found for client');
//   }

//   const clientName =
//     booking.bookingType?.flightBooking?.passengerDetails?.firstName ||
//     booking.bookingType?.hotelBooking?.guestDetails?.firstName ||
//     'Valued Customer';

//   const tripDetails = getTripDetails(booking);

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: clientEmail,
//     subject: 'How was your trip? - Share Your Feedback',
//     html: generateFeedbackEmailTemplate(clientName, tripDetails, booking.uniqueBookingId),
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log('Email sent successfully!');
//     console.log('Message ID:', info.messageId);
//     console.log('Recipient:', clientEmail);
//     console.log('Sent at:', new Date());
//     console.log('Booking ID:', booking.uniqueBookingId);

//     return info;
//   } catch (error) {
//     console.error('Error sending email:', error);
//     throw error;
//   }
// };

// const getTripDetails = (booking) => {
//   const flight = booking.bookingType?.flightBooking?.flightDetails;
//   const hotel = booking.bookingType?.hotelBooking?.hotelDetails;

//   return {
//     destination: flight?.destination || hotel?.city || 'Your destination',
//     travelDates: {
//       departure: flight?.departureDate,
//       return: flight?.returnDate,
//       checkIn: hotel?.checkInDate,
//       checkOut: hotel?.checkOutDate,
//     },
//   };
// };

// const generateFeedbackEmailTemplate = (clientName, tripDetails, bookingId) => {
//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//         .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//         .header { background: #f8f9fa; padding: 20px; text-align: center; }
//         .content { padding: 20px; }
//         .button {
//           background: #007bff;
//           color: white;
//           padding: 12px 30px;
//           text-decoration: none;
//           border-radius: 5px;
//           display: inline-block;
//           margin: 20px 0;
//         }
//         .footer {
//           background: #f8f9fa;
//           padding: 20px;
//           text-align: center;
//           font-size: 12px;
//           color: #666;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <h1>Share Your Experience</h1>
//         </div>
//         <div class="content">
//           <h2>Dear ${clientName},</h2>
//           <p>We hope you had a wonderful trip to <strong>${tripDetails.destination}</strong>!</p>
//           <p>Your feedback is incredibly valuable to us. It helps us improve our services and assist future travelers in making their journeys memorable.</p>

//           <div style="text-align: center;">
//             <a href="${process.env.FEEDBACK_URL || 'https://yourwebsite.com/feedback'}?bookingId=${bookingId}" class="button">
//               Share Your Feedback
//             </a>
//           </div>

//           <p><strong>Booking Reference:</strong> ${bookingId}</p>
//           <p><strong>Destination:</strong> ${tripDetails.destination}</p>
//           ${
//             tripDetails.travelDates.departure
//               ? `
//             <p><strong>Travel Dates:</strong> ${tripDetails.travelDates.departure} to ${
//                   tripDetails.travelDates.return || tripDetails.travelDates.checkOut
//                 }</p>
//           `
//               : ''
//           }

//           <p>It will only take 2-3 minutes to complete the survey.</p>
//           <p>Thank you for choosing us for your travel needs!</p>
//         </div>
//         <div class="footer">
//           <p>Best regards,<br>The Travel Team</p>
//           <p>If you have any questions, please contact our support team.</p>
//           <p>© ${new Date().getFullYear()} Your Travel Company. All rights reserved.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
// };

// // Test email connection (optional)
// export const verifyEmailConnection = async () => {
//   try {
//     await transporter.verify();
//     console.log('Email server connection verified');
//     // const today = new Date();
//     // console.log('Current date:', today.toLocaleString());

//     const today = new Date();
//     console.log('Current date (IST):', today.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));

//     return true;
//   } catch (error) {
//     console.error('Email server connection failed:', error);
//     return false;
//   }
// };

// ---------------------------------------------------------------------------------------------
// // Configure nodemailer
// const transporter = nodemailer.createTransport({
//   service: 'gmail', // or your email service
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

// export const sendFeedbackEmail = async (booking) => {
//   const clientEmail =
//     booking.flightBooking?.passengerDetails?.email ||
//     booking.hotelBooking?.guestDetails?.email;

//   if (!clientEmail) {
//     throw new Error('No email found for client');
//   }

//   const clientName =
//     booking.flightBooking?.passengerDetails?.firstName ||
//     booking.hotelBooking?.guestDetails?.firstName ||
//     'Valued Customer';

//   const tripDetails = getTripDetails(booking);

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: clientEmail,
//     subject: 'How was your trip? - Share Your Feedback',
//     html: generateFeedbackEmailTemplate(
//       clientName,
//       tripDetails,
//       booking.uniqueBookingId
//     ),
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log('Email sent successfully!');
//     console.log('Message ID:', info.messageId);
//     console.log('Recipient:', clientEmail);
//     console.log('Sent at:', new Date());
//     console.log('Booking ID:', booking.uniqueBookingId);

//     return info;
//   } catch (error) {
//     console.error('Error sending email:', error);
//     throw error;
//   }
// };

// const getTripDetails = (booking) => {
//   const flight = booking.flightBooking?.flightDetails;
//   const hotel = booking.hotelBooking?.hotelDetails;

//   return {
//     destination: flight?.destination || hotel?.city || 'Your destination',
//     travelDates: {
//       departure: flight?.departureDate,
//       return: flight?.returnDate,
//       checkIn: hotel?.checkInDate,
//       checkOut: hotel?.checkOutDate,
//     },
//   };
// };

// const generateFeedbackEmailTemplate = (clientName, tripDetails, bookingId) => {
//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//         .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//         .header { background: #f8f9fa; padding: 20px; text-align: center; }
//         .content { padding: 20px; }
//         .button {
//           background: #007bff;
//           color: white;
//           padding: 12px 30px;
//           text-decoration: none;
//           border-radius: 5px;
//           display: inline-block;
//           margin: 20px 0;
//         }
//         .footer {
//           background: #f8f9fa;
//           padding: 20px;
//           text-align: center;
//           font-size: 12px;
//           color: #666;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <h1>Share Your Experience</h1>
//         </div>
//         <div class="content">
//           <h2>Dear ${clientName},</h2>
//           <p>We hope you had a wonderful trip to <strong>${
//             tripDetails.destination
//           }</strong>!</p>
//           <p>Your feedback is incredibly valuable to us. It helps us improve our services and assist future travelers in making their journeys memorable.</p>

//           <div style="text-align: center;">
//             <a href="${
//               process.env.FEEDBACK_URL
//             }?bookingId=${bookingId}" class="button">
//               Share Your Feedback
//             </a>
//           </div>

//           <p><strong>Booking Reference:</strong> ${bookingId}</p>
//           <p><strong>Destination:</strong> ${tripDetails.destination}</p>
//           ${
//             tripDetails.travelDates.departure
//               ? `
//             <p><strong>Travel Dates:</strong> ${
//               tripDetails.travelDates.departure
//             } to ${
//                   tripDetails.travelDates.return ||
//                   tripDetails.travelDates.checkOut
//                 }</p>
//           `
//               : ''
//           }

//           <p>It will only take 2-3 minutes to complete the survey.</p>
//           <p>Thank you for choosing us for your travel needs!</p>
//         </div>
//         <div class="footer">
//           <p>Best regards,<br>The Travel Team</p>
//           <p>If you have any questions, please contact our support team.</p>
//           <p>© ${new Date().getFullYear()} Your Travel Company. All rights reserved.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
// };
