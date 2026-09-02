package com.bakery.cottage.controller;

import com.bakery.cottage.dto.*;
import com.bakery.cottage.entity.CustomCakeStatus;
import com.bakery.cottage.entity.OrderStatus;
import com.bakery.cottage.security.JwtAuthenticationFilter;
import com.bakery.cottage.service.ProductService;
import com.bakery.cottage.service.ShopkeeperService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ShopkeeperController.class)
@AutoConfigureMockMvc(addFilters = false)
public class ShopkeeperControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean private ShopkeeperService shopkeeperService;
    @MockitoBean private ProductService productService;
    @MockitoBean private JwtAuthenticationFilter jwtAuthenticationFilter;

    @TestConfiguration
    static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http.csrf(AbstractHttpConfigurer::disable)
                    .authorizeHttpRequests(authorize -> authorize.anyRequest().permitAll());
            return http.build();
        }
    }

    @Test
    void getShopkeeperSummary_Returns200Ok() throws Exception {
        ShopkeeperSummaryDTO summary = ShopkeeperSummaryDTO.builder()
                .totalProducts(20)
                .availableProducts(18)
                .totalOrders(50)
                .pendingOrders(5)
                .preparingOrders(3)
                .readyOrders(4)
                .outForDeliveryOrders(2)
                .completedOrders(36)
                .pendingPayments(2)
                .pendingCustomCakes(3)
                .totalCustomCakes(10)
                .todayOrders(7)
                .build();

        when(shopkeeperService.getShopkeeperSummary()).thenReturn(summary);

        mockMvc.perform(get("/shopkeeper/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalProducts").value(20))
                .andExpect(jsonPath("$.availableProducts").value(18))
                .andExpect(jsonPath("$.preparingOrders").value(3))
                .andExpect(jsonPath("$.readyOrders").value(4));
    }

    @Test
    void getOrders_Returns200Ok() throws Exception {
        OrderDTO order = OrderDTO.builder()
                .id("ord-1")
                .orderNumber("PBC-1001")
                .customerName("Jane Doe")
                .orderStatus(OrderStatus.PREPARING)
                .grandTotal(BigDecimal.valueOf(950))
                .build();

        when(shopkeeperService.getActiveOrders(null)).thenReturn(List.of(order));

        mockMvc.perform(get("/shopkeeper/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].orderNumber").value("PBC-1001"))
                .andExpect(jsonPath("$[0].orderStatus").value("PREPARING"));
    }

    @Test
    void updateOrderStatus_Returns200Ok() throws Exception {
        UpdateOrderStatusRequest request = new UpdateOrderStatusRequest();
        request.setStatus(OrderStatus.READY);
        request.setKitchenNotes("Freshly baked and boxed");

        OrderDTO updated = OrderDTO.builder()
                .id("ord-1")
                .orderNumber("PBC-1001")
                .orderStatus(OrderStatus.READY)
                .kitchenNotes("Freshly baked and boxed")
                .build();

        when(shopkeeperService.updateOrderStatus(eq("ord-1"), any(UpdateOrderStatusRequest.class))).thenReturn(updated);

        mockMvc.perform(put("/shopkeeper/orders/ord-1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderStatus").value("READY"))
                .andExpect(jsonPath("$.kitchenNotes").value("Freshly baked and boxed"));
    }

    @Test
    void getCustomCakes_Returns200Ok() throws Exception {
        CustomCakeRequestDTO cake = CustomCakeRequestDTO.builder()
                .id("cake-1")
                .customerName("John Smith")
                .cakeType("Birthday Cake")
                .status(CustomCakeStatus.PENDING_REVIEW)
                .build();

        when(shopkeeperService.getCustomCakeRequests(null)).thenReturn(List.of(cake));

        mockMvc.perform(get("/shopkeeper/custom-cakes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("cake-1"))
                .andExpect(jsonPath("$[0].status").value("PENDING_REVIEW"));
    }

    @Test
    void reviewCustomCake_Returns200Ok() throws Exception {
        ShopkeeperCustomCakeReviewRequest reviewRequest = new ShopkeeperCustomCakeReviewRequest();
        reviewRequest.setStatus(CustomCakeStatus.APPROVED);
        reviewRequest.setConfirmedPrice(BigDecimal.valueOf(1800));
        reviewRequest.setFeasibilityDecision("FEASIBLE");
        reviewRequest.setBakeryNotes("Approved by head baker");

        CustomCakeRequestDTO reviewed = CustomCakeRequestDTO.builder()
                .id("cake-1")
                .status(CustomCakeStatus.APPROVED)
                .confirmedPrice(BigDecimal.valueOf(1800))
                .bakeryNotes("Approved by head baker")
                .build();

        when(shopkeeperService.reviewCustomCakeRequest(eq("cake-1"), any(ShopkeeperCustomCakeReviewRequest.class))).thenReturn(reviewed);

        mockMvc.perform(put("/shopkeeper/custom-cakes/cake-1/review")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.confirmedPrice").value(1800));
    }

    @Test
    void getProducts_Returns200Ok() throws Exception {
        ProductDTO product = ProductDTO.builder()
                .id("prod-1")
                .name("Plum Cake")
                .category("Cakes")
                .price(BigDecimal.valueOf(650))
                .isAvailable(true)
                .build();

        when(productService.getProducts(any(), any(), any(), any(), any(), any(), any())).thenReturn(List.of(product));

        mockMvc.perform(get("/shopkeeper/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Plum Cake"));
    }
}
