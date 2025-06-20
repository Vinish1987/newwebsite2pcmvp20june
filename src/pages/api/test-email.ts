import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { Resend } = await import('resend');
    
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set' : 'Not set');
    
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return res.status(500).json({ message: 'Email service not configured' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Test email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px;">
          Test Email from 2PC System
        </h2>
        
        <p>This is a test email to verify that the email service is working correctly.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Test Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Timestamp:</strong> ${new Date().toLocaleString()}</li>
            <li><strong>Environment:</strong> Development</li>
            <li><strong>Service:</strong> Resend API</li>
          </ul>
        </div>
        
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          If you received this email, the email service is working correctly!
        </p>
        
        <p style="color: #64748b; font-size: 14px;">
          Best regards,<br>
          2PC System
        </p>
      </div>
    `;

    // Send test email
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: ['vini12345@gmail.com'],
      subject: 'Test Email - 2PC System',
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ message: 'Failed to send email', error });
    }

    console.log('Test email sent successfully:', data);
    return res.status(200).json({ message: 'Test email sent successfully', data });

  } catch (error) {
    console.error('Test email API error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error });
  }
}