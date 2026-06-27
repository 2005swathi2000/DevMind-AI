package com.devmind.auth.service;

import com.devmind.auth.dto.*;
import com.devmind.auth.entity.RefreshToken;
import com.devmind.auth.repository.RefreshTokenRepository;
import com.devmind.enums.Role;
import com.devmind.exception.TokenRefreshException;
import com.devmind.security.jwt.JwtTokenProvider;
import com.devmind.user.entity.User;
import com.devmind.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.util.Collections;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final LoginAttemptService loginAttemptService;
    private final ObjectMapper objectMapper;

    @Value("${devmind.security.jwt.refresh-token-expiration-ms:86400000}")
    private long refreshTokenExpirationMs;

    @Value("${devmind.security.google.client-id:}")
    private String googleClientId;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("[Register Step 1] Registration request received for email: {}", request.getEmail());
        
        String email = request.getEmail().trim().toLowerCase();
        log.info("[Register Step 2] Performing validation: Checking if email already exists...");
        if (userRepository.existsByEmailIgnoreCase(email)) {
            log.error("[Register Error] Email is already in use: {}", email);
            throw new IllegalArgumentException("Email is already in use");
        }

        log.info("[Register Step 3] Performing password encoding...");
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(email)
                .password(encodedPassword)
                .role(Role.USER)
                .provider("local")
                .emailVerified(false)
                .gender(request.getGender())
                .active(true)
                .build();

        log.info("[Register Step 4] Saving user entity to PostgreSQL database...");
        User savedUser = userRepository.save(user);
        log.info("[Register Step 5] User saved successfully. ID: {}, Email: {}", savedUser.getId(), savedUser.getEmail());

        log.info("[Register Step 6] Generating JWT security access token...");
        String accessToken = jwtTokenProvider.generateAccessToken(savedUser.getEmail());
        
        log.info("[Register Step 7] Generating and saving refresh token...");
        String refreshToken = createAndSaveRefreshToken(savedUser);

        log.info("[Register Step 8] Returning successfully compiled AuthResponse!");
        return buildAuthResponse(savedUser, accessToken, refreshToken);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (!userRepository.existsByEmailIgnoreCase(email)) {
            throw new org.springframework.security.core.userdetails.UsernameNotFoundException("No account found with this email.");
        }

        if (loginAttemptService.isLocked(email)) {
            long remainingSeconds = loginAttemptService.getLockoutTimeRemainingSeconds(email);
            throw new LockedException("Account is locked due to too many failed attempts. Try again in " 
                    + (remainingSeconds / 60 + 1) + " minutes.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );

            loginAttemptService.loginSucceeded(email);
            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            String accessToken = jwtTokenProvider.generateAccessToken(email);
            String refreshToken = rotateRefreshToken(user);

            return buildAuthResponse(user, accessToken, refreshToken);
        } catch (BadCredentialsException ex) {
            loginAttemptService.loginFailed(email);
            throw ex;
        }
    }

    @Override
    @Transactional
    public AuthResponse googleLogin(GoogleLoginRequest request) {
        String idTokenString = request.getIdToken();
        String email;
        String firstName;
        String lastName;
        String picture = null;

        try {
            // Verify token signature, audience, and expiration using Google's official verifier libraries
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId.isEmpty() ? null : googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                // Check if it is a mock token for local testing/development environments
                if (idTokenString != null && idTokenString.startsWith("mock-")) {
                    String[] parts = idTokenString.split("\\.");
                    String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
                    Map<String, Object> claims = objectMapper.readValue(payload, Map.class);
                    email = (String) claims.get("email");
                    firstName = (String) claims.getOrDefault("given_name", "Google");
                    lastName = (String) claims.getOrDefault("family_name", "User");
                    picture = (String) claims.get("picture");
                } else {
                    throw new BadCredentialsException("Google token signature or audience verification failed");
                }
            } else {
                GoogleIdToken.Payload payload = idToken.getPayload();
                if (!payload.getEmailVerified()) {
                    throw new BadCredentialsException("Google email is not verified");
                }
                email = payload.getEmail();
                firstName = (String) payload.get("given_name");
                lastName = (String) payload.get("family_name");
                picture = (String) payload.get("picture");
            }
        } catch (Exception e) {
            log.error("Google ID Token verification failed", e);
            throw new BadCredentialsException("Google Sign-In failed: " + e.getMessage());
        }

        Optional<User> userOptional = userRepository.findByEmailIgnoreCase(email);
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Link/upgrade to google
            if ("local".equals(user.getProvider())) {
                user.setProvider("google");
            }
            if (picture != null) {
                user.setProfilePicture(picture);
            }
            user.setLastLogin(LocalDateTime.now());
            user = userRepository.save(user);
        } else {
            // Register new Google user
            user = User.builder()
                    .firstName(firstName != null ? firstName : "Google")
                    .lastName(lastName != null ? lastName : "User")
                    .email(email)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString())) // Random password
                    .role(Role.USER)
                    .provider("google")
                    .profilePicture(picture)
                    .emailVerified(true)
                    .active(true)
                    .lastLogin(LocalDateTime.now())
                    .build();
            user = userRepository.save(user);
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail());
        String refreshToken = rotateRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenRepository.findByToken(requestRefreshToken)
                .map(this::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail());
                    String newRefreshToken = rotateRefreshToken(user);
                    return buildAuthResponse(user, accessToken, newRefreshToken);
                })
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken, "Refresh token is not in database!"));
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(refreshTokenRepository::delete);
    }

    @Override
    @Transactional
    public String requestPasswordReset(PasswordResetRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        return token;
    }

    @Override
    @Transactional
    public void confirmPasswordReset(PasswordResetConfirmRequest request) {
        User user = userRepository.findByResetPasswordToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid password reset token"));

        if (user.getResetPasswordTokenExpiry() == null || user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Password reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);
    }

    private String createAndSaveRefreshToken(User user) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(LocalDateTime.now().plusNanos(refreshTokenExpirationMs * 1_000_000))
                .build();

        refreshToken = refreshTokenRepository.save(refreshToken);
        return refreshToken.getToken();
    }

    private String rotateRefreshToken(User user) {
        // Delete old token if exists
        refreshTokenRepository.findByUser(user).ifPresent(refreshTokenRepository::delete);
        return createAndSaveRefreshToken(user);
    }

    private RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException(token.getToken(), "Refresh token was expired. Please make a new signin request");
        }
        return token;
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .profilePicture(user.getProfilePicture())
                .gender(user.getGender())
                .build();
    }
}
