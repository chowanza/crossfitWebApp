import nodemailer from "nodemailer";

// ============================================================
// Email: Recuperación de contraseña
// ============================================================
export async function sendPasswordResetEmail({
    to,
    resetLink,
    firstName,
}: {
    to: string;
    resetLink: string;
    firstName: string;
}) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_USER ? `"Iron Fit" <${process.env.SMTP_USER}>` : '"Iron Fit" <no-reply@ironfit.com>',
            to,
            subject: "🔐 Recupera tu contraseña — Iron Fit Box CrossFit",
            html: buildPasswordResetHtml({ resetLink, firstName }),
        });

        return info;
    } catch (error) {
        console.error("[Nodemailer] Error enviando email de recuperación:", error);
        throw new Error("No se pudo enviar el email. Intenta nuevamente.");
    }
}

// ============================================================
// Template HTML del email
// ============================================================
function buildPasswordResetHtml({
    resetLink,
    firstName,
}: {
    resetLink: string;
    firstName: string;
}) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Recuperar contraseña — Iron Fit</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f1a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- HEADER / LOGO -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="display:inline-block;">
                <span style="font-size:28px;font-weight:900;letter-spacing:-1px;background:linear-gradient(135deg,#6366f1,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;color:#6366f1;">
                  IRON FIT
                </span>
                <p style="margin:4px 0 0;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:3px;">Box CrossFit</p>
              </div>
            </td>
          </tr>

          <!-- CARD -->
          <tr>
            <td style="background-color:#1e1e3a;border-radius:16px;border:1px solid rgba(99,102,241,0.2);overflow:hidden;">

              <!-- ICON BANNER -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(129,140,248,0.05));padding:36px 24px 28px;">
                    <div style="width:64px;height:64px;background:rgba(99,102,241,0.15);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;line-height:64px;">
                      🔐
                    </div>
                    <h1 style="margin:20px 0 8px;font-size:22px;font-weight:700;color:#f1f5f9;">
                      Recupera tu contraseña
                    </h1>
                    <p style="margin:0;font-size:15px;color:#94a3b8;line-height:1.5;">
                      Hola <strong style="color:#e2e8f0;">${firstName}</strong>,<br/>
                      recibimos una solicitud para restablecer la contraseña de tu cuenta.
                    </p>
                  </td>
                </tr>

                <!-- BODY -->
                <tr>
                  <td style="padding:28px 32px 36px;">
                    <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.6;">
                      Haz clic en el botón de abajo para crear una nueva contraseña. Este enlace es válido por <strong style="color:#e2e8f0;">1 hora</strong>.
                    </p>

                    <!-- CTA BUTTON -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${resetLink}"
                             style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
                            Crear nueva contraseña →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- LINK FALLBACK -->
                    <p style="margin:24px 0 0;font-size:12px;color:#64748b;line-height:1.5;">
                      Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
                      <a href="${resetLink}" style="color:#818cf8;word-break:break-all;">${resetLink}</a>
                    </p>

                    <!-- SECURITY NOTE -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                      <tr>
                        <td style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:12px 16px;">
                          <p style="margin:0;font-size:12px;color:#fca5a5;line-height:1.5;">
                            🛡️ Si no solicitaste este cambio, ignora este correo. Tu contraseña actual seguirá siendo la misma.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0;font-size:12px;color:#475569;">
                © ${new Date().getFullYear()} Iron Fit Box CrossFit · Venezuela
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#334155;">
                Este correo fue enviado automáticamente, por favor no respondas a este mensaje.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
