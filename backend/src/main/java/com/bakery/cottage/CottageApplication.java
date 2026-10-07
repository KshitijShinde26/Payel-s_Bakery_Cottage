package com.bakery.cottage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class CottageApplication {
    public static void main(String[] args) {
        SpringApplication.run(CottageApplication.class, args);
    }
}
