const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paymentService = require('../services/paymentService');
const logger = require('../utils/logger');

const webhookController = {
  handleStripeWebhook: async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      logger.error('Webhook signature verification failed', { error: err.message });
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      logger.info('Processing checkout.session.completed event', { 
        sessionId: session.id,
        customerId: session.customer,
        paymentStatus: session.payment_status
      });
      
      try {
        // Make sure the payment is successful
        if (session.payment_status === 'paid') {
          // Handle the successful payment
          await paymentService.handleSuccessfulPayment(session);
          
          // Optional: Send confirmation email here
          // await emailService.sendOrderConfirmation(session.customer_details.email, ...);
        } else {
          logger.warn('Checkout session not paid yet', { 
            sessionId: session.id, 
            status: session.payment_status 
          });
        }
      } catch (error) {
        logger.error('Error processing webhook', { error: error.message, sessionId: session.id });
        // We don't want to fail the webhook if there's an error processing
        // Better to log and investigate later
      }
    }
    
    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
  }
};

module.exports = webhookController;