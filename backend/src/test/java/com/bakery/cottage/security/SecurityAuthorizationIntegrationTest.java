package com.bakery.cottage.security;

import com.bakery.cottage.config.SecurityConfig;
import com.bakery.cottage.controller.AdminController;
import com.bakery.cottage.controller.ShopkeeperController;
import com.bakery.cottage.dto.AdminSummaryDTO;
import com.bakery.cottage.service.AdminService;
import com.bakery.cottage.service.CloudinaryService;
import com.bakery.cottage.service.ProductService;
import com.bakery.cottage.service.ShopkeeperService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {AdminController.class, ShopkeeperController.class})
@Import({SecurityConfig.class})
public class SecurityAuthorizationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean private JwtAuthenticationFilter jwtAuthenticationFilter;
    @MockitoBean private AdminService adminService;
    @MockitoBean private ProductService productService;
    @MockitoBean private CloudinaryService cloudinaryService;
    @MockitoBean private ShopkeeperService shopkeeperService;

    @BeforeEach
    void setUp() throws Exception {
        doAnswer(invocation -> {
            HttpServletRequest request = invocation.getArgument(0);
            HttpServletResponse response = invocation.getArgument(1);
            FilterChain filterChain = invocation.getArgument(2);
            filterChain.doFilter(request, response);
            return null;
        }).when(jwtAuthenticationFilter).doFilter(any(), any(), any());
    }

    @Test
    void unauthenticated_AccessAdminEndpoint_Returns401Unauthorized() throws Exception {
        mockMvc.perform(get("/admin/summary"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void unauthenticated_AccessShopkeeperEndpoint_Returns401Unauthorized() throws Exception {
        mockMvc.perform(get("/shopkeeper/orders"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    void customerRole_AccessAdminEndpoint_Returns403Forbidden() throws Exception {
        mockMvc.perform(get("/admin/summary"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    void customerRole_AccessShopkeeperEndpoint_Returns403Forbidden() throws Exception {
        mockMvc.perform(get("/shopkeeper/orders"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "shopkeeper@example.com", roles = {"SHOPKEEPER"})
    void shopkeeperRole_AccessAdminEndpoint_Returns403Forbidden() throws Exception {
        mockMvc.perform(get("/admin/summary"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "shopkeeper@example.com", roles = {"SHOPKEEPER"})
    void shopkeeperRole_AccessShopkeeperEndpoint_Returns200Ok() throws Exception {
        when(shopkeeperService.getActiveOrders(null)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/shopkeeper/orders"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void adminRole_AccessAdminEndpoint_Returns200Ok() throws Exception {
        when(adminService.getAdminSummary()).thenReturn(new AdminSummaryDTO());

        mockMvc.perform(get("/admin/summary"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void adminRole_AccessShopkeeperEndpoint_Returns200Ok() throws Exception {
        when(shopkeeperService.getActiveOrders(null)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/shopkeeper/orders"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "shopkeeper@example.com", roles = {"SHOPKEEPER"})
    void shopkeeperRole_PostAdminProduct_Returns403Forbidden() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/admin/products")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Cake\",\"category\":\"Cakes\",\"price\":500,\"description\":\"Desc\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    void customerRole_PostAdminProduct_Returns403Forbidden() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/admin/products")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Cake\",\"category\":\"Cakes\",\"price\":500,\"description\":\"Desc\"}"))
                .andExpect(status().isForbidden());
    }
}
