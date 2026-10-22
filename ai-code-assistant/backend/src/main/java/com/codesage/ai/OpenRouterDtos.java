package com.codesage.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/** OpenAI-compatible wire shapes used by the OpenRouter endpoint. */
public final class OpenRouterDtos {

    private OpenRouterDtos() {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Message(String role, String content) {
    }

    public record ChatRequestBody(
            String model,
            List<Message> messages,
            Double temperature,
            @JsonProperty("max_tokens") Integer maxTokens
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ChatCompletionResponse(List<Choice> choices, ApiError error) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Choice(Message message) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ApiError(String message, String code) {
    }
}
