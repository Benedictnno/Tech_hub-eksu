import QRCode from 'qrcode';

export const generateQRCode = async (userId) => {
  try {
    // Generate QR code with user ID and timestamp for uniqueness
    const data = JSON.stringify({
      userId,
      timestamp: Date.now()
    });
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(data);
    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};