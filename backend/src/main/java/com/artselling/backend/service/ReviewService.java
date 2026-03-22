package com.artselling.backend.service;

import com.artselling.backend.entity.*;
import com.artselling.backend.repository.ArtworkRepository;
import com.artselling.backend.repository.OrderRepository;
import com.artselling.backend.repository.ReviewRepository;
import com.artselling.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ArtworkRepository artworkRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ActivityLogService activityLogService;

    public List<Review> getReviewsByArtwork(Long artworkId) {
        return reviewRepository.findByArtworkId(artworkId);
    }

    public Double getAverageRating(Long artworkId) {
        Double avg = reviewRepository.getAverageRatingByArtworkId(artworkId);
        return avg != null ? avg : 0.0;
    }

    @Transactional
    public Review postReview(Long userId, Long artworkId, int rating, String comment, MultipartFile image,
            String username) {
        // Verified Purchase Gate
        boolean hasPurchased = orderRepository.findByUserId(userId).stream()
                .filter(order -> order.getStatus() == EOrderStatus.DELIVERED
                        || order.getStatus() == EOrderStatus.PAID || order.getStatus() == EOrderStatus.CONFIRMED)
                .anyMatch(order -> order.getItems().stream()
                        .anyMatch(item -> item.getArtwork().getId().equals(artworkId)));

        if (!hasPurchased) {
            throw new RuntimeException("You must purchase this artwork before reviewing it.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Artwork artwork = artworkRepository.findById(artworkId)
                .orElseThrow(() -> new RuntimeException("Artwork not found"));

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = saveImage(image);
        }

        Review review = new Review(user, artwork, rating, comment, imageUrl);
        Review savedReview = reviewRepository.save(review);

        activityLogService.log("POST_REVIEW", username,
                "Reviewed artwork: " + artwork.getTitle() + " with " + rating + " stars");

        return savedReview;
    }

    private String saveImage(MultipartFile file) {
        try {
            String uploadDir = "uploads/reviews/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            return "/" + uploadDir + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Could not store image file. Error: " + e.getMessage());
        }
    }

    public List<Review> getReviewsByArtworkWithLogging(Long artworkId, String username) {
        List<Review> reviews = reviewRepository.findByArtworkId(artworkId);
        if (username != null && !username.equals("anonymousUser")) {
            activityLogService.log("VIEW_REVIEW", username, "Viewed reviews for artwork ID: " + artworkId);
        }
        return reviews;
    }
}
