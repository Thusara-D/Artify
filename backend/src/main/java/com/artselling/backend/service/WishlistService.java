package com.artselling.backend.service;

import com.artselling.backend.entity.Artwork;
import com.artselling.backend.entity.User;
import com.artselling.backend.entity.WishlistFolder;
import com.artselling.backend.entity.WishlistItem;
import com.artselling.backend.repository.ArtworkRepository;
import com.artselling.backend.repository.UserRepository;
import com.artselling.backend.repository.WishlistFolderRepository;
import com.artselling.backend.repository.WishlistItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WishlistService {

    @Autowired
    private WishlistFolderRepository folderRepository;

    @Autowired
    private WishlistItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ArtworkRepository artworkRepository;

    @Autowired
    private ActivityLogService activityLogService;

    public List<WishlistFolder> getUserFolders(Long userId) {
        return folderRepository.findByUserId(userId);
    }

    public WishlistFolder createFolder(Long userId, String folderName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        WishlistFolder folder = new WishlistFolder(folderName, user);
        return folderRepository.save(folder);
    }

    @Transactional
    public void deleteFolder(Long folderId) {
        folderRepository.deleteById(folderId);
    }

    @Transactional
    public WishlistItem addItemToFolder(Long folderId, Long artworkId, String username) {
        WishlistFolder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Folder not found"));
        Artwork artwork = artworkRepository.findById(artworkId)
                .orElseThrow(() -> new RuntimeException("Artwork not found"));

        // Optional: Check if already exists in folder
        if (itemRepository.findByFolderIdAndArtworkId(folderId, artworkId).isPresent()) {
            throw new RuntimeException("Item already in wishlist folder");
        }

        WishlistItem item = new WishlistItem(folder, artwork);
        WishlistItem savedItem = itemRepository.save(item);

        activityLogService.log("ADD_TO_WISHLIST", username,
                "Added " + artwork.getTitle() + " to folder " + folder.getName());

        return savedItem;
    }

    @Transactional
    public void removeItemFromFolder(Long itemId) {
        itemRepository.deleteById(itemId);
    }

    @Transactional
    public WishlistItem moveItem(Long itemId, Long targetFolderId) {
        WishlistItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Wishlist item not found"));
        WishlistFolder targetFolder = folderRepository.findById(targetFolderId)
                .orElseThrow(() -> new RuntimeException("Target folder not found"));

        item.setFolder(targetFolder);
        return itemRepository.save(item);
    }
}
