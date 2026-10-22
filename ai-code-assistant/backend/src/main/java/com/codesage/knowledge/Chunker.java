package com.codesage.knowledge;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Splits extracted document text into retrieval chunks. Paragraph-based first,
 * then merged to the requested chunk length, keeping the first line of each
 * chunk as its "section" heading whenever it looks like one.
 */
@Component
public class Chunker {

    private final int targetLength;
    private final int overlap;

    public Chunker() {
        this(900, 120);
    }

    public Chunker(int targetLength, int overlap) {
        this.targetLength = targetLength;
        this.overlap = overlap;
    }

    public List<KnowledgeDocument.Chunk> chunk(String docId, String title, String text) {
        List<KnowledgeDocument.Chunk> chunks = new ArrayList<>();
        if (text == null) {
            return chunks;
        }
        String[] paragraphs = text
                .replace("\r\n", "\n")
                .replace ('\f' , '\n')
                .split("\n{2,}");

        if (paragraphs.length == 0) {
            return chunks;
        }

        StringBuilder buffer = new StringBuilder();
        String currentSection = null;
        List<KnowledgeDocument.Chunk> out = new ArrayList<>();

        for (String paragraph : paragraphs) {
            String cleaned = collapse(paragraph);
            if (cleaned.isBlank()) {
                continue;
            }
            boolean isNewHeading = looksLikeHeading(cleaned);
            if (isNewHeading) {
                flush(docId, title, buffer, currentSection, out);
                currentSection = cleaned;
                buffer.append(cleaned).append("\n\n");
                continue;
            }
            buffer.append(cleaned).append("\n\n");
            if (buffer.length() >= targetLength) {
                flushWithOverflow(docId, title, buffer, currentSection, out);
            }
        }
        flush(docId, title, buffer, currentSection, out);
        return out;
    }

    private void flush(String docId, String title, StringBuilder buffer, String section,
                       List<KnowledgeDocument.Chunk> out) {
        flushWithOverflow(docId, title, buffer, section, out);
    }

    private void flushWithOverflow(String docId, String title, StringBuilder buffer, String section,
                                   List<KnowledgeDocument.Chunk> out) {
        String whole = buffer.toString().strip();
        buffer.setLength(0);
        if (whole.isBlank()) {
            return;
        }
        if (whole.length() <= targetLength + 200) {
            out.add(make(docId, title, section, whole, out.size()));
            return;
        }
        int start = 0;
        while (start < whole.length()) {
            int end = Math.min(whole.length(), start + targetLength);
            if (end < whole.length()) {
                int cut = whole.lastIndexOf(' ', end);
                if (cut > start + 200) {
                    end = cut;
                }
            }
            String piece = whole.substring(start, end).strip();
            if (!piece.isBlank()) {
                out.add(make(docId, title, section, piece, out.size()));
            }
            if (end >= whole.length()) {
                break;
            }
            start = Math.max(end - overlap, start + 1);
        }
    }

    private KnowledgeDocument.Chunk make(String docId, String title, String section, String text, int index) {
        String safeSection = (section == null || section.isBlank()) ? "Paragraph " + (index + 1) : section;
        String id = docId + "-c" + (index + 1);
        return new KnowledgeDocument.Chunk(id, docId, title, safeSection, text);
    }

    /** Headings are short lines that look like section titles. */
    static boolean looksLikeHeading(String line) {
        String s =(line == null ? "" : line).strip();
        if (s.isEmpty() || s.length() > 76) {
            return false;
        }
        if (s.endsWith(".") && s.length() < 60 && !s.endsWith(" e.g.")) {
            // A short sentence ending in a period is often a title, e.g. "ZeroDivisionError."
            return true;
        }
        boolean upper = s.toUpperCase().equals(s) && s.chars().anyMatch(Character::isLetter);
        boolean numbered = s.matches("(?iu)^\\s*(chapter|section|part)\\s+([0-9]+[a-z]?\\.?|iv|vi+|v|xi*|iii|viii|xx?|i{1,3})\\b.*") ;
        boolean biblio = s.matches("(?iu)^(table|listing|figure)\\s+\\d+[a-z]?");
        boolean ticket = s.matches("(?iu)^[0-9]+\\.[0-9a-z]([a-z0-9.]*\\.)*\\s+.{0,64}");
        boolean outline = s.matches("(?iu)^([0-9]+)(\\.[0-9]+)+\\s+\\S.*");
        boolean camel = s.matches("[A-Z][a-zA-Z0-9]*(\\.[a-zA-Z0-9]+)*(\\s[A-Za-z0-9()]+)*") && hasUpperRun(s);
        return upper || numbered || biblio || ticket || outline || (camel && !s.endsWith(".") && hasUpperRun(s));
    }

    private static boolean hasUpperRun(String s) {
        int run = 0;
        for (char c : s.toCharArray()) {
            if (Character.isUpperCase(c)) {
                run++;
                if (run >= 2) {
                    return true;
                }
            } else if (!Character.isDigit(c)) {
                run = 0;
            }
        }
        return false;
    }

    private static String collapse(String text) {
        if (text == null) {
            return "";
        }
        return text
                .replaceAll("[ \\t\\x0B\\f]+", " ")
                .replaceAll(" ?\n ?", "\n")
                .strip();
    }
}
