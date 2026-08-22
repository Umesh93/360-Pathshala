package com.pathshala.payment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pathshala.config.KhaltiProperties;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;

class KhaltiRestClientTest {
    private HttpServer server;
    private KhaltiProperties properties;
    private final AtomicReference<String> path = new AtomicReference<>();
    private final AtomicReference<String> authorization = new AtomicReference<>();

    @BeforeEach
    void setUp() throws IOException {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.start();
        properties = new KhaltiProperties();
        properties.setEnabled(true);
        properties.setSecretKey("test-secret-never-returned");
        properties.setBaseUrl("http://localhost:" + server.getAddress().getPort());
        properties.setWebsiteUrl("http://localhost:5173");
        properties.setReturnUrl("http://localhost:8080/api/payments/khalti/callback");
    }

    @AfterEach void tearDown() { server.stop(0); }

    @Test void successfulInitiationUsesDocumentedPathAndParsesFields() {
        respond(200, "{\"pidx\":\"PX1\",\"payment_url\":\"https://pay.khalti.com/x\",\"status\":\"Initiated\"}");
        var result = client().initiate(request());
        assertEquals("/epayment/initiate/", path.get());
        assertEquals("Key test-secret-never-returned", authorization.get());
        assertEquals("PX1", result.pidx());
        assertEquals("https://pay.khalti.com/x", result.paymentUrl());
    }

    @Test void missingPidxIsSpecificAndPreservesSafeResponse() {
        respond(200, "{\"payment_url\":\"https://pay.khalti.com/x\",\"status\":\"Initiated\"}");
        KhaltiClientException error = assertThrows(KhaltiClientException.class, () -> client().initiate(request()));
        assertTrue(error.getMessage().contains("missing pidx"));
        assertTrue(error.getSafeResponse().contains("payment_url"));
    }

    @Test void missingPaymentUrlIsSpecific() {
        respond(200, "{\"pidx\":\"PX1\"}");
        assertTrue(assertThrows(KhaltiClientException.class, () -> client().initiate(request())).getMessage().contains("missing payment_url"));
    }

    @Test void providerHttpErrorPreservesSafeDetailWithoutSecret() {
        respond(400, "{\"detail\":\"Invalid return URL\",\"secret\":\"must-not-leak\"}");
        KhaltiClientException error = assertThrows(KhaltiClientException.class, () -> client().initiate(request()));
        assertEquals(400, error.getProviderStatus());
        assertTrue(error.getMessage().contains("Invalid return URL"));
        assertFalse(error.getMessage().contains("test-secret-never-returned"));
        assertFalse(error.getSafeResponse().contains("must-not-leak"));
    }

    private KhaltiRestClient client() { return new KhaltiRestClient(properties, new ObjectMapper()); }
    private KhaltiPaymentClient.InitiationRequest request() { return new KhaltiPaymentClient.InitiationRequest(300000, "ORDER-1", "Feature Add-ons", properties.getReturnUrl(), "Admin", "admin@example.com", "9800000000"); }
    private void respond(int status, String body) {
        server.createContext("/epayment/initiate/", exchange -> send(exchange, status, body));
    }
    private void send(HttpExchange exchange, int status, String body) throws IOException {
        path.set(exchange.getRequestURI().getPath());
        authorization.set(exchange.getRequestHeaders().getFirst("Authorization"));
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(status, bytes.length);
        exchange.getResponseBody().write(bytes);
        exchange.close();
    }
}
