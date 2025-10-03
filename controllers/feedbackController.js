//controllers/feedbackController.js
import flightAndHotelBookingModel from '../models/flightAndHotelBookingModel.js';
import { checkAndSendFeedbackEmails } from '../services/feedbackService.js';

export const triggerFeedbackEmails = async (req, res) => {
  try {
    await checkAndSendFeedbackEmails();
    res.json({
      message: 'Feedback email process completed successfully',
      triggeredAt: new Date(),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error triggering feedback emails',
      error: error.message,
    });
  }
};

// controllers/feedbackController.js
export const submitFeedback = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rating, comments, suggestions } = req.body;
    console.log('rating', rating);
    console.log('comments', comments);
    console.log('suggestions', suggestions);

    // Update booking with feedback
    await flightAndHotelBookingModel.findOneAndUpdate(
      { uniqueBookingId: bookingId },
      {
        feedbackReceived: true,
        feedbackReceivedAt: new Date(),
        feedbackData: {
          rating,
          comments,
          suggestions,
          submittedAt: new Date(),
        },
      },
    );

    res.json({
      message: 'Thank you for your valuable feedback!',
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error submitting feedback',
      error: error.message,
    });
  }
};
