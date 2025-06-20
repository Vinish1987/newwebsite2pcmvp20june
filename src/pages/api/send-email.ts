
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { Resend } = await import('resend');
    
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return res.status(500).json({ message: 'Email service not configured' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const {
      userEmail,
      userName,
      userAge,
      userGender,
      userPassword,
      amount,
      transactionId,
      screenshotUrl,
      timestamp
    } = req.body;

    // Email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px;">
          New Payment Submission - 2PC Pilot Project
        </h2>
        
        <p>New payment submission received for the 2PC pilot project. Please verify and activate the user's account.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">User Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Name:</strong> ${userName}</li>
            <li><strong>Email:</strong> ${userEmail}</li>
            <li><strong>Age:</strong> ${userAge}</li>
            <li><strong>Gender:</strong> ${userGender}</li>
            <li><strong>Password:</strong> ${userPassword}</li>
          </ul>
        </div>
        
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Payment Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Amount:</strong> ₹${amount.toLocaleString()}</li>
            <li><strong>Transaction ID:</strong> ${transactionId || "Not provided"}</li>
            <li><strong>Screenshot:</strong> ${screenshotUrl ? "Uploaded" : "Not provided"}</li>
            <li><strong>Submission Time:</strong> ${new Date(timestamp).toLocaleString()}</li>
          </ul>
        </div>
        
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          Please verify this payment and activate the user's account accordingly.
        </p>
        
        <p style="color: #64748b; font-size: 14px;">
          Best regards,<br>
          2PC System
        </p>
      </div>
    `;

    // Send email
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: ['vini12345@gmail.com'],
      subject: 'New Payment Submission - 2PC Pilot Project',
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ message: 'Failed to send email', error });
    }

    console.log('Email sent successfully:', data);
    return res.status(200).json({ message: 'Email sent successfully', data });

  } catch (error) {
    console.error('Email API error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error });
  }
}
