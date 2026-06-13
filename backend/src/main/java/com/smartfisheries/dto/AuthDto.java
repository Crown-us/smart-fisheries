package com.smartfisheries.dto;

import com.smartfisheries.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class AuthDto {

    private AuthDto() {} // Prevent instantiation

    public record RegisterRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email format")
            String email,

            @NotBlank(message = "Username is required")
            @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
            String username,

            @NotBlank(message = "Password is required")
            @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
            String password,

            @Size(max = 50)
            String firstName,

            @Size(max = 50)
            String lastName,

            @NotNull(message = "Role is required")
            UserRole role
    ) {}

    public record LoginRequest(
            @NotBlank(message = "Username or email is required")
            String usernameOrEmail,

            @NotBlank(message = "Password is required")
            String password
    ) {}

    public record AuthResponse(
            String accessToken,
            String refreshToken,
            Long userId,
            String username,
            String email,
            String role
    ) {}

    public record RefreshTokenRequest(
            @NotBlank(message = "Refresh token is required")
            String refreshToken
    ) {}

    public record ChangePasswordRequest(
            @NotBlank(message = "Old password is required")
            String oldPassword,

            @NotBlank(message = "New password is required")
            @Size(min = 6, message = "New password must be at least 6 characters")
            String newPassword
    ) {}
}
