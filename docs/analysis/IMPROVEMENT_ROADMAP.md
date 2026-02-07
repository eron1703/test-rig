# Test-Rig Improvement Roadmap

**Date:** February 7, 2026
**Status:** Based on comprehensive analysis of implementation, test reports, and codebase audit

---

## Executive Summary

Test-Rig has **sound architecture** and **comprehensive scope** (monoliths + microservices, multi-framework support), but is hindered by **critical implementation bugs** that prevent production use. The tool demonstrates strong potential for AI-driven test automation but needs focused execution on blockers before strategic enhancements.

**Current State:** 65% functional (core parallelization works, test generation broken, server incomplete)
**Market Fit:** CI/CD automation tool for coding agents + developer workflows
**Differentiation:** Multi-agent parallel execution + component-based specs + cross-framework support

---

## CRITICAL BLOCKERS (Must Fix for Basic Usability)

### 1. **PascalCase Template Bug** ⚠️ BLOCKING
**Issue:** Test generation produces syntactically invalid TypeScript
**Root Cause:** Template placeholders use PascalCase (e.g., `UserService`), but component names are kebab-case (e.g., `user-service`), causing invalid identifiers like `user-service` in type annotations.

**Impact:**
- Generated test files don't compile
- Unit tests, integration tests, and factories all broken
- Command `test-rig generate user-service` produces unusable output
- **Customer Pain:** "Generate command is worthless"

**Example Failure:**
```typescript
// Line 11 - INVALID SYNTAX
import { user-service } from '@/services/user-service';
// TS Error: ',' expected

// Line 30 - INVALID TYPE
let userService: user-service;
// TS Error: Cannot use kebab-case in type annotations
```

**Fix Approach:** (2-3 hours)
1. Implement case conversion: kebab-case → PascalCase (e.g., `user-service` → `UserService`)
2. Implement case conversion: kebab-case → camelCase for variables
3. Add TypeScript validation before writing files
4. Test with multiple naming patterns (single-word, multi-hyphen)

**Files to Modify:**
- `/src/agents/test-generator.ts` (lines 28-89)
- Add utility function `convertKebabToPascalCase()`
- Add validation step in `generateTests()`

**Validation:**
- Generate tests for `user-service` → compiles without errors
- Generate tests for `auth-controller` → compiles without errors
- Factory names: `user-service-user-service.factory.ts` → `UserServiceFactory.ts`

---

### 2. **Mocha Framework Handler Missing** ⚠️ BLOCKING
**Issue:** README claims "Framework Support: Vitest, Pytest, Playwright" but Mocha isn't listed yet is commonly requested.

**Current State:**
- `src/core/framework-installer.ts` only supports Vitest, Jest, Pytest
- `src/core/test-runner.ts` only has parsers for Vitest and Pytest
- No Mocha command or JSON reporter configuration

**Impact:**
- Projects using Mocha cannot be tested
- Common in older Node.js projects
- Inconsistent with feature claims

**Fix Approach:** (3-4 hours)
1. Add Mocha JSON reporter parser (similar to Vitest parser)
2. Update `framework-installer.ts` to install Mocha dependencies
3. Add `--reporter json` to Mocha commands
4. Document Mocha setup requirements

**Files to Create/Modify:**
- Modify `/src/core/test-runner.ts`: Add `parseMochaResults()` function
- Modify `/src/core/framework-installer.ts`: Add Mocha installation
- Create fixture: `tests/fixtures/mocha-output.json`

**Test Coverage:**
- Parse Mocha JSON reporter output (similar to Vitest)
- Handle Mocha-specific failure formats
- Extract duration from hooks

---

### 3. **Container Selection Not Saved to Config** ⚠️ BLOCKING
**Issue:** During `test-rig setup`, users select container runtime (Docker, Podman, etc.) but selection isn't saved to config.

**Impact:**
- Running `test-rig run` doesn't know which container runtime to use
- Testcontainers integration fails silently
- Container tests can't run in CI/CD without manual intervention

**Current Behavior:**
```bash
$ test-rig setup
? Select container runtime: [Docker, Podman, None]
# Selection made but lost
$ cat test-rig.config.yaml
# No containerRuntime field
```

