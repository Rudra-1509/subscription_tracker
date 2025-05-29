import dayjs from "dayjs";
import { emailTemplates } from "./email.template.js";
import transporter, { accountEmail } from "../config/nodemailer.js";

export const sendReminderEmail = async ({ to, type, subscription }) => {
  if (!to) throw new Error("Recipient email is required");
  if (!type) throw new Error("Email type is required");

  const template = emailTemplates.find((temp) => temp.label === type);

  if (!template) throw new Error("Invalid email type");

  const mailInfo = {
    userName: subscription.user.name,
    subscriptionName: subscription.name,
    renewalDate: dayjs(subscription.renewalDate).format("MMM D, YYYY"),
    planName: subscription.name,
    price: `${subscription.currency} ${subscription.price} (${subscription.frequency})`,
    paymentMethod: subscription.paymentMethod,
  };

  const message = template.generateBody(mailInfo);
  const subject = template.generateSubject(mailInfo);

  const mailOptions = {
    from: accountEmail,
    to: to,
    subject: subject,
    html: message,
  };
  console.log("📧 Sending email to:", to);
  console.log("📝 Email subject:", subject);
  console.log("📩 Email body preview:", message.slice(0, 100) + "..."); // Preview first 100 characters

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email successfully sent:", info.response);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
};

export default transporter;
