import dayjs from 'dayjs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { serve } = require('@upstash/workflow/express');
import Subscription from '../models/subscription.model.js';
import { sendReminderEmail } from '../utils/send-email.js';

const REMINDERS = [7, 5, 2, 1];

export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requestPayload;
  const subscription = await fetchSubscription(context, subscriptionId);

  if (!subscription || subscription.status !== 'active') {
    console.log(`Subscription ${subscriptionId} is invalid or inactive.`);
    return;
  }

  const renewalDate = dayjs(subscription.renewalDate);
  console.log(`Processing subscription ${subscriptionId} with renewal date ${renewalDate.toISOString()}`);

  // If renewal date has passed
  if (renewalDate.isBefore(dayjs())) {
    console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`);
    return;
  }

  for (const daysBefore of REMINDERS) {
    const reminderDate = renewalDate.subtract(daysBefore, 'day');
    console.log(`Checking reminder for ${daysBefore} days before: ${reminderDate.toISOString()}`);

    // Trigger reminder only if today matches the reminder date
    if (dayjs().isSame(reminderDate, 'day')) {
      await triggerReminder(context, `${daysBefore} days before reminder`, subscription);
    } else if (reminderDate.isAfter(dayjs())) {
      console.log(`Reminder for ${daysBefore} days before is in the future: ${reminderDate.toISOString()}`);
      // Skip future reminders; rely on external scheduling to re-trigger workflow
    }
  }
});

const fetchSubscription = async (context, subscriptionId) => {
  return await context.run('get subscription', async () => {
    return Subscription.findById(subscriptionId).populate('user', 'name email');
  });
};

const triggerReminder = async (context, label, subscription) => {
  return await context.run(label, async () => {
    console.log(`Triggering ${label} reminder for ${subscription.user.email}`);
    await sendReminderEmail({
      to: subscription.user.email,
      type: label,
      subscription,
    });
  });
};