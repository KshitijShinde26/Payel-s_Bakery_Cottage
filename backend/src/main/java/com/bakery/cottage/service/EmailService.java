package com.bakery.cottage.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            logger.info("Email sent successfully to {}", to);
        } catch (Exception ex) {
            logger.error("Failed to send email to {}. Error: {}", to, ex.getMessage());
            logger.warn("==================================================================");
            logger.warn("DEVELOPMENT EMAIL FALLBACK:");
            logger.warn("TO: {}", to);
            logger.warn("SUBJECT: {}", subject);
            logger.warn("HTML CONTENT:\n{}", htmlContent);
            logger.warn("==================================================================");
        }
    }

    public void sendVerificationOtp(String to, String fullName, String code) {
        String subject = "Verify Your Account - Payal's Bakery Cottage";
        String html = """
                <html>
                <body style="font-family: 'Outfit', sans-serif; background-color: #fbfbfb; padding: 20px; color: #1c1917;">
                    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e7e5e4; border-radius: 8px; padding: 30px;">
                        <h2 style="font-family: 'Playfair Display', serif; color: #b45309; text-align: center; margin-bottom: 20px;">Payal's Bakery Cottage</h2>
                        <p>Dear <strong>%s</strong>,</p>
                        <p>Thank you for registering an account at Payal's Bakery Cottage! To verify your email address, please enter the following 6-digit verification code on the registration page:</p>
                        <div style="background-color: #fef3c7; border: 1px dashed #d97706; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #78350f; border-radius: 6px; margin: 25px 0;">
                            %s
                        </div>
                        <p style="font-size: 13px; color: #78716c;">This verification code is valid for exactly 15 minutes. Please do not share this code with anyone.</p>
                        <hr style="border: 0; border-top: 1px solid #e7e5e4; margin: 25px 0;" />
                        <p style="font-size: 12px; text-align: center; color: #a8a29e;">&copy; Payal's Bakery Cottage. All rights reserved.</p>
                    </div>
                </body>
                </html>
                """.formatted(fullName, code);
        sendHtmlEmail(to, subject, html);
    }

    public void sendResendOtp(String to, String code) {
        String subject = "Your New Verification Code - Payal's Bakery Cottage";
        String html = """
                <html>
                <body style="font-family: 'Outfit', sans-serif; background-color: #fbfbfb; padding: 20px; color: #1c1917;">
                    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e7e5e4; border-radius: 8px; padding: 30px;">
                        <h2 style="font-family: 'Playfair Display', serif; color: #b45309; text-align: center; margin-bottom: 20px;">Payal's Bakery Cottage</h2>
                        <p>Hello,</p>
                        <p>You requested a new verification code. Please enter the following 6-digit OTP code to verify your account:</p>
                        <div style="background-color: #fef3c7; border: 1px dashed #d97706; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #78350f; border-radius: 6px; margin: 25px 0;">
                            %s
                        </div>
                        <p style="font-size: 13px; color: #78716c;">This verification code is valid for exactly 15 minutes. Please do not share this code with anyone.</p>
                        <hr style="border: 0; border-top: 1px solid #e7e5e4; margin: 25px 0;" />
                        <p style="font-size: 12px; text-align: center; color: #a8a29e;">&copy; Payal's Bakery Cottage. All rights reserved.</p>
                    </div>
                </body>
                </html>
                """.formatted(code);
        sendHtmlEmail(to, subject, html);
    }

    public void sendPasswordResetOtp(String to, String code) {
        String subject = "Reset Your Password - Payal's Bakery Cottage";
        String html = """
                <html>
                <body style="font-family: 'Outfit', sans-serif; background-color: #fbfbfb; padding: 20px; color: #1c1917;">
                    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e7e5e4; border-radius: 8px; padding: 30px;">
                        <h2 style="font-family: 'Playfair Display', serif; color: #b45309; text-align: center; margin-bottom: 20px;">Payal's Bakery Cottage</h2>
                        <p>Hello,</p>
                        <p>We received a request to reset the password for your Payal's Bakery Cottage account. Use the following 6-digit OTP code to reset your password:</p>
                        <div style="background-color: #fee2e2; border: 1px dashed #ef4444; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #991b1b; border-radius: 6px; margin: 25px 0;">
                            %s
                        </div>
                        <p style="font-size: 13px; color: #78716c;">This code will expire in 15 minutes. If you did not make this request, you can safely ignore this email.</p>
                        <hr style="border: 0; border-top: 1px solid #e7e5e4; margin: 25px 0;" />
                        <p style="font-size: 12px; text-align: center; color: #a8a29e;">&copy; Payal's Bakery Cottage. All rights reserved.</p>
                    </div>
                </body>
                </html>
                """.formatted(code);
        sendHtmlEmail(to, subject, html);
    }

    public void sendPasswordChangedNotification(String to, String fullName) {
        String subject = "Password Changed Successfully - Payal's Bakery Cottage";
        String html = """
                <html>
                <body style="font-family: 'Outfit', sans-serif; background-color: #fbfbfb; padding: 20px; color: #1c1917;">
                    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e7e5e4; border-radius: 8px; padding: 30px;">
                        <h2 style="font-family: 'Playfair Display', serif; color: #b45309; text-align: center; margin-bottom: 20px;">Payal's Bakery Cottage</h2>
                        <p>Dear <strong>%s</strong>,</p>
                        <p>This is to confirm that the password for your Payal's Bakery Cottage account was changed successfully.</p>
                        <p>If you did not initiate this change, please contact our support team immediately or reset your password to secure your account.</p>
                        <hr style="border: 0; border-top: 1px solid #e7e5e4; margin: 25px 0;" />
                        <p style="font-size: 12px; text-align: center; color: #a8a29e;">&copy; Payal's Bakery Cottage. All rights reserved.</p>
                    </div>
                </body>
                </html>
                """.formatted(fullName);
        sendHtmlEmail(to, subject, html);
    }
}
