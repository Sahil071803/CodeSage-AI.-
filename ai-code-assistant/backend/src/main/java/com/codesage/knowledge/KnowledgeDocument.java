package com.codesage.knowledge;

import java.util.Locale;

/** Immutable knowledge-base document with its retrieval-ready chunks. */
public class KnowledgeDocument {

    public record Chunk(String id, String docId, String title, String section, String text) {
    }

    private final String id;
    private String title;
    private String type;
    private String language;
    private String description;
    private String status;
    private String text;
    private long sizeBytes;
    private java.util.List<Chunk> chunks;

    public KnowledgeDocument(String id, String title, String type, String language,
                             String description, String status, String text, long sizeBytes) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.language = language;
        this.description = description;
        this.status = status;
        this.text = text;
        this.sizeBytes = sizeBytes;
        this.chunks = java.util.Collections.emptyList();
    }

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getType() {
        return type;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getDescription() {
        return description;
    }

    public String getStatus() {
        return status;
    }

    public String getText() {
        return text;
    }

    public long getSizeBytes() {
        return sizeBytes;
    }

    public java.util.List<Chunk> getChunks() {
        return chunks == null ? java.util.Collections.emptyList() : chunks;
    }

    public void setChunks(java.util.List<Chunk> chunks) {
        this.chunks = chunks == null ? java.util.Collections.emptyList() : chunks;
    }

    /** Matches the frontend contract: length chip, size chip, description line. */
    public ApiShape toDto() {
        String chunkWord = chunks.size() == 1 ? "chunk" : "chunks";
        String chipLength = chunks.isEmpty() ? "No text" : (chunks.size() + " " + chunkWord + " · " + words() + " words");
        return new ApiShape(id, title, type, language, chipLength, humanSize(sizeBytes), description, status);
    }

    private int words() {
        if (text == null || text.isBlank()) {
            return 0;
        }
        return text.trim().split("\\s+").length;
    }

    private static String humanSize(long bytes) {
        if (bytes <= 0) {
            return "—";
        }
        if (bytes < 1024) {
            return bytes + " B";
        }
        if (bytes < 1024 * 1024) {
            return Math.max(1, Math.round(bytes / 1024.0)) + " KB";
        }
        return Math.round(bytes / (1024.0 * 1024.0) * 10) / 10 + " MB";
    }

    public record ApiShape(String id, String title, String type, String language,
                           String length, String size, String description, String status) {
    }

    /** Normalises a language id received from the frontend, e.g. "cpp" -> "C++". */
    public static String prettyLanguage(String frontendId) {
        if (frontendId == null || frontendId.isBlank()) {
            return "General";
        }
        return switch (frontendId.trim().toLowerCase(Locale.ROOT)) {
            case "python" -> "Python";
            case "javascript" -> "JavaScript";
            case "typescript" -> "TypeScript";
            case "java" -> "Java";
            case "cpp", "c++" -> "C++";
            case "c" -> "C";
            default -> "General";
        };
    }
}
