package com.artselling.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ArtSellingApplication {

    public static void main(String[] args) {
        SpringApplication.run(ArtSellingApplication.class, args);
    }

}
