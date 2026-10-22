package com.codesage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

import java.nio.file.Files;
import java.nio.file.Path;

/**
 * CodeSage AI backend.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
public class CodeSageApplication {

    public static void main(String[] args) {
        loadOpenRouterKey();
        SpringApplication.run(CodeSageApplication.class, args);
    }

    /**
     * Convenience for local development: reads the OpenRouter key from a local
     * "openrouter.key" file (workspace root or ~/.codesage/) when the
     * environment variable is not already set. The file must contain the raw
     * key, which always starts with "sk-or-". Adding this file to .gitignore
     * keeps the key out of source control.
     */
    private static void loadOpenRouterKey() {
        if (System.getProperty("OPENROUTER_API_KEY") != null
                && !System.getProperty("OPENROUTER_API_KEY").isBlank()) {
            return;
        }
        Path[] candidates = {
                Path.of("openrouter.key"),
                Path.of(System.getProperty("user.home"), ".codesage", "openrouter.key"),
        };
        for (Path path : candidates) {
            try {
                if (!Files.exists(path)) {
                    continue;
                }
                String key = Files.readString(path).trim();
                if (key.startsWith("sk-or-")) {
                    System.setProperty("OPENROUTER_API_KEY", key);
                    System.out.println("Loaded the OpenRouter API key from " + path.toAbsolutePath());
                    return;
                }
                System.out.println(path.toAbsolutePath()
                        + " exists but does not look like an OpenRouter key (expected \"sk-or-...\"). Ignored.");
            } catch (Exception ignored) {
                // fall through to the next candidate
            }
        }
    }
}
