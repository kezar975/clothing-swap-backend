const https = require('https');

const sendEmail = async (to, subject, text, html) => {
  const data = JSON.stringify({
    sender: {
      name: 'SwapStyle',
      email: process.env.EMAIL_FROM || 'af52d5001@smtp-brevo.com'
    },
    to: [{ email: to }],
    subject,
    textContent: text,
    htmlContent: html
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Email sent successfully');
          resolve(responseData);
        } else {
          console.error('❌ Email API error:', responseData);
          reject(new Error(`Email failed: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

module.exports = sendEmail;