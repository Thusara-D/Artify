package com.artselling.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artwork_id")
    private Artwork artwork;

    @Min(1)
    @Max(5)
    private int rating;

    @Column(length = 1000)
    private String comment;

    private String imageUrl;

    private LocalDateTime createdAt;

    public Review() {
        this.createdAt = LocalDateTime.now();
    }

    public Review(User user, Artwork artwork, int rating, String comment, String imageUrl) {
        this();
        this.user = user;
        this.artwork = artwork;
        this.rating = rating;
        this.comment = comment;
        this.imageUrl = imageUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Artwork getArtwork() {
        return artwork;
    }

    public void setArtwork(Artwork artwork) {
        this.artwork = artwork;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
