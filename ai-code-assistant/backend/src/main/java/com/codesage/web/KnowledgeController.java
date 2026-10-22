package com.codesage.web;

import static com.codesage.web.ApiDtos.HealthResponse;
import static com.codesage.web.ApiDtos.KnowledgeDocDto;

import com.codesage.ai.OpenRouterClient;
import com.codesage.knowledge.DocumentParser;
import com.codesage.knowledge.KnowledgeDocument;
import com.codesage.knowledge.KnowledgeStore;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/** Knowledge-base CRUD plus the readiness endpoint. */
@RestController
@RequestMapping("/api")
public class KnowledgeController {

    private static final long MAX_BYTES = 10L * 1024 * 1024; // 10 MB, matches the UI hint
    private static final Set<String> ALLOWED = Set.of(".pdf", ".txt", ".md", ".java", ".py", ".js", ".ts", ".c", ".cpp");

    private final KnowledgeStore knowledge;
    private final DocumentParser parser;
    private final OpenRouterClient openRouter;

    public KnowledgeController(KnowledgeStore knowledge, DocumentParser parser, OpenRouterClient openRouter) {
        this.knowledge = knowledge;
        this.parser = parser;
        this.openRouter = openRouter;
    }

    @GetMapping("/health")
    public HealthResponse health() {
        return new HealthResponse("UP", openRouter.isConfigured(), openRouter.currentModel());
    }

    @GetMapping("/knowledge-base")
    public List<KnowledgeDocument.ApiShape> list() {
        return knowledge.all().stream().map(document -> document.toDto()).toList();
    }

    /** Multipart field name "file" matches the frontend's uploadDocument(). */
    @PostMapping("/knowledge-base/upload")
    public KnowledgeDocument.ApiShape upload(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Choose a file to upload.");
        }
        String originalName = file.getOriginalFilename() == null ? "document" : file.getOriginalFilename();
        String extension = extension(originalName);
        if (!ALLOWED.contains(extension)) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Unsupported file type. Allowed: .pdf, .txt, .md, .java, .py, .js, .ts, .c, .cpp");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "That file is larger than 10 MB.");
        }

        DocumentParser.Extracted extracted;
        try {
            extracted = parser.parse(MultipartFileUtil.toFile(file), originalName);
        } catch (IllegalStateException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, e.getMessage());
        }

        String language = MultipartFileUtil.guessLanguage(originalName, extracted);
        String title = MultipartFileUtil.stripExtension(originalName);
        String description = MultipartFileUtil.describe(language, extracted);

        KnowledgeDocument saved = knowledge.add(
                title, extracted.kind(), language, description, extracted.text(), file.getSize());
        return saved.toDto();
    }

    @DeleteMapping("/knowledge-base/{id}")
    public void delete(@PathVariable String id) {
        if (!knowledge.delete(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "That document does not exist.");
        }
    }

    private static String extension(String name) {
        int dot = name.lastIndexOf('.');
        return dot >= 0 ? name.substring(dot).toLowerCase(Locale.ROOT) : "";
    }

    /** Small helpers kept out of the controller body. */
    static final class MultipartFileUtil {
        private MultipartFileUtil() {
        }

        static java.io.File toFile(MultipartFile file) {
            try {
                java.nio.file.Path temp = java.nio.file.Files.createTempFile("codesage-upload-", ".tmp");
                file.transferTo(temp.toFile());
                temp.toFile().deleteOnExit();
                return temp.toFile();
            } catch (IOException e) {
                throw new IllegalStateException("That file could not be read: " + e.getMessage(), e);
            }
        }

        static String stripExtension(String name) {
            int dot = name.lastIndexOf('.');
            String clean = (dot > 0 ? name.substring(0, dot) : name).replace('_', ' ').replace('-', ' ');
            return clean.isBlank() ? name : clean;
        }

        static String guessLanguage(String name, DocumentParser.Extracted extracted) {
            String lower = name.toLowerCase(Locale.ROOT);
            String language = switch (extensionOf(lower)) {
                case ".py" -> "Python";
                case ".js" -> "JavaScript";
                case ".ts" -> "TypeScript";
                case ".java" -> "Java";
                case ".c" -> "C";
                case ".cpp" -> "C++";
                default -> "General";
            };
            return language.equals("General") && extracted.text() != null
                    && extracted.text().contains("def ") && extracted.kind().equals("TXT") ? "Python" : language;
        }

        static String describe(String language, DocumentParser.Extracted extracted) {
            int words = extracted.text() == null || extracted.text().isBlank()
                    ? 0
                    : extracted.text().strip().split("\\s+").length;
            return "Indexed for retrieval · " + words + " words · " + language;
        }

        private static String extensionOf(String name) {
            int dot = name.lastIndexOf('.');
            return dot >= 0 ? name.substring(dot) : "";
        }
    }
}
