// app/api/contact/route.js

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.M365_EMAIL,
    pass: process.env.M365_PASSWORD,
  },
  tls: {
    ciphers: 'SSLv3',
  },
});

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"Your Name" <${process.env.M365_EMAIL}>`,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};

export async function POST() {
  // Dummy data for testing
  const name = 'John Tester';
  const email = 'john@test.com';
  const message = 'Hi, I’m interested in this product!';
  const phone = '+1234567890';
  const product_title = 'Ergonomic Chair';
  const product_url = 'https://example.com/products/ergonomic-chair';
  const product_variant = 'Black - High Back';
  const seller_email = 'seller@example.com';

  try {
    await sendEmail({
      to: seller_email,
      subject: `Product Inquiry: ${product_title}`,
      html: `
        <h3>New Product Inquiry (Dummy Data)</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong><br/>${message}</p>
        <p><strong>Product:</strong> <a href="${product_url}">${product_title} - ${product_variant}</a></p>
      `,
    });

    return new Response(JSON.stringify({ success: true, note: "Dummy email sent" }), { status: 200 });
  } catch (error) {
    console.error('Email send error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to send email' }),
      { status: 500 }
    );
  }
}
