package com.codesage.web;

import org.springframework.http.HttpStatus;

/** Exception carrying a safe, user-facing message and HTTP status. */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
