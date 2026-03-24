package com.artselling.backend.service;

import com.artselling.backend.entity.Artwork;
import com.artselling.backend.entity.Order;
import com.artselling.backend.entity.OrderItem;
import com.artselling.backend.entity.User;
import com.artselling.backend.repository.ArtworkRepository;
import com.artselling.backend.repository.OrderRepository;
import com.artselling.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ArtworkRepository artworkRepository;

    public List<Artwork> getRuleBasedRecommendations(Long userId) {
        List<Artwork> allArtworks = artworkRepository.findByDeletedFalse();

        if (userId == null) {
            return getFallbackRecommendations(allArtworks);
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return getFallbackRecommendations(allArtworks);
        }

        User user = userOpt.get();
        List<Order> userOrders = orderRepository.findByUserOrderByOrderDateDesc(user);
        if (userOrders == null || userOrders.isEmpty()) {
            return getFallbackRecommendations(allArtworks);
        }

        // Rule 1 & 2: Category and Artist Affinities
        Map<String, Integer> categoryFrequency = new HashMap<>();
        Map<Long, Integer> artistFrequency = new HashMap<>();
        List<BigDecimal> prices = new ArrayList<>();
        Set<Long> purchasedArtworkIds = new HashSet<>();

        for (Order order : userOrders) {
            for (OrderItem item : order.getItems()) {
                Artwork art = item.getArtwork();
                purchasedArtworkIds.add(art.getId());

                if (art.getCategory() != null) {
                    categoryFrequency.put(art.getCategory(), categoryFrequency.getOrDefault(art.getCategory(), 0) + 1);
                }
                if (art.getArtist() != null) {
                    artistFrequency.put(art.getArtist().getId(),
                            artistFrequency.getOrDefault(art.getArtist().getId(), 0) + 1);
                }
                if (art.getPrice() != null) {
                    prices.add(art.getPrice());
                }
            }
        }

        // Calculate average price for Rule 3
        BigDecimal avgPrice = BigDecimal.ZERO;
        if (!prices.isEmpty()) {
            BigDecimal sum = prices.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
            avgPrice = sum.divide(new BigDecimal(prices.size()), java.math.RoundingMode.HALF_UP);
        }

        BigDecimal lowerPriceBound = avgPrice.multiply(new BigDecimal("0.7"));
        BigDecimal upperPriceBound = avgPrice.multiply(new BigDecimal("1.3"));

        // Score artworks based on rules
        Map<Artwork, Integer> scores = new HashMap<>();
        for (Artwork artwork : allArtworks) {
            if (purchasedArtworkIds.contains(artwork.getId()) || artwork.getStockQuantity() <= 0) {
                continue; // Do not recommend purchased or out of stock items
            }

            int score = 0;
            // Category Affinity
            if (artwork.getCategory() != null && categoryFrequency.containsKey(artwork.getCategory())) {
                score += categoryFrequency.get(artwork.getCategory()) * 5;
            }

            // Artist Affinity
            if (artwork.getArtist() != null && artistFrequency.containsKey(artwork.getArtist().getId())) {
                score += artistFrequency.get(artwork.getArtist().getId()) * 8;
            }

            // Price Tolerance Rule
            if (avgPrice.compareTo(BigDecimal.ZERO) > 0 && artwork.getPrice() != null) {
                if (artwork.getPrice().compareTo(lowerPriceBound) >= 0
                        && artwork.getPrice().compareTo(upperPriceBound) <= 0) {
                    score += 10;
                }
            }

            if (score > 0) {
                scores.put(artwork, score);
            }
        }

        if (scores.isEmpty()) {
            return getFallbackRecommendations(allArtworks);
        }

        return scores.entrySet().stream()
                .sorted(Map.Entry.<Artwork, Integer>comparingByValue().reversed())
                .map(Map.Entry::getKey)
                .limit(8)
                .collect(Collectors.toList());
    }

    private List<Artwork> getFallbackRecommendations(List<Artwork> allArtworks) {
        return allArtworks.stream()
                .filter(a -> a.getStockQuantity() > 0)
                // Assuming newer artworks have higher IDs roughly, or random
                .sorted((a1, a2) -> a2.getId().compareTo(a1.getId()))
                .limit(8)
                .collect(Collectors.toList());
    }
}
