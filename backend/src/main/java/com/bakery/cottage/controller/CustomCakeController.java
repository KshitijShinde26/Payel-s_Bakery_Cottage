package com.bakery.cottage.controller;

import com.bakery.cottage.dto.CustomCakeRequestDTO;
import com.bakery.cottage.entity.CustomCakeRequestEntity;
import com.bakery.cottage.entity.CustomCakeStatus;
import com.bakery.cottage.exception.ResourceNotFoundException;
import com.bakery.cottage.repository.CustomCakeRequestRepository;
import com.bakery.cottage.security.UserPrincipal;
import com.bakery.cottage.service.CloudinaryService;
import com.bakery.cottage.service.ShopkeeperService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/custom-cakes")
@Tag(name = "Custom Cake Requests", description = "Endpoints for submitting custom cake design reference requests and feasibility tracking")
@SecurityRequirement(name = "bearerAuth")
public class CustomCakeController {

    private final CustomCakeRequestRepository customCakeRequestRepository;
    private final ShopkeeperService shopkeeperService;
    private final CloudinaryService cloudinaryService;

    public CustomCakeController(CustomCakeRequestRepository customCakeRequestRepository,
                                ShopkeeperService shopkeeperService,
                                CloudinaryService cloudinaryService) {
        this.customCakeRequestRepository = customCakeRequestRepository;
        this.shopkeeperService = shopkeeperService;
        this.cloudinaryService = cloudinaryService;
    }

    private UserPrincipal getPrincipal(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken) {
            Object p = ((UsernamePasswordAuthenticationToken) principal).getPrincipal();
            if (p instanceof UserPrincipal) {
                return (UserPrincipal) p;
            }
        }
        return null;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Submit a custom cake request with reference photo")
    public ResponseEntity<CustomCakeRequestDTO> submitCustomCake(
            @RequestParam("cakeType") String cakeType,
            @RequestParam("flavor") String flavor,
            @RequestParam("weight") String weight,
            @RequestParam("dietaryPreference") String dietaryPreference,
            @RequestParam(value = "customMessage", required = false) String customMessage,
            @RequestParam(value = "specialInstructions", required = false) String specialInstructions,
            @RequestParam(value = "referenceImage", required = false) MultipartFile referenceImage,
            @RequestParam("preferredDeliveryDate") String preferredDeliveryDate,
            @RequestParam("preferredDeliveryTime") String preferredDeliveryTime,
            Principal principal) {

        UserPrincipal userPrincipal = getPrincipal(principal);
        String userId = userPrincipal != null ? userPrincipal.getId() : "guest";
        String customerName = userPrincipal != null ? userPrincipal.getUser().getFullName() : "Valued Customer";
        String customerPhone = userPrincipal != null ? userPrincipal.getUser().getPhoneNumber() : "";
        String customerEmail = userPrincipal != null ? userPrincipal.getUsername() : "";

        String imageUrl = "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80";
        String imageName = "default_reference.jpg";
        Long imageSize = 0L;

        if (referenceImage != null && !referenceImage.isEmpty()) {
            imageName = referenceImage.getOriginalFilename();
            imageSize = referenceImage.getSize();
            try {
                imageUrl = cloudinaryService.uploadCustomCakeReference(referenceImage);
            } catch (Exception e) {
                // Keep default or fallback url
            }
        }

        CustomCakeRequestEntity entity = CustomCakeRequestEntity.builder()
                .userId(userId)
                .customerName(customerName)
                .customerPhone(customerPhone)
                .customerEmail(customerEmail)
                .cakeType(cakeType)
                .flavor(flavor)
                .weight(weight)
                .dietaryPreference(dietaryPreference)
                .customMessage(customMessage)
                .specialInstructions(specialInstructions)
                .referenceImageUrl(imageUrl)
                .referenceImageName(imageName)
                .referenceImageSize(imageSize)
                .preferredDeliveryDate(preferredDeliveryDate)
                .preferredDeliveryTime(preferredDeliveryTime)
                .status(CustomCakeStatus.PENDING_REVIEW)
                .estimatedPrice(BigDecimal.valueOf(850.00))
                .build();

        CustomCakeRequestEntity saved = customCakeRequestRepository.save(entity);
        return ResponseEntity.status(HttpStatus.CREATED).body(shopkeeperService.mapToCustomCakeDto(saved));
    }

    @GetMapping("/my-requests")
    @Operation(summary = "Get current customer custom cake inquiries")
    public ResponseEntity<List<CustomCakeRequestDTO>> getMyRequests(Principal principal) {
        UserPrincipal userPrincipal = getPrincipal(principal);
        if (userPrincipal == null) {
            return ResponseEntity.ok(List.of());
        }
        List<CustomCakeRequestEntity> list = customCakeRequestRepository.findByUserIdOrderByCreatedAtDesc(userPrincipal.getId());
        return ResponseEntity.ok(list.stream().map(shopkeeperService::mapToCustomCakeDto).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get custom cake request details by ID")
    public ResponseEntity<CustomCakeRequestDTO> getRequestById(@PathVariable String id, Principal principal) {
        UserPrincipal userPrincipal = getPrincipal(principal);
        CustomCakeRequestEntity entity = customCakeRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CustomCakeRequest", "id", id));

        // Enforce customer ownership isolation: Non-staff users can only access their own custom cake requests
        if (userPrincipal != null) {
            boolean isStaff = userPrincipal.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SHOPKEEPER"));
            if (!isStaff && !entity.getUserId().equals(userPrincipal.getId())) {
                throw new ResourceNotFoundException("CustomCakeRequest", "id", id);
            }
        }
        return ResponseEntity.ok(shopkeeperService.mapToCustomCakeDto(entity));
    }
}
