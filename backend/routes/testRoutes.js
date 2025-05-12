const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { sendToQueue } = require('../rabbit');
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

router.post('/test-rabbitmq', async (req, res) => {
  const { name, email, subject, text } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Missing name or email' });
  }

  const payload = {
    name,
    email,
    subject: subject || 'Test Email',
    text: text || `Hi ${name}, this is a test email.`
  };

  try {
    
    await sendToQueue('email_campaign_queue', payload);
    console.log('📦 Queued message for:', email);

  
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: payload.subject,
      text: payload.text
    });

    console.log('📨 Email sent to:', email);

    res.json({ success: true, message: 'Queued and email sent' });
  } catch (err) {
    console.error('❌ Failed to send:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
