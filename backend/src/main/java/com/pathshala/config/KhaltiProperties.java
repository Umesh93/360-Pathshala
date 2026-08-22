//package com.pathshala.config;
//
//import lombok.Getter;
//import lombok.Setter;
//import org.springframework.boot.context.properties.ConfigurationProperties;
//
//@Getter
//@Setter
//@ConfigurationProperties(prefix = "khalti")
//public class KhaltiProperties {
//    private boolean enabled;
//    private String secretKey;
//    private String baseUrl = "https://dev.khalti.com/api/v2";
//    private String websiteUrl = "http://localhost:5173";
//    private String returnUrl = "http://localhost:8080/api/payments/khalti/callback";
//    private int connectTimeoutMs = 3000;
//    private int readTimeoutMs = 8000;
//}

package com.pathshala.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "khalti")
public class KhaltiProperties {

    private boolean enabled;

    private String secretKey;

    private String baseUrl;

    private String websiteUrl;

    private String returnUrl;

    private int connectTimeoutMs = 3000;

    private int readTimeoutMs = 8000;
}
