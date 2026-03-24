package com.artselling.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseRepair implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Fix strict ENUM types preventing the saving of new statuses
            jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN status VARCHAR(255)");
            System.out.println("Successfully altered 'orders' table to use VARCHAR for status.");
        } catch (Exception e) {
            System.out.println("Notice: Could not alter 'orders' table: " + e.getMessage());
        }
    }
}
