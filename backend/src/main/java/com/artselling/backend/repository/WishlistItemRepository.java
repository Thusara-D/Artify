package com.artselling.backend.repository;

import com.artselling.backend.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByFolderId(Long folderId);

    Optional<WishlistItem> findByFolderIdAndArtworkId(Long folderId, Long artworkId);
}
