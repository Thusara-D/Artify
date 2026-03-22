package com.artselling.backend.config;

import com.artselling.backend.entity.ERole;
import com.artselling.backend.entity.Role;
import com.artselling.backend.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    com.artselling.backend.repository.UserRepository userRepository;

    @Autowired
    org.springframework.security.crypto.password.PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize Roles
        if (!roleRepository.findByName(ERole.ROLE_CUSTOMER).isPresent()) {
            roleRepository.save(new Role(ERole.ROLE_CUSTOMER));
        }
        if (!roleRepository.findByName(ERole.ROLE_ARTIST).isPresent()) {
            roleRepository.save(new Role(ERole.ROLE_ARTIST));
        }
        if (!roleRepository.findByName(ERole.ROLE_ADMIN).isPresent()) {
            roleRepository.save(new Role(ERole.ROLE_ADMIN));
        }

        // Initialize Admin User
        com.artselling.backend.entity.User admin = userRepository.findByUsername("admin")
                .orElse(new com.artselling.backend.entity.User());

        if (admin.getId() == null) {
            admin.setUsername("admin");
            admin.setEmail("admin@artgallery.com");
            admin.setAddress("Artist Studio, Galle");
            admin.setPhone("+94 11 222 3333");
        }

        // Always force the password to 'admin123'
        admin.setPassword(encoder.encode("admin123"));

        java.util.Set<Role> roles = new java.util.HashSet<>();
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN).orElseThrow();
        roles.add(adminRole);
        admin.setRoles(roles);

        userRepository.save(admin);
        System.out.println("Admin user credentials (re)initialized successfully!");
    }
}
