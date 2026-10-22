package com.codesage.knowledge;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

/** Extracts plain text from PDF (PDFBox) or text files. */
@Component
public class DocumentParser {

    public record Extracted(String text, String kind) {
    }

    /** Reads a file into plain text, keeping common PDF and text encodings working. */
    public Extracted parse(File file, String originalName) {
        String lower = originalName.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".pdf")) {
            String pdfText = extractPdf(file);
            if (pdfText == null || pdfText.isBlank()) {
                throw new IllegalStateException(
                        "That PDF has no extractable text (it may be an image-only scan). " +
                        "CodeSage needs real text to index, so this file was not added.");
            }
            return new Extracted(pdfText, "PDF");
        }
        return new Extracted(readTxt(file), "TXT");
    }

    private String extractPdf(File file) {
        try (PDDocument pdf = Loader.loadPDF(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            return stripper.getText(pdf);
        } catch (IOException e) {
            throw new IllegalStateException("That PDF could not be parsed: " + e.getMessage(), e);
        }
    }

    private String readTxt(File file) {
        try {
            return java.nio.file.Files.readString(file.toPath(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("That text file could not be read: " + e.getMessage(), e);
        }
    }
}
