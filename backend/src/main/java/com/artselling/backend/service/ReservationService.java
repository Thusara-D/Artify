package com.artselling.backend.service;

import com.artselling.backend.entity.Artwork;
import com.artselling.backend.entity.EReservationStatus;
import com.artselling.backend.entity.Reservation;
import com.artselling.backend.entity.User;
import com.artselling.backend.payload.CartItemPayload;
import com.artselling.backend.repository.ArtworkRepository;
import com.artselling.backend.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ArtworkRepository artworkRepository;

    @Transactional
    public LocalDateTime reserveItems(User user, List<CartItemPayload> items) {
        // Clear any existing active reservations for this user and restore stock
        List<Reservation> activeReservations = reservationRepository.findByUserAndStatus(user,
                EReservationStatus.ACTIVE);
        for (Reservation res : activeReservations) {
            Artwork artwork = res.getArtwork();
            artwork.setStockQuantity(artwork.getStockQuantity() + res.getQuantity());
            artworkRepository.save(artwork);
            res.setStatus(EReservationStatus.EXPIRED);
            reservationRepository.save(res);
        }

        // Create new reservations
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);
        for (CartItemPayload item : items) {
            Long artworkId = item.getArtwork().getId();
            Artwork artwork = artworkRepository.findById(artworkId)
                    .orElseThrow(() -> new RuntimeException("Artwork not found: " + artworkId));

            if (artwork.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for artwork: " + artwork.getTitle());
            }

            // Subtract stock
            artwork.setStockQuantity(artwork.getStockQuantity() - item.getQuantity());
            artworkRepository.save(artwork);

            // Save reservation
            Reservation reservation = new Reservation(user, artwork, item.getQuantity(), expiresAt,
                    EReservationStatus.ACTIVE);
            reservationRepository.save(reservation);
        }

        return expiresAt;
    }

    @Scheduled(fixedRate = 60000) // Runs every minute
    @Transactional
    public void cleanupExpiredReservations() {
        List<Reservation> expiredReservations = reservationRepository
                .findByStatusAndExpiresAtBefore(EReservationStatus.ACTIVE, LocalDateTime.now());
        for (Reservation res : expiredReservations) {
            // Restore stock
            Artwork artwork = res.getArtwork();
            artwork.setStockQuantity(artwork.getStockQuantity() + res.getQuantity());
            artworkRepository.save(artwork);

            // Mark as expired
            res.setStatus(EReservationStatus.EXPIRED);
            reservationRepository.save(res);
        }
    }
}
