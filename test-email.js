require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD?.replace(/"/g, ''),
    },
});

transporter.verify(function(error, success) {
  if (error) {
    console.log("Error de conexión:", error);
  } else {
    console.log("Servidor listo para enviar mensajes");
  }
});
