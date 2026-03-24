package com.artselling.backend.service;

import com.artselling.backend.entity.Artwork;
import com.artselling.backend.entity.EOrderStatus;
import com.artselling.backend.entity.Order;
import com.artselling.backend.entity.OrderItem;
import com.artselling.backend.entity.User;
import com.artselling.backend.repository.ArtworkRepository;
import com.artselling.backend.repository.OrderRepository;
import com.artselling.backend.repository.ReservationRepository;
import com.artselling.backend.entity.Reservation;
import com.artselling.backend.entity.EReservationStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ArtworkRepository artworkRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private EmailService emailService;

    @Transactional
    public Order placeOrder(Order order) {
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItem item : order.getItems()) {
            Long artworkId = item.getArtwork().getId();
            if (artworkId == null)
                throw new RuntimeException("Artwork ID is null");
            Artwork artwork = artworkRepository.findById(artworkId)
                    .orElseThrow(() -> new RuntimeException("Artwork not found with id: " + item.getArtwork().getId()));

            // Check for active reservation
            Optional<Reservation> optRes = reservationRepository.findByUserAndArtworkAndStatus(order.getUser(), artwork,
                    EReservationStatus.ACTIVE);
            if (optRes.isPresent() && optRes.get().getQuantity() >= item.getQuantity()) {
                // Consume reservation stock
                Reservation res = optRes.get();
                res.setQuantity(res.getQuantity() - item.getQuantity());
                if (res.getQuantity() == 0) {
                    res.setStatus(EReservationStatus.CONSUMED);
                }
                reservationRepository.save(res);
                // DO NOT subtract stock again, as it was subtracted during reservation
            } else {
                // Normal validation and stock reduction
                if (artwork.getStockQuantity() < item.getQuantity()) {
                    throw new RuntimeException("Insufficient stock for: " + artwork.getTitle());
                }
                artwork.setStockQuantity(artwork.getStockQuantity() - item.getQuantity());
                artworkRepository.save(artwork);
            }

            // Associate the full artwork entity
            item.setArtwork(artwork);

            // Use provided price (for negotiated offers) or fallback to catalog price
            if (item.getPrice() == null || item.getPrice().doubleValue() <= 0) {
                item.setPrice(artwork.getPrice());
            }

            item.setOrder(order);
            total = total.add(item.getPrice().multiply(new BigDecimal(item.getQuantity())));
        }

        // Apply delivery fee
        BigDecimal fee = BigDecimal.ZERO;
        if (order.getDeliveryFee() != null) {
            fee = order.getDeliveryFee();
        } else if (order.getShippingDetails() != null && order.getShippingDetails().getDeliveryFee() != null) {
            fee = order.getShippingDetails().getDeliveryFee();
        }
        order.setDeliveryFee(fee);
        if (order.getShippingDetails() != null) {
            order.getShippingDetails().setDeliveryFee(fee);
        }

        order.setTotalAmount(total.add(fee));
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(EOrderStatus.PAID);

        Order savedOrder = orderRepository.save(order);
        activityLogService.log("ORDER_PLACED", order.getUser().getUsername(), "Placed order #" + savedOrder.getId());

        return savedOrder;
    }

    public List<Order> getOrdersByUser(User user) {
        return orderRepository.findByUserOrderByOrderDateDesc(user);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc();
    }

    public Order getOrderById(Long id) {
        if (id == null)
            throw new RuntimeException("Order ID is null");
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    @Transactional
    public Order confirmAndGenerateShipment(Long id, String deliveryDateStr) {
        Order order = getOrderById(id);
        if (order.getStatus() != EOrderStatus.PAID) {
            throw new RuntimeException("Order must be PAID before it can be confirmed.");
        }

        order.setStatus(EOrderStatus.CONFIRMED);

        com.artselling.backend.entity.ShippingDetails shipping = order.getShippingDetails();
        if (shipping != null) {
            if (deliveryDateStr != null && !deliveryDateStr.trim().isEmpty()) {
                try {
                    shipping.setEstimatedDeliveryDate(java.time.LocalDate.parse(deliveryDateStr));
                } catch (Exception e) {
                    shipping.setEstimatedDeliveryDate(java.time.LocalDate.now().plusDays(5));
                }
            } else {
                shipping.setEstimatedDeliveryDate(java.time.LocalDate.now().plusDays(5));
            }
        }

        Order savedOrder = orderRepository.save(order);

        String logUser = "system";
        if (order.getUser() != null) {
            logUser = order.getUser().getUsername();
        }
        activityLogService.log("ORDER_CONFIRMED", logUser,
                "Confirmed shipment and set delivery date for order #" + savedOrder.getId());

        // Send Email Notification
        emailService.sendOrderStatusEmail(order.getUser(), savedOrder,
                "Your shipment has been confirmed and scheduled for dispatch.");

        return savedOrder;
    }

    @Transactional
    public Order updateOrderStatus(Long id, String statusString) {
        Order order = getOrderById(id);

        try {
            EOrderStatus newStatus = EOrderStatus.valueOf(statusString);
            order.setStatus(newStatus);
            Order savedOrder = orderRepository.save(order);
            activityLogService.log("ORDER_STATUS_CHANGED", "admin",
                    "Updated order #" + id + " status to " + statusString);

            // Send Email Notification for specific delivery milestones
            if (newStatus == EOrderStatus.SHIPPED ||
                    newStatus == EOrderStatus.OUT_FOR_DELIVERY ||
                    newStatus == EOrderStatus.DELIVERED) {

                String customMsg = "Your order status has been successfully updated to " + newStatus.toString() + ".";
                if (newStatus == EOrderStatus.DELIVERED) {
                    customMsg = "Great news! Your masterpiece has been delivered. Enjoy!";
                }
                emailService.sendOrderStatusEmail(order.getUser(), savedOrder, customMsg);
            }

            return savedOrder;
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid order status: " + statusString);
        }
    }

    @Transactional
    public Order updateShippingAddress(Long id, String newAddress, String newPhoneNumber) {
        Order order = getOrderById(id);

        // Only allow modification if not yet shipped
        if (order.getStatus() == EOrderStatus.SHIPPED ||
                order.getStatus() == EOrderStatus.OUT_FOR_DELIVERY ||
                order.getStatus() == EOrderStatus.DELIVERED) {
            throw new RuntimeException("Cannot modify shipping information after the order has been dispatched.");
        }

        com.artselling.backend.entity.ShippingDetails shipping = order.getShippingDetails();
        if (shipping == null) {
            throw new RuntimeException("No shipping details found for this order.");
        }

        boolean updated = false;
        if (newAddress != null && !newAddress.trim().isEmpty()) {
            shipping.setAddress(newAddress);
            updated = true;
        }
        if (newPhoneNumber != null && !newPhoneNumber.trim().isEmpty()) {
            shipping.setPhoneNumber(newPhoneNumber);
            updated = true;
        }

        if (updated) {
            Order savedOrder = orderRepository.save(order);
            activityLogService.log("SHIPPING_INFO_UPDATED", "admin", "Updated shipping details for order #" + id);
            return savedOrder;
        }

        return order;
    }

    @Transactional
    public Order cancelOrder(Long id) {
        Order order = getOrderById(id);

        if (order.getStatus() == EOrderStatus.SHIPPED ||
                order.getStatus() == EOrderStatus.OUT_FOR_DELIVERY ||
                order.getStatus() == EOrderStatus.DELIVERED ||
                order.getStatus() == EOrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot cancel an order that has already been dispatched or cancelled.");
        }

        // Restore Stock
        for (OrderItem item : order.getItems()) {
            Artwork artwork = item.getArtwork();
            if (artwork != null) {
                artwork.setStockQuantity(artwork.getStockQuantity() + item.getQuantity());
                artworkRepository.save(artwork);
            }
        }

        // Hide/Remove Shipping Record estimated date
        if (order.getShippingDetails() != null) {
            order.getShippingDetails().setEstimatedDeliveryDate(null);
        }

        order.setStatus(EOrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);

        activityLogService.log("ORDER_CANCELLED", "admin", "Cancelled order #" + id + " and restored stock");

        return savedOrder;
    }
}
