const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendStatusUpdate = async ({ to, name, complaintTitle, newStatus }) => {
  const statusMessages = {
    InProgress: {
      emoji: '🔧',
      message: 'Our team is currently working on resolving this issue.',
      color: '#2563eb',
    },
    Resolved: {
      emoji: '✅',
      message: 'Great news! Your complaint has been resolved.',
      color: '#16a34a',
    },
    Rejected: {
      emoji: '❌',
      message: 'Unfortunately your complaint could not be processed at this time.',
      color: '#dc2626',
    },
  };

  const info = statusMessages[newStatus] || {
    emoji: '📋',
    message: 'Your complaint status has been updated.',
    color: '#6b7280',
  };

  await transporter.sendMail({
    from: `"CityFlow" <${process.env.SMTP_USER}>`,
    to,
    subject: `${info.emoji} Update on your complaint: ${complaintTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1d4ed8, #2563eb); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🏙️ CityFlow</h1>
          <p style="color: #bfdbfe; margin: 5px 0 0;">Complaint Status Update</p>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px;">Hi <strong>${name}</strong>,</p>
          <p style="color: #374151;">Your complaint has been updated:</p>
          <div style="background: #f9fafb; border-left: 4px solid ${info.color}; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #111827;">${complaintTitle}</p>
            <p style="margin: 8px 0 0; color: ${info.color}; font-weight: bold; font-size: 18px;">
              ${info.emoji} ${newStatus}
            </p>
          </div>
          <p style="color: #6b7280;">${info.message}</p>
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">
            View Dashboard
          </a>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="color: #9ca3af; font-size: 12px;">CityFlow — Connecting Citizens with City Services</p>
        </div>
      </div>
    `,
  });
};