package com.artselling.backend.service;

import com.artselling.backend.entity.Artwork;
import com.artselling.backend.entity.User;
import com.artselling.backend.entity.Wishlist;
import com.artselling.backend.repository.ArtworkRepository;
import com.artselling.backend.repository.UserRepository;
import com.artselling.backend.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ArtworkRepository artworkRepository;

    public List<Wishlist> getUserWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId);
    }

    @Transactional
    public Wishlist addArtworkToWishlist(Long userId, Long artworkId) {
        if (wishlistRepository.findByUserIdAndArtworkId(userId, artworkId).isPresent()) {
            throw new RuntimeException("Artwork already in wishlist");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Artwork artwork = artworkRepository.findById(artworkId)
                .orElseThrow(() -> new RuntimeException("Artwork not found"));

        Wishlist wishlist = new Wishlist(user, artwork);
        return wishlistRepository.save(wishlist);
    }

    @Transactional
    public void removeFromWishlist(Long wishlistId, Long userId) {
        Wishlist wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new RuntimeException("Wishlist item not found"));

        if (!wishlist.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only remove items from your own wishlist.");
        }

        wishlistRepository.delete(wishlist);
    }
}
