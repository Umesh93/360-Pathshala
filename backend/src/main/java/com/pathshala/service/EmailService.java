package com.pathshala.service;

import com.pathshala.entity.School;
import com.pathshala.entity.User;
import com.pathshala.entity.ModuleCode;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.email.enabled}")
    private boolean emailEnabled;

    @Value("${app.login-url:http://localhost:5173/login}")
    private String loginUrl;
    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;
    @Value("${spring.mail.host:}") private String mailHost;
    @Value("${spring.mail.port:0}") private int mailPort;
    @Value("${spring.mail.username:}") private String mailUsername;
    @Value("${spring.mail.password:}") private String mailPassword;
    @Value("${spring.mail.properties.mail.smtp.auth:false}") private boolean smtpAuth;
    @Value("${spring.mail.properties.mail.smtp.starttls.enable:false}") private boolean startTls;

    @PostConstruct
    void logConfiguration() {
        log.info("Email configuration: enabled={}, readiness={}, host={}, port={}, username={}, smtpAuth={}, startTls={}, sender={}",
                emailEnabled, readiness(), safe(mailHost), mailPort, safe(mailUsername), smtpAuth, startTls, safe(fromEmail));
    }

    public boolean isEnabled() {
        return emailEnabled;
    }

    public String readiness() {
        if (!emailEnabled) return "DISABLED";
        if (mailHost == null || mailHost.isBlank()) return "MISCONFIGURED";
        if (mailPort <= 0) return "MISCONFIGURED";
        if (fromEmail == null || fromEmail.isBlank()) return "MISCONFIGURED";
        boolean gmail = "smtp.gmail.com".equalsIgnoreCase(mailHost.trim());
        if ((smtpAuth || gmail) && (mailUsername == null || mailUsername.isBlank() || mailPassword == null || mailPassword.isBlank())) return "MISCONFIGURED";
        if (gmail && (!smtpAuth || mailPort != 587 || !startTls)) return "MISCONFIGURED";
        if (gmail && !fromEmail.equalsIgnoreCase(mailUsername)) return "MISCONFIGURED";
        if (mailPassword != null && mailPassword.toLowerCase().contains("app-password")) return "MISCONFIGURED";
        return "READY";
    }

    private String safe(String value) { return value == null || value.isBlank() ? "<unset>" : value; }

    public void sendSchoolRegistrationEmail(School school, User admin, String plainPassword, BigDecimal totalAmount, String paymentReference, String paymentLink) throws MessagingException {
        if (!emailEnabled) {
            return;
        }

        String qrBase64 = generateQrBase64(paymentLink != null ? paymentLink : paymentReference);
        String html = buildRegistrationHtml(school, admin, plainPassword, totalAmount, paymentReference, qrBase64);
        sendHtmlEmail(school.getEmail(), "Welcome to 360 Pathshala - School Registration Successful", html);
    }

    public void sendDemoExpiryBillingEmail(School school, User admin, BigDecimal totalAmount, String paymentReference, String paymentLink) throws MessagingException {
        if (!emailEnabled) {
            return;
        }

        String qrBase64 = generateQrBase64(paymentLink != null ? paymentLink : paymentReference);
        String html = buildDemoExpiryHtml(school, admin, totalAmount, paymentReference, qrBase64);
        sendHtmlEmail(school.getEmail(), "360 Pathshala - Your Demo Period Has Ended", html);
    }

    public void sendDemoAccountCredentials(String to, String contactPerson, String schoolName, String username, String plainPassword, String startDate, String expiryDate, java.util.List<ModuleCode> modules) throws MessagingException {
        if (!emailEnabled) {
            return;
        }

        String html = buildDemoAccountHtml(contactPerson, schoolName, username, plainPassword, startDate, expiryDate, modules);
        sendHtmlEmail(to, "Your 360 Pathshala Demo Account Has Been Created", html);
    }

    public void sendPasswordResetEmail(String to, String token) {
        if (!emailEnabled) return;
        String resetUrl = frontendUrl.replaceAll("/+$", "") + "/reset-password?token=" + token;
        String html = "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;background:#f4f6f8;padding:24px;'>"
                + "<div style='max-width:600px;margin:auto;background:#fff;padding:28px;border-radius:12px;'>"
                + "<h2 style='color:#234A91;'>360 Pathshala</h2>"
                + "<p>We received a request to reset your password.</p>"
                + "<p><a href='" + resetUrl + "' style='display:inline-block;background:#234A91;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;'>Reset Password</a></p>"
                + "<p>This link expires in 30 minutes and can only be used once.</p>"
                + "<p>If you did not request this, you can safely ignore this email.</p></div></body></html>";
        try {
            sendHtmlEmail(to, "Reset your 360 Pathshala password", html);
        } catch (MessagingException exception) {
            throw new IllegalStateException("Password reset email could not be sent", exception);
        }
    }

    private String generateQrBase64(String data) {
        try {
            byte[] pngBytes = net.glxn.qrgen.javase.QRCode.from(data).withSize(250, 250).stream().toByteArray();
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngBytes);
        } catch (Exception e) {
            return "";
        }
    }

    private String buildRegistrationHtml(School school, User admin, String plainPassword, BigDecimal totalAmount, String paymentReference, String qrBase64) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'><style>")
          .append("body{font-family:Arial,sans-serif;background:#f4f6f8;margin:0;padding:0;}")
          .append(".container{max-width:600px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);}")
          .append(".header{background:#234A91;color:#fff;padding:24px;text-align:center;}")
          .append(".body{padding:24px;}")
          .append(".info{background:#f8fafc;border-radius:8px;padding:16px;margin:12px 0;}")
          .append(".label{font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;}")
          .append(".value{font-size:16px;font-weight:600;color:#1e293b;margin-top:4px;}")
          .append(".qr{text-align:center;margin:20px 0;}")
          .append(".qr img{max-width:200px;border:1px solid #e2e8f0;border-radius:8px;}")
          .append(".footer{text-align:center;padding:16px;font-size:12px;color:#94a3b8;}")
          .append("</style></head><body>")
          .append("<div class='container'>")
          .append("<div class='header'><h2>360 Pathshala</h2><p>School Registration Successful</p></div>")
          .append("<div class='body'>")
          .append("<p>Dear Administrator,</p>")
          .append("<p>Your school has been successfully registered on <strong>360 Pathshala</strong>. Here are your login credentials:</p>")
          .append("<div class='info'><div class='label'>School Code</div><div class='value'>").append(school.getCode()).append("</div></div>")
          .append("<div class='info'><div class='label'>Username</div><div class='value'>").append(admin.getUsername()).append("</div></div>")
          .append("<div class='info'><div class='label'>Temporary Password</div><div class='value'>").append(plainPassword).append("</div></div>")
          .append("<div class='info'><div class='label'>Total Amount</div><div class='value'>NPR ").append(totalAmount).append("</div></div>")
          .append("<div class='info'><div class='label'>Payment Reference</div><div class='value'>").append(paymentReference).append("</div></div>")
          .append("<p>Please use the following link to complete your payment:</p>")
          .append("<div class='qr'><img src='").append(qrBase64).append("' alt='Payment QR'/></div>")
          .append("<p style='text-align:center;'><a href='").append(loginUrl).append("' style='background:#234A91;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;'>Login to Dashboard</a></p>")
          .append("</div>")
          .append("<div class='footer'>&copy; 360 Pathshala. All rights reserved.</div>")
          .append("</div></body></html>");
        return sb.toString();
    }

    private String buildDemoAccountHtml(String contactPerson, String schoolName, String username, String plainPassword, String startDate, String expiryDate, java.util.List<ModuleCode> modules) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'><style>")
          .append("body{font-family:Arial,sans-serif;background:#f4f6f8;margin:0;padding:0;}")
          .append(".container{max-width:600px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);}")
          .append(".header{background:#234A91;color:#fff;padding:24px;text-align:center;}")
          .append(".body{padding:24px;}")
          .append(".info{background:#f8fafc;border-radius:8px;padding:16px;margin:12px 0;}")
          .append(".label{font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;}")
          .append(".value{font-size:16px;font-weight:600;color:#1e293b;margin-top:4px;}")
          .append(".footer{text-align:center;padding:16px;font-size:12px;color:#94a3b8;}")
          .append("</style></head><body>")
          .append("<div class='container'>")
          .append("<div class='header'><h2>360 Pathshala</h2><p>Your Demo Account is Ready</p></div>")
          .append("<div class='body'>")
          .append("<p>Dear ").append(contactPerson == null || contactPerson.isBlank() ? "Administrator" : contactPerson).append(",</p>")
          .append("<p>Your demo request for <strong>").append(schoolName).append("</strong> has been approved. Your 360 Pathshala demo account is valid for 30 days.</p>")
          .append("<div class='info'><div class='label'>Demo Period</div><div class='value'>").append(startDate).append(" - ").append(expiryDate).append("</div></div>")
          .append("<div class='info'><div class='label'>Login URL</div><div class='value'>").append(loginUrl).append("</div></div>")
          .append("<div class='info'><div class='label'>Username</div><div class='value'>").append(username).append("</div></div>")
          .append("<div class='info'><div class='label'>Temporary Password</div><div class='value'>").append(plainPassword).append("</div></div>")
          .append("<div class='info'><div class='label'>Available Modules</div><div class='value'>").append(modules.stream().map(ModuleCode::name).collect(java.util.stream.Collectors.joining(", "))).append("</div></div>")
          .append("<p>Please keep these credentials secure and change your password after your first login.</p>")
          .append("<p style='text-align:center;'><a href='").append(loginUrl).append("' style='background:#234A91;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;'>Login to Dashboard</a></p>")
          .append("</div>")
          .append("<div class='footer'>&copy; 360 Pathshala. All rights reserved.</div>")
          .append("</div></body></html>");
        return sb.toString();
    }

    private String buildDemoExpiryHtml(School school, User admin, BigDecimal totalAmount, String paymentReference, String qrBase64) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'><style>")
          .append("body{font-family:Arial,sans-serif;background:#f4f6f8;margin:0;padding:0;}")
          .append(".container{max-width:600px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);}")
          .append(".header{background:#dc2626;color:#fff;padding:24px;text-align:center;}")
          .append(".body{padding:24px;}")
          .append(".info{background:#f8fafc;border-radius:8px;padding:16px;margin:12px 0;}")
          .append(".label{font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;}")
          .append(".value{font-size:16px;font-weight:600;color:#1e293b;margin-top:4px;}")
          .append(".qr{text-align:center;margin:20px 0;}")
          .append(".qr img{max-width:200px;border:1px solid #e2e8f0;border-radius:8px;}")
          .append(".footer{text-align:center;padding:16px;font-size:12px;color:#94a3b8;}")
          .append("</style></head><body>")
          .append("<div class='container'>")
          .append("<div class='header'><h2>360 Pathshala</h2><p>Your Demo Period Has Ended</p></div>")
          .append("<div class='body'>")
          .append("<p>Dear Administrator,</p>")
          .append("<p>Your <strong>1-month free demo</strong> for <strong>").append(school.getName()).append("</strong> has ended. Please subscribe to continue using 360 Pathshala.</p>")
          .append("<div class='info'><div class='label'>School Code</div><div class='value'>").append(school.getCode()).append("</div></div>")
          .append("<div class='info'><div class='label'>Username</div><div class='value'>").append(admin.getUsername()).append("</div></div>")
          .append("<div class='info'><div class='label'>Billing Amount</div><div class='value'>NPR ").append(totalAmount).append("</div></div>")
          .append("<div class='info'><div class='label'>Payment Reference</div><div class='value'>").append(paymentReference).append("</div></div>")
          .append("<p>Please use the following QR code to complete your payment and continue uninterrupted access:</p>")
          .append("<div class='qr'><img src='").append(qrBase64).append("' alt='Payment QR'/></div>")
          .append("<p style='text-align:center;'><a href='").append(loginUrl).append("' style='background:#dc2626;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;'>Login to Renew</a></p>")
          .append("</div>")
          .append("<div class='footer'>&copy; 360 Pathshala. All rights reserved.</div>")
          .append("</div></body></html>");
        return sb.toString();
    }

    private void sendHtmlEmail(String to, String subject, String html) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        mailSender.send(message);
    }
}
