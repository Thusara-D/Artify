package com.artselling.backend.repository;

import com.artselling.backend.entity.Offer;
import com.artselling.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {
    @Query("SELECT o FROM Offer o JOIN FETCH o.artwork JOIN FETCH o.customer JOIN FETCH o.artist WHERE o.customer = :customer")
    List<Offer> findByCustomer(@Param("customer") User customer);

    @Query("SELECT o FROM Offer o JOIN FETCH o.artwork JOIN FETCH o.customer JOIN FETCH o.artist WHERE o.artist = :artist")
    List<Offer> findByArtist(@Param("artist") User artist);

    @org.springframework.lang.NonNull
    @Query("SELECT o FROM Offer o JOIN FETCH o.artwork JOIN FETCH o.customer JOIN FETCH o.artist")
    List<Offer> findAll();

    long countByStatus(Offer.OfferStatus status);
}
