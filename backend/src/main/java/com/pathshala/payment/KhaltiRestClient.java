package com.pathshala.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pathshala.config.KhaltiProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Map;
import java.util.Iterator;
import java.util.Map.Entry;

@Service
@RequiredArgsConstructor
public class KhaltiRestClient implements KhaltiPaymentClient {
    private final KhaltiProperties properties;
    private final ObjectMapper mapper;

    private RestClient client() {
        HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofMillis(properties.getConnectTimeoutMs())).build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(http);
        factory.setReadTimeout(Duration.ofMillis(properties.getReadTimeoutMs()));
        return RestClient.builder().baseUrl(properties.getBaseUrl()).requestFactory(factory)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Key " + properties.getSecretKey())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE).build();
    }

    @Override public Initiation initiate(InitiationRequest request) {
        ensureReady();
        try {
            JsonNode n = client().post().uri("/epayment/initiate/").body(Map.of(
                    "return_url", request.returnUrl(), "website_url", properties.getWebsiteUrl(),
                    "amount", request.amountPaisa(), "purchase_order_id", request.purchaseOrderId(),
                    "purchase_order_name", request.productName(), "customer_info", Map.of(
                            "name", safe(request.customerName()), "email", safe(request.customerEmail()), "phone", safe(request.customerPhone()))))
                    .retrieve().body(JsonNode.class);
            String raw = sanitize(n);
            String pidx = text(n, "pidx");
            String paymentUrl = text(n, "payment_url");
            if (pidx == null || pidx.isBlank()) throw incomplete("pidx", raw);
            if (paymentUrl == null || paymentUrl.isBlank()) throw incomplete("payment_url", raw);
            return new Initiation(pidx, paymentUrl, text(n, "status"), raw);
        } catch (KhaltiClientException e) {
            throw e;
        } catch (RestClientResponseException e) {
            String raw = sanitize(e.getResponseBodyAsString());
            throw new KhaltiClientException("Khalti initiation failed (HTTP " + e.getStatusCode().value() + "): " + providerMessage(raw), e.getStatusCode().value(), raw, e);
        } catch (Exception e) {
            throw new KhaltiClientException("Khalti payment initiation failed", null, null, e);
        }
    }

    @Override public Lookup lookup(String pidx) {
        ensureReady();
        try {
            JsonNode n = client().post().uri("/epayment/lookup/").body(Map.of("pidx", pidx)).retrieve().body(JsonNode.class);
            Long amount = n != null && n.has("total_amount") ? n.get("total_amount").asLong() : null;
            return new Lookup(text(n, "pidx"), text(n, "status"), amount, text(n, "purchase_order_id"), text(n, "transaction_id"), n == null ? null : n.toString());
        } catch (KhaltiClientException e) { throw e;
        } catch (RestClientResponseException e) {
            String raw = sanitize(e.getResponseBodyAsString());
            throw new KhaltiClientException("Khalti verification failed (HTTP " + e.getStatusCode().value() + "): " + providerMessage(raw), e.getStatusCode().value(), raw, e);
        } catch (Exception e) { throw new KhaltiClientException("Khalti payment verification failed", null, null, e); }
    }
    private void ensureReady() { if (!properties.isEnabled() || properties.getSecretKey() == null || properties.getSecretKey().isBlank()) throw new KhaltiClientException("Khalti payments are not available"); }
    private static String text(JsonNode n, String key) { return n != null && n.hasNonNull(key) ? n.get(key).asText() : null; }
    private static String safe(String s) { return s == null ? "" : s; }
    private static KhaltiClientException incomplete(String field, String raw) {
        return new KhaltiClientException("Khalti returned an incomplete payment response: missing " + field, 200, raw);
    }
    private String sanitize(JsonNode node) {
        if (node == null) return null;
        JsonNode copy = node.deepCopy();
        redact(copy);
        return limit(copy.toString());
    }
    private String sanitize(String body) {
        if (body == null || body.isBlank()) return null;
        try { return sanitize(mapper.readTree(body)); }
        catch (Exception ignored) { return limit(body.replaceAll("(?i)(authorization|secret|password|token)\\s*[:=]\\s*[^,}\\s]+", "$1=[REDACTED]")); }
    }
    private static void redact(JsonNode node) {
        if (node == null) return;
        if (node.isObject()) {
            Iterator<Entry<String, JsonNode>> fields = node.fields();
            while (fields.hasNext()) {
                Entry<String, JsonNode> field = fields.next();
                if (field.getKey().matches("(?i).*(authorization|secret|password|token|credential).*$")) ((com.fasterxml.jackson.databind.node.ObjectNode) node).put(field.getKey(), "[REDACTED]");
                else redact(field.getValue());
            }
        } else if (node.isArray()) node.forEach(KhaltiRestClient::redact);
    }
    private static String providerMessage(String raw) {
        if (raw == null || raw.isBlank()) return "provider rejected the request";
        try {
            JsonNode n = new ObjectMapper().readTree(raw);
            for (String key : new String[]{"detail", "message", "error", "error_key", "non_field_errors"}) {
                JsonNode value = n.get(key);
                if (value != null && !value.isNull()) return limit(value.isArray() && !value.isEmpty() ? value.get(0).asText() : value.asText());
            }
            Iterator<Entry<String, JsonNode>> fields = n.fields();
            if (fields.hasNext()) { Entry<String, JsonNode> first = fields.next(); return limit(first.getKey() + ": " + first.getValue().toString()); }
        } catch (Exception ignored) {}
        return "provider rejected the request";
    }
    private static String limit(String value) { return value == null ? null : value.substring(0, Math.min(value.length(), 4000)); }
}
