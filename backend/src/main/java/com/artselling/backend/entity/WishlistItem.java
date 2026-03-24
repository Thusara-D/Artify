package com.artselling.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "wishlist_items")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class WishlistItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id")
    private WishlistFolder folder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artwork_id")
    private Artwork artwork;

    private LocalDateTime addedAt;

    public WishlistItem() {
        this.addedAt = LocalDateTime.now();
    }

    public WishlistItem(WishlistFolder folder, Artwork artwork) {
        this();
        this.folder = folder;
        this.artwork = artwork;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public WishlistFolder getFolder() {
        return folder;
    }

    public void setFolder(WishlistFolder folder) {
        this.folder = folder;
    }

    public Artwork getArtwork() {
        return artwork;
    }

    public void setArtwork(Artwork artwork) {
        this.artwork = artwork;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
}
