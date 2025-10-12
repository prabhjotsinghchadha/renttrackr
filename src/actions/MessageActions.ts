'use server';

import { z } from 'zod';
import { TwilioWhatsAppService } from '@/libs/Twilio';

// Validation schema for sending messages
const sendMessageSchema = z.object({
  to: z.string().min(1, 'Phone number is required'),
  message: z.string().min(1, 'Message is required').max(1600, 'Message is too long'),
  tenantName: z.string().optional(),
  locale: z.string().optional().default('en'),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export type SendMessageResult = {
  success: boolean;
  message?: string;
  error?: string;
  messageSid?: string;
};

/**
 * Send a WhatsApp message to a tenant
 */
export async function sendWhatsAppMessage(input: SendMessageInput): Promise<SendMessageResult> {
  try {
    // Validate input
    const validatedInput = sendMessageSchema.parse(input);

    // Format and validate phone number
    const formattedPhone = TwilioWhatsAppService.formatPhoneNumber(validatedInput.to);

    if (!TwilioWhatsAppService.isValidPhoneNumber(formattedPhone)) {
      return {
        success: false,
        error: 'Invalid phone number format. Please use format: +1234567890',
      };
    }

    // Create the message with tenant context if provided
    let messageContent = validatedInput.message;
    if (validatedInput.tenantName) {
      let greeting: string;
      let closing: string;

      switch (validatedInput.locale) {
        case 'es':
          greeting = 'Hola';
          closing = 'Saludos cordiales,\nEquipo RentTrackr';
          break;
        case 'fr':
          greeting = 'Bonjour';
          closing = 'Cordialement,\nÉquipe RentTrackr';
          break;
        default:
          greeting = 'Hello';
          closing = 'Best regards,\nRentTrackr Team';
      }

      messageContent = `${greeting} ${validatedInput.tenantName},\n\n${validatedInput.message}\n\n${closing}`;
    }

    // Send the message
    const result = await TwilioWhatsAppService.sendWhatsAppMessage(formattedPhone, messageContent);

    if (result.success) {
      return {
        success: true,
        message: 'Message sent successfully!',
        messageSid: result.messageSid,
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to send message',
      };
    }
  } catch (error) {
    console.error('Error in sendWhatsAppMessage:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Invalid input data',
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred while sending the message',
    };
  }
}

/**
 * Send a quick payment reminder message
 */
export async function sendPaymentReminder(
  tenantPhone: string,
  tenantName: string,
  amount: number,
  dueDate: string,
  locale: string = 'en',
): Promise<SendMessageResult> {
  let message: string;

  switch (locale) {
    case 'es':
      message = `Este es un recordatorio amigable de que su pago de alquiler de $${amount.toFixed(2)} vence el ${dueDate}. Por favor realice su pago lo antes posible para evitar cargos por demora. ¡Gracias!`;
      break;
    case 'fr':
      message = `Ceci est un rappel amical que votre paiement de loyer de $${amount.toFixed(2)} est dû le ${dueDate}. Veuillez effectuer votre paiement dès que possible pour éviter des frais de retard. Merci !`;
      break;
    default:
      message = `This is a friendly reminder that your rent payment of $${amount.toFixed(2)} is due on ${dueDate}. Please make your payment as soon as possible to avoid any late fees. Thank you!`;
  }

  return sendWhatsAppMessage({
    to: tenantPhone,
    message,
    tenantName,
    locale,
  });
}

/**
 * Send a lease renewal reminder
 */
export async function sendLeaseRenewalReminder(
  tenantPhone: string,
  tenantName: string,
  leaseEndDate: string,
  locale: string = 'en',
): Promise<SendMessageResult> {
  let message: string;

  switch (locale) {
    case 'es':
      message = `Su contrato de arrendamiento está programado para expirar el ${leaseEndDate}. Por favor contáctenos para discutir opciones de renovación o programar una inspección de salida. ¡Nos encantaría que se quede!`;
      break;
    case 'fr':
      message = `Votre bail est prévu pour expirer le ${leaseEndDate}. Veuillez nous contacter pour discuter des options de renouvellement ou planifier une inspection de sortie. Nous aimerions que vous restiez !`;
      break;
    default:
      message = `Your lease is set to expire on ${leaseEndDate}. Please contact us to discuss renewal options or schedule a move-out inspection. We'd love to have you stay!`;
  }

  return sendWhatsAppMessage({
    to: tenantPhone,
    message,
    tenantName,
    locale,
  });
}
