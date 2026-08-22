package com.pathshala.payment;

public class KhaltiClientException extends RuntimeException {
    private final Integer providerStatus;
    private final String safeResponse;

    public KhaltiClientException(String message) { this(message, null, null, null); }
    public KhaltiClientException(String message, Throwable cause) { this(message, null, null, cause); }
    public KhaltiClientException(String message, Integer providerStatus, String safeResponse) {
        this(message, providerStatus, safeResponse, null);
    }
    public KhaltiClientException(String message, Integer providerStatus, String safeResponse, Throwable cause) {
        super(message, cause);
        this.providerStatus = providerStatus;
        this.safeResponse = safeResponse;
    }

    public Integer getProviderStatus() { return providerStatus; }
    public String getSafeResponse() { return safeResponse; }
}
