package com.bakery.cottage.controller;

import com.bakery.cottage.dto.ChangePasswordRequest;
import com.bakery.cottage.dto.EditProfileRequest;
import com.bakery.cottage.dto.UserDTO;
import com.bakery.cottage.entity.User;
import com.bakery.cottage.mapper.UserMapper;
import com.bakery.cottage.security.UserPrincipal;
import com.bakery.cottage.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    public UserController(UserService userService, UserMapper userMapper) {
        this.userService = userService;
        this.userMapper = userMapper;
    }

    private String getUserId(Principal principal) {
        UserPrincipal userPrincipal = (UserPrincipal) ((UsernamePasswordAuthenticationToken) principal).getPrincipal();
        return userPrincipal.getId();
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(
            @Valid @RequestBody EditProfileRequest request,
            Principal principal,
            HttpServletRequest servletRequest) {
        
        String userId = getUserId(principal);
        User updatedUser = userService.updateProfile(
                userId,
                request.getFullName(),
                request.getPhoneNumber(),
                servletRequest.getRemoteAddr()
        );

        return ResponseEntity.ok(userMapper.toDto(updatedUser));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Principal principal,
            HttpServletRequest servletRequest) {
        
        String userId = getUserId(principal);
        userService.changePassword(
                userId,
                request.getCurrentPassword(),
                request.getNewPassword(),
                servletRequest.getRemoteAddr()
        );

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password changed successfully.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Principal principal,
            HttpServletRequest servletRequest) throws IOException {
        
        String userId = getUserId(principal);
        User updatedUser = userService.updateAvatar(userId, file, servletRequest.getRemoteAddr());

        Map<String, String> response = new HashMap<>();
        response.put("avatarUrl", updatedUser.getAvatarUrl());
        return ResponseEntity.ok(response);
    }
}
