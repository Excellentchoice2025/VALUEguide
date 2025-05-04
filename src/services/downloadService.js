const { nanoid } = require('nanoid');

class DownloadService {
  constructor() {
    this.downloads = {};
    this.expiryHours = process.env.DOWNLOAD_EXPIRY_HOURS || 24;
    this.maxDownloads = process.env.MAX_DOWNLOADS || 3;
  }
  
  generateDownloadLink(orderId, filePath) {
    const token = nanoid(32);
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + parseInt(this.expiryHours));
    
    this.downloads[token] = {
      orderId,
      filePath,
      downloadsRemaining: parseInt(this.maxDownloads),
      expires: expiryTime,
      created: new Date()
    };
    
    return `https://${process.env.DOMAIN}/download/${token}`;
  }
  
  validateDownload(token) {
    const download = this.downloads[token];
    
    if (!download) return { valid: false, reason: 'invalid-token' };
    if (download.expires < new Date()) return { valid: false, reason: 'expired' };
    if (download.downloadsRemaining <= 0) return { valid: false, reason: 'max-downloads-reached' };
    
    return { valid: true, download };
  }
  
  recordDownload(token) {
    if (this.downloads[token]) {
      this.downloads[token].downloadsRemaining--;
      return this.downloads[token];
    }
    return null;
  }
  
  // For testing and development
  getDownloadStats() {
    return {
      total: Object.keys(this.downloads).length,
      active: Object.values(this.downloads).filter(d => 
        d.expires > new Date() && d.downloadsRemaining > 0
      ).length
    };
  }
}

module.exports = new DownloadService();