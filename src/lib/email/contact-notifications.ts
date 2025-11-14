/**
 * Contact Form Email Notifications
 * Handles admin notifications and user confirmations
 */

import { sendEmail, sendBatchEmails } from './email-service';

export interface ContactMessageData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  isAuthenticated: boolean;
  timestamp?: string;
}

/**
 * Get admin email addresses from environment
 * Supports multiple admins separated by comma
 */
function getAdminEmails(): string[] {
  const adminEmails = process.env.ADMIN_EMAILS || process.env.GMAIL_USER || '';
  return adminEmails.split(',').map((email) => email.trim()).filter(Boolean);
}

/**
 * Get category display name with emoji
 */
function getCategoryDisplay(category: string): string {
  const categories: Record<string, string> = {
    general: '💬 Richiesta Generale',
    support: '🛠️ Supporto Tecnico',
    bug: '🐛 Segnalazione Bug',
    feature: '✨ Richiesta Funzionalità',
    billing: '💳 Domanda su Fatturazione',
    other: '📝 Altro',
  };
  return categories[category] || category;
}

/**
 * Send notification email to administrators
 * 
 * @param data - Contact message data
 * @returns Promise<boolean> - true if sent successfully
 */
export async function sendContactAdminNotification(
  data: ContactMessageData
): Promise<boolean> {
  const adminEmails = getAdminEmails();

  if (adminEmails.length === 0) {
    console.warn('⚠️ No admin emails configured (ADMIN_EMAILS or GMAIL_USER)');
    return false;
  }

  const categoryDisplay = getCategoryDisplay(data.category);
  const userType = data.isAuthenticated ? '🔐 Utente Autenticato' : '👤 Ospite';
  const timestamp = data.timestamp || new Date().toLocaleString('it-IT', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const subject = `[AI Knowledge Companion] ${categoryDisplay}: ${data.subject}`;

  const text = `
NUOVO MESSAGGIO DI CONTATTO

Da: ${data.name} (${data.email})
Tipo: ${userType}
Categoria: ${categoryDisplay}
Oggetto: ${data.subject}
Data: ${timestamp}

Messaggio:
${data.message}

---
AI Knowledge Companion - Sistema di Contatto
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuovo Messaggio di Contatto</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 30px 20px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 24px; font-weight: 600;">🔔 Nuovo Messaggio di Contatto</h1>
    <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.95;">AI Knowledge Companion</p>
  </div>

  <div style="background: #f9fafb; padding: 30px 20px; border: 1px solid #e5e7eb; border-top: none;">
    
    <!-- User Info -->
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
      <h2 style="margin: 0 0 15px 0; font-size: 16px; color: #1f2937;">Informazioni Mittente</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 30%;"><strong>Nome:</strong></td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${data.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Email:</strong></td>
          <td style="padding: 8px 0; font-size: 14px;">
            <a href="mailto:${data.email}" style="color: #3b82f6; text-decoration: none;">${data.email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Tipo:</strong></td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${userType}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Categoria:</strong></td>
          <td style="padding: 8px 0; font-size: 14px;">
            <span style="background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 500;">
              ${categoryDisplay}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Data:</strong></td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${timestamp}</td>
        </tr>
      </table>
    </div>

    <!-- Subject -->
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="margin: 0 0 10px 0; font-size: 16px; color: #1f2937;">Oggetto</h2>
      <p style="margin: 0; color: #374151; font-size: 15px; font-weight: 500;">${data.subject}</p>
    </div>

    <!-- Message -->
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="margin: 0 0 15px 0; font-size: 16px; color: #1f2937;">Messaggio</h2>
      <div style="color: #374151; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${data.message}</div>
    </div>

    <!-- Action Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject)}" 
         style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);">
        📧 Rispondi via Email
      </a>
    </div>

    <!-- Info Box -->
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin-top: 20px;">
      <p style="margin: 0; color: #92400e; font-size: 13px;">
        <strong>💡 Suggerimento:</strong> Rispondi entro 2 giorni lavorativi per mantenere un'ottima customer experience.
      </p>
    </div>

  </div>

  <!-- Footer -->
  <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
    <p style="margin: 0; color: #6b7280; font-size: 12px;">
      Questa è una notifica automatica dal sistema di contatto di AI Knowledge Companion.<br>
      Per gestire le notifiche email, modifica la variabile d'ambiente <code>ADMIN_EMAILS</code>.
    </p>
  </div>

</body>
</html>
  `.trim();

  // Send to all admins
  if (adminEmails.length === 1) {
    return await sendEmail({
      to: adminEmails[0],
      subject,
      text,
      html,
      replyTo: data.email,
    });
  } else {
    // Multiple admins - send in batch
    const emails = adminEmails.map((email) => ({
      to: email,
      subject,
      text,
      html,
      replyTo: data.email,
    }));

    const result = await sendBatchEmails(emails);
    return result.sent > 0;
  }
}

/**
 * Send confirmation email to user
 * 
 * @param data - Contact message data
 * @returns Promise<boolean> - true if sent successfully
 */
export async function sendContactUserConfirmation(
  data: ContactMessageData
): Promise<boolean> {
  const categoryDisplay = getCategoryDisplay(data.category);

  const subject = `Messaggio ricevuto - AI Knowledge Companion`;

  const text = `
Ciao ${data.name},

Grazie per averci contattato!

Abbiamo ricevuto il tuo messaggio e il nostro team lo esaminerà a breve.

DETTAGLI DELLA TUA RICHIESTA:
- Categoria: ${categoryDisplay}
- Oggetto: ${data.subject}
- Tempo di risposta previsto: 2 giorni lavorativi

Riceverai una risposta via email a: ${data.email}

Nel frattempo, puoi:
- Esplorare la nostra dashboard
- Creare il tuo primo AI tutor personalizzato
- Caricare documenti per arricchire la knowledge base

Grazie per la tua pazienza!

---
AI Knowledge Companion Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Messaggio Ricevuto</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 30px 20px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 28px; font-weight: 600;">✅ Messaggio Ricevuto!</h1>
    <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.95;">Grazie per averci contattato</p>
  </div>

  <div style="background: #f9fafb; padding: 30px 20px; border: 1px solid #e5e7eb; border-top: none;">
    
    <!-- Greeting -->
    <div style="margin-bottom: 25px;">
      <p style="font-size: 16px; color: #1f2937; margin: 0 0 15px 0;">
        Ciao <strong>${data.name}</strong>,
      </p>
      <p style="font-size: 15px; color: #374151; margin: 0; line-height: 1.6;">
        Abbiamo ricevuto il tuo messaggio e il nostro team lo esaminerà a breve. 
        Ti risponderemo il prima possibile!
      </p>
    </div>

    <!-- Request Details -->
    <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 25px;">
      <h2 style="margin: 0 0 15px 0; font-size: 16px; color: #1e40af;">📋 Dettagli della tua richiesta</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #1e40af; font-size: 14px; width: 35%;"><strong>Categoria:</strong></td>
          <td style="padding: 6px 0; color: #1e40af; font-size: 14px;">${categoryDisplay}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #1e40af; font-size: 14px;"><strong>Oggetto:</strong></td>
          <td style="padding: 6px 0; color: #1e40af; font-size: 14px;">${data.subject}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #1e40af; font-size: 14px;"><strong>Risposta prevista:</strong></td>
          <td style="padding: 6px 0; color: #1e40af; font-size: 14px; font-weight: 600;">2 giorni lavorativi</td>
        </tr>
      </table>
    </div>

    <!-- Response Info -->
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
        📧 Riceverai una risposta via email a: <strong style="color: #3b82f6;">${data.email}</strong>
      </p>
    </div>

    <!-- Next Steps -->
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #e5e7eb;">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #1f2937;">Nel frattempo, puoi:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px;">
        <li style="margin-bottom: 8px;">🎓 Esplorare la nostra dashboard</li>
        <li style="margin-bottom: 8px;">🤖 Creare il tuo primo AI tutor personalizzato</li>
        <li style="margin-bottom: 8px;">📚 Caricare documenti per arricchire la knowledge base</li>
        <li>🏪 Scoprire AI tutor nella marketplace</li>
      </ul>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
         style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);">
        🚀 Vai alla Dashboard
      </a>
    </div>

  </div>

  <!-- Footer -->
  <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
    <p style="margin: 0 0 10px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
      Grazie per la tua pazienza! 🙏
    </p>
    <p style="margin: 0; color: #6b7280; font-size: 12px;">
      Questa è una conferma automatica. Per favore non rispondere a questa email.<br>
      Per ulteriori domande, usa il form di contatto sul nostro sito.
    </p>
    <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 11px;">
      © ${new Date().getFullYear()} AI Knowledge Companion. Tutti i diritti riservati.
    </p>
  </div>

</body>
</html>
  `.trim();

  return await sendEmail({
    to: data.email,
    subject,
    text,
    html,
  });
}

