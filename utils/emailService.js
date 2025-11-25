const nodemailer = require('nodemailer');

const createTransporter = () => {
  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    return transporter;
  } catch (error) {
    console.error('Error creating email transporter:', error);
    throw new Error('Email service configuration error');
  }
};

const sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: to,
      subject: subject,
      text: text,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

const sendOTPEmail = async (email, otp) => {
  try {
    const subject = 'Your Login OTP';
    const text = `Your OTP for login is: ${otp}. This OTP will expire in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Your Login OTP</h2>
        <p>Your OTP for login is: <strong style="font-size: 24px; color: #4CAF50;">${otp}</strong></p>
        <p>This OTP will expire in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes.</p>
        <p>If you did not request this OTP, please ignore this email.</p>
      </div>
    `;

    return await sendEmail(email, subject, text, html);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    const subject = 'Password Reset Request';
    const text = `You requested a password reset. Click the link to reset your password: ${resetUrl}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Reset Password</a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this password reset, please ignore this email.</p>
      </div>
    `;

    return await sendEmail(email, subject, text, html);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendPasswordResetEmail,
};

