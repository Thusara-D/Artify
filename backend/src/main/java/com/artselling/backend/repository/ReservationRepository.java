package com.artselling.backend.repository;

import com.artselling.backend.entity.Artwork;
import com.artselling.backend.entity.EReservationStatus;
import com.artselling.backend.entity.Reservation;
import com.artselling.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByStatusAndExpiresAtBefore(EReservationStatus status, LocalDateTime now);

    Optional<Reservation> findByUserAndArtworkAndStatus(User user, Artwork artwork, EReservationStatus status);

    List<Reservation> findByUserAndStatus(User user, EReservationStatus status);
}
