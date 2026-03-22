package com.artselling.backend.controller;

import com.artselling.backend.entity.WishlistFolder;
import com.artselling.backend.entity.WishlistItem;
import com.artselling.backend.payload.request.FolderRequest;
import com.artselling.backend.payload.response.MessageResponse;
import com.artselling.backend.security.services.UserDetailsImpl;
import com.artselling.backend.service.WishlistService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping("/folders")
    public ResponseEntity<?> getUserFolders() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not authenticated!"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return ResponseEntity.ok(wishlistService.getUserFolders(userDetails.getId()));
    }

    @PostMapping("/folders")
    public ResponseEntity<?> createFolder(@Valid @RequestBody FolderRequest folderRequest) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not authenticated!"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        WishlistFolder folder = wishlistService.createFolder(userDetails.getId(), folderRequest.getName());
        return ResponseEntity.ok(folder);
    }

    @DeleteMapping("/folders/{folderId}")
    public ResponseEntity<?> deleteFolder(@PathVariable Long folderId) {
        wishlistService.deleteFolder(folderId);
        return ResponseEntity.ok(new MessageResponse("Folder deleted successfully!"));
    }

    @PostMapping("/folders/{folderId}/add/{artworkId}")
    public ResponseEntity<?> addItem(@PathVariable Long folderId, @PathVariable Long artworkId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not authenticated!"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        try {
            WishlistItem item = wishlistService.addItemToFolder(folderId, artworkId, userDetails.getUsername());
            return ResponseEntity.ok(item);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<?> removeItem(@PathVariable Long itemId) {
        wishlistService.removeItemFromFolder(itemId);
        return ResponseEntity.ok(new MessageResponse("Item removed from wishlist!"));
    }

    @PutMapping("/items/{itemId}/move/{targetFolderId}")
    public ResponseEntity<?> moveItem(@PathVariable Long itemId, @PathVariable Long targetFolderId) {
        try {
            WishlistItem item = wishlistService.moveItem(itemId, targetFolderId);
            return ResponseEntity.ok(item);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
