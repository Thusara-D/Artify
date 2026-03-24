package com.artselling.backend.controller;

import com.artselling.backend.entity.Offer;
import com.artselling.backend.entity.User;
import com.artselling.backend.repository.OfferRepository;
import com.artselling.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offers")
public class OfferController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.artselling.backend.repository.ArtworkRepository artworkRepository;

    @Autowired
    private OfferRepository offerRepository;

    @Autowired
    private com.artselling.backend.service.ActivityLogService activityLogService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public Offer createOffer(@RequestBody Offer offer) {
        if (offer.getArtwork() == null || offer.getArtwork().getId() == null)
            throw new IllegalArgumentException("Artwork ID required");
        if (offer.getCustomer() == null || offer.getCustomer().getId() == null)
            throw new IllegalArgumentException("Customer ID required");
        if (offer.getArtist() == null || offer.getArtist().getId() == null)
            throw new IllegalArgumentException("Artist ID required");

        // Resolve entities from DB to avoid transient issues
        offer.setArtwork(artworkRepository.findById(offer.getArtwork().getId()).orElseThrow());
        offer.setCustomer(userRepository.findById(offer.getCustomer().getId()).orElseThrow());
        offer.setArtist(userRepository.findById(offer.getArtist().getId()).orElseThrow());

        Offer saved = offerRepository.save(offer);
        activityLogService.log("OFFER_CREATED", saved.getCustomer().getUsername(),
                "Created a new offer for artwork: " + saved.getArtwork().getTitle());
        return saved;
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Offer> getAllOffers() {
        return offerRepository.findAll();
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public List<Offer> getMyOffers(java.security.Principal principal) {
        User customer = userRepository.findByUsername(principal.getName()).orElseThrow();
        return offerRepository.findByCustomer(customer);
    }

    @GetMapping("/artist/{artistId}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Offer> getArtistOffers(@PathVariable Long artistId) {
        User artist = userRepository.findById(artistId).orElseThrow();
        return offerRepository.findByArtist(artist);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOfferStatus(@PathVariable Long id, @RequestParam Offer.OfferStatus status) {
        Offer offer = offerRepository.findById(id).orElseThrow();
        offer.setStatus(status);
        offerRepository.save(offer);

        String action = status == Offer.OfferStatus.ACCEPTED ? "SALE" : "OFFER_UPDATE";
        activityLogService.log(action, "ADMIN",
                "Offer status updated to: " + status + " for artwork: " + offer.getArtwork().getTitle());

        return ResponseEntity.ok().build();
    }
}
