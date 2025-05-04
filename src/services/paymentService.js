const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pdfService = require('./pdfService');
const downloadService = require('./downloadService');
const logger = require('../utils/logger');

class PaymentService {
  async createCheckoutSession() {
    try {
      return await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `https://${process.env.DOMAIN}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://${process.env.DOMAIN}`,
        metadata: {
          product_name: 'The Ultimate Budget Travel Planner'
        }
      });
    } catch (error) {
      logger.error('Error creating checkout session', { error: error.message });
      throw error;
    }
  }
  
  async handleSuccessfulPayment(session) {
    try {
      const customerEmail = session.customer_details.email;
      const orderId = session.id;
      
      logger.info('Processing successful payment', { orderId, customerEmail });
      
      // Generate protected PDF
      const pdfPath = await pdfService.createProtectedPDF(customerEmail, orderId);
      
      // Generate secure download link
      const downloadLink = downloadService.generateDownloadLink(orderId, pdfPath);
      
      logger.info('Generated download link', { orderId, downloadLink });
      
      return { downloadLink, customerEmail, orderId };
    } catch (error) {
      logger.error('Error handling successful payment', { error: error.message, sessionId: session.id });
      throw error;
    }
  }
  
  async createUpsellCheckoutSession(originalOrderId) {
    try {
      return await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: process.env.STRIPE_UPSELL_PRICE_ID,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `https://${process.env.DOMAIN}/thank-you?session_id={CHECKOUT_SESSION_ID}&upsell=true`,
        cancel_url: `https://${process.env.DOMAIN}/thank-you?session_id=${originalOrderId}`,
        metadata: {
          product_name: 'Secret Travel Technique Bundle',
          original_order: originalOrderId
        }
      });
    } catch (error) {
      logger.error('Error creating upsell checkout session', { error: error.message, originalOrderId });
      throw error;
    }
  }
  
  async verifySession(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return {
        verified: session.payment_status === 'paid',
        session
      };
    } catch (error) {
      logger.error('Error verifying session', { error: error.message, sessionId });
      return { verified: false };
    }
  }
}

module.exports = new PaymentService();