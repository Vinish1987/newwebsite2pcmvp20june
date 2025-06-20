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
      withdrawalAmount,
      timestamp
    } = req.body;

    // Email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
          New Withdrawal Request - 2PC System
        </h2>
        
        <p>A new withdrawal request has been received from a user. Please verify and process accordingly.</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="color: #1e293b; margin-top: 0;">Withdrawal Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>User Name:</strong> ${userName}</li>
            <li><strong>User Email:</strong> ${userEmail}</li>
            <li><strong>Withdrawal Amount:</strong> ₹${withdrawalAmount.toLocaleString()}</li>
            <li><strong>Request Time:</strong> ${new Date(timestamp).toLocaleString()}</li>
          </ul>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Action Required:</h3>
          <p>Please verify this withdrawal request and process the payment within 24 hours as per the user agreement.</p>
        </div>
        
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          New withdrawal request received. Please verify and process.
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
      subject: 'New Withdrawal Request - 2PC System',
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ message: 'Failed to send email', error });
    }

    console.log('Withdrawal email sent successfully:', data);
    return res.status(200).json({ message: 'Withdrawal email sent successfully', data });

  } catch (error) {
    console.error('Withdrawal email API error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error });
  }
}