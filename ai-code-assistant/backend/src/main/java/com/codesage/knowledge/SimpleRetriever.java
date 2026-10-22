package com.codesage.knowledge;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Baseline "vocabulary-HOT" retriever: token-level inverted-index-like scoring
 * with two passes (A) exact token overlap and (B) fuzzy n-gram fallback.
 */
@Component
public class SimpleRetriever {

    private static final Set<String> STOPWORDS = Set.of(
            "the", "a", "an", "and", "or", "of", "in", "on", "for", "to", "is", "are",
            "be", "it", "as", "at", "by", "with", "from", "that", "this", "these",
            "was", "not", "but", "has", "have", "can", "its", "if", "then", "you", "we",
            "int", "i", "x");
    private static final int MIN_TOKEN_LEN = 3;

    public record ScoredChunk(KnowledgeDocument.Chunk chunk, double score) {
    }

    public double score(KnowledgeDocument doc, KnowledgeDocument.Chunk chunk, List<String> queryTokens) {
        Map<String, Integer> chunkTokens = tokenCounts(chunk.text());
        Map<String, Integer> titleTokens = tokenCounts(chunk.title() + " " + chunk.section());

        if (chunkTokens.isEmpty() || queryTokens.isEmpty()) {
            return 0.0;
        }

        int overlap = 0;
        for (String token : queryTokens) {
            if (chunkTokens.containsKey(token)) {
                overlap++;
            } else if (titleTokens.containsKey(token)) {
                overlap += 0.9;
            } else {
                overlap += fuzzyBonus(token, chunkTokens);
            }
        }

        // Normalise: overlap / query size, with slight damping so that a single
        // accidental match in a huge chunk does not dominate.
        double scaled = Math.log1p(chunkTokens.size()) ; // ceil
        if (scaled <= 0) {
            return 0;
        }
        double base = overlap / (queryTokens.size());
        // Weight title hits a bit higher.
        if (!titleTokens.isEmpty()) {
            double titleOverlap = queryTokens.stream().filter(titleTokens::containsKey).count()
                    / (double) titleTokens.size();
            base += titleOverlap * 0.4 ;
        }
        double langBonus = doc != null && doc.getLanguage() != null
                && doc.getLanguage().toLowerCase(Locale.ROOT).equals("general") ? 0 : 0.03;
        return base * 0.9 + langBonus;
    }

    /** Defensive pick of the best chunks; lower scores than minScore are dropped. */
    public List<ScoredChunk> topScored(List<KnowledgeDocument> docs, String query, int limit, double minScore) {
        List<String> tokens = tokens(query);
        List<ScoredChunk> scored = new ArrayList<>();
        for (KnowledgeDocument doc : docs) {
            for (KnowledgeDocument.Chunk chunk : doc.getChunks()) {
                double s = score(doc, chunk, tokens);
                if (s <= minScore) {
                    continue;
                }
                scored.add(new ScoredChunk(chunk, s));
            }
        }
        scored.sort((a, b) -> Double.compare(b.score(), a.score()));
        return scored.size() > limit ? new ArrayList<>(scored.subList(0, limit)) : scored;
    }

    private static double fuzzyBonus(String queryToken, Map<String, Integer> tokens) {
        double best = 0;
        int qLen = queryToken.length();
        for (String candidate : tokens.keySet()) {
            int cLen = candidate.length();
            if (Math.abs(qLen - cLen) > 2) {
                continue;
            }
            int dist = levenshtein(queryToken, candidate, Math.min(qLen, 12));
            if (dist <= 1) {
                best = Math.max(best, 0.8);
            } else if (dist == 2 && Math.min(qLen, cLen) >= 5) {
                best = Math.max(best, 0.35);
            }
        }
        return best;
    }

    private static int levenshtein(String a, String b, int cap) {
        if (a.equals(b)) {
            return 0;
        }
        int[][] dp = new int[a.length() + 1][b.length() + 1];
        for (int i = 0; i <= a.length(); i++) {
            dp[i][0] = i;
        }
        for (int j = 0; j <= b.length(); j++) {
            dp[0][j] = j;
        }
        for (int i = 1; i <= a.length(); i++) {
            for (int j = 1; j <= b.length(); j++) {
                int cost = a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1;
                dp[i][j] = Math.min(Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1), dp[i - 1][j - 1] + cost);
                if (dp[i][j] > cap) {
                    return cap;
                }
            }
        }
        return dp[a.length()][b.length()];
    }

    static List<String> tokens(String raw) {
        List<String> out = new ArrayList<>();
        if (raw == null || raw.isBlank()) {
            return out;
        }
        for (String word : raw.toLowerCase(Locale.ROOT).split("[^A-Za-z0-9_]+")) {
            if (word.length() < MIN_TOKEN_LEN || STOPWORDS.contains(word)) {
                continue;
            }
            out.add(word);
        }
        return out;
    }

    private static Map<String, Integer> tokenCounts(String text) {
        Map<String, Integer> counts = new HashMap<>();
        if (text == null || text.isBlank()) {
            return counts;
        }
        String lowered = text.toLowerCase(Locale.ROOT);
        for (String part : lowered.split("[^A-Za-z0-9_]+")) {
            if (part.length() < MIN_TOKEN_LEN || STOPWORDS.contains(part)) {
                continue;
            }
            counts.put(part, counts.getOrDefault(part, 0) + 1);
        }
        return counts;
    }

    @SuppressWarnings("unused")
    private static String normalizeWhitespace(String in) {
        return new String(in.getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8);
    }
}
