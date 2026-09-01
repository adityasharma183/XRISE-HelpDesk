import nodemailer from 'nodemailer';
import { logger } from '../config/logger.js';

interface ResolutionEmailPayload {
  customerName: string;
  customerEmail: string;
  ticketId: string;
  subject: string;
  status: 'RESOLVED' | 'CLOSED';
  latestAgentReply?: string | null;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      logger.warn(
        'EmailService: SMTP credentials not set. Resolution/Closure emails will be skipped. ' +
        'Add SMTP_HOST, SMTP_USER, SMTP_PASS to .env to enable.'
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: false,          // true for port 465, false for 587 (STARTTLS)
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    this.isConfigured = true;
    logger.info({ host: SMTP_HOST, user: SMTP_USER }, 'EmailService: SMTP transporter ready');
  }

  /**
   * Send a branded resolution or closure notification email to the customer.
   * Fire-and-forget — errors are logged, never thrown to callers.
   */
  async sendResolutionEmail(payload: ResolutionEmailPayload): Promise<void> {
    if (!this.isConfigured || !this.transporter) {
      logger.debug('EmailService: Skipping notification email — SMTP not configured.');
      return;
    }

    const { customerName, customerEmail, ticketId, subject, status, latestAgentReply } = payload;
    const from = process.env.SMTP_FROM || `XRISEHelpDesk <${process.env.SMTP_USER}>`;

    const isResolved = status === 'RESOLVED';
    const statusLabel = isResolved ? 'RESOLVED' : 'CLOSED';
    const statusIcon = isResolved ? '✅' : '🔒';
    const headingText = isResolved ? 'Your ticket has been resolved' : 'Your ticket has been closed';
    const emailSubject = `${statusIcon} Ticket ${ticketId} ${isResolved ? 'resolved' : 'closed'} — XRISEHelpDesk`;
    const messageDesc = isResolved
      ? `Hi <strong style="color:#DFD5C6;">${customerName}</strong>, your support request has been marked as <strong style="color:#C9B9A6;">RESOLVED</strong> by our team.`
      : `Hi <strong style="color:#DFD5C6;">${customerName}</strong>, your support request has been formally <strong style="color:#C9B9A6;">CLOSED</strong>. All actions regarding this inquiry are now complete.`;

    const replySection = latestAgentReply
      ? `
        <tr>
          <td style="padding: 0 40px 32px;">
            <div style="background:#16161B;border-left:3px solid #C9B9A6;padding:20px 24px;border-radius:0 4px 4px 0;">
              <p style="margin:0 0 8px;font-family:'Courier New',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#C9B9A6;">
                LATEST RESPONSE FROM OUR TEAM
              </p>
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.7;color:#DFD5C6;">
                ${latestAgentReply.replace(/\n/g, '<br/>')}
              </p>
            </div>
          </td>
        </tr>`
      : '';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${emailSubject}</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0C;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0C;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111115;border:1px solid rgba(201,185,166,0.2);border-radius:6px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.8);">

          <!-- Header brand bar -->
          <tr>
            <td style="background:#0E0E12;padding:24px 40px;border-bottom:1px solid rgba(201,185,166,0.15);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display:inline-block;background:linear-gradient(135deg,#DFD5C6,#C9B9A6,#A89680);color:#0A0A0C;font-family:'Courier New',monospace;font-weight:900;font-size:13px;padding:6px 10px;border-radius:3px;margin-right:10px;">XR</span>
                    <span style="font-size:18px;font-weight:600;color:#F5F5F7;letter-spacing:-0.3px;">XRISE<span style="color:#C9B9A6;">HelpDesk</span></span>
                  </td>
                  <td align="right">
                    <span style="font-family:'Courier New',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#9E9EA8;">Sovereign Support</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Section -->
          <tr>
            <td style="padding:40px 40px 28px;text-align:center;border-bottom:1px solid rgba(201,185,166,0.1);">
              <div style="display:inline-block;width:56px;height:56px;background:rgba(201,185,166,0.1);border:1px solid rgba(201,185,166,0.3);border-radius:50%;line-height:56px;font-size:24px;margin-bottom:20px;">${statusIcon}</div>
              <h1 style="margin:0 0 10px;font-size:26px;font-weight:700;color:#F5F5F7;letter-spacing:-0.5px;">
                ${headingText}
              </h1>
              <p style="margin:0;font-size:14px;color:#9E9EA8;line-height:1.6;">
                ${messageDesc}
              </p>
            </td>
          </tr>

          <!-- Ticket ID telemetry badge -->
          <tr>
            <td style="padding:28px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#16161B;border:1px solid rgba(201,185,166,0.2);border-radius:4px;padding:16px 20px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-family:'Courier New',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#9E9EA8;">TICKET ID</p>
                    <p style="margin:0;font-family:'Courier New',monospace;font-size:18px;font-weight:700;color:#C9B9A6;">${ticketId}</p>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <span style="display:inline-block;background:rgba(201,185,166,0.15);border:1px solid rgba(201,185,166,0.4);color:#C9B9A6;font-family:'Courier New',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;padding:4px 10px;border-radius:2px;">${statusLabel}</span>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top:10px;border-top:1px solid rgba(201,185,166,0.1);margin-top:10px;">
                    <p style="margin:8px 0 0;font-size:13px;color:#9E9EA8;">
                      <strong style="color:#F5F5F7;font-size:14px;">${subject}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Latest agent reply (if any) -->
          ${replySection}

          <!-- Body message -->
          <tr>
            <td style="padding:${latestAgentReply ? '0' : '28px'} 40px 28px;">
              <p style="margin:0;font-size:14px;color:#9E9EA8;line-height:1.7;">
                If you have any follow-up questions or your issue recurs, please don't hesitate to submit a new request or check your ticket status at our portal.
              </p>
            </td>
          </tr>

          <!-- CTA button -->
          <tr>
            <td style="padding:0 40px 36px;text-align:center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/check-status"
                 style="display:inline-block;background:#C9B9A6;color:#0A0A0C;font-family:'Courier New',monospace;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;text-decoration:none;padding:14px 32px;border-radius:3px;">
                View Ticket Status
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(201,185,166,0.1);text-align:center;">
              <p style="margin:0 0 6px;font-family:'Courier New',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#5A5A66;">
                XRISE AI SYSTEMS INDIA · SOVEREIGN SUPPORT NODE
              </p>
              <p style="margin:0;font-size:12px;color:#4A4A55;">
                This is an automated notification. Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `Hi ${customerName},\n\nYour support ticket (${ticketId}) — "${subject}" — has been marked as ${statusLabel}.\n\n${latestAgentReply ? `Latest response from our team:\n${latestAgentReply}\n\n` : ''}If you have further questions, please visit ${process.env.CLIENT_URL || 'http://localhost:5173'}/check-status.\n\n— XRISEHelpDesk Support Team`;

    try {
      const info = await this.transporter!.sendMail({
        from,
        to: customerEmail,
        subject: emailSubject,
        text,
        html,
      });
      logger.info({ ticketId, customerEmail, status, messageId: info.messageId }, 'Ticket status email sent successfully');
    } catch (err: any) {
      // Fire-and-forget: log the error but never propagate it so the status update always succeeds
      logger.error({ ticketId, customerEmail, status, err: err.message }, 'Failed to send ticket status email');
    }
  }
}

// Singleton export
export const emailService = new EmailService();

