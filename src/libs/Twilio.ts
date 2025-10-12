import { Twilio } from 'twilio';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error(
    'Twilio credentials are not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.',
  );
}

export const twilioClient = new Twilio(accountSid, authToken);

// WhatsApp messaging service
export class TwilioWhatsAppService {
  private static readonly WHATSAPP_FROM = 'whatsapp:+14155238886'; // Twilio Sandbox number
  private static readonly PHONE_REGEX = /^\+[1-9]\d{9,14}$/;

  /**
   * Send a WhatsApp message
   * @param to - The recipient's phone number (with country code, e.g., +1234567890)
   * @param message - The message content
   * @returns Promise with message result
   */
  static async sendWhatsAppMessage(to: string, message: string) {
    try {
      // Ensure the phone number is in the correct format
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

      const result = await twilioClient.messages.create({
        body: message,
        from: this.WHATSAPP_FROM,
        to: formattedTo,
      });

      return {
        success: true,
        messageSid: result.sid,
        status: result.status,
        data: result,
      };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Validate phone number format
   * @param phoneNumber - The phone number to validate
   * @returns boolean indicating if the phone number is valid
   */
  static isValidPhoneNumber(phoneNumber: string): boolean {
    // Remove all non-digit characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');

    // Check if it starts with + and has 10-15 digits after country code
    return this.PHONE_REGEX.test(cleaned);
  }

  /**
   * Format phone number for WhatsApp
   * @param phoneNumber - The phone number to format
   * @returns Formatted phone number
   */
  static formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');

    // If it doesn't start with +, assume it's a US number
    if (!cleaned.startsWith('+')) {
      return `+1${cleaned}`;
    }

    return cleaned;
  }
}
