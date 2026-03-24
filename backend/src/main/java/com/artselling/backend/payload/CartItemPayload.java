package com.artselling.backend.payload;

public class CartItemPayload {
    private ArtworkIdPayload artwork;
    private int quantity;

    public ArtworkIdPayload getArtwork() {
        return artwork;
    }

    public void setArtwork(ArtworkIdPayload artwork) {
        this.artwork = artwork;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
