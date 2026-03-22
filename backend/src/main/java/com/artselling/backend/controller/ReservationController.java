package com.artselling.backend.controller;

import com.artselling.backend.entity.User;
import com.artselling.backend.payload.ReservationRequest;
import com.artselling.backend.payload.ReservationResponse;
import com.artselling.backend.repository.UserRepository;
import com.artselling.backend.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/create")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createReservation(@RequestBody ReservationRequest request, Principal principal) {
        try {
            User user = userRepository.findByUsername(principal.getName()).get();
            LocalDateTime expiresAt = reservationService.reserveItems(user, request.getItems());
            return ResponseEntity.ok(new ReservationResponse("Reservation created successfully", expiresAt));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
