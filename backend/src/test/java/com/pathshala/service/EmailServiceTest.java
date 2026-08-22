package com.pathshala.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;

class EmailServiceTest {
    private EmailService service;

    @BeforeEach
    void setUp() {
        service = new EmailService(mock(JavaMailSender.class));
        set("emailEnabled", true);
        set("mailHost", "smtp.gmail.com");
        set("mailPort", 587);
        set("mailUsername", "sender@gmail.com");
        set("mailPassword", "valid-sixteen-char-secret");
        set("smtpAuth", true);
        set("startTls", true);
        set("fromEmail", "sender@gmail.com");
    }

    @Test void readyForCompleteGmailConfiguration() { assertEquals("READY", service.readiness()); }
    @Test void disabledIsReportedSeparately() { set("emailEnabled", false); assertEquals("DISABLED", service.readiness()); }
    @Test void missingCredentialsAreMisconfigured() { set("mailPassword", ""); assertEquals("MISCONFIGURED", service.readiness()); }
    @Test void gmailRequiresAuthentication() { set("smtpAuth", false); assertEquals("MISCONFIGURED", service.readiness()); }
    @Test void gmailRequiresStartTls() { set("startTls", false); assertEquals("MISCONFIGURED", service.readiness()); }
    @Test void gmailRequiresPort587() { set("mailPort", 465); assertEquals("MISCONFIGURED", service.readiness()); }
    @Test void gmailSenderMustMatchAuthenticatedUser() { set("fromEmail", "other@gmail.com"); assertEquals("MISCONFIGURED", service.readiness()); }
    @Test void placeholderPasswordIsRejected() { set("mailPassword", "your-new-gmail-app-password"); assertEquals("MISCONFIGURED", service.readiness()); }

    private void set(String field, Object value) { ReflectionTestUtils.setField(service, field, value); }
}
