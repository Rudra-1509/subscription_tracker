import dayjs from "dayjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");
import Subscription from "../models/subscription.model.js";
import { sendReminderEmail } from "../utils/send-email.js";

const REMINDERS = [7, 5, 2, 1];

export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requestPayload;
  const subscription = await fetchSubscription(context, subscriptionId);

  if (!subscription || subscription.status !== "active") return;

  const renewalDate = dayjs(subscription.renewalDate);

  if (renewalDate.isBefore(dayjs())) {
    console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`);
    return;
  }

  for (const daysBefore of REMINDERS) {
    const reminderDate = renewalDate.subtract(daysBefore, "day");
    const sleepLabel = `sleep-${daysBefore}`;
    const triggerLabel = `trigger-${daysBefore}`;

    // Wrap each stage with context.step to isolate it
    await context.step(sleepLabel, async () => {
      if (reminderDate.isAfter(dayjs())) {
        console.log(`Sleeping until ${sleepLabel} at ${reminderDate}`);
        await context.sleepUntil(sleepLabel, reminderDate.toDate());
      }
    });

    await context.step(triggerLabel, async () => {
      if (dayjs().isSame(reminderDate, "day")) {
        console.log(`Sending reminder ${triggerLabel}`);
        await sendReminderEmail({
          to: subscription.user.email,
          type: `${daysBefore} days before`,
          subscription,
        });
      }
    });
  }
});

const fetchSubscription = async (context, subscriptionId) => {
  return await context.run("get subscription", async () => {
    return Subscription.findById(subscriptionId).populate("user", "name email");
  });
};
