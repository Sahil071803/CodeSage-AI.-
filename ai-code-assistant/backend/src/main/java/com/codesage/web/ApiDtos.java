package com.codesage.web;

import java.util.List;

/**
 * All request/response payloads. These shapes are the contract expected by the
 * React frontend (see ai-code-assistant/frontend README).
 */
public final class ApiDtos {

    private ApiDtos() {
    }

    public record AuthRequest(String email, String password, String name) {
    }

    public record UserDto(String name, String email) {
    }

    public record AuthResponse(UserDto user, String token) {
    }

    public record AnalyzeRequest(String mode, String code, String language, String problem) {
    }

    public record Entity(String name, String kind, String description) {
    }

    public record Explanation(String summary, List<String> steps, List<Entity> entities, String note) {
    }

    public record Issue(String id, String severity, Integer line, String title, String description, String fix) {
    }

    public record DebugResult(String summary, List<Issue> issues, String correctedCode) {
    }

    public record SourceRef(String id, String title, String section, String page, String excerpt) {
    }

    /**
     * The shape Home.jsx reads: explanation / debug / sources / demo.
     */
    public record AnalysisResult(
            String mode,
            boolean demo,
            Explanation explanation,
            DebugResult debug,
            List<SourceRef> sources,
            String generatedAt
    ) {
    }

    public record KnowledgeDocDto(
            String id,
            String title,
            String type,
            String language,
            String length,
            String size,
            String description,
            String status
    ) {
    }

    public record HealthResponse(String status, boolean aiConfigured, String model) {
    }
}
