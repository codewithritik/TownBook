const cron = require('node-cron');
const BookRequest = require('../models/BookRequest');
const { sendReminderEmail } = require('./emailService');

// Run every day at 12 AM
cron.schedule('0 12 * * *', async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextDay = new Date(tomorrow);
    nextDay.setDate(nextDay.getDate() + 1);

    // Find all approved book requests with pickup date tomorrow
    const requests = await BookRequest.find({
      status: 'approved',
      isPickedUp: false,
      pickupDate: {
        $gte: tomorrow,
        $lt: nextDay
      }
    }).populate('book').populate('user');

    // Send reminder emails
    for (const request of requests) {
      await sendReminderEmail(
        request.user.email,
        request.user.name,
        request.book.title,
        request.pickupDate
      );
    }
  } catch (error) {
    console.error('Error in reminder scheduler:', error);
  }
}); 