package com.artselling.backend.controller;

import com.artselling.backend.entity.Wishlist;
import com.artselling.backend.payload.response.MessageResponse;
import com.artselling.backend.security.services.UserDetailsImpl;
import com.artselling.backend.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping("/my-list")
    public ResponseEntity<?> getMyWishlist() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not authenticated!"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        try {
            List<Wishlist> wishlist = wishlistService.getUserWishlist(userDetails.getId());
            return ResponseEntity.ok(wishlist);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/add/{artworkId}")
    public ResponseEntity<?> addToWishlist(@PathVariable Long artworkId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not authenticated!"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        try {
            Wishlist wishlist = wishlistService.addArtworkToWishlist(userDetails.getId(), artworkId);
            return ResponseEntity.ok(wishlist);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/remove/{wishlistId}")
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long wishlistId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not authenticated!"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        try {
            wishlistService.removeFromWishlist(wishlistId, userDetails.getId());
            return ResponseEntity.ok(new MessageResponse("Artwork removed from wishlist successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
