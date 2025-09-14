import { Resend } from 'resend';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

class MailService {
  constructor() {
    this.resend = new Resend(env.RESEND_API_KEY);
    this.fromEmail = env.FROM_EMAIL || 'noreply@kiwisrilankans.com';
    this.fromName = env.FROM_NAME || 'Kiwi Sri Lankans Events';
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: [to],
        subject,
        html,
        text,
      });

      if (error) {
        logger.error('Email send error:', error);
        throw new Error('Failed to send email');
      }

      logger.info(`Email sent successfully to ${to}: ${subject}`);
      return data;
    } catch (error) {
      logger.error('Mail service error:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendEventReminder(email, event) {
    const subject = `Reminder: ${event.title} - Tomorrow!`;
    const html = this.generateEventReminderHTML(event);
    const text = this.generateEventReminderText(event);

    return await this.sendEmail(email, subject, html, text);
  }

  async sendRegistrationDeadlineReminder(email, event) {
    const subject = `Registration Deadline: ${event.title} - Register Now!`;
    const html = this.generateRegistrationDeadlineHTML(event);
    const text = this.generateRegistrationDeadlineText(event);

    return await this.sendEmail(email, subject, html, text);
  }

  async sendWeeklyDigest(email, events) {
    const subject = 'Weekly Events Digest - Kiwi Sri Lankans';
    const html = this.generateWeeklyDigestHTML(events);
    const text = this.generateWeeklyDigestText(events);

    return await this.sendEmail(email, subject, html, text);
  }

  async sendWelcomeEmail(email, name) {
    const subject = 'Welcome to Kiwi Sri Lankans Events!';
    const html = this.generateWelcomeHTML(name);
    const text = this.generateWelcomeText(name);

    return await this.sendEmail(email, subject, html, text);
  }

  async sendEventConfirmation(email, event, registration) {
    const subject = `Registration Confirmed: ${event.title}`;
    const html = this.generateEventConfirmationHTML(event, registration);
    const text = this.generateEventConfirmationText(event, registration);

    return await this.sendEmail(email, subject, html, text);
  }

  async sendPasswordResetEmail(email, resetToken) {
    const subject = 'Password Reset - Kiwi Sri Lankans Events';
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = this.generatePasswordResetHTML(resetUrl);
    const text = this.generatePasswordResetText(resetUrl);

    return await this.sendEmail(email, subject, html, text);
  }

  async sendEmailVerification(email, verificationToken) {
    const subject = 'Verify Your Email - Kiwi Sri Lankans Events';
    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const html = this.generateEmailVerificationHTML(verificationUrl);
    const text = this.generateEmailVerificationText(verificationUrl);

    return await this.sendEmail(email, subject, html, text);
  }

  generateEventReminderHTML(event) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Event Reminder</h2>
        <h3>${event.title}</h3>
        <p><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${new Date(event.startDate).toLocaleTimeString()}</p>
        <p><strong>Location:</strong> ${event.location.name}, ${event.location.address}</p>
        <p>${event.description}</p>
        <a href="${env.FRONTEND_URL}/events/${event.slug}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Event</a>
      </div>
    `;
  }

  generateEventReminderText(event) {
    return `
Event Reminder

${event.title}
Date: ${new Date(event.startDate).toLocaleDateString()}
Time: ${new Date(event.startDate).toLocaleTimeString()}
Location: ${event.location.name}, ${event.location.address}

${event.description}

View Event: ${env.FRONTEND_URL}/events/${event.slug}
    `;
  }

  generateRegistrationDeadlineHTML(event) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Registration Deadline Approaching</h2>
        <h3>${event.title}</h3>
        <p><strong>Registration Deadline:</strong> ${new Date(event.registrationDeadline).toLocaleString()}</p>
        <p><strong>Event Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
        <p><strong>Location:</strong> ${event.location.name}</p>
        <p>Don't miss out! Register now to secure your spot.</p>
        <a href="${env.FRONTEND_URL}/events/${event.slug}" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Register Now</a>
      </div>
    `;
  }

  generateRegistrationDeadlineText(event) {
    return `
Registration Deadline Approaching

${event.title}
Registration Deadline: ${new Date(event.registrationDeadline).toLocaleString()}
Event Date: ${new Date(event.startDate).toLocaleDateString()}
Location: ${event.location.name}

Don't miss out! Register now to secure your spot.

Register: ${env.FRONTEND_URL}/events/${event.slug}
    `;
  }

  generateWeeklyDigestHTML(events) {
    let eventsHTML = '';
    events.forEach(event => {
      eventsHTML += `
        <div style="border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 5px;">
          <h4>${event.title}</h4>
          <p><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
          <p><strong>Location:</strong> ${event.location.name}</p>
          <p>${event.description.substring(0, 150)}...</p>
          <a href="${env.FRONTEND_URL}/events/${event.slug}" style="color: #2563eb;">View Details</a>
        </div>
      `;
    });

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Weekly Events Digest</h2>
        <p>Here are the upcoming events this week:</p>
        ${eventsHTML}
        <p><a href="${env.FRONTEND_URL}/events" style="color: #2563eb;">View All Events</a></p>
      </div>
    `;
  }

  generateWeeklyDigestText(events) {
    let eventsText = '';
    events.forEach(event => {
      eventsText += `
${event.title}
Date: ${new Date(event.startDate).toLocaleDateString()}
Location: ${event.location.name}
${event.description.substring(0, 150)}...
View: ${env.FRONTEND_URL}/events/${event.slug}

`;
    });

    return `
Weekly Events Digest

Here are the upcoming events this week:

${eventsText}
View All Events: ${env.FRONTEND_URL}/events
    `;
  }

  generateWelcomeHTML(name) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Kiwi Sri Lankans Events!</h2>
        <p>Hi ${name},</p>
        <p>Welcome to our community! We're excited to have you join us for upcoming events and activities.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse and register for events</li>
          <li>Set up pencil holds for popular events</li>
          <li>Subscribe to notifications</li>
          <li>Connect with other community members</li>
        </ul>
        <a href="${env.FRONTEND_URL}/events" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Browse Events</a>
      </div>
    `;
  }

  generateWelcomeText(name) {
    return `
Welcome to Kiwi Sri Lankans Events!

Hi ${name},

Welcome to our community! We're excited to have you join us for upcoming events and activities.

You can now:
- Browse and register for events
- Set up pencil holds for popular events
- Subscribe to notifications
- Connect with other community members

Browse Events: ${env.FRONTEND_URL}/events
    `;
  }

  generateEventConfirmationHTML(event, registration) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Registration Confirmed!</h2>
        <h3>${event.title}</h3>
        <p><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${new Date(event.startDate).toLocaleTimeString()}</p>
        <p><strong>Location:</strong> ${event.location.name}, ${event.location.address}</p>
        <p><strong>Registration ID:</strong> ${registration._id}</p>
        <p>We look forward to seeing you at the event!</p>
        <a href="${env.FRONTEND_URL}/events/${event.slug}" style="background-color: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Event Details</a>
      </div>
    `;
  }

  generateEventConfirmationText(event, registration) {
    return `
Registration Confirmed!

${event.title}
Date: ${new Date(event.startDate).toLocaleDateString()}
Time: ${new Date(event.startDate).toLocaleTimeString()}
Location: ${event.location.name}, ${event.location.address}
Registration ID: ${registration._id}

We look forward to seeing you at the event!

View Event Details: ${env.FRONTEND_URL}/events/${event.slug}
    `;
  }

  generatePasswordResetHTML(resetUrl) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;
  }

  generatePasswordResetText(resetUrl) {
    return `
Password Reset Request

You requested to reset your password. Click the link below to reset it:

${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.
    `;
  }

  generateEmailVerificationHTML(verificationUrl) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Verify Your Email</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      </div>
    `;
  }

  generateEmailVerificationText(verificationUrl) {
    return `
Verify Your Email

Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.
    `;
  }
}

export const mailService = new MailService();
