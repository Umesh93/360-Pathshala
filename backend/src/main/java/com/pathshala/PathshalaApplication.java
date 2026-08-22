package com.pathshala;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import com.pathshala.config.KhaltiProperties;

@EnableScheduling
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
@EnableJpaRepositories(considerNestedRepositories = true)
@SpringBootApplication
@EnableConfigurationProperties(KhaltiProperties.class)
public class PathshalaApplication {
    public static void main(String[] args) {
        SpringApplication.run(PathshalaApplication.class, args);
    }
}
