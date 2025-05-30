// api/sendEmail.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // ---- START DEBUGGING LOGS ----
  console.log("--- Executing /api/sendEmail ---");
  console.log("Received EMAIL_HOST:", process.env.EMAIL_HOST);
  console.log("Received EMAIL_PORT:", process.env.EMAIL_PORT);
  console.log("Received EMAIL_USER:", process.env.EMAIL_USER);
  // For security, be cautious about logging EMAIL_PASS directly in production.
  // This check is safer for verifying if it's present during local debugging:
  console.log("Is EMAIL_PASS set?", process.env.EMAIL_PASS ? 'Yes, a value is present' : 'No, it is undefined or empty');
  console.log("--- End of Environment Variable Check ---");
  // ---- END DEBUGGING LOGS ----

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Ensure environment variables are used, with fallbacks only for local non-sensitive defaults if any
  const emailHost = process.env.EMAIL_HOST;
  const emailPort = parseInt(process.env.EMAIL_PORT || '587', 10); // Default to 587 if not set
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailHost || !emailUser || !emailPass) {
    console.error("Missing critical email configuration environment variables.");
    return res.status(500).json({ message: 'Server configuration error for sending email.' });
  }

  const transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465, // True for 465, false for other ports (like 587 which uses STARTTLS)
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    // Enable extensive logging for Nodemailer during debugging:
    // logger: true,
    // debug: true,
  });

  const mailOptions = {
    from: `"${name}" <${emailUser}>`, // Use your verified sending email as from, but show sender's name
    to: 'hello@clowe.co', // Your email address where you want to receive messages
    replyTo: email,        // So you can reply directly to the form submitter
    subject: `New Contact Form Submission: ${subject}`,
    text: `You have a new message from your portfolio contact form:\n
Name: ${name}\n
Email: ${email}\n
Subject: ${subject}\n
Message:\n
${message}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #1a1a1a;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #007bff;">${email}</a></p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <div style="padding: 15px; border-left: 4px solid #007bff; background-color: #f8f9fa; white-space: pre-wrap; font-size: 1em; margin-top: 5px;">${message.replace(/\n/g, '<br>')}</div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 0.9em; color: #777;">This message was sent from your portfolio website contact form.</p>
      </div>
    `,
  };

  try {
    console.log("Attempting to send email with Nodemailer...");
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully by Nodemailer.");
    return res.status(200).json({ message: 'Message sent successfully! I will get back to you soon.' });
  } catch (error) {
    console.error('Error sending email (inside Nodemailer sendMail catch block):', error);
    // Provide more context from the error if available and safe
    let errorMessage = 'Failed to send message. Please try again later.';
    if (error.code === 'EAUTH' || error.responseCode === 535) {
        errorMessage = 'Authentication failed. Please check your email credentials.';
    } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Connection refused. Please check your SMTP host and port.';
    } else if (error.code === 'ENOTFOUND' || error.code === 'EDNS') {
        errorMessage = 'Could not resolve SMTP host. Please check your EMAIL_HOST setting.';
    }
    // It's generally better not to expose too much detail from `error.message` directly to the client
    // for security reasons, but log it server-side.
    return res.status(500).json({ message: errorMessage });
  }
}