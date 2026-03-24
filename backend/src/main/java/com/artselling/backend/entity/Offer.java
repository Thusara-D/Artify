package com.artselling.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "offers")
public class Offer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artwork_id")
    private Artwork artwork;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id")
    private User artist;

    private BigDecimal offeringPrice;

    @Enumerated(EnumType.STRING)
    private OfferStatus status = OfferStatus.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Offer() {
    }

    public Offer(Long id, Artwork artwork, User customer, User artist, BigDecimal offeringPrice, OfferStatus status,
            LocalDateTime createdAt) {
        this.id = id;
        this.artwork = artwork;
        this.customer = customer;
        this.artist = artist;
        this.offeringPrice = offeringPrice;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Artwork getArtwork() {
        return artwork;
    }

    public void setArtwork(Artwork artwork) {
        this.artwork = artwork;
    }

    public User getCustomer() {
        return customer;
    }

    public void setCustomer(User customer) {
        this.customer = customer;
    }

    public User getArtist() {
        return artist;
    }

    public void setArtist(User artist) {
        this.artist = artist;
    }

    public BigDecimal getOfferingPrice() {
        return offeringPrice;
    }

    public void setOfferingPrice(BigDecimal offeringPrice) {
        this.offeringPrice = offeringPrice;
    }

    public OfferStatus getStatus() {
        return status;
    }

    public void setStatus(OfferStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public enum OfferStatus {
        PENDING, ACCEPTED, REJECTED
    }
}
