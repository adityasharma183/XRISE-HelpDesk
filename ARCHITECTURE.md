# XRISEAI Mini Helpdesk — Technical Architecture & System Design

This document details the architectural decisions, database schemas, authorization mechanisms, scalability considerations, observability practices, and infrastructure topology for the **XRISEAI Mini Helpdesk** platform.

---

## 1. High-Level System Architecture

```mermaid
graph TD
    subgraph ClientLayer["Client Layer (Browser)"]
        User["Customer / Support Agent / Administrator"]
        ReactSPA["React 18 + Vite SPA (Plus Jakarta Sans UI)"]
    end

    subgraph NetworkTopology["Network & Routing Architecture"]
        LocalDev["Local Dev Mode: direct HTTP to :8000"]
        DockerNginx["Docker Mode: Nginx Reverse Proxy (:80 on Host :5173)"]
    end

    subgraph BackendLayer["Backend Application Layer"]
        ExpressAPI["Express 4 + Node 20 LTS (Host :8000 in Dev / Container :5000 on Host :5001)"]
        SwaggerDoc["Swagger / OpenAPI 3.0 (/api-docs & /api-docs.json)"]
        AuthMiddleware["JWT & RBAC Security Middleware"]
        MulterMiddleware["Multer MemoryStorage File Parser"]
        TicketService["Ticket & Lifecycle Domain Service"]
        AiService["AiService Abstraction & Heuristics"]
        EmailService["Nodemailer SMTP Transporter"]
        UploadService["Cloudinary Uploader Pipeline"]
    end

    subgraph ExternalCloud["External Cloud Infrastructure"]
        MongoAtlas[("MongoDB Atlas Cloud Cluster (Mongoose ODM)")]
        CloudinaryCDN[("Cloudinary Cloud Storage (Attachments CDN)")]
        GeminiAPI["Google Gemini 3.6 Flash LLM API"]
        GmailSMTP["Gmail SMTP Gateway / Custom SMTP"]
    end

    User --> ReactSPA
    ReactSPA -->|Local Dev :5173 -> :8000| LocalDev
    ReactSPA -->|Docker :5173 -> :80| DockerNginx
    LocalDev --> ExpressAPI
    DockerNginx -->|/api/* proxy_pass| ExpressAPI

    ExpressAPI --> AuthMiddleware
    ExpressAPI --> SwaggerDoc
    ExpressAPI --> MulterMiddleware

    AuthMiddleware --> TicketService
    MulterMiddleware --> UploadService

    TicketService --> MongoAtlas
    UploadService --> CloudinaryCDN
    TicketService -.->|Async Resolution Notice| EmailService
    EmailService -.-> GmailSMTP

    TicketService -.->|AI Triage / Draft Requests| AiService
    AiService -.->|HTTPS REST| GeminiAPI

    classDef primary fill:#2563eb,stroke:#1d4ed8,color:#fff;
    classDef secondary fill:#7c3aed,stroke:#6d28d9,color:#fff;
    classDef storage fill:#059669,stroke:#047857,color:#fff;
    classDef external fill:#d97706,stroke:#b45309,color:#fff;

    class User,ReactSPA primary;
    class ExpressAPI,SwaggerDoc,AuthMiddleware,MulterMiddleware,TicketService,AiService,EmailService,UploadService secondary;
    class MongoAtlas,CloudinaryCDN storage;
    class GeminiAPI,GmailSMTP external;
```

---

## 2. Port Architecture & Environment Separation

