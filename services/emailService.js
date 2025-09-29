// services/emailService.js
import nodemailer from 'nodemailer';

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendFeedbackEmail = async (booking) => {
  const clientEmail =
    booking.flightBooking?.passengerDetails?.email ||
    booking.hotelBooking?.guestDetails?.email;

  if (!clientEmail) {
    throw new Error('No email found for client');
  }

  const clientName =
    booking.flightBooking?.passengerDetails?.firstName ||
    booking.hotelBooking?.guestDetails?.firstName ||
    'Valued Customer';

  const tripDetails = getTripDetails(booking);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: clientEmail,
    subject: 'How was your trip? - Share Your Feedback',
    html: generateFeedbackEmailTemplate(
      clientName,
      tripDetails,
      booking.uniqueBookingId
    ),
  };

  await transporter.sendMail(mailOptions);

  console.log('Email sent successfully!');
  console.log('Message ID:', info.messageId);
  console.log('Recipient:', clientEmail);
  console.log('Sent at:', new Date());
  console.log('Booking ID:', booking.uniqueBookingId);
};

const getTripDetails = (booking) => {
  const flight = booking.flightBooking?.flightDetails;
  const hotel = booking.hotelBooking?.hotelDetails;

  return {
    destination: flight?.destination || hotel?.city || 'Your destination',
    travelDates: {
      departure: flight?.departureDate,
      return: flight?.returnDate,
      checkIn: hotel?.checkInDate,
      checkOut: hotel?.checkOutDate,
    },
  };
};

const generateFeedbackEmailTemplate = (clientName, tripDetails, bookingId) => {
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
          <p>We hope you had a wonderful trip to <strong>${
            tripDetails.destination
          }</strong>!</p>
          <p>Your feedback is incredibly valuable to us. It helps us improve our services and assist future travelers in making their journeys memorable.</p>
          
          <div style="text-align: center;">
            <a href="${
              process.env.FEEDBACK_URL
            }?bookingId=${bookingId}" class="button">
              Share Your Feedback
            </a>
          </div>
          
          <p><strong>Booking Reference:</strong> ${bookingId}</p>
          <p><strong>Destination:</strong> ${tripDetails.destination}</p>
          ${
            tripDetails.travelDates.departure
              ? `
            <p><strong>Travel Dates:</strong> ${
              tripDetails.travelDates.departure
            } to ${
                  tripDetails.travelDates.return ||
                  tripDetails.travelDates.checkOut
                }</p>
          `
              : ''
          }
          
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
