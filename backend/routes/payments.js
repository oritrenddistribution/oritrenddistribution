// backend/routes/payments.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const PLANS = {
    artist: { price: 999, interval: 'year' },
    pro: { price: 1999, interval: 'year' },
    label: { price: 4999, interval: 'year' },
};

// Create payment session
router.post('/create-session', protect, async (req, res) => {
    try {
        const { plan } = req.body;

        if (!PLANS[plan]) {
            return res.status(400).json({ message: 'Invalid plan' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: req.user.email,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Oritrend ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
                            description: `Annual subscription to ${plan} plan`,
                        },
                        unit_amount: PLANS[plan].price,
                        recurring: {
                            interval: PLANS[plan].interval,
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
            metadata: {
                userId: req.user.id.toString(),
                plan: plan,
            },
        });

        res.status(200).json({
            success: true,
            sessionId: session.id,
            url: session.url,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Verify payment
router.post('/verify', protect, async (req, res) => {
    try {
        const { sessionId } = req.body;

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            // Create payment record
            const payment = new Payment({
                userId: req.user.id,
                plan: session.metadata.plan,
                amount: session.amount_total / 100,
                status: 'completed',
                paymentMethod: 'stripe',
                transactionId: session.id,
                stripePaymentIntentId: session.payment_intent,
                stripeCustomerId: session.customer,
            });

            await payment.save();

            // Update user
            const subscriptionEndDate = new Date();
            subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);

            await User.findByIdAndUpdate(
                req.user.id,
                {
                    plan: session.metadata.plan,
                    paymentStatus: 'active',
                    subscriptionEndDate: subscriptionEndDate,
                    accountVerified: true,
                }
            );

            // Create notification
            await Notification.create({
                userId: req.user.id,
                type: 'payment',
                title: 'Payment Successful',
                message: `Your ${session.metadata.plan} plan subscription is now active!`,
            });

            res.status(200).json({
                success: true,
                message: 'Payment verified and plan activated',
                payment,
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Payment not completed',
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get payment history
router.get('/history', protect, async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, payments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Webhook handler for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'customer.subscription.updated':
                const subscription = event.data.object;
                const userId = subscription.metadata.userId;

                if (subscription.cancel_at_period_end) {
                    await User.findByIdAndUpdate(userId, {
                        paymentStatus: 'cancelled',
                    });

                    await Notification.create({
                        userId: userId,
                        type: 'payment',
                        title: 'Subscription Cancelled',
                        message: 'Your subscription will end at the current billing period end.',
                    });
                }
                break;

            case 'customer.subscription.deleted':
                const deletedSub = event.data.object;
                const deleteUserId = deletedSub.metadata.userId;

                await User.findByIdAndUpdate(deleteUserId, {
                    plan: 'free',
                    paymentStatus: 'expired',
                });

                await Notification.create({
                    userId: deleteUserId,
                    type: 'payment',
                    title: 'Subscription Expired',
                    message: 'Your subscription has expired. Upgrade to continue.',
                });
                break;
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
});

module.exports = router;