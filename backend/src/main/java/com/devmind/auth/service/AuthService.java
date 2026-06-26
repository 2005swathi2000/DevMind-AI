package com.devmind.auth.service;

import com.devmind.auth.dto.*;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse googleLogin(GoogleLoginRequest request);
    AuthResponse refreshToken(TokenRefreshRequest request);
    void logout(String refreshToken);
    String requestPasswordReset(PasswordResetRequest request);
    void confirmPasswordReset(PasswordResetConfirmRequest request);
}
