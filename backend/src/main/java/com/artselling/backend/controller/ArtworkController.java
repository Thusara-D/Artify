package com.artselling.backend.controller;

import com.artselling.backend.entity.Artwork;
import com.artselling.backend.service.ArtworkService;
import com.artselling.backend.service.FileStorageService;
import com.artselling.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/artworks")
public class ArtworkController {

    @Autowired
    private ArtworkService artworkService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.artselling.backend.service.ActivityLogService activityLogService;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping
    public List<Artwork> getAllArtworks() {
        return artworkService.getAllArtworks();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Artwork> getArtworkById(@PathVariable Long id) {
        return ResponseEntity.ok(artworkService.getArtworkById(id));
    }

    @PostMapping(consumes = { "multipart/form-data" })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createArtwork(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("price") double price,
            @RequestParam("category") String category,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam(value = "stockQuantity", defaultValue = "1") int stockQuantity,
            @RequestParam(value = "minStockThreshold", defaultValue = "0") int minStockThreshold,
            @RequestParam("image") MultipartFile image,
            @RequestParam("artistId") String artistId) {

        if (price <= 0) {
            return ResponseEntity.badRequest().body("Price must be greater than zero.");
        }
        if (stockQuantity <= 0) {
            return ResponseEntity.badRequest().body("Stock quantity must be greater than zero.");
        }
        if (minStockThreshold >= stockQuantity) {
            return ResponseEntity.badRequest().body("Min stock threshold must be less than the stock quantity.");
        }

        try {
            String fileName = fileStorageService.storeFile(image);

            Artwork artwork = new Artwork();
            artwork.setTitle(title);
            artwork.setDescription(description);
            artwork.setPrice(new java.math.BigDecimal(price));
            artwork.setCategory(category);
            artwork.setImageUrl("/uploads/artworks/" + fileName);
            artwork.setStockQuantity(stockQuantity);
            artwork.setMinStockThreshold(minStockThreshold);

            if (tags != null && !tags.isEmpty()) {
                java.util.Set<String> tagSet = new java.util.HashSet<>(java.util.Arrays.asList(tags.split(",")));
                artwork.setTags(tagSet);
            }

            com.artselling.backend.entity.User artist = userRepository.findById(Long.parseLong(artistId)).orElseThrow();
            artwork.setArtist(artist);

            Artwork saved = artworkService.saveArtwork(artwork);
            activityLogService.log("ARTWORK_UPLOAD", artist.getUsername(), "Uploaded new artwork: " + saved.getTitle());

            // Return a simple response to avoid potential serialization issues with
            // lazy-loaded entities
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("message", "Artwork uploaded successfully");
            response.put("id", saved.getId());
            response.put("title", saved.getTitle());
            response.put("imageUrl", saved.getImageUrl());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to upload artwork: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Changed PreAuthorize role
    public ResponseEntity<?> updateArtwork(@PathVariable Long id, @RequestBody Artwork artworkDetails) {
        if (artworkDetails.getPrice().doubleValue() <= 0) {
            return ResponseEntity.badRequest().body("Price must be greater than zero.");
        }
        if (artworkDetails.getStockQuantity() <= 0) {
            return ResponseEntity.badRequest().body("Stock quantity must be greater than zero.");
        }
        if (artworkDetails.getMinStockThreshold() >= artworkDetails.getStockQuantity()) {
            return ResponseEntity.badRequest().body("Min stock threshold must be less than the stock quantity.");
        }

        Artwork artwork = artworkService.getArtworkById(id);
        artwork.setTitle(artworkDetails.getTitle());
        artwork.setDescription(artworkDetails.getDescription());
        artwork.setPrice(artworkDetails.getPrice());
        // artwork.setImageUrl(artworkDetails.getImageUrl()); // Removed this line
        artwork.setCategory(artworkDetails.getCategory());
        artwork.setTags(artworkDetails.getTags());
        artwork.setStockQuantity(artworkDetails.getStockQuantity());
        artwork.setMinStockThreshold(artworkDetails.getMinStockThreshold());

        Artwork updated = artworkService.saveArtwork(artwork); // Capture updated artwork
        activityLogService.log("ARTWORK_UPDATE", "ADMIN", "Updated artwork: " + updated.getTitle()); // Log update
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Changed PreAuthorize role
    public ResponseEntity<?> deleteArtwork(@PathVariable Long id) {
        Artwork artwork = artworkService.getArtworkById(id); // Get artwork before deletion
        artworkService.deleteArtwork(id);
        activityLogService.log("ARTWORK_DELETE", "ADMIN", "Deleted artwork: " + artwork.getTitle()); // Log deletion
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public List<Artwork> searchArtworks(@RequestParam String keyword) {
        return artworkService.searchArtworks(keyword);
    }

    @GetMapping("/recommendations")
    public List<Artwork> getRecommendations(@RequestParam(required = false) Long userId) {
        return artworkService.getRecommendations(userId);
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasRole('ARTIST') or hasRole('ADMIN')")
    public List<Artwork> getLowStockAlerts() {
        return artworkService.getLowStockArtworks();
    }
}
