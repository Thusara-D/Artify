package com.artselling.backend.controller;

import com.artselling.backend.entity.User;
import com.artselling.backend.service.ActivityLogService;
import com.artselling.backend.service.ArtworkService;
import com.artselling.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private ArtworkService artworkService;

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private com.artselling.backend.repository.OrderRepository orderRepository;

    @Autowired
    private com.artselling.backend.repository.OfferRepository offerRepository;

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> setUserStatus(@PathVariable Long id, @RequestParam boolean active) {
        userService.setUserActiveStatus(id, active);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userService.getUserCount());
        stats.put("totalArtworks", artworkService.getAllArtworks().size());
        stats.put("lowStockCount", artworkService.getLowStockArtworks().size());

        List<com.artselling.backend.entity.Order> allOrders = orderRepository.findAll();
        double orderRevenue = allOrders.stream()
                .filter(o -> o.getTotalAmount() != null)
                .mapToDouble(o -> o.getTotalAmount().doubleValue())
                .sum();

        List<com.artselling.backend.entity.Offer> acceptedOffers = offerRepository.findAll().stream()
                .filter(o -> o.getStatus() == com.artselling.backend.entity.Offer.OfferStatus.ACCEPTED)
                .filter(o -> o.getOfferingPrice() != null)
                .toList();

        double offerRevenue = acceptedOffers.stream()
                .mapToDouble(o -> o.getOfferingPrice().doubleValue())
                .sum();

        stats.put("totalSales", allOrders.size() + acceptedOffers.size());
        stats.put("totalRevenue", orderRevenue + offerRevenue);
        stats.put("recentLogs", activityLogService.getRecentLogs());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/logs")
    public List<?> getAllLogs() {
        return activityLogService.getRecentLogs();
    }
}
