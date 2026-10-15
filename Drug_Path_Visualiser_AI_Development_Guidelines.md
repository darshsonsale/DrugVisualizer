# Drug Path Visualiser --- AI Development Guidelines

Use this file as persistent guidance for any AI coding assistant working
in this repository. Read it and relevant project documents before
changing code. Preserve approved architecture; make focused changes; do
not invent medical facts, citations, test results, or completion status.

## 1. Medication scope

Support these four medication entries: - **Ibuprofen** --- preserve
approved content and verify scientific claims. - **Amoxicillin capsule**
--- model the capsule/oral formulation. - **Insulin injection** ---
insulin products differ. Specify the insulin type/product for a detailed
model, or label it clearly as a high-level overview. Never imply one
pathway fits all insulin products. - **Ambroxol syrup** --- model the
oral syrup formulation and verify product/jurisdiction-specific claims
where relevant.

Keep the system data-driven: adding a medication should primarily
require reviewed content/configuration, not medication-specific code. Do
not provide dose recommendations, patient-specific treatment, diagnosis,
or advice to start/stop/change medication. Do not assume food effects or
pharmacokinetics are identical across formulations. If evidence is
unclear, say so rather than inventing a difference.

## 2. Scientific citations and quiz evidence

Every scientific claim shown in a pathway/flow diagram, node panel,
condition comparison, or quiz answer/explanation must link to a
traceable source.

Store structured reference metadata where appropriate: - Reference ID,
title, publisher/organization, URL or DOI - Publication/updated date
when available and access date - Source type - Claim/content IDs
supported by the reference

Prefer current official product information, medicines regulators,
authoritative clinical guidance, and relevant peer-reviewed literature.
Match the source to the exact medicine, formulation, route, and claim.
Show readable references near pathway details and quiz explanations,
with a per-medication references view. Never fabricate citations, URLs,
DOI numbers, publication details, or quotations. If a claim lacks
adequate support, flag it for scientific review and do not publish it as
verified. Track review status, reviewer, and review date if the content
workflow supports them.

## 3. Anatomical/pathway visualization accuracy

Review the existing diagram against reliable anatomy and
medicine-specific sources. Use meaningful regions and correctly directed
transitions; distinguish biological stages from educational
simplifications. Label simplifications clearly and never imply the
schematic is a patient-specific model. Keep scientific pathway data
separate from 3D scene layout. Provide an accessible non-3D pathway/list
view with equivalent key information. Test mobile layouts, keyboard
access, legibility, and reduced-motion behavior.

### ROI and YOLO

Region of Interest (ROI) and YOLO are optional techniques, not automatic
requirements. Consider them only if a defined computer-vision problem
warrants them, such as highlighting regions in suitable reference
images. Define inputs, intended outputs, and measurable acceptance
criteria first. Evaluate on held-out, appropriate data and document
failure cases. Model predictions must never serve as medical evidence or
as the sole validator of anatomical/pharmacological truth. YOLO cannot
validate absorption, distribution, metabolism, or excretion. Confirm
image rights and privacy before use. If there is no clear need and
suitable evaluation data, prefer a carefully authored schematic.

## 4. Security and privacy

Treat all user input and external data as untrusted. Validate at UI,
API, business-logic, and database boundaries.

-   Validate every textbox, form field, query/path parameter, and API
    payload **before processing or saving**. Enforce type, length,
    format, allowed values, and business rules on the server; client
    validation is for usability only.
-   Use parameterized SQL/prepared statements or safe ORM APIs. Never
    concatenate user input into SQL or execute user-supplied database
    queries.
-   Never execute input as shell commands, JavaScript, templates, code,
    or dynamic expressions.
-   Encode output for its context. If rich text is necessary, sanitize
    with a strict allowlist; prefer plain text otherwise.
-   Reject malformed pathway graphs, invalid node/edge references,
    unsupported conditions, invalid quiz-option relationships, and
    unauthorized edits.
-   Return safe client errors; do not expose stack traces, secrets, or
    internal implementation details.
-   Enforce authorization on the server for every protected operation.
    Users may access only their own progress/results unless explicitly
    authorized otherwise. Protect admin operations with role-based
    access control and least privilege.
-   Use standards-based Google OAuth/OIDC if sign-in is implemented;
    validate tokens and callback/state handling. Use secure
    session/token handling.
-   Never commit secrets, private keys, OAuth secrets, or database
    credentials. Keep `.env` ignored and provide placeholders only in
    `.env.example`.
-   Use HTTPS/TLS in deployed environments. Encrypt sensitive data at
    rest where appropriate to the threat model; document key management
    and scope.
-   Apply secure cookie/session settings, CSRF protection where
    applicable, restrictive CORS, security headers, and rate limits on
    sensitive endpoints.
-   Do not log passwords, tokens, secrets, or unnecessary personal data.
    Audit sensitive admin changes.
-   Anonymous exploration should continue to work if optional
    sign-in/progress persistence fails.

### Validation layers

-   **Control/component:** required fields, format, length, allowed
    choices, feedback.
-   **Page/form:** required combinations and cross-field rules.
-   **Module/business logic:** domain invariants and pathway/quiz
    relationships.
-   **API:** server-side schema validation, authentication,
    authorization, request-size limits.
-   **Database:** primary/foreign keys, NOT NULL, UNIQUE, CHECK
    constraints, transactions, indexes.

Database constraints are a final integrity boundary, not a substitute
for application validation.

## 5. Data integrity and administration

Use migrations and version-controlled seed data. Keep pathway topology,
educational content, references, and quiz answers consistent. Ensure
edges reference valid nodes. Require appropriate references/review
before publishing scientific content. Record who changed published
content and when where appropriate. Use transactions for multi-record
operations and roll back partial failures. Verify backup and restore
procedures before production.

## 6. Testing

Develop tests throughout implementation, not only at the end. Cover: -
Control and reusable component testing - Unit testing of domain logic,
validation, scoring, and authorization - Module testing - Page testing:
loading, empty, success, error, unauthorized, responsive states -
Validation testing: missing, malformed, oversized, out-of-range,
unsupported, and malicious inputs - API testing: schemas, status codes,
authentication/authorization, rate limits, errors - Database testing:
constraints, migrations, transactions, rollback, referential integrity -
Integration testing: frontend/API/database, references/content,
quiz/results, sign-in/progress - Security testing: SQL injection, XSS,
authorization bypass, IDOR, CSRF where applicable, session/token
handling, secret leakage, unsafe errors - Use-case and end-to-end
testing - Accessibility and responsive testing, including keyboard use
and the non-3D alternative

### Final verification after all 30/30 roadmap tasks

Do not declare completion just because all tasks are checked off. Run
and record: 1. Control testing 2. Unit testing 3. Page testing 4.
Validation testing 5. Use-case testing 6. API, integration, security,
accessibility, and end-to-end regression testing

Completion gate: - Map every requirement to tests and record results. -
All critical tests pass; document failures and accepted risks. -
Scientific claims and quiz explanations have verified references. - All
four medication entries have formulation/route-specific review. - No
unresolved critical/high security issue remains without explicit risk
acceptance. - Build, migrations, seed process, and deployment
instructions work from a clean checkout. - Final report lists tests run,
results, failures, limitations, and remaining work.

## 7. Requirement traceability

Maintain:
`Requirement → Use case → UI/component or module → API/database → Test case → Result`

Update implementation, tests, documentation, and traceability together
when requirements change.

## 8. AI workflow for each task

Before coding: read this file and relevant project documents; identify
task, dependencies, and acceptance criteria; inspect existing
code/tests; raise material conflicts before broad changes.

While coding: follow established patterns and types; keep changes small;
add/update tests and references; keep scientific facts in curated data
rather than hardcoded UI components.

After coding: run available tests, lint, type checks, and build; review
diffs for secrets, unsafe input, missing authorization, unverified
medical claims, and unintended architecture changes. Report changed
files, behavior, commands/tests and results, assumptions, and remaining
issues. Mark criteria complete only when evidence supports it.

## 9. Definition of done

A feature is done only when acceptance criteria are met; scientific
claims are sourced and appropriately reviewed; server-side validation
and authorization are enforced; integrity and failure behavior are
handled; relevant tests pass; responsive/accessibility requirements are
met; documentation and traceability are updated; no secrets are exposed;
and limitations/risks are recorded.
