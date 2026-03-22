package com.artselling.backend.repository;

import com.artselling.backend.entity.WishlistFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WishlistFolderRepository extends JpaRepository<WishlistFolder, Long> {
    List<WishlistFolder> findByUserId(Long userId);
}
