package com.codesage.web;

import static com.codesage.web.ApiDtos.AnalyzeRequest;
import static com.codesage.web.ApiDtos.AnalysisResult;

import com.codesage.ai.AnalysisService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * POST /api/analyze — matches the frontend's ENDPOINTS contract
 * ({ mode, code, language, problem } in; { explanation, debug, sources } out).
 */
@RestController
@RequestMapping("/api")
public class AnalyzeController {

    private final AnalysisService analysisService;

    public AnalyzeController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping("/analyze")
    public AnalysisResult analyze(@RequestBody AnalyzeRequest request) {
        return analysisService.analyze(request);
    }
}
