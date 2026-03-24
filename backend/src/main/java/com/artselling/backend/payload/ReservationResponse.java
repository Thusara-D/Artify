package com.artselling.backend.payload;

import java.time.LocalDateTime;

public class ReservationResponse {
    private String message;
    private LocalDateTime expiresAt;

    public ReservationResponse() {
    }

    public ReservationResponse(String message, LocalDateTime expiresAt) {
        this.message = message;
        this.expiresAt = expiresAt;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
}
