require('dotenv').config();
const fs = require('fs-extra');
const path = require('path');

// Set up environment for testing
process.env.DOMAIN = 'test.valueguides.co';
process.env.DOWNLOAD_EXPIRY_HOURS = '24';
process.env.MAX_DOWNLOADS = '3';

// Import the download service
const downloadService = require('../src/services/downloadService');

// Basic test function
const testDownloadSystem = async () => {
  try {
    console.log('Testing download system...');
    
    // Create a test file path
    const testFilePath = path.join(__dirname, 'test-file.pdf');
    
    // Create a test file
    await fs.writeFile(testFilePath, 'Test PDF content');
    
    // Test parameters
    const testOrderId = 'test-order-123';
    
    // Generate a download link
    const downloadLink = downloadService.generateDownloadLink(testOrderId, testFilePath);
    console.log('Generated download link:', downloadLink);
    
    // Extract token from the download link
    const token = downloadLink.split('/').pop();
    
    // Validate the download link
    const validation = downloadService.validateDownload(token);
    console.log('Download validation:', validation);
    
    // Record a download
    if (validation.valid) {
      const updatedDownload = downloadService.recordDownload(token);
      console.log('After download, remaining downloads:', updatedDownload.downloadsRemaining);
      
      // Validate again
      const revalidation = downloadService.validateDownload(token);
      console.log('Download re-validation:', revalidation);
      
      // Exhaust all downloads
      for (let i = 0; i < parseInt(process.env.MAX_DOWNLOADS); i++) {
        downloadService.recordDownload(token);
      }
      
      // Validate again after exhausting downloads
      const finalValidation = downloadService.validateDownload(token);
      console.log('Final validation after exhausting downloads:', finalValidation);
    }
    
    // Clean up
    await fs.remove(testFilePath);
    
    return {
      success: validation.valid,
      downloadLink
    };
  } catch (error) {
    console.error('Download system test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Run the test
testDownloadSystem()
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