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
// ============================================================
// Email: Notificación de Nuevo Registro al Admin
// ============================================================
export async function sendNewRegistrationEmailToAdmin({
    adminEmail,
    athleteName,
    athleteEmail,
    athleteId,
    athletePhone,
}: {
    adminEmail: string;
    athleteName: string;
    athleteEmail: string;
    athleteId: string;
    athletePhone?: string;
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
            to: adminEmail,
            subject: `🚀 Nuevo atleta registrado: ${athleteName}`,
            html: buildNewRegistrationHtml({ athleteName, athleteEmail, athleteId, athletePhone }),
        });
        return info;
    } catch (error) {
        console.error("[Nodemailer] Error enviando email de nuevo registro:", error);
    }
}

function buildNewRegistrationHtml({ athleteName, athleteEmail, athleteId, athletePhone }: { athleteName: string, athleteEmail: string, athleteId: string, athletePhone?: string }) {
    // 1. Usa la variable explícita si existe (ideal para localhost o custom domains).
    // 2. Si no, usa la URL automática de Vercel (ideal para producción).
    // 3. Fallback a localhost.
    const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL 
        ? process.env.NEXT_PUBLIC_SITE_URL 
        : vercelUrl 
            ? `https://${vercelUrl}` 
            : "http://localhost:3000";
            
    const actionUrl = `${siteUrl}/admin/athletes/${athleteId}`;
    
    return `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Nuevo Registro en Iron Fit</h2>
        <p>Un nuevo atleta se ha registrado y está a la espera de aprobación.</p>
        <ul>
            <li><strong>Nombre:</strong> ${athleteName}</li>
            <li><strong>Email:</strong> ${athleteEmail}</li>
            <li><strong>Teléfono:</strong> ${athletePhone || "No proporcionado"}</li>
        </ul>
        <p>
            <a href="${actionUrl}" style="display:inline-block; padding: 10px 20px; background-color: #4f46e5; color: #fff; text-decoration: none; border-radius: 5px;">
                Revisar y Activar Atleta
            </a>
        </p>
        <p>Por favor ingresa al panel de administración para verificar y activar su cuenta.</p>
        <br>
        <p>Equipo Iron Fit</p>
    </div>
    `;
}

// ============================================================
// Email: Comprobante de Pago al Admin
// ============================================================
export async function sendPaymentReceiptEmailToAdmin({
    adminEmail,
    athleteName,
    amount,
    receiptUrl,
    notes,
    paymentId,
}: {
    adminEmail: string;
    athleteName: string;
    amount: number;
    receiptUrl?: string | null;
    notes: string;
    paymentId?: string;
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
            to: adminEmail,
            subject: `💰 Nuevo pago reportado por ${athleteName}`,
            html: buildPaymentReceiptHtml({ athleteName, amount, receiptUrl, notes, paymentId }),
        });
        return info;
    } catch (error) {
        console.error("[Nodemailer] Error enviando email de comprobante:", error);
    }
}

