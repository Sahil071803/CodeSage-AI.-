package com.codesage.auth;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory user store with salted SHA-256 password hashes and opaque
 * bearer tokens. Good enough for a local dev/demo backend; swap for a database
 * and BCrypt plus HttpOnly cookie sessions before going to production.
 */
@Component
public class UserStore {

    public record StoredUser(String id, String name, String email, String salt, String passwordHash) {
    }

    private static final SecureRandom RANDOM = new SecureRandom();

    private final Map<String, StoredUser> usersByEmail = new ConcurrentHashMap<>();
    private final Map<String, String> tokenToEmail = new ConcurrentHashMap<>();

    /** Registers a user and returns the new session token. */
    public synchronized String register(String name, String email, String password) {
        String key = normalize(email);
        if (usersByEmail.containsKey(key)) {
            throw new IllegalStateException("That email is already registered. Try signing in instead.");
        }
        String salt = randomHex(16);
        String hash = hash(password, salt);
        String id = randomHex(8);
        usersByEmail.put(key, new StoredUser(id, name, key, salt, hash));
        return issueToken(key);
    }

    /** Verifies credentials and returns a session token, or null when they do not match. */
    public synchronized String login(String email, String password) {
        String key = normalize(email);
        StoredUser user = usersByEmail.get(key);
        if (user == null) {
            return null;
        }
        if (!hash(password, user.salt()).equals(user.passwordHash())) {
            return null;
        }
        return issueToken(key);
    }

    public SessionUser userForToken(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        String email = tokenToEmail.get(token);
        if (email == null) {
            return null;
        }
        StoredUser stored = usersByEmail.get(email);
        if (stored == null) {
            return null;
        }
        return new SessionUser(stored.id(), stored.name(), stored.email());
    }

    public void revoke(String token) {
        if (token != null) {
            tokenToEmail.remove(token);
        }
    }

    private String issueToken(String email) {
        String token = randomHex(32);
        tokenToEmail.put(token, email);
        return token;
    }

    private static String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private static String randomHex(int bytes) {
        byte[] buf = new byte[bytes];
        RANDOM.nextBytes(buf);
        return HexFormat.of().formatHex(buf);
    }

    private static String hash(String password, String salt) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] out = digest.digest((salt + ":" + password).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(out);
        } catch (Exception e) {
            throw new IllegalStateException("Password hashing is unavailable", e);
        }
    }

    public record SessionUser(String id, String name, String email) {
    }
}
