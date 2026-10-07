package com.bakery.cottage.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class AccountUnverifiedException extends RuntimeException {
    private final String email;

    public AccountUnverifiedException(String message, String email) {
        super(message);
        this.email = email;
    }

    public String getEmail() {
        return email;
    }
}
