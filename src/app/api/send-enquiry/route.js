import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, message, phone, product_title, product_url, product_variant, seller_email } = body;

    if (!name || !email || !message || !phone || !product_title || !product_url || !product_variant || !seller_email) {
      return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER1,
        pass: process.env.MAIL_PASS1,
      },
      tls: {
        ciphers: 'SSLv3',
      }
    });

    const success = await transporter.verify();
    console.log('Transporter ready?', success);


    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: seller_email,
      subject: `New Enquiry for ${product_title}`,
      html: `
        <h2>New Product Enquiry for ${product_title}</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <div><strong>Product URL:</strong> <a href="${product_url}">${product_url}</a></div><br/>
        <div><strong>Product Variant:</strong> ${product_variant}</div>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return Response.json({ success: false, error: 'Email failed to send' }, { status: 500 });
  }
}
