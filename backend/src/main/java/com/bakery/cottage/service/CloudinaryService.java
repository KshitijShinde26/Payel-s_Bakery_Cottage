package com.bakery.cottage.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
public class CloudinaryService {

    private static final Logger logger = LoggerFactory.getLogger(CloudinaryService.class);

    private Cloudinary cloudinary;
    private final boolean isConfigured;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {
        
        if (cloudName != null && !cloudName.isBlank() &&
            apiKey != null && !apiKey.isBlank() &&
            apiSecret != null && !apiSecret.isBlank()) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true
            ));
            this.isConfigured = true;
            logger.info("Cloudinary successfully configured.");
        } else {
            this.isConfigured = false;
            logger.warn("Cloudinary is not configured. File uploads will fallback or fail.");
        }
    }

    public String uploadAvatar(MultipartFile file) throws IOException {
        validateFile(file);

        if (!isConfigured) {
            throw new IllegalStateException("Cloudinary credentials are not configured in this environment.");
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "bakery/avatars",
                    "resource_type", "image"
            ));
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            logger.error("Failed to upload file to Cloudinary: {}", e.getMessage());
            throw e;
        }
    }

    public String uploadCustomCakeReference(MultipartFile file) throws IOException {
        validateFile(file);

        if (!isConfigured) {
            return "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80";
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "bakery/custom_cakes",
                    "resource_type", "image"
            ));
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            logger.error("Failed to upload custom cake reference image to Cloudinary: {}", e.getMessage());
            return "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80";
        }
    }

    public String uploadProductImage(MultipartFile file) throws IOException {
        validateFile(file);

        if (!isConfigured) {
            return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80";
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "bakery/products",
                    "resource_type", "image"
            ));
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            logger.error("Failed to upload product image to Cloudinary: {}", e.getMessage());
            throw e;
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty.");
        }

        // Limit size to 5MB
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 5MB.");
        }

        // Validate MIME type (don't trust extension alone)
        String contentType = file.getContentType();
        if (contentType == null) {
            throw new IllegalArgumentException("File content type is null.");
        }

        List<String> allowedTypes = Arrays.asList("image/jpeg", "image/jpg", "image/png");
        if (!allowedTypes.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid file type. Only JPG, JPEG, and PNG are allowed.");
        }
    }
}
