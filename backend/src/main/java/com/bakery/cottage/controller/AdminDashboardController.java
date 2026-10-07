package com.bakery.cottage.controller;

import com.bakery.cottage.dto.DashboardStatsDTO;
import com.bakery.cottage.service.AdminDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats() {
        DashboardStatsDTO stats = adminDashboardService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
}
