package com.cago.controller;

import com.cago.dto.CheckoutRequestDTO;
import com.cago.dto.OrderDTO;
import com.cago.dto.response.ApiResponse;
import com.cago.service.CheckoutService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/cago/checkout")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CheckoutController {

    CheckoutService checkoutService;

    @PostMapping
    @Operation(summary = "Checkout order", description = "User proceeds to checkout their cart")
    public ApiResponse<OrderDTO> checkout(
            @RequestBody CheckoutRequestDTO request,
            Authentication authentication) {

        String username = null;
        if (authentication != null && authentication.isAuthenticated()) {
            username = authentication.getName();
        }
        OrderDTO order = checkoutService.checkout(username, request);
        return new ApiResponse<>("success", 200, "Checkout successful", order);
    }
}

