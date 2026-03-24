package com.artselling.backend.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    public PaymentIntent createPaymentIntent(Long amount) throws StripeException {
        // amount is in cents, so multiplied by 100 for LKR or keep it depending on
        // currency
        // Usually, Stripe accepts amounts in the smallest currency unit. IF amount is
        // Rs 500.00, we pass 50000.
        // Let's assume the frontend passes the amount in full Rupees, e.g., 500.
        long amountInCents = amount * 100;

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("lkr")
                .build();

        return PaymentIntent.create(params);
    }
}
