package com.codesage.web;

import com.codesage.auth.UserStore;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Locale;
import java.util.Set;

import static com.codesage.web.ApiDtos.AuthRequest;
import static com.codesage.web.ApiDtos.AuthResponse;
import static com.codesage.web.ApiDtos.UserDto;

/** /api/auth/login and /api/auth/signup match the frontend's ENDPOINTS contract. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Set<String> RESERVED = Set.of("root", "admin", "official", "staff");

    private final UserStore users;

    public AuthController(UserStore users) {
        this.users = users;
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        String email = email(request);
        String password = required(request.password(), "Enter your password.");
        String derived = deriveName(email, request.name());
        validate(true, email, password, derived); // signup-style format validation
        String token = users.login(email, password);
        if (token == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Email and password do not match.");
        }
        UserStore.SessionUser stored = users.userForToken(token);
        return new AuthResponse(new UserDto(displayName(derived, stored), stored.email()), token);
    }

    @PostMapping("/signup")
    public AuthResponse signup(@RequestBody AuthRequest request) {
        String email = email(request);
        String password = required(request.password(), "Choose a password of 8 or more characters.");
        String name = required(request.name(), "Enter your name.");
        validate(false, email, password, name);
        String token = users.register(name.trim(), email, password);
        return new AuthResponse(new UserDto(name.trim(), email), token);
    }

    /* ---------- helpers ---------- */

    private String email(AuthRequest request) {
        return required(request.email(), "Enter a valid email address.");
    }

    private static String required(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, message);
        }
        return value.trim();
    }

    private void validate(boolean logInOnly, String email, String password, String name) {
        if (!EMAIL.matcher(email).matches()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Enter a valid email address.");
        }
        if (password.length() < 8) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters.");
        }
        if (!logInOnly && name.length() < 2) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Enter your name (at least 2 characters).");
        }
    }

    /** Reuse a plausible display name when the user logs in with only an email. */
    private String deriveName(String email, String fallback) {
        String prefix = email.toLowerCase(Locale.ROOT).split("@", 2)[0];
        String cleaned = prefix.replaceAll("[._\\-]+", " ").trim();
        if (cleaned.isEmpty()) {
            return "Developer";
        }
        StringBuilder sb = new StringBuilder();
        for (String part : cleaned.split("\\s+")) {
            if (!RESERVED.contains(part)) {
                sb.append(Character.toUpperCase(part.charAt(0))).append(part.substring(1)).append(" ");
            }
        }
        String name = sb.toString().trim();
        return fallback != null && !fallback.isBlank() ? fallback.trim() : (name.isEmpty() ? "Developer" : name);
    }

    private String displayName(String derived, UserStore.SessionUser stored) {
        return stored.name() == null || stored.name().isBlank() ? derived : stored.name();
    }

    private static final java.util.regex.Pattern EMAIL =
            java.util.regex.Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
}
