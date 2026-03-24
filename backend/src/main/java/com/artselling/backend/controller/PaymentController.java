package com.artselling.backend.controller;

import com.artselling.backend.service.PaymentService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody Map<String, Object> data) {
        try {
            // Safely parse number even if it's sent as a decimal from JavaScript
            Long amount = Double.valueOf(data.get("amount").toString()).longValue();
            PaymentIntent paymentIntent = paymentService.createPaymentIntent(amount);

            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", paymentIntent.getClientSecret());
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body("Stripe Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating payment intent: " + e.getMessage());
        }
    }
}
