/**
 * @fileoverview Email notification helper for TVK Constituency Complaint Portal.
 * Uses the Resend SDK for transactional email delivery.
 *
 * Provides email templates for:
 *   - New complaint acknowledgement (to citizen)
 *   - New complaint notification (to admin/MLA office)
 *   - Status change notification (to citizen)
 */

import { Resend } from 'resend';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const resendApiKey = process.env.RESEND_API_KEY || '';
const constituencyEmail = process.env.CONSTITUENCY_EMAIL || 'office@tvkrknagar.in';
const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3000';
const fromEmail = process.env.FROM_EMAIL || 'TVK Grievance Portal <noreply@tvkrknagar.in>';

/** Resend client instance — null if API key not configured */
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

/** Check if email sending is configured */
export const isEmailConfigured = (): boolean => !!resendApiKey;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Payload for new complaint notification emails */
export interface NewComplaintEmailPayload {
  ticketId: string;
  citizenName: string;
  citizenPhone: string;
  citizenEmail?: string;
  wardName: string;
  categoryName: string;
  title: string;
  description: string;
  photoUrl?: string;
}

/** Payload for status change notification emails */
export interface StatusChangeEmailPayload {
  ticketId: string;
  citizenName: string;
  citizenEmail: string;
  title: string;
  oldStatus: string;
  newStatus: string;
  statusMessage?: string;
  adminNotes?: string;
}

/** Result of an email send attempt */
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Email Templates
// ---------------------------------------------------------------------------

/**
 * Generates the HTML template for new complaint admin notification.
 */
