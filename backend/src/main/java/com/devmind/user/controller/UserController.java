package com.devmind.user.controller;

import com.devmind.common.dto.ApiResponse;
import com.devmind.user.dto.ProfileUpdateRequest;
import com.devmind.user.entity.User;
import com.devmind.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/profile/me")
    public ResponseEntity<ApiResponse<User>> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Unauthorized"));
        }
        Optional<User> userOptional = userRepository.findByEmailIgnoreCase(userDetails.getUsername());
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponse.error(404, "User not found"));
        }
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", userOptional.get()));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ProfileUpdateRequest request) {
        
        if (userDetails == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Unauthorized"));
        }

        Optional<User> userOptional = userRepository.findByEmailIgnoreCase(userDetails.getUsername());
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponse.error(404, "User not found"));
        }

        User user = userOptional.get();
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getProfilePicture() != null) {
            user.setProfilePicture(request.getProfilePicture());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }

        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", user));
    }
}
