require('dotenv').config();

// Mock Stripe for testing
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return {
      checkout: {
        sessions: {
          create: jest.fn().mockResolvedValue({
            id: 'test_session_123',
            url: 'https://checkout.stripe.com/test',
            payment_status: 'paid'
          }),
          retrieve: jest.fn().mockResolvedValue({
            id: 'test_session_123',
            payment_status: 'paid',
            customer_details: {
              email: 'test@example.com'
            }
          })
        }
      },
      webhooks: {
        constructEvent: jest.fn().mockReturnValue({
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'test_session_123',
              payment_status: 'paid',
              customer_details: {
                email: 'test@example.com'
              }
            }
          }
        })
      }
    };
  });
});

// Simple integration test function
const testIntegration = async () => {
  try {
    console.log('Running integration tests...');
    
    // Import services after mocking
    const paymentService = require('../src/services/paymentService');
    
    // Test checkout session creation
    console.log('Testing checkout session creation...');
    const session = await paymentService.createCheckoutSession();
    console.log('Checkout session created:', session.id);
    
    // Test session verification
    console.log('Testing session verification...');
    const verification = await paymentService.verifySession('test_session_123');
    console.log('Session verified:', verification.verified);
    
    // Test payment handling
    console.log('Testing successful payment handling...');
    const paymentResult = await paymentService.handleSuccessfulPayment({
      id: 'test_session_123',
      customer_details: {
        email: 'test@example.com'
      }
    });
    console.log('Payment processed, download link generated:', paymentResult.downloadLink);
    
    // Test upsell session creation
    console.log('Testing upsell checkout session creation...');
    const upsellSession = await paymentService.createUpsellCheckoutSession('test_session_123');
    console.log('Upsell session created:', upsellSession.id);
    
    return {
      success: true,
      results: {
        session: session.id,
        verification: verification.verified,
        downloadLink: paymentResult.downloadLink,
        upsellSession: upsellSession.id
      }
    };
  } catch (error) {
    console.error('Integration test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// This is a simplified version for demonstration purposes
// In a real test, you would use a proper testing framework like Jest
console.log('Note: This is a simplified integration test without a proper testing framework');
console.log('In a production environment, use Jest or Mocha for more robust testing');

// Run the test
testIntegration()
  .then(result => {
    console.log('Integration test result:', result.success ? 'PASSED' : 'FAILED');
    if (!result.success) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });