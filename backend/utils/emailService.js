const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendReminderEmail = async (userEmail, userName, bookTitle, pickupDate) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Reminder: Book Pickup Tomorrow',
    html: `
      <h2>Hello ${userName},</h2>
      <p>This is a reminder that you have a book pickup scheduled for tomorrow:</p>
      <p><strong>Book:</strong> ${bookTitle}</p>
      <p><strong>Pickup Date:</strong> ${new Date(pickupDate).toLocaleDateString()}</p>
      <p>Please make sure to visit the library during operating hours to pick up your book.</p>
      <p>Thank you,<br>Library Staff</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending reminder email:', error);
  }
};

module.exports = {
  sendReminderEmail
}; 