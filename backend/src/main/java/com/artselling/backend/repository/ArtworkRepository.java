package com.artselling.backend.repository;

import com.artselling.backend.entity.Artwork;
import com.artselling.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArtworkRepository extends JpaRepository<Artwork, Long> {
    List<Artwork> findByArtist(User artist);

    List<Artwork> findByCategory(String category);

    @Query("SELECT a FROM Artwork a WHERE a.title LIKE %:keyword% OR a.category LIKE %:keyword%")
    List<Artwork> searchArtworks(@Param("keyword") String keyword);

    @Query("SELECT a FROM Artwork a LEFT JOIN FETCH a.artist WHERE a.deleted = false")
    List<Artwork> findByDeletedFalse();
}