function buildNewComplaintAdminHtml(payload: NewComplaintEmailPayload): string {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #DDD9D0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #142840; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">TVK R.K. Nagar Constituency</h2>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #D4920F; font-weight: bold; letter-spacing: 1px;">GRIEVANCE REGISTRATION SYSTEM</p>
      </div>
      <div style="padding: 24px; color: #111827; background-color: #FCFBF9;">
        <h3 style="margin-top: 0; color: #1C3557; border-bottom: 2px solid #D4920F; padding-bottom: 8px;">New Complaint Registered</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 140px; color: #6B7280;">Ticket ID:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #1C3557; font-size: 16px;">${payload.ticketId}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6B7280;">Citizen Name:</td>
            <td style="padding: 6px 0;">${payload.citizenName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6B7280;">Phone:</td>
            <td style="padding: 6px 0;">${payload.citizenPhone}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6B7280;">Ward / Area:</td>
            <td style="padding: 6px 0;">${payload.wardName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6B7280;">Category:</td>
            <td style="padding: 6px 0; font-weight: 500;">${payload.categoryName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6B7280;">Issue Title:</td>
            <td style="padding: 6px 0; font-weight: 500;">${payload.title}</td>
          </tr>
        </table>
        <div style="background-color: #F4F2EE; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 8px 0; color: #1C3557;">Description</h4>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #374151;">${payload.description}</p>
        </div>
        ${payload.photoUrl ? `
          <div style="margin-bottom: 20px; text-align: center;">
            <h4 style="margin: 0 0 8px 0; text-align: left; color: #1C3557;">Attached Photo</h4>
            <img src="${payload.photoUrl}" alt="Complaint Photo" style="max-width: 100%; max-height: 300px; border-radius: 6px; border: 1px solid #DDD9D0;" />
          </div>
        ` : ''}
        <div style="text-align: center; margin-top: 30px; border-top: 1px solid #DDD9D0; padding-top: 20px;">
          <a href="${portalUrl}/admin/dashboard" style="background-color: #1C3557; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Open Admin Dashboard</a>
        </div>
      </div>
      <div style="background-color: #F4F2EE; text-align: center; padding: 12px; font-size: 11px; color: #9CA3AF; border-top: 1px solid #DDD9D0;">
        Automated notification from TVK Digital Governance Initiative
      </div>
    </div>
  `;
}

/**
 * Generates the HTML template for status change citizen notification.
 */
function buildStatusChangeHtml(payload: StatusChangeEmailPayload): string {
  const statusLabels: Record<string, string> = {
    new: '🆕 New / புதிய',
    assigned: '👤 Assigned / ஒதுக்கப்பட்டது',
    in_progress: '🔄 In Progress / நடைபெறுகிறது',
    pending_govt: '🏛️ Pending Govt Action / அரசு நடவடிக்கை',
    resolved: '✅ Resolved / தீர்வு',
    closed: '🔒 Closed / முடிவு',
  };

  return `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #DDD9D0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #142840; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">TVK R.K. Nagar Constituency</h2>
        <p style="margin: 5px 0 0 0; font-size: 13px; color: #D4920F;">COMPLAINT STATUS UPDATE</p>
      </div>
      <div style="padding: 24px; color: #111827; background-color: #FCFBF9;">
        <p style="font-size: 15px;">Dear <strong>${payload.citizenName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6;">
          Your complaint <strong style="color: #1C3557;">${payload.ticketId}</strong> — "<em>${payload.title}</em>" has been updated.
        </p>
        <div style="background-color: #F4F2EE; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #6B7280; width: 130px;">Previous Status:</td>
              <td style="padding: 6px 0;">${statusLabels[payload.oldStatus] || payload.oldStatus}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6B7280;">New Status:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #1C3557;">${statusLabels[payload.newStatus] || payload.newStatus}</td>
            </tr>
          </table>
        </div>
        ${payload.statusMessage ? `
          <div style="margin: 16px 0;">
            <p style="font-size: 14px; color: #374151;">${payload.statusMessage}</p>
          </div>
        ` : ''}
        ${payload.adminNotes ? `
          <div style="background-color: #FEF3CD; padding: 12px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #D4920F;">
            <strong style="font-size: 13px; color: #856404;">Admin Notes:</strong>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #856404;">${payload.adminNotes}</p>
          </div>
        ` : ''}
        <div style="text-align: center; margin-top: 24px; border-top: 1px solid #DDD9D0; padding-top: 20px;">
          <a href="${portalUrl}/track?ticket=${payload.ticketId}" style="background-color: #D4920F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Track Your Complaint</a>
        </div>
      </div>
      <div style="background-color: #F4F2EE; text-align: center; padding: 12px; font-size: 11px; color: #9CA3AF;">
        TVK Digital Governance Initiative — R.K. Nagar
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Email Sending Functions
// ---------------------------------------------------------------------------

/**
 * Sends a new complaint notification email to the MLA constituency office.
 *
 * @param payload - New complaint details
 * @returns Email send result
 */
export async function sendNewComplaintEmail(
  payload: NewComplaintEmailPayload
): Promise<EmailResult> {
  const subject = `[New Complaint] ${payload.ticketId} - ${payload.categoryName} (${payload.wardName})`;
  const html = buildNewComplaintAdminHtml(payload);

  if (!resend) {
    logMockEmail('NEW COMPLAINT NOTIFICATION', constituencyEmail, subject, payload);
    return { success: true, messageId: 'mock-' + Date.now() };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: constituencyEmail,
      subject,
      html,
    });

    if (error) {
      console.error('[Email Error]', error);
      return { success: false, error: error.message };
    }

    console.log(`[Email Success] Admin notification sent for ${payload.ticketId}`);
    return { success: true, messageId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown email error';
    console.error('[Email Error]', message);
    return { success: false, error: message };
  }
}

/**
 * Sends a status change notification email to the citizen.
 *
 * @param payload - Status change details
 * @returns Email send result
 */
export async function sendStatusChangeEmail(
  payload: StatusChangeEmailPayload
): Promise<EmailResult> {
  if (!payload.citizenEmail) {
    return { success: false, error: 'No citizen email provided' };
  }

  const subject = `[Status Update] ${payload.ticketId} — ${payload.newStatus.replace('_', ' ').toUpperCase()}`;
  const html = buildStatusChangeHtml(payload);

  if (!resend) {
    logMockEmail('STATUS CHANGE NOTIFICATION', payload.citizenEmail, subject, payload);
    return { success: true, messageId: 'mock-' + Date.now() };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: payload.citizenEmail,
      subject,
      html,
    });

    if (error) {
      console.error('[Email Error]', error);
      return { success: false, error: error.message };
    }

    console.log(`[Email Success] Status update sent to ${payload.citizenEmail} for ${payload.ticketId}`);
    return { success: true, messageId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown email error';
    console.error('[Email Error]', message);
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Mock Email Logger (when Resend is not configured)
// ---------------------------------------------------------------------------

/**
 * Logs a mock email to console when Resend is not configured.
 * Useful for development and testing.
 */
function logMockEmail(
  type: string,
  to: string,
  subject: string,
  payload: Record<string, unknown>
): void {
  console.log('='.repeat(60));
  console.log(` [MOCK EMAIL] ${type}`);
  console.log(` TO: ${to}`);
  console.log(` SUBJECT: ${subject}`);
  console.log('-'.repeat(60));
  Object.entries(payload).forEach(([key, value]) => {
    if (value) console.log(` ${key}: ${value}`);
  });
  console.log('='.repeat(60));
}
