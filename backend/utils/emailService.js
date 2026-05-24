const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Send email
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${options.to}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error('Email could not be sent');
  }
};

// Send verification email
const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  
  const html = `
    <h2>Welcome to Oritrend Distribution!</h2>
    <p>Please verify your email address to get started.</p>
    <a href="${verificationUrl}" style="background-color: #ff8c00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Verify Email
    </a>
    <p>Or copy this link: ${verificationUrl}</p>
    <p>This link expires in 24 hours.</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Verify Your Oritrend Account',
    html
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <h2>Password Reset Request</h2>
    <p>You requested to reset your password. Click the link below to continue.</p>
    <a href="${resetUrl}" style="background-color: #ff8c00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Reset Password
    </a>
    <p>Or copy this link: ${resetUrl}</p>
    <p>This link expires in 30 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Reset Your Oritrend Password',
    html
  });
};

// Send subscription confirmation
const sendSubscriptionConfirmation = async (email, plan, amount) => {
  const html = `
    <h2>Subscription Confirmed!</h2>
    <p>Thank you for subscribing to Oritrend Distribution!</p>
    <p><strong>Plan:</strong> ${plan}</p>
    <p><strong>Amount:</strong> $${amount}/year</p>
    <p>Your artist dashboard is now active. You can start uploading songs immediately!</p>
    <a href="${process.env.CLIENT_URL}/dashboard" style="background-color: #ff8c00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Go to Dashboard
    </a>
  `;

  await sendEmail({
    to: email,
    subject: 'Your Oritrend Subscription is Active',
    html
  });
};

// Send upload notification
const sendUploadNotification = async (email, songTitle, status) => {
  const statusText = status === 'live' ? 'is now live on all platforms!' : `status: ${status}`;
  
  const html = `
    <h2>Your Song Upload</h2>
    <p><strong>"${songTitle}"</strong> ${statusText}</p>
    <a href="${process.env.CLIENT_URL}/dashboard/songs" style="background-color: #ff8c00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
      View in Dashboard
    </a>
  `;

  await sendEmail({
    to: email,
    subject: `Song Upload: ${songTitle}`,
    html
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendSubscriptionConfirmation,
  sendUploadNotification
};
