export interface EmailNotificationData {
  userEmail: string;
  userName: string;
  userAge: string;
  userGender: string;
  userPassword: string;
  amount: number;
  transactionId?: string;
  screenshotUrl?: string;
  timestamp: string;
}

export const emailService = {
  async sendAdminNotification(data: EmailNotificationData) {
    try {
      // Call the Next.js API endpoint
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send email');
      }

      console.log("Email sent successfully:", result);
      return { success: true, message: "Email sent successfully", data: result };
    } catch (error) {
      console.error("Email notification error:", error);
      
      // Fallback: Store email request for manual processing
      const emailData = {
        to: "vini12345@gmail.com",
        subject: "New Payment Submission - 2PC Pilot Project",
        body: `
          New payment submission received for the 2PC pilot project. Please verify and activate the user's account.
          
          User Details:
          - Name: ${data.userName}
          - Email: ${data.userEmail}
          - Age: ${data.userAge}
          - Gender: ${data.userGender}
          - Password: ${data.userPassword}
          
          Payment Details:
          - Amount: ₹${data.amount.toLocaleString()}
          - Transaction ID: ${data.transactionId || "Not provided"}
          - Screenshot: ${data.screenshotUrl ? "Uploaded" : "Not provided"}
          - Submission Time: ${new Date(data.timestamp).toLocaleString()}
          
          Please verify this payment and activate the user's account accordingly.
          
          Best regards,
          2PC System
        `,
        timestamp: data.timestamp,
        status: "failed",
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      // Store failed email for retry
      const existingEmails = JSON.parse(localStorage.getItem("emailNotifications") || "[]");
      existingEmails.push(emailData);
      localStorage.setItem("emailNotifications", JSON.stringify(existingEmails));

      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Function to get pending email notifications (for admin dashboard)
  getPendingNotifications() {
    return JSON.parse(localStorage.getItem("emailNotifications") || "[]");
  }
};

export default emailService;
