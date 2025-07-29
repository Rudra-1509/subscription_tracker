import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { serve } = require('@upstash/workflow/express');
import Subscription from '../models/subscription.model.js';
import { sendReminderEmail } from '../utils/send-email.js';

// Configure dayjs for UTC to avoid timezone issues
dayjs.extend(utc);
dayjs.extend(timezone);

const REMINDERS = [7, 5, 2, 1];

export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requestPayload;
  console.log(`Processing subscriptionId: ${subscriptionId}`);

  const subscription = await fetchSubscription(context, subscriptionId);
  if (!subscription || subscription.status !== 'active') {
    console.log(`Subscription ${subscriptionId} is invalid or inactive.`);
    return;
  }

  const renewalDate = dayjs(subscription.renewalDate).utc();
  console.log(`Renewal date: ${renewalDate.toISOString()}`);

  // If renewal date has passed
  if (renewalDate.isBefore(dayjs().utc())) {
    console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`);
    return;
  }

  for (const daysBefore of REMINDERS) {
    const reminderDate = renewalDate.subtract(daysBefore, 'day');
    console.log(`Checking reminder for ${daysBefore} days before: ${reminderDate.toISOString()}`);

    // Trigger reminder only if today matches the reminder date
    if (dayjs().utc().isSame(reminderDate, 'day')) {
      await triggerReminder(context, `${daysBefore} days before reminder`, subscription);
    } else {
      console.log(`Reminder for ${daysBefore} days before is not due today: ${reminderDate.toISOString()}`);
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
    console.log(`Triggering ${label} for ${subscription.user.email}`);
    await sendReminderEmail({
      to: subscription.user.email,
      type: label,
      subscription,
    });
  });
};