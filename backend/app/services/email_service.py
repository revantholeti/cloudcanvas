import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import aiosmtplib
from app.config import settings

logger = logging.getLogger(__name__)

PASSWORD_RESET_HTML = """\
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#0f1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#1a1d27;border:1px solid #2a2d3a;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #2a2d3a;">
              <p style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">☁️ CloudCanvas</p>
              <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Design cloud architectures visually</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#ffffff;">Reset your password</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.6;">
                Hi {name},<br/><br/>
                We received a request to reset the password for your CloudCanvas account. Click the button below to choose a new password. This link expires in <strong style="color:#e2e8f0;">1 hour</strong>.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;background:#6366f1;">
                    <a href="{reset_url}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                      Reset password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:12px;color:#64748b;line-height:1.6;">
                If you didn't request a password reset, you can safely ignore this email — your password will not change.<br/><br/>
                Or copy this link into your browser:<br/>
                <a href="{reset_url}" style="color:#6366f1;word-break:break-all;">{reset_url}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #2a2d3a;">
              <p style="margin:0;font-size:11px;color:#475569;">
                © 2025 CloudCanvas · This email was sent to {email}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


async def send_password_reset_email(to_email: str, name: str, token: str) -> bool:
    """Send a password reset email. Returns True on success, False on failure."""
    if not settings.smtp_username or not settings.smtp_from_email:
        logger.warning("SMTP not configured — skipping email send")
        return False

    reset_url = f"{settings.frontend_url}/reset-password?token={token}"

    html = PASSWORD_RESET_HTML.format(
        name=name,
        email=to_email,
        reset_url=reset_url,
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Reset your CloudCanvas password"
    msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
    msg["To"] = to_email

    plain = (
        f"Hi {name},\n\n"
        f"Reset your CloudCanvas password by visiting:\n{reset_url}\n\n"
        "This link expires in 1 hour. If you didn't request a reset, ignore this email."
    )
    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html, "html"))

    try:
        await aiosmtplib.send(
            msg,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_username,
            password=settings.smtp_password,
            start_tls=True,
        )
        logger.info(f"Password reset email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False
