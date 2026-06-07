import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY || "";
const constituencyEmail = process.env.CONSTITUENCY_EMAIL || "office@tvkrknagar.in";

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface EmailPayload {
  ticket_no: string;
  name: string;
  phone: string;
  wardName: string;
  categoryName: string;
  title: string;
  description: string;
  photo_url?: string;
}

/**
 * Sends a notification email to the MLA constituency office for new complaints.
 */
export async function sendNewComplaintEmail(payload: EmailPayload) {
  const subject = `[New Complaint] ${payload.ticket_no} - ${payload.categoryName} (${payload.wardName})`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #DDD9D0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #142840; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">TVK R.K. Nagar constituency</h2>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #D4920F; font-weight: bold; letter-spacing: 1px;">GRIEVANCE REGISTRATION SYSTEM</p>
      </div>
      <div style="padding: 24px; color: #111827; background-color: #FCFBF9;">
        <h3 style="margin-top: 0; color: #1C3557; border-bottom: 2px solid #D4920F; padding-bottom: 8px;">Complaint Details</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 150px; color: #6B7280;">Ticket ID:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #1C3557; font-size: 16px;">${payload.ticket_no}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6B7280;">Citizen Name:</td>
            <td style="padding: 6px 0;">${payload.name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6B7280;">Phone Number:</td>
            <td style="padding: 6px 0;">${payload.phone}</td>
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
        
        ${payload.photo_url ? `
          <div style="margin-bottom: 20px; text-align: center;">
            <h4 style="margin: 0 0 8px 0; text-align: left; color: #1C3557;">Attached Photo</h4>
            <img src="${payload.photo_url}" alt="Complaint Photo" style="max-width: 100%; max-height: 300px; border-radius: 6px; border: 1px solid #DDD9D0;" />
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #6B7280;"><a href="${payload.photo_url}" target="_blank" style="color: #D4920F; text-decoration: none; font-weight: bold;">View Original Photo</a></p>
          </div>
        ` : ""}
        
        <div style="text-align: center; margin-top: 30px; border-top: 1px solid #DDD9D0; padding-top: 20px;">
          <a href="http://localhost:3000/admin/dashboard" style="background-color: #1C3557; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Open Admin Dashboard</a>
        </div>
      </div>
      <div style="background-color: #F4F2EE; text-align: center; padding: 12px; font-size: 11px; color: #9CA3AF; border-top: 1px solid #DDD9D0;">
        This is an automated security transmission from TVK Digital Governance Initative.
      </div>
    </div>
  `;

  if (resend) {
    try {
      await resend.emails.send({
        from: "TVK Grievance Portal <noreply@tvkrknagar.in>",
        to: constituencyEmail,
        subject: subject,
        html: html,
      });
      console.log(`[Email Success] Notification sent for ticket ${payload.ticket_no}`);
    } catch (error) {
      console.error("[Email Error] Failed to send email via Resend:", error);
    }
  } else {
    // Simulated Mail Delivery
    console.log("==========================================================");
    console.log(" [MOCK EMAIL DELIVERY] - RESEND IS NOT CONFIGURED");
    console.log(` TO: ${constituencyEmail}`);
    console.log(` SUBJECT: ${subject}`);
    console.log("----------------------------------------------------------");
    console.log(` Ticket ID: ${payload.ticket_no}`);
    console.log(` Citizen:   ${payload.name} (${payload.phone})`);
    console.log(` Ward:      ${payload.wardName}`);
    console.log(` Category:  ${payload.categoryName}`);
    console.log(` Title:     ${payload.title}`);
    console.log(` Desc:      ${payload.description}`);
    if (payload.photo_url) {
      console.log(` Attachment: ${payload.photo_url}`);
    }
    console.log("==========================================================");
  }
}
