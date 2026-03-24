package com.artselling.backend.repository;

import com.artselling.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByArtworkId(Long artworkId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.artwork.id = :artworkId")
    Double getAverageRatingByArtworkId(Long artworkId);

    boolean existsByUserIdAndArtworkId(Long userId, Long artworkId);
}