function buildPaymentReceiptHtml({ athleteName, amount, receiptUrl, notes, paymentId }: { athleteName: string, amount: number, receiptUrl?: string | null, notes: string, paymentId?: string }) {
    const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
        ? process.env.NEXT_PUBLIC_SITE_URL
        : vercelUrl
            ? `https://${vercelUrl}`
            : "http://localhost:3000";
    const adminUrl = `${siteUrl}/admin/payments`;
    const fullReceiptUrl = receiptUrl
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/receipts/${receiptUrl}`
        : null;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nuevo pago reportado — Iron Fit</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f1a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
          <!-- HEADER -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:28px;font-weight:900;letter-spacing:-1px;background:linear-gradient(135deg,#6366f1,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;color:#6366f1;">IRON FIT</span>
              <p style="margin:4px 0 0;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:3px;">Box CrossFit</p>
            </td>
          </tr>
          <!-- CARD -->
          <tr>
            <td style="background-color:#1e1e3a;border-radius:16px;border:1px solid rgba(99,102,241,0.2);overflow:hidden;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background:linear-gradient(135deg,rgba(234,179,8,0.15),rgba(234,179,8,0.05));padding:36px 24px 28px;">
                    <div style="width:64px;height:64px;background:rgba(234,179,8,0.15);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;line-height:64px;">💰</div>
                    <h1 style="margin:20px 0 8px;font-size:22px;font-weight:700;color:#f1f5f9;">Nuevo Pago Reportado</h1>
                    <p style="margin:0;font-size:15px;color:#94a3b8;line-height:1.5;">
                      <strong style="color:#e2e8f0;">${athleteName}</strong> ha reportado un pago y está a la espera de confirmación.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 32px 36px;">
                    <!-- DETAILS -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.07);">
                      <tr>
                        <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);">
                          <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Monto</span>
                          <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#4ade80;">$${amount}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 16px;">
                          <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Detalles</span>
                          <p style="margin:4px 0 0;font-size:14px;color:#94a3b8;">${notes || "Sin detalles adicionales"}</p>
                        </td>
                      </tr>
                    </table>
                    <!-- CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom:${fullReceiptUrl ? "12px" : "0"};">
                          <a href="${adminUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
                            Ir a Pagos Pendientes →
                          </a>
                        </td>
                      </tr>
                      ${fullReceiptUrl ? `<tr><td align="center"><a href="${fullReceiptUrl}" style="display:inline-block;background:rgba(99,102,241,0.1);color:#818cf8;text-decoration:none;font-size:14px;font-weight:600;padding:10px 28px;border-radius:8px;border:1px solid rgba(99,102,241,0.3);">Ver Comprobante Adjunto</a></td></tr>` : ""}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- FOOTER -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0;font-size:12px;color:#475569;">© ${new Date().getFullYear()} Iron Fit Box CrossFit · Venezuela</p>
              <p style="margin:6px 0 0;font-size:11px;color:#334155;">Este correo fue enviado automáticamente, por favor no respondas a este mensaje.</p>
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

// ============================================================
// Email: Pago Aprobado al Atleta
// ============================================================
export async function sendPaymentConfirmedEmailToAthlete({
    athleteEmail,
    athleteName,
    amount,
}: {
    athleteEmail: string;
    athleteName: string;
    amount: number;
}) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    try {
        const firstName = athleteName.split(" ")[0];
        await transporter.sendMail({
            from: process.env.SMTP_USER ? `"Iron Fit" <${process.env.SMTP_USER}>` : '"Iron Fit" <no-reply@ironfit.com>',
            to: athleteEmail,
            subject: "✅ Tu pago ha sido confirmado — Iron Fit",
            html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#0f0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f1a;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <tr><td align="center" style="padding-bottom:32px;">
          <span style="font-size:28px;font-weight:900;letter-spacing:-1px;color:#6366f1;">IRON FIT</span>
          <p style="margin:4px 0 0;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:3px;">Box CrossFit</p>
        </td></tr>
        <tr><td style="background-color:#1e1e3a;border-radius:16px;border:1px solid rgba(74,222,128,0.2);overflow:hidden;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="background:linear-gradient(135deg,rgba(74,222,128,0.12),rgba(74,222,128,0.03));padding:36px 24px 28px;">
              <div style="width:64px;height:64px;background:rgba(74,222,128,0.15);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;line-height:64px;">✅</div>
              <h1 style="margin:20px 0 8px;font-size:22px;font-weight:700;color:#f1f5f9;">¡Pago Confirmado!</h1>
              <p style="margin:0;font-size:15px;color:#94a3b8;line-height:1.5;">
                Hola <strong style="color:#e2e8f0;">${firstName}</strong>, tu pago de <strong style="color:#4ade80;">$${amount}</strong> ha sido verificado y aprobado.
              </p>
            </td></tr>
            <tr><td style="padding:28px 32px 36px;">
              <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.6;">Tu membresía está activa. ¡Sigue entrenando duro! 💪</p>
              <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}" style="display:inline-block;background:linear-gradient(135deg,#22c55e,#16a34a);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;">
                  Ir al Dashboard →
                </a>
              </td></tr></table>
            </td></tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding-top:28px;">
          <p style="margin:0;font-size:12px;color:#475569;">© ${new Date().getFullYear()} Iron Fit Box CrossFit · Venezuela</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim(),
        });
    } catch (error) {
        console.error("[Nodemailer] Error enviando email de pago confirmado:", error);
    }
}

// ============================================================
// Email: Pago Rechazado al Atleta
// ============================================================
export async function sendPaymentRejectedEmailToAthlete({
    athleteEmail,
    athleteName,
    amount,
}: {
    athleteEmail: string;
    athleteName: string;
    amount: number;
}) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    try {
        const firstName = athleteName.split(" ")[0];
        await transporter.sendMail({
            from: process.env.SMTP_USER ? `"Iron Fit" <${process.env.SMTP_USER}>` : '"Iron Fit" <no-reply@ironfit.com>',
            to: athleteEmail,
            subject: "⚠️ Tu comprobante de pago requiere atención — Iron Fit",
            html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#0f0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f1a;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <tr><td align="center" style="padding-bottom:32px;">
          <span style="font-size:28px;font-weight:900;letter-spacing:-1px;color:#6366f1;">IRON FIT</span>
          <p style="margin:4px 0 0;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:3px;">Box CrossFit</p>
        </td></tr>
        <tr><td style="background-color:#1e1e3a;border-radius:16px;border:1px solid rgba(239,68,68,0.2);overflow:hidden;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="background:linear-gradient(135deg,rgba(239,68,68,0.12),rgba(239,68,68,0.03));padding:36px 24px 28px;">
              <div style="width:64px;height:64px;background:rgba(239,68,68,0.15);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;line-height:64px;">⚠️</div>
              <h1 style="margin:20px 0 8px;font-size:22px;font-weight:700;color:#f1f5f9;">Comprobante No Procesado</h1>
              <p style="margin:0;font-size:15px;color:#94a3b8;line-height:1.5;">
                Hola <strong style="color:#e2e8f0;">${firstName}</strong>, tu comprobante de <strong style="color:#f87171;">$${amount}</strong> no pudo ser verificado.
              </p>
            </td></tr>
            <tr><td style="padding:28px 32px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:8px;">
                <tr><td style="padding:14px 16px;">
                  <p style="margin:0;font-size:13px;color:#fca5a5;line-height:1.6;">Por favor comunícate con el administrador del box para resolver el inconveniente con tu pago.</p>
                </td></tr>
              </table>
              <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.6;">Si crees que esto es un error, contacta a tu entrenador o al administrador directamente.</p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding-top:28px;">
          <p style="margin:0;font-size:12px;color:#475569;">© ${new Date().getFullYear()} Iron Fit Box CrossFit · Venezuela</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim(),
        });
    } catch (error) {
        console.error("[Nodemailer] Error enviando email de pago rechazado:", error);
    }
}

// ============================================================
// Email: Cuenta Activada al Atleta
// ============================================================
export async function sendAccountActivatedEmailToAthlete({
    athleteEmail,
    athleteName,
}: {
    athleteEmail: string;
    athleteName: string;
}) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
        ? process.env.NEXT_PUBLIC_SITE_URL
        : vercelUrl
            ? `https://${vercelUrl}`
            : "http://localhost:3000";

    try {
        const firstName = athleteName.split(" ")[0];
        await transporter.sendMail({
            from: process.env.SMTP_USER ? `"Iron Fit" <${process.env.SMTP_USER}>` : '"Iron Fit" <no-reply@ironfit.com>',
            to: athleteEmail,
            subject: "🚀 ¡Tu cuenta en Iron Fit está activa! — Iron Fit Box CrossFit",
            html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#0f0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f1a;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <tr><td align="center" style="padding-bottom:32px;">
          <span style="font-size:28px;font-weight:900;letter-spacing:-1px;color:#6366f1;">IRON FIT</span>
          <p style="margin:4px 0 0;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:3px;">Box CrossFit</p>
        </td></tr>
        <tr><td style="background-color:#1e1e3a;border-radius:16px;border:1px solid rgba(99,102,241,0.2);overflow:hidden;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(129,140,248,0.05));padding:36px 24px 28px;">
              <div style="width:64px;height:64px;background:rgba(99,102,241,0.15);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;line-height:64px;">🚀</div>
              <h1 style="margin:20px 0 8px;font-size:22px;font-weight:700;color:#f1f5f9;">¡Bienvenido a Iron Fit!</h1>
              <p style="margin:0;font-size:15px;color:#94a3b8;line-height:1.5;">
                Hola <strong style="color:#e2e8f0;">${firstName}</strong>, el administrador ha activado tu cuenta. ¡Ya puedes ingresar al sistema!
              </p>
            </td></tr>
            <tr><td style="padding:28px 32px 36px;">
              <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.6;">
                Desde el dashboard podrás ver los WODs del día, registrar tus resultados, llevar el control de tus PRs y mucho más. ¡Bienvenido al box! 💪
              </p>
              <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
                <a href="${siteUrl}/login" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
                  Ingresar ahora →
                </a>
              </td></tr></table>
            </td></tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding-top:28px;">
          <p style="margin:0;font-size:12px;color:#475569;">© ${new Date().getFullYear()} Iron Fit Box CrossFit · Venezuela</p>
          <p style="margin:6px 0 0;font-size:11px;color:#334155;">Este correo fue enviado automáticamente, por favor no respondas a este mensaje.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim(),
        });
    } catch (error) {
        console.error("[Nodemailer] Error enviando email de cuenta activada:", error);
    }
}
