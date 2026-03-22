package com.artselling.backend.payload;

import java.util.List;

public class ReservationRequest {
    private List<CartItemPayload> items;

    public List<CartItemPayload> getItems() {
        return items;
    }

    public void setItems(List<CartItemPayload> items) {
        this.items = items;
    }
}
