import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ironfitappadmin@gmail.com',
    pass: 'ironfitappadmin1.'
  }
});

async function test() {
  try {
    await transporter.verify();
    console.log("Success: Ready to send messages");
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
