package com.artselling.backend.service;

import com.artselling.backend.entity.Artwork;
import com.artselling.backend.repository.ArtworkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ArtworkService {

    @Autowired
    private ArtworkRepository artworkRepository;

    @Autowired
    private RecommendationService recommendationService;

    public List<Artwork> getAllArtworks() {
        return artworkRepository.findByDeletedFalse();
    }

    public Artwork getArtworkById(Long id) {
        return artworkRepository.findById(id).orElseThrow(() -> new RuntimeException("Artwork not found"));
    }

    public Artwork saveArtwork(Artwork artwork) {
        return artworkRepository.save(artwork);
    }

    public void deleteArtwork(Long id) {
        artworkRepository.deleteById(id);
    }

    public List<Artwork> searchArtworks(String keyword) {
        return artworkRepository.searchArtworks(keyword);
    }

    public List<Artwork> getRecommendations(Long userId) {
        return recommendationService.getRuleBasedRecommendations(userId);
    }

    public List<Artwork> getLowStockArtworks() {
        return artworkRepository.findAll().stream()
                .filter(a -> !a.isDeleted() && a.getStockQuantity() <= a.getMinStockThreshold())
                .collect(Collectors.toList());
    }
}
