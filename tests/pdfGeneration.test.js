require('dotenv').config();
const fs = require('fs-extra');
const path = require('path');

// Mocking the PDF template since we don't have the actual template
const mockTemplate = async () => {
  const templatePath = path.join(__dirname, '../assets/travel-planner-template.pdf');
  
  // Create directory if it doesn't exist
  await fs.ensureDir(path.dirname(templatePath));
  
  // Check if the file exists, if not create a placeholder
  if (!fs.existsSync(templatePath)) {
    console.log('Creating mock PDF template for testing');
    
    // Since we can't create an actual PDF here, just write a placeholder file
    await fs.writeFile(templatePath, 'Mock PDF template');
    
    console.log('Mock PDF template created at:', templatePath);
  }
  
  return templatePath;
};

// Basic test function
const testPDFGeneration = async () => {
  try {
    // Set up mock template
    process.env.PDF_TEMPLATE_PATH = await mockTemplate();
    
    // Import the service after setting up environment
    const pdfService = require('../src/services/pdfService');
    
    // Test parameters
    const testEmail = 'test@example.com';
    const testOrderId = 'test-order-123';
    
    console.log('Testing PDF generation...');
    console.log('Note: This is a simulated test without actual PDF validation');
    
    // Attempt to create a protected PDF
    // In a real test, we would validate the output PDF
    const outputPath = await pdfService.createProtectedPDF(testEmail, testOrderId);
    
    console.log('PDF generation test completed');
    console.log('Output file path:', outputPath);
    
    // Check if the output file exists
    const exists = await fs.pathExists(outputPath);
    console.log('Output file exists:', exists);
    
    return {
      success: exists,
      path: outputPath
    };
  } catch (error) {
    console.error('PDF generation test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Run the test
testPDFGeneration()
  .then(result => {
    console.log('Test result:', result.success ? 'PASSED' : 'FAILED');
    if (!result.success) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });