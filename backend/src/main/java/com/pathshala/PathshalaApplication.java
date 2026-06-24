package com.pathshala;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
@EnableJpaRepositories(considerNestedRepositories = true)
@SpringBootApplication
public class PathshalaApplication {
    public static void main(String[] args) {
        SpringApplication.run(PathshalaApplication.class, args);
    }
}