The application strictly separates Local Development from Docker Containerization:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             LOCAL DEVELOPMENT                               │
│                                                                             │
│   Frontend Client            Backend Server          Swagger Docs           │
│   http://localhost:5173  ──► http://localhost:8000   http://localhost:8000  │
│                                (PORT=8000)                 /api-docs        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            DOCKER CONTAINERIZATION                          │
│                                                                             │
│   Browser Client             Nginx Container         Backend Container      │
│   http://localhost:5173  ──► (Port 80 on Host)   ──► (Port 5000 internal)   │
│                                Proxy /api/* ──►      Host port: 5001        │
│                                                      Swagger: :5001/api-docs│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Request Flow Lifecycle

Every incoming HTTP request follows a deterministic, unidirectional pipeline:

```
Request
  │
  ▼
[Security & Tracing Middleware]
  ├── Helmet Security Headers
  ├── CORS Validation
  ├── Pino Request Logger (with correlation x-request-id)
  └── Express Rate Limiter
  │
  ▼
[Parsing & Upload Middleware]
  ├── express.json({ limit: '1mb' })
  ├── cookieParser()
  └── Multer upload.array('attachments', 5) [if multipart/form-data]
  │
  ▼
[Authentication & RBAC Middleware]
  ├── authenticate (Extracts JWT from HttpOnly cookie or Bearer header)
  └── authorize('ADMIN') [for restricted routes]
  │
  ▼
[Validation Layer]
  └── validate({ body, query, params }) with Zod Schemas
  │
  ▼
[Controller Layer] (Thin, parses request DTO, calls domain services)
  │
  ▼
[Domain Services Layer]
  ├── TicketService / AuthService / UserService
  ├── UploadService (streams buffers to Cloudinary)
  ├── EmailService (asynchronous SMTP dispatches)
  └── AiService (Gemini API with fallback heuristics)
  │
  ▼
[Persistence Layer]
  └── Mongoose Models (with Compound Indexes and Connection Pooling)
  │
  ▼
[Response Transformation Layer]
  └── ApiResponse.success / ApiResponse.paginated (Consistent Envelope)
```

---

## 4. Data Models & Database Design

```mermaid
erDiagram
    USER ||--o{ TICKET : "assigned to"
    USER ||--o{ TICKET_MESSAGE : "authors"
    USER ||--o{ TICKET_EVENT : "initiates"
    TICKET ||--|{ TICKET_MESSAGE : "contains"
    TICKET ||--|{ TICKET_EVENT : "logs"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string passwordHash
        string role "ADMIN | AGENT"
        boolean isActive
        string avatar
        date createdAt
        date updatedAt
    }

    TICKET {
        ObjectId _id PK
        string ticketId UK "XR-XXXXXX"
        object customer "name, email"
        string subject
        string body
        string priority "LOW | MEDIUM | HIGH | URGENT"
        string status "OPEN | IN_PROGRESS | RESOLVED | CLOSED"
        ObjectId assignee FK "ref User"
        array attachments "[{ publicId, url, name, size, mimeType, format }]"
        object aiCache "{ category, suggestedPriority, summary, currentState, suggestedNextStep }"
        date closedAt
        date createdAt
        date updatedAt
    }

    TICKET_MESSAGE {
        ObjectId _id PK
        string ticketId FK "XR-XXXXXX"
        string senderType "CUSTOMER | AGENT"
        ObjectId senderId FK "ref User (optional)"
        string senderName
        string body
        array attachments "[{ publicId, url, name, size, mimeType, format }]"
        date createdAt
        date updatedAt
    }

    TICKET_EVENT {
        ObjectId _id PK
        string ticketId FK "XR-XXXXXX"
        string type "CREATED | ASSIGNED | REASSIGNED | REPLIED | STATUS_CHANGED"
        object actor "{ id, name, email, role }"
        object metadata "{ previousStatus, newStatus, assigneeName, etc. }"
        date createdAt
    }
```

### Schema Decisions & Tradeoff Justification

1. **Dedicated Collections vs. Embedded Arrays**:
   - Rather than storing `messages: []` and `events: []` inside the `Ticket` document, we maintain separate `TicketMessage` and `TicketEvent` collections.
   - **Prevents Document Bloat**: Guarantees the 16MB MongoDB document boundary is never exceeded.
   - **Immutable Compliance Audit Trail**: Events are append-only.
   - **Independent Pagination**: Allows fast retrieval of conversation history.
2. **Lightweight Embedded `aiCache`**:
   - Persisted on `Ticket` to eliminate multi-collection `$lookup` joins when loading ticket details.
   - Atomically invalidated (`$set: { 'aiCache.summary': null }`) whenever a new reply is created.
3. **Compound Indexes**:
   - `{ assignee: 1, status: 1, createdAt: -1 }`: Optimizes agent dashboard queries.
   - `{ ticketId: 1 }`: Unique B-tree index for O(1) telemetry lookups.
   - `{ 'customer.email': 1 }`: Accelerated public ticket verification.
   - Text index on `{ subject: 10, body: 5 }`: Fast full-text search.

---

## 5. File Upload & Cloudinary Storage Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer / Agent
    participant UI as React UI (FileUploadInput)
    participant Multer as Multer MemoryStorage
    participant Controller as TicketController
    participant UploadService as UploadService
    participant Cloudinary as Cloudinary API
    participant DB as MongoDB Atlas

    Customer->>UI: Selects files (PNG, JPG, PDF, DOCX, CSV)
    UI->>Multer: POST /api/public/tickets or /api/tickets/:id/replies (multipart/form-data)
    Multer->>Multer: Validate file size (<=10MB) & MIME type in RAM buffer
    Multer->>Controller: req.files (Buffer[])
    Controller->>UploadService: uploadFiles(files)
    loop For each file buffer
        UploadService->>Cloudinary: uploader.upload_stream({ folder: 'mini-helpdesk/attachments' })
        Cloudinary-->>UploadService: { secure_url, public_id, bytes, format }
    end
    UploadService-->>Controller: AttachmentDto[]
    Controller->>DB: Save ticket / message with attachments array
    DB-->>Controller: Persisted Document
    Controller-->>UI: 201 Created with secure file URLs
    UI->>Customer: Display AttachmentList with image previews & download badges
```

---

## 6. Authentication, Security & RBAC Scoping

### 1. Token Architecture
- **JWT Signing**: HMAC-SHA256 signature using a minimum 32-character secret (`JWT_SECRET`).
- **Cookie Transport**: `HttpOnly`, `SameSite=None` (or `Lax`), `Secure` cookie preventing cross-site scripting (XSS) extraction.
- **Authorization Header**: Supports `Authorization: Bearer <token>` for API clients and Swagger UI.

### 2. Database-Level Query Scoping
Security is enforced at the database query level rather than relying on frontend route guards:

```ts
// Enforced inside TicketService.getTickets():
const filter: FilterQuery<ITicketDocument> = {};

if (user.role === 'AGENT') {
  // Agent query automatically constrained to their assigned user ID
  filter.assignee = user._id;
}
// ADMIN role can query all tickets or specify an optional assignee filter
```

---

## 7. Google Gemini AI Enhancement Layer

```mermaid
sequenceDiagram
    autonumber
    actor Agent as Support Agent / Admin
    participant UI as React UI (AiAssistantPanel)
    participant Auth as Auth & RBAC Middleware
    participant Controller as TicketController
    participant Service as TicketService & AiService
    participant Provider as GeminiProvider (IAiProvider)
    participant Gemini as Google Gemini 3.6 Flash API

    Agent->>UI: Clicks "Analyze Ticket" / "Summarize" / "Generate Reply"
    UI->>Auth: POST /api/tickets/:ticketId/ai/{action}
    Auth->>Auth: Verify JWT & ticket ownership (Agent vs Admin)
    Auth->>Controller: Forward authorized request
    Controller->>Service: analyzeTicket() / summarizeTicket() / generateAiDraft()
    Service->>Service: Sanitize context (limit to last 10 messages, strip credentials)
    Service->>Provider: Invoke IAiProvider method
    Provider->>Gemini: Prompt with <untrusted_customer_context> & JSON schema
    alt Gemini API Available
        Gemini-->>Provider: Structured JSON / draft text
        Provider->>Provider: Validate with Zod schema
    else Gemini Offline / Missing Key
        Provider->>Provider: Execute deterministic rule-based heuristic fallback
    end
    Provider-->>Service: Validated domain result
    Service-->>Controller: Return result
    Controller-->>UI: 200 OK with structured data
    UI->>Agent: Display classification badges / summary / editable reply draft
    Note over Agent,UI: Human-in-the-Loop: Agent reviews, edits, and manually sends reply
```

### Safety & Privacy Guarantees:
- **Zero Core Dependency**: Core ticket submission and resolution never depend on AI availability.
- **Prompt Injection Defense**: Untrusted customer inputs are wrapped in strict delimiters (`<untrusted_customer_context>`).
- **Human-in-the-Loop**: Drafts are populated into an editable composer; AI never sends messages autonomously.

---

## 8. Scalability & Concurrency Strategy

1. **Horizontal API Scaling**: Stateless Express containers behind Nginx load balancing.
2. **Database Concurrency**: Atomic `findOneAndUpdate` operations prevent race conditions during ticket reassignment or status transitions.
3. **Connection Pooling**: Mongoose connection pool (`maxPoolSize: 50`) optimized for high-throughput container clusters.
4. **Cloud Media Offload**: Multer memory buffers stream directly to Cloudinary CDN, bypassing local disk I/O bottlenecks.

---

## 9. Observability & Telemetry

- **Structured JSON Logging**: Pino logger outputs structured logs with correlation IDs (`x-request-id`).
- **Secret Redaction**: Passwords, authorization tokens, cookies, and database credentials are automatically redacted from logs.
- **Health Telemetry**: `/api/health` exposes real-time uptime, service status, and MongoDB Atlas connectivity state.
