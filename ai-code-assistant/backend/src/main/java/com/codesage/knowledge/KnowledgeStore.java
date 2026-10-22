package com.codesage.knowledge;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory knowledge base. Seeded with built-in documentation chunks so RAG
 * retrieval works out of the box, and stores uploaded PDF/TXT files at runtime.
 */
@Service
public class KnowledgeStore {

    private final ConcurrentHashMap<String, KnowledgeDocument> docs = new ConcurrentHashMap<>();

    public KnowledgeStore(Chunker chunker, SeedDocuments seeds) {
        for (SeedDocuments.Seed seed : seeds.all()) {
            KnowledgeDocument doc = new KnowledgeDocument(
                    seed.id(), seed.title(), seed.type(), seed.language(),
                    seed.description(), "sample", seed.body(),
                    seed.body().getBytes(StandardCharsets.UTF_8).length);
            doc.setChunks(chunker.chunk(doc.getId(), doc.getTitle(), doc.getText()));
            docs.put(doc.getId(), doc);
        }
    }

    public List<KnowledgeDocument> all() {
        List<KnowledgeDocument> list = new ArrayList<>(docs.values());
        // Newest uploads first, then seeded docs sorted by title.
        list.sort((a, b) -> {
            boolean ua = a.getId().startsWith("upl-");
            boolean ub = b.getId().startsWith("upl-");
            if (ua != ub) {
                return ua ? -1 : 1;
            }
            return a.getTitle().compareToIgnoreCase(b.getTitle());
        });
        return list;
    }

    public KnowledgeDocument add(String title, String type, String language, String description,
                                 String text, long sizeBytes) {
        String id = "upl-" + UUID.randomUUID();
        KnowledgeDocument doc = new KnowledgeDocument(
                id, title, type, language, description, "sample", text, sizeBytes);
        doc.setChunks(new Chunker().chunk(doc.getId(), doc.getTitle(), doc.getText()));
        docs.put(id, doc);
        return doc;
    }

    public boolean delete(String id) {
        return docs.remove(id) != null;
    }

    public KnowledgeDocument byId(String id) {
        return docs.get(id);
    }

    public boolean isEmpty() {
        return docs.isEmpty();
    }

    public String describe(KnowledgeDocument doc) {
        return String.format(Locale.ROOT, "%s (%s, %s)", doc.getTitle(), doc.getType(), doc.getLanguage());
    }
}
