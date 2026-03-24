package com.artselling.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.util.Set;

@Entity
@Table(name = "artworks")
@SQLDelete(sql = "UPDATE artworks SET deleted = true WHERE id=?")
@SQLRestriction("deleted=false")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Artwork {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private String category;

    @ElementCollection
    @CollectionTable(name = "artwork_tags", joinColumns = @JoinColumn(name = "artwork_id"))
    @Column(name = "tag")
    private Set<String> tags;

    private int stockQuantity;
    private int minStockThreshold;

    private boolean deleted = Boolean.FALSE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id")
    private User artist;

    public Artwork() {
    }

    public Artwork(Long id, String title, String description, BigDecimal price, String imageUrl, String category,
            Set<String> tags, int stockQuantity, int minStockThreshold, boolean deleted, User artist) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.category = category;
        this.tags = tags;
        this.stockQuantity = stockQuantity;
        this.minStockThreshold = minStockThreshold;
        this.deleted = deleted;
        this.artist = artist;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Set<String> getTags() {
        return tags;
    }

    public void setTags(Set<String> tags) {
        this.tags = tags;
    }

    public int getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(int stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public int getMinStockThreshold() {
        return minStockThreshold;
    }

    public void setMinStockThreshold(int minStockThreshold) {
        this.minStockThreshold = minStockThreshold;
    }

    public boolean isDeleted() {
        return deleted;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }

    public User getArtist() {
        return artist;
    }

    public void setArtist(User artist) {
        this.artist = artist;
    }

    public String getStockStatus() {
        if (stockQuantity <= 0)
            return "Out of Stock";
        if (stockQuantity <= minStockThreshold)
            return "Low Stock";
        return "Available";
    }
}
