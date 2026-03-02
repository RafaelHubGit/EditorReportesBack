import { RecoveryParams } from "../../../interface/mail";
import { sendEmail } from "../brevo.service";


export const sendPasswordRecoveryEmail = async ({
  toEmail,
  toName,
  temporaryPassword
}: RecoveryParams) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
      <h2 style="color: #333;">Recuperación de contraseña</h2>
      <p>Hola ${toName}, hemos generado una contraseña temporal para tu acceso:</p>
      <div style="background: #fff3cd; border: 1px solid #ffeeba; padding: 15px; text-align: center; font-family: monospace; font-size: 20px;">
        ${temporaryPassword}
      </div>
      <p><strong>Importante:</strong> Por seguridad, cámbiala inmediatamente al iniciar sesión.</p>
      <p style="font-size: 12px; color: #999;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
    </div>
  `;

  return sendEmail({
    toEmail,
    toName,
    subject: "Tu contraseña temporal - PDF Service",
    htmlContent
  });
};