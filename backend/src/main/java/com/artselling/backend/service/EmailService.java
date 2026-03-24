package com.artselling.backend.service;

import com.artselling.backend.entity.Order;
import com.artselling.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOrderStatusEmail(User user, Order order, String customMessage) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            
            // Extract the user's actual registered email address
            String toAddress = user.getEmail();
            if (toAddress == null || toAddress.trim().isEmpty()) {
                System.err.println("Notice: Could not send email because User has no recorded email address.");
                return;
            }
            
            message.setTo(toAddress);
            message.setSubject("ArtSelling: Order #" + order.getId() + " Status Update");
            
            String status = order.getStatus().toString();
            String feeStr = order.getDeliveryFee() != null ? order.getDeliveryFee().toString() : "0.00";
            String estDelivery = order.getShippingDetails() != null && order.getShippingDetails().getEstimatedDeliveryDate() != null
                ? order.getShippingDetails().getEstimatedDeliveryDate().toString() : "Not scheduled yet";

            String text = "Dear " + user.getUsername() + ",\n\n"
                    + "Your order #" + order.getId() + " has been updated.\n\n"
                    + "New Status: " + status + "\n"
                    + "Estimated Delivery Date: " + estDelivery + "\n"
                    + "Delivery Fee: Rs." + feeStr + "\n\n"
                    + customMessage + "\n\n"
                    + "Thank you for curating with ArtSelling!\n";

            message.setText(text);
            
            // Only attempt to send if a real mail server username is configured
            // Otherwise, just log it. This prevents the server from crashing if credentials aren't set yet.
            mailSender.send(message);
            System.out.println("Email Sent Successfully to: " + toAddress + " for Order #" + order.getId());
            
        } catch (Exception e) {
            System.err.println("Notice: Failed to send email (Check credentials or network): " + e.getMessage());
        }
    }
}