**Fix Approach:** (1-2 hours)
1. Add `containerRuntime` field to config schema
2. Save selection to `test-rig.config.yaml` during setup
3. Load container runtime from config in test-runner
4. Validate container is available before test run

**Files to Modify:**
- `/src/core/config-generator.ts`: Add container field
- `/src/cli/commands/setup.ts`: Save container selection
- `/src/core/test-runner.ts`: Load and validate container

**Validation:**
- `test-rig setup` → config contains `containerRuntime: docker`
- `test-rig run` → uses saved container runtime
- Fails gracefully if container unavailable

---

### 4. **Build Configuration - Templates Not Distributed**
**Issue:** Template files must be manually copied after build (workaround: `cp src/templates/*.ts dist/templates/`)

**Current Problem:**
- `tsconfig.json` excludes `src/templates/**/*` from compilation
- Build doesn't copy template files to dist
- Runtime tries to load templates that don't exist
- **Fix Required:** Every build needs manual intervention

**Impact:**
- Deployment is broken without manual steps
- CI/CD pipelines can't build reliably
- npm publish would fail if templates are missing

**Fix Approach:** (1 hour)
1. Update `tsconfig.json` to include templates as assets
2. Add build script to copy templates
3. Verify templates are included in npm package

**Files to Modify:**
- `/tsconfig.json`: Adjust `include` patterns
- `/package.json`: Add post-build copy command

---

## QUICK WINS (Low Effort, High Impact)

### 5. **Implement Watch Mode** ⭐ QUICK WIN
**Issue:** `--watch` flag exists in CLI but isn't implemented (options passed but not used)

**Current State:**
```typescript
// src/cli/commands/run.ts
watch: options.watch  // Passed to orchestrator, but not used
```

**Impact:**
- Developers can't reload tests on file changes
- Requires manual re-running for each change
- Poor developer experience vs standard tools

**Fix Approach:** (2 hours)
1. Detect file changes using `chokidar` (already available via dependencies)
2. Re-run tests when files change
3. Show change summary before re-run
4. Add `--debounce` option for rapid changes

**Files to Modify:**
- `/src/cli/commands/run.ts`: Implement watch mode logic
- Add dependency: `chokidar` (if not already available)

**Validation:**
```bash
test-rig run --watch
# Modify a test file
# Tests should automatically re-run within 1 second
```

---

### 6. **CLI UX - Better Error Messages** ⭐ QUICK WIN
**Issue:** Error messages don't guide users to solutions

**Current Examples:**
```
Error: test-rig.config.yaml not found. Run "test-rig setup" first.
# ✓ Good - tells user what to do

Error: Framework detection failed
# ✗ Bad - doesn't explain why or how to fix
```

**Impact:**
- First-time users are confused
- Support burden increases
- Bad perception of tool maturity

**Quick Wins** (2-3 hours each):
1. **Component not found:** Show available components from specs
2. **Framework detection failed:** List detected files and why detection failed
3. **Test run failed:** Show which test files exist vs what was searched for
4. **Config missing:** Suggest exact `test-rig setup` command with flags

**Files to Modify:**
- All `src/cli/commands/*.ts`: Enhance error handling
- Add helper: `src/cli/utils/error-messages.ts`

---

### 7. **Documentation - API Reference & Examples** ⭐ QUICK WIN
**Issue:** README lacks:
- API endpoint documentation (server mode)
- Component spec YAML schema
- Template customization guide
- Troubleshooting section

**Impact:**
- Users can't integrate with custom tools
- Component spec feature is undiscovered
- Setup failures are hard to debug

**Effort:** 3 hours (documentation only, no code)

**Deliverables:**
1. `docs/api-reference.md` - Server API endpoints and payloads
2. `docs/component-specs.md` - YAML schema with examples
3. `docs/troubleshooting.md` - Common issues and solutions
4. `docs/custom-templates.md` - How to override templates

---

