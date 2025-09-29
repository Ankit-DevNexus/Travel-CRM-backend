// controllers/feedbackController.js
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
    const { bookingId, rating, comments, suggestions } = req.body;

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
      }
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
