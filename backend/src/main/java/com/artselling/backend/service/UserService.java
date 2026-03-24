package com.artselling.backend.service;

import com.artselling.backend.entity.User;
import com.artselling.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateProfile(Long id, User userDetails) {
        User user = getUserById(id);

        if (userDetails.getPhone() != null && !userDetails.getPhone().trim().isEmpty()) {
            if (!userDetails.getPhone().matches("^\\d{10}$")) {
                throw new RuntimeException("Phone number must be exactly 10 digits.");
            }
        }

        user.setAddress(userDetails.getAddress());
        user.setPhone(userDetails.getPhone());
        user.setProfilePicture(userDetails.getProfilePicture());
        return userRepository.save(user);
    }

    public void setUserActiveStatus(Long id, boolean active) {
        User user = getUserById(id);
        user.setActive(active);
        userRepository.save(user);
    }

    public long getUserCount() {
        return userRepository.count();
    }
}
