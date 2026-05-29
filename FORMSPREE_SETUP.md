# Formspree Integration Setup Guide

## Step 1: Create a Formspree Account
1. Go to https://formspree.io
2. Click "Sign up for free"
3. Enter your email and create a password
4. Click the verification link in your email

## Step 2: Create a New Form
1. In your Formspree dashboard, click "New Form" or "Create"
2. Give it a name like "Oritrend Contact Form"
3. Add your email address: `oritrenddistribution@gmail.com`
4. Click "Create Form"

## Step 3: Get Your Form ID
1. After creation, you'll see your Form ID (looks like: `f_xxxxx`)
2. Copy this ID

## Step 4: Update Your Website
The contact form in `index.html` has already been updated with Formspree integration.

The form is now configured to send emails to your address. You can verify this worked by:

1. Visiting your website: https://oritrenddistribution.github.io/oritrenddistribution/
2. Scrolling to the "Contact Us" section
3. Filling out the form and clicking "Send Message"
4. Check your email inbox for the submission

## Features Included

✅ **Email Notifications** - You'll receive an email for each form submission
✅ **Spam Protection** - Formspree includes reCAPTCHA protection
✅ **Automatic Responses** - You can set up auto-replies to visitors
✅ **Form Data Storage** - All submissions stored in Formspree dashboard
✅ **Mobile Optimized** - Form works perfectly on all devices

## How It Works

- Visitor fills out the contact form
- Data is sent to Formspree servers
- Formspree sends you an email with the submission
- Visitor sees a success message
- You can reply from your email inbox

## Customizing the Form

If you want to add more fields to the form:
1. Add new `<input>` or `<textarea>` fields with a `name` attribute
2. Make sure each field has a unique `name`
3. Formspree will automatically include all named fields in your email

Example:
```html
<div class="form-group">
  <label for="budget">Budget:</label>
  <input type="text" id="budget" name="budget" required>
</div>
```

## Monitoring Submissions

1. Log into your Formspree account
2. Go to "Forms" section
3. Click on your "Oritrend Contact Form"
4. View all submissions and download as CSV if needed

## Upgrade Options (Optional)

Formspree Free Tier includes:
- Unlimited forms
- 50 submissions per month
- Basic spam protection

If you need more submissions or features:
- **Pro Plan**: $25/month - Unlimited submissions, priority support, webhooks
- **Business Plan**: Custom pricing - API access, custom domain support

## Testing the Form

Try submitting a test message to verify everything works:
1. Fill in all fields on the contact form
2. Click "Send Message"
3. You should see a success message
4. Check your email inbox within a few minutes

## Troubleshooting

**Form not sending emails?**
- Make sure Formspree email is verified (check your inbox for confirmation)
- Check your spam folder
- Wait a few minutes - sometimes emails are delayed

**Want to change the email address?**
- Go back to your Formspree form settings
- Update the email address
- Save changes

**Need to test again?**
- Formspree has a test form on their dashboard
- Or just submit through your website

## Support

If you have issues:
- Formspree Help: https://help.formspree.io
- Email their support: support@formspree.io
- Check your form logs in the Formspree dashboard
