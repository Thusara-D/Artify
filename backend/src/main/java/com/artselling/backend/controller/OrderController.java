package com.artselling.backend.controller;

import com.artselling.backend.entity.Order;
import com.artselling.backend.entity.User;
import com.artselling.backend.service.OrderService;
import com.artselling.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> placeOrder(@RequestBody Order order, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).get();
        order.setUser(user);
        try {
            Order savedOrder = orderService.placeOrder(order);
            return ResponseEntity.ok(savedOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<Order>> getCustomerOrderHistory(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).get();
        return ResponseEntity.ok(orderService.getOrdersByUser(user));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getAllOrdersForAdmin() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<Order> getOrderDetails(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/{id}/confirm-shipment")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> confirmAndGenerateShipment(@PathVariable Long id, @RequestParam(required = false) String deliveryDate) {
        try {
            Order updatedOrder = orderService.confirmAndGenerateShipment(id, deliveryDate);
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        try {
            String status = payload.get("status");
            if (status == null) {
                return ResponseEntity.badRequest().body("Status is required");
            }
            Order updatedOrder = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/shipping-info")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateShippingInfo(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        try {
            String address = payload.get("address");
            String phoneNumber = payload.get("phoneNumber");
            Order updatedOrder = orderService.updateShippingAddress(id, address, phoneNumber);
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        try {
            Order cancelledOrder = orderService.cancelOrder(id);
            return ResponseEntity.ok(cancelledOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
