const express = require('express');
const router = express.Router();

// Controllers
const downloadController = require('../controllers/downloadController');
const webhookController = require('../controllers/webhookController');
const paymentService = require('../services/paymentService');

// Download route
router.get('/download/:token', downloadController.handleDownload);

// Webhook route
router.post('/webhook', webhookController.handleStripeWebhook);

// Create checkout session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await paymentService.createCheckoutSession();
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify session
router.get('/verify-session', async (req, res) => {
  try {
    const { sessionId } = req.query;
    const result = await paymentService.verifySession(sessionId);
    
    if (result.verified) {
      // For the demo, we'll generate a new PDF and download link on verification
      // In production, this would be retrieved from a database
      const session = result.session;
      const { downloadLink, customerEmail } = await paymentService.handleSuccessfulPayment(session);
      
      res.json({ 
        verified: true, 
        downloadUrl: downloadLink,
        email: customerEmail
      });
    } else {
      res.json({ verified: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create upsell session
router.post('/create-upsell-session', async (req, res) => {
  try {
    const session = await paymentService.createUpsellCheckoutSession(req.body.originalOrderId);
    res.json({ checkoutUrl: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Email capture endpoint
router.post('/api/capture-email', (req, res) => {
  const { email } = req.body;
  // Save email to your database or email service
  console.log('Captured email:', email);
  res.json({ success: true });
});

module.exports = router;