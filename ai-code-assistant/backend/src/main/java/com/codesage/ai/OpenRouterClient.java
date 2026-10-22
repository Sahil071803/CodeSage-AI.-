package com.codesage.ai;

import com.codesage.web.ApiException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

import static com.codesage.ai.OpenRouterDtos.ChatRequestBody;
import static com.codesage.ai.OpenRouterDtos.ChatCompletionResponse;
import static com.codesage.ai.OpenRouterDtos.Message;

/**
 * Thin OpenRouter chat-completions client. OpenRouter speaks the OpenAI
 * protocol, so this only needs raw java.net.http + Jackson — no SDK on the
 * classpath, and one place to tune model, temperature and timeouts.
 */
@Service
public class OpenRouterClient {

    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${openrouter.api-key:}")
    private String apiKey;

    @Value("${openrouter.base-url:https://openrouter.ai/api/v1}")
    private String baseUrl;

    @Value("${openrouter.model:openai/gpt-4o-mini}")
    private String model;

    @Value("${openrouter.temperature:0.2}")
    private double temperature;

    @Value("${openrouter.max-tokens:1600}")
    private int maxTokens;

    @Value("${openrouter.timeout-seconds:90}")
    private long timeoutSeconds;

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public String currentModel() {
        return model;
    }

    /** Sends one chat completion and returns the assistant's content string. */
    public String complete(String systemPrompt, String userPrompt) {
        if (!isConfigured()) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "The AI backend is not configured. Set the OPENROUTER_API_KEY environment variable and restart.");
        }

        try {
            ChatRequestBody body = new ChatRequestBody(
                    model,
                    List.of(new Message("system", systemPrompt), new Message("user", userPrompt)),
                    temperature,
                    maxTokens);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/chat/completions"))
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .header("HTTP-Referer", "http://localhost:5173")
                    .header("X-Title", "CodeSage AI")
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)))
                    .build();

            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                throw new ApiException(HttpStatus.BAD_GATEWAY,
                        "OpenRouter request failed (HTTP " + response.statusCode() + "): " + safeError(response.body()));
            }

            ChatCompletionResponse parsed = mapper.readValue(response.body(), ChatCompletionResponse.class);
            if (parsed.choices() == null || parsed.choices().isEmpty()) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "OpenRouter returned no completion. Try again.");
            }
            String content = parsed.choices().get(0).message().content();
            if (content == null || content.isBlank()) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "OpenRouter returned an empty completion.");
            }
            return content;
        } catch (ApiException e) {
            throw e;
        } catch (java.io.IOException e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Could not reach OpenRouter: " + e.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ApiException(HttpStatus.BAD_GATEWAY, "The AI request was interrupted.");
        }
    }

    private String safeError(String body) {
        if (body == null) {
            return "no response body";
        }
        try {
            ChatCompletionResponse parsed = mapper.readValue(body, ChatCompletionResponse.class);
            if (parsed.error() != null && parsed.error().message() != null) {
                return parsed.error().message();
            }
        } catch (Exception ignored) {
            // fall through and show the raw body
        }
        return body.length() > 300 ? body.substring(0, 300) + "…" : body;
    }
}
