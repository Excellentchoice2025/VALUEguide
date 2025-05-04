const path = require('path');
const fs = require('fs-extra');
const downloadService = require('../services/downloadService');
const logger = require('../utils/logger');

const downloadController = {
  handleDownload: async (req, res) => {
    try {
      const { token } = req.params;
      
      // Validate the download token
      const validation = downloadService.validateDownload(token);
      
      if (!validation.valid) {
        logger.info(`Download denied: ${validation.reason}`, { token });
        
        // Redirect to appropriate error page based on reason
        switch (validation.reason) {
          case 'expired':
            return res.status(410).render('error', { 
              message: 'This download link has expired.',
              suggestion: 'Please check your email for another link or contact support.'
            });
          case 'max-downloads-reached':
            return res.status(429).render('error', { 
              message: 'Maximum download attempts reached.',
              suggestion: 'Please contact support for assistance.'
            });
          case 'invalid-token':
          default:
            return res.status(404).render('error', { 
              message: 'Invalid download link.',
              suggestion: 'Please check your email for the correct link or contact support.'
            });
        }
      }
      
      // Valid download
      const download = validation.download;
      
      // Check if the file exists
      if (!await fs.pathExists(download.filePath)) {
        logger.error(`File not found: ${download.filePath}`, { token, orderId: download.orderId });
        return res.status(404).render('error', { 
          message: 'File not found.',
          suggestion: 'Please contact support for assistance.'
        });
      }
      
      // Record the download
      downloadService.recordDownload(token);
      
      // Set appropriate headers for PDF download
      const filename = path.basename(download.filePath);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/pdf');
      
      // Stream the file
      const fileStream = fs.createReadStream(download.filePath);
      fileStream.pipe(res);
      
      // Log the download
      logger.info(`Download successful: ${filename}`, { 
        token, 
        orderId: download.orderId,
        downloadsRemaining: download.downloadsRemaining - 1
      });
      
    } catch (error) {
      logger.error('Download error', { error: error.message });
      res.status(500).render('error', { 
        message: 'An error occurred during download.',
        suggestion: 'Please try again later or contact support.'
      });
    }
  }
};

module.exports = downloadController;