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
        // Simple recommendation logic: Top 5 latest artworks for now
        // In a real app, this would use user preferences/history
        return artworkRepository.findAll().stream()
                .filter(a -> !a.isDeleted())
                .limit(5)
                .collect(Collectors.toList());
    }

    public List<Artwork> getLowStockArtworks() {
        return artworkRepository.findAll().stream()
                .filter(a -> !a.isDeleted() && a.getStockQuantity() <= a.getMinStockThreshold())
                .collect(Collectors.toList());
    }
}
