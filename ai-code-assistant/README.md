# CodeSage AI: AI-Powered Code Explainer and Debugging Assistant (RAG)

React + Vite frontend. It runs fully in **Demo Mode** (pre-written sample data) so it works without the backend.
The existing `backend/` folder is not touched by anything here.

## Run it

## Frontend only (Demo Mode)

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into frontend/dist
```

Sign up or log in with any valid email and a password of 8+ characters when on Demo Mode.

## Full stack (Spring Boot backend + OpenRouter AI)

```bash
# 1. Set your OpenRouter key (https://openrouter.ai/keys) in the environment:
#    PowerShell:  $env:OPENROUTER_API_KEY = "sk-or-v1-..."
#    Or change `openrouter.api-key` in backend/src/main/resources/application.yml

# 2. Start the backend (http://localhost:8080):
cd backend
mvn spring-boot:run

# 3. Start the frontend:
cd ../frontend
npm run dev        # http://localhost:5173
```

The frontend `.env` already contains `VITE_USE_MOCK=false` and `VITE_API_BASE_URL=http://localhost:8080`.

> The Monaco editor loads its files from a CDN, so the editor needs an internet connection. Fonts are self-hosted in `frontend/public/fonts`, so the UI has no font CDN dependency.

## What works

- Login, signup, sign out, and route protection
- Dashboard: language selector (Python, JavaScript, Java, C++, C, TypeScript), Monaco editor, problem description, Explain Code, Debug Code, Reset, source-file upload
- Analysis tabs: Code Explanation, Detected Issues (severity, line, fix), Suggested Fix (copy / apply to editor), Source References
- Flagged lines are highlighted in the editor after Debug Code
- "No supporting documentation" warning when nothing relevant is found (try C in Demo Mode)
- Knowledge Base page (sample docs, search, PDF/TXT upload) and Analysis History page (saved in this browser)
- Loading, empty and error states; responsive layout; keyboard-accessible tabs and menus

## What is still mock data

| Area | Demo Mode behavior |
| --- | --- |
| Explain / Debug | Pre-written output for the built-in example in each language. No AI model runs. |
| Source References | Pre-written passages. No retrieval happens. C has none on purpose. |
| Knowledge Base | Sample documents. Uploads are only listed locally and are never read or indexed. |
| History | Stored in `localStorage` with three sample entries. |
| Login / signup | Accepts any valid email and an 8+ character password. No token is issued. |

The UI labels all of this as Demo Mode and does not claim real inference or RAG.

## Connecting the Java / Spring Boot backend

1. Copy `frontend/.env.example` to `frontend/.env`, set `VITE_API_BASE_URL`, and set `VITE_USE_MOCK=false`.
2. Fill in the paths in `ENDPOINTS` in `frontend/src/services/api.js`. They are `null` on purpose because the real paths are not known. Until they are set, live calls fail with a clear message.
3. Make the backend return the shapes below (they match `src/data/mockAnalysis.js`). This is the contract the UI expects, not an existing API.
4. Allow the frontend origin (`http://localhost:5173` in development) in the backend's CORS configuration.

```text
login / signup  -> { user: { name, email }, token }
analyze (POST { mode, code, language, problem }) ->
{
  explanation: { summary, steps: [string], entities: [{ name, kind, description }], note? } | null,
  debug: { summary, issues: [{ id, severity: "critical|high|medium|low", line, title, description, fix }], correctedCode } | null,
  sources: [{ id, title, section, page, excerpt }],     // empty array => "not grounded" warning
  demo: false
}
knowledgeBase (GET)   -> [{ id, title, type, language, length, size, description, status }]
uploadDocument (POST multipart "file") -> the created document, same shape
```

Never put API keys or secrets in `VITE_` variables: they are bundled into the browser. The token is sent as `Authorization: Bearer <token>`;
for production, prefer an HttpOnly cookie set by the backend over `localStorage`.

## Structure

```text
frontend/src
  main.jsx, App.jsx, index.css
  context/AuthContext.jsx        session state (login, signup, logout)
  components/                    Navbar, Sidebar, CodeInput, LanguageSelector, AnalysisResult,
                                 IssueList, SourceReferences, FileUpload, Loader, AuthLayout
  pages/                         Home, KnowledgeBase, History, Login, Signup
  services/api.js                Axios client, ENDPOINTS, Demo Mode switch
  data/mockAnalysis.js           all mock data
```