### 8. **Container Selection Persistence** ⭐ QUICK WIN (Grouped with Blocker #3)
**Effort:** 1-2 hours (includes Blocker #3 fix)

---

## STRATEGIC ENHANCEMENTS (Differentiation)

### 9. **AI-Powered Test Suggestions** 🎯 STRATEGIC
**Gap:** Tool claims "AI-Powered Generation" but uses simple templates, not real AI analysis

**Current Implementation:**
- Template-based generation (no AI)
- Simple filename analysis (no AST)
- No coverage gap detection

**Opportunity:** Add Claude API integration for intelligent test generation

**Proposed Features:**
1. **Coverage Gap Detection**
   - Parse coverage report
   - Identify untested code paths
   - Generate tests for gaps
   - Integration with Claude for suggesting test cases

2. **Test Case Suggestions**
   - Analyze function signatures
   - Suggest test scenarios
   - Auto-generate mock setup

3. **Failure Root Cause Analysis**
   - Parse failing test output
   - Suggest fixes or debugging steps

**Effort:** 6-8 hours (Claude API integration, caching, cost management)

**Impact:** 9/10 - Sets test-rig apart from Vitest, differentiates from commodity tools

**Files to Create:**
- `/src/agents/claude-analyzer.ts` - Claude API integration
- `/src/core/coverage-analyzer.ts` - Coverage gap detection
- Add to package.json: `anthropic` SDK

---

### 10. **Cross-Service Testing for Microservices** 🎯 STRATEGIC
**Gap:** Positioned for microservices but no service-to-service test coordination

**Proposed Features:**
1. **Service Contract Testing**
   - Auto-discover service boundaries
   - Generate contract tests
   - Validate API contracts

2. **Multi-Service Test Orchestration**
   - Run tests across multiple services
   - Coordinate service startup/teardown
   - Parallel execution with dependencies

3. **Integration Test Chains**
   - Define service dependencies
   - Run cross-service flows
   - Report end-to-end results

**Effort:** 8-10 hours (complex orchestration, dependency management)

**Impact:** 8/10 - Makes tool indispensable for microservice teams

**Market Position:** "The only tool that tests services together, not just individually"

---

### 11. **Test Distribution Across Teams** 🎯 STRATEGIC
**Gap:** Server mode (API) exists but isn't functional, limiting tool sharing

**Proposed Features:**
1. **REST API for Test Execution**
   - Implement `/test/run` endpoint (currently TODO)
   - Implement `/test/generate` endpoint (currently TODO)
   - WebSocket support for real-time streaming results

2. **Test Queue Management**
   - Distribute tests to available agents
   - Queue management for burst loads
   - Load balancing across machines

3. **Results Aggregation & Reporting**
   - Centralized test dashboard
   - Results storage (SQLite or cloud)
   - Export to CI/CD systems

**Effort:** 10-12 hours (server implementation, queuing, storage)

**Impact:** 7/10 - Enables enterprise deployments

---

## FEATURES TO DISCONTINUE (Low ROI, High Maintenance)

### 12. **Playwright Support** 🔴 REMOVE
**Current State:** Listed as supported but not implemented
- No Playwright parser in `test-runner.ts`
- No Playwright installer in `framework-installer.ts`
- No example tests

**Rationale:**
- Playwright is E2E testing, not unit/integration testing
- Overlaps with Vitest scope (Vitest runs Playwright)
- Better left to specialized E2E tools
- Adds maintenance burden without user demand

**Action:** Remove from feature claims, update README

---

### 13. **Over-Engineered Abstractions** 🔴 SIMPLIFY
**Current Examples:**
- `ComponentAnalysis` interface with `files` and `subcomponents` - redundant structure
- `WorkItem` queue with topological sorting - overkill for simple sequential execution
- Multiple file format options (YAML, JSON) when YAML is used exclusively

**Action:** Simplify internal models, keep public APIs stable

---

### 14. **Unused Flags - `--non-interactive` Alias** 🟡 KEEP BUT DEPRECATE
**Current:** `--headless` and `--non-interactive` do the same thing
- Creates confusion (which one to use?)
- Maintains two code paths
- Deprecate one, standardize on `--headless`

**Action:** Keep both for backward compatibility, recommend `--headless` in docs

---

## REPOSITIONING & MARKET FIT

### Current Positioning:
"Multi-agent testing infrastructure for monoliths and microservices"

### Issues with Current Positioning:
- Too broad (monoliths AND microservices are different use cases)
- "Multi-agent" implies distributed testing (not clearly differentiated from Vitest)
- Infrastructure language is intimidating for individual developers

### Recommended Repositioning:

**PRIMARY TARGET: CI/CD Automation & Coding Agents**
- Test-rig = "testing orchestration for AI-driven development"
- Focus: Works seamlessly with Claude Code and other AI coding agents
- Positioning: "The testing backbone for autonomous development"

**SECONDARY TARGET: Microservice Teams**
- Cross-service contract testing
- Service integration validation
- Microservice-aware test orchestration

**NOT A TARGET: Vitest Replacement**
- Vitest is the runner, test-rig is the orchestrator
- Avoid positioning as "Vitest killer"
- Message: "Vitest + test-rig = complete testing platform"

### Recommended Feature Focus:

**DO:**
- ✅ AI integration (Claude-powered test suggestions)
- ✅ Agent-friendly (headless, non-interactive by default)
- ✅ Multi-framework (Vitest, Pytest, Jest, Mocha)
- ✅ Component specs (organize tests logically)
- ✅ Parallel execution (leverage multi-core)

**DON'T:**
- ❌ E2E testing (use Playwright directly)
- ❌ Visual regression (use Percy or similar)
- ❌ Performance profiling (use native tools)
- ❌ Distributed testing across machines (out of scope initially)

---

## TOP 5 PRIORITIES (Ranked by ROI)

### Priority 1: Fix PascalCase Bug
**Effort:** 2-3 hours
**Impact:** 10/10 (blocks all test generation)
**ROI:** 3.3-5.0
**Enables:** generate, unit tests, factories, integration tests

**Action Items:**
- [ ] Implement case conversion utilities
- [ ] Fix template replacements in test-generator.ts
- [ ] Add TypeScript validation
- [ ] Test with multiple naming patterns

---

### Priority 2: Add Mocha Support
**Effort:** 3-4 hours
**Impact:** 7/10 (unblocks legacy projects)
**ROI:** 1.75-2.3
**Enables:** Mocha projects can use test-rig

**Action Items:**
- [ ] Create Mocha JSON parser
- [ ] Update framework installer
- [ ] Add test fixtures
- [ ] Document Mocha setup

---

### Priority 3: Save Container Selection to Config
**Effort:** 1-2 hours
**Impact:** 6/10 (unblocks testcontainers)
**ROI:** 3.0-6.0
**Enables:** Container-based integration tests

**Action Items:**
- [ ] Add containerRuntime to config schema
- [ ] Persist selection during setup
- [ ] Load and validate in test-runner
- [ ] Test container availability

---

### Priority 4: Implement Watch Mode
**Effort:** 2 hours
**Impact:** 6/10 (improves developer experience)
**ROI:** 3.0
**Enables:** Live test reloading

**Action Items:**
- [ ] Add chokidar for file watching
- [ ] Re-run tests on file changes
- [ ] Show change summary
- [ ] Document watch mode

---

### Priority 5: AI-Powered Test Analysis (Claude Integration)
**Effort:** 6-8 hours
**Impact:** 9/10 (major differentiation)
**ROI:** 1.1-1.5
**Enables:** Intelligent test suggestions, coverage gap detection

**Action Items:**
- [ ] Integrate Claude API
- [ ] Parse coverage reports
- [ ] Suggest test cases
- [ ] Cache results (cost management)
- [ ] Document AI features

---

## IMPLEMENTATION TIMELINE

### Phase 1: Fix Blockers (Week 1)
- PascalCase bug (2-3h)
- Mocha support (3-4h)
- Container config (1-2h)
- Build templates (1h)
- **Total: 7-10 hours**
- **Result:** Test generation works, containers work, Mocha projects supported

### Phase 2: Quick Wins (Week 2)
- Watch mode (2h)
- Error messages (2-3h)
- Documentation (3h)
- **Total: 7-8 hours**
- **Result:** Better UX, improved developer experience, documented features

### Phase 3: Strategic Features (Weeks 3-4)
- Claude AI integration (6-8h)
- Cross-service testing (8-10h)
- **Total: 14-18 hours**
- **Result:** Market differentiation, microservice capabilities

### Phase 4: Enterprise Features (Weeks 5+)
- REST API implementation (5-6h)
- Test queue management (3-4h)
- Results aggregation (3-4h)
- **Total: 11-14 hours**
- **Result:** Enterprise deployment capability

---

## RISK ASSESSMENT

### High Risk:
- **PascalCase bug (Priority 1)**: If not fixed, tool is unusable
- **Mocha parser (Priority 2)**: Risk of incomplete JSON format support
- **Claude integration (Priority 5)**: API costs, rate limiting

### Medium Risk:
- Watch mode implementation: File watcher edge cases
- Container runtime validation: Varies by OS

### Low Risk:
- Error messages: User-facing only, no breaking changes
- Documentation: No code risk

---

## SUCCESS METRICS

### Short Term (After Phase 1):
- [ ] test-rig generate produces valid TypeScript (0 compilation errors)
- [ ] Mocha projects can run tests with test-rig
- [ ] Container tests run without manual intervention
- [ ] Build process is automated (no manual copying)

### Medium Term (After Phase 2):
- [ ] Watch mode reloads tests in <1 second
- [ ] Error messages guide users to solutions
- [ ] Documentation covers 90% of use cases
- [ ] CLI help text is comprehensive

### Long Term (After Phase 3+):
- [ ] Claude AI suggests 5+ test cases per component
- [ ] Cross-service tests reduce integration issues by 40%
- [ ] Teams using test-rig report 2x faster test iteration
- [ ] 1000+ GitHub stars (community validation)

---

## CONCLUSION

Test-Rig has **strong architectural foundations** and **ambitious scope**, but is currently hampered by **critical implementation bugs** that prevent production use. The tool's unique positioning for AI-driven testing and multi-agent orchestration is not yet realized.

**Recommended Approach:**
1. **Aggressively fix blockers** (Priority 1-3) - 7-10 hours
2. **Improve UX and documentation** (Priority 4) - 7-8 hours
3. **Implement AI differentiation** (Priority 5) - 6-8 hours
4. **Strategic features** (microservices, API) - 14-18 hours

**Expected Outcome:** From "unusable alpha" to "production-ready SaaS tool for AI-driven testing" within 4-6 weeks of focused development.

**Market Opportunity:** Unique position as the first testing tool purpose-built for AI coding agents + microservice teams.

---

## APPENDIX: DETAILED TECHNICAL NOTES

### PascalCase Bug - Technical Details

**Problem:**
```typescript
// Template (factory-template.ts)
export interface User { ... }
export const userFactory = new Factory<User>(...);

// Placeholder replacement
template.replace(/User/g, "user-service")
// Result:
export interface user-service { ... }  // ❌ INVALID
export const user-servicefactory = new Factory<user-service>(...);
```

**Solution:**
```typescript
function convertKebabToPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// Usage
const pascalName = convertKebabToPascalCase("user-service"); // "UserService"
template.replace(/User/g, pascalName);
```

**Files Affected:**
- `/src/agents/test-generator.ts` line 38, 59, 79
- `/src/templates/test-template.spec.ts` - uses `User` placeholder
- `/src/templates/factory-template.ts` - uses `User` placeholder
- `/src/templates/test-template.integration.ts` - uses `User` placeholder

### Container Runtime Config Schema

**Add to config schema:**
```yaml
containerRuntime: docker  # or: podman, colima, none
containerRuntimePath: /usr/bin/docker  # optional, auto-detect if not specified
containerOptions:
  networks: bridge  # or: host, none
  removalPolicy: remove  # or: stop
```

### Mocha JSON Report Format

**Mocha command:**
```bash
mocha --reporter json > test-results.json
```

**Output structure (similar to Vitest):**
```json
{
  "stats": {
    "tests": 10,
    "passes": 8,
    "failures": 2,
    "pending": 0,
    "duration": 1500
  },
  "failures": [
    {
      "title": "should validate email",
      "fullTitle": "User > validate > should validate email",
      "err": { "message": "Expected false to be true" }
    }
  ]
}
```

---

**Report Generated:** February 7, 2026
**Prepared For:** test-rig Development Team
**Next Review:** After Priority 1-3 implementation (Est. Feb 14, 2026)
