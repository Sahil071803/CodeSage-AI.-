package com.codesage.ai;

import com.codesage.knowledge.KnowledgeDocument;
import com.codesage.knowledge.KnowledgeStore;
import com.codesage.knowledge.SimpleRetriever;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

import static com.codesage.web.ApiDtos.SourceRef;

/**
 * Simple retrieval-augmented generation glue: scores knowledge-base chunks
 * against the user's code + problem text and turns the best hits into
 * (a) prompt context and (b) the "sources" list the UI renders.
 */
@Service
public class RetrievalService {

    private static final String SOURCE_PARAGRAPH_FALLBACK = "—";

    private final KnowledgeStore knowledge;
    private final SimpleRetriever retriever;

    @org.springframework.beans.factory.annotation.Value("${rag.max-chunks:4}")
    private int topK;

    @org.springframework.beans.factory.annotation.Value("${rag.min-score:0.05}")
    private double minScore;

    public RetrievalService(KnowledgeStore knowledge, SimpleRetriever retriever) {
        this.knowledge = knowledge;
        this.retriever = retriever;
    }

    public record Retrieved(String contextBlock, List<SourceRef> sources) {
    }

    /** Retrieves supporting passages and formats both prompt context and citations. */
    public Retrieved retrieve(String language, String code, String problem) {
        String query = (problem == null ? "" : problem + "\n") + (code == null ? "" : code);
        List<SimpleRetriever.ScoredChunk> hits =
                retriever.topScored(knowledge.all(), query, topK, minScore);

        if (hits.isEmpty()) {
            return new Retrieved("", List.of());
        }

        StringBuilder context = new StringBuilder();
        List<SourceRef> sources = new ArrayList<>();
        int index = 1;
        for (SimpleRetriever.ScoredChunk hit : hits) {
            KnowledgeDocument.Chunk chunk = hit.chunk();
            context.append("[Passage ").append(index).append("] ")
                    .append(chunk.title()).append(" – ").append(chunk.section()).append('\n')
                    .append(chunk.text()).append("\n\n");
            sources.add(new SourceRef(
                    chunk.id(),
                    chunk.title(),
                    chunk.section(),
                    SOURCE_PARAGRAPH_FALLBACK,
                    excerpt(chunk.text())));
            index++;
        }
        return new Retrieved(context.toString(), sources);
    }

    private static String excerpt(String text) {
        if (text == null) {
            return "";
        }
        String trimmed = text.strip();
        if (trimmed.length() <= 320) {
            return trimmed;
        }
        return trimmed.substring(0, 320) + "…";
    }
}
