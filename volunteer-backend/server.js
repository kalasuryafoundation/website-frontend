require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Choose email method: 'gmail' or 'resend'
const EMAIL_METHOD = process.env.EMAIL_METHOD || 'gmail';

app.post('/api/volunteer', async (req, res) => {
  const { user_name, user_email, user_phone, user_interest } = req.body;

  try {
    if (EMAIL_METHOD === 'resend') {
      // OPTION 1: Using Resend API (simpler, no App Password needed)
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Kalasurya Foundation <onboarding@resend.dev>`, // Resend verified domain
          reply_to: user_email,
          to: [process.env.ADMIN_EMAIL],
          subject: `New Volunteer Application 🙌 - ${user_name}`,
          html: `
            <h3>New Volunteer Application</h3>
            <p><strong>From:</strong> ${user_email} - ${user_name}</p>
            <hr>
            <p><strong>Name:</strong> ${user_name}</p>
            <p><strong>Email:</strong> ${user_email}</p>
            <p><strong>Phone:</strong> ${user_phone}</p>
            <p><strong>Interest:</strong> ${user_interest}</p>
            <hr>
            <p><em>Click "Reply" to respond directly to the volunteer.</em></p>
          `,
        }),
      });

      if (!response.ok) {
        throw new Error('Resend API error');
      }
      
      res.status(200).json({ message: 'Application sent successfully!' });
    } else {
      // OPTION 2: Using Gmail (requires App Password)
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASS,
        },
      });

      let mailOptions = {
        from: `"${user_email} - ${user_name}" <${process.env.GMAIL_USER}>`,
        replyTo: user_email,
        to: process.env.ADMIN_EMAIL || process.env.GMAIL_USER,
        subject: `New Volunteer Application 🙌 - ${user_name}`,
        text: `
          Name: ${user_name}
          Email: ${user_email}
          Phone: ${user_phone}
          Interest: ${user_interest}
        `,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Application sent successfully!' });
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to send email. Check server logs.' });
  }
});

// 👇👇👇 ONLY ADDED — CONTACT FORM ROUTE (NO EXISTING CODE CHANGED) 👇👇👇

app.post('/api/contact', async (req, res) => {
  const { first_name, last_name, email, phone, subject, message } = req.body;

  try {
    if (EMAIL_METHOD === 'resend') {
      // Using Resend API
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Kalasurya Foundation <onboarding@resend.dev>`,
          reply_to: email,
          to: [process.env.ADMIN_EMAIL],
          subject: `New Contact Form: ${subject}`,
          html: `
            <h3>New Contact Form Submission</h3>
            <p><strong>From:</strong> ${email} - ${first_name} ${last_name}</p>
            <hr>
            <p><strong>Name:</strong> ${first_name} ${last_name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #4CAF50;">
              <p><strong>Message:</strong></p>
              <p>${message}</p>
            </div>
            <hr>
            <p><em>Click "Reply" to respond directly to the contact.</em></p>
          `,
        }),
      });

      if (!response.ok) {
        throw new Error('Resend API error');
      }

      res.status(200).json({ message: 'Message sent successfully!' });
    } else {
      // Using Gmail with nodemailer
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASS,
        },
      });

      let mailOptions = {
        from: `"${email} - ${first_name} ${last_name}" <${process.env.GMAIL_USER}>`,
        replyTo: email,
        to: process.env.ADMIN_EMAIL || process.env.GMAIL_USER,
        subject: `New Contact Form: ${subject}`,
        text: `
          New Contact Form Submission:

          Name: ${first_name} ${last_name}
          Email: ${email}
          Phone: ${phone}
          Subject: ${subject}
          Message: ${message}

          — Sent from Contact Page
        `,
        html: `
          <h3>New Contact Form Submission</h3>
          <ul>
            <li><strong>Name:</strong> ${first_name} ${last_name}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Phone:</strong> ${phone}</li>
            <li><strong>Subject:</strong> ${subject}</li>
            <li><strong>Message:</strong> ${message}</li>
          </ul>
          <p><em>Sent from Contact Page</em></p>
        `
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Message sent successfully!' });
    }
  } catch (error) {
    console.error('Error sending contact form email:', error.message);
    res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
});

// 👆👆👆 ONLY ADDED — CONTACT FORM ROUTE (NO EXISTING CODE CHANGED) 👆👆👆

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});