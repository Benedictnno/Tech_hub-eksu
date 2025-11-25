
import { Resend } from "resend"
export const sendEmail = async ({ to, subject, html }) => {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('sendEmail: RESEND_API_KEY not set, skipping email')
    return
  }

  try {
    const client = new Resend(key)
    const result = await client.emails.send({
      from: process.env.RESEND_FROM || 'noreply@tech-hub-eksu.com',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    })
    console.log('sendEmail: Resend response', result)
  } catch (err) {
    console.error('sendEmail: Resend error', err)
  }
}