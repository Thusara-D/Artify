package com.artselling.backend.controller;

import com.artselling.backend.entity.Review;
import com.artselling.backend.payload.response.MessageResponse;
import com.artselling.backend.security.services.UserDetailsImpl;
import com.artselling.backend.service.ReviewService;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/artwork/{artworkId}")
    public ResponseEntity<List<Review>> getArtworkReviews(@PathVariable Long artworkId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null) ? auth.getName() : "anonymousUser";
        return ResponseEntity.ok(reviewService.getReviewsByArtworkWithLogging(artworkId, username));
    }

    @GetMapping("/artwork/{artworkId}/average")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long artworkId) {
        return ResponseEntity.ok(reviewService.getAverageRating(artworkId));
    }

    @PostMapping(value = "/post", consumes = { "multipart/form-data" })
    public ResponseEntity<?> postReview(
            @RequestParam("artworkId") Long artworkId,
            @RequestParam("rating") int rating,
            @RequestParam("comment") String comment,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not authenticated!"));
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        try {
            Review review = reviewService.postReview(
                    userDetails.getId(),
                    artworkId,
                    rating,
                    comment,
                    image,
                    userDetails.getUsername());
            return ResponseEntity.ok(review);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
