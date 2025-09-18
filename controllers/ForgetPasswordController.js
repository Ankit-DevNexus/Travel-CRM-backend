import crypto from 'crypto';
import { sendEmail } from '../utils/SendEmail.js';
import userModel from '../models/userModel.js';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export const forgotPassword = async (req, res) => {
  if (req.method === 'GET') {
    res.render('forgetPassword');
  } else if (req.method === 'POST') {
    try {
      const { email } = req.body;
      const user = await userModel.findOne({ email });

      if (!user)
        return res.status(404).json({ msg: 'User not found with this email' });

      const token = crypto.randomBytes(32).toString('hex');

      user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
      user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

      await user.save();

      const resetLink = `${CLIENT_URL}/api/reset-password/${token}`;

      const html = `
                <p>Hello ${user.name},</p>
                <p>Click the link below to reset your password:</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>This link is valid for 1 hour.</p>
            `;

      await sendEmail(user.email, 'Password Reset Request', html);

      res.status(200).json({ message: 'Reset link sent to your email.' });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ msg: 'Something went wrong', error: error.message });
    }
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash token to compare with DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // token should not be expired
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res
      .status(200)
      .json({ message: 'Password reset successful. Please login.' });
  } catch (error) {
    return res.status(500).json({ msg: 'Server error', error: error.message });
  }
};
