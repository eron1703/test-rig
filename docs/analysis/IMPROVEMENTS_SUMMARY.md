# Test-Rig Improvements Summary - Quick Reference

## Top 5 Priorities (Ranked by ROI)

| Priority | Issue | Effort | Impact | ROI | Status |
|----------|-------|--------|--------|-----|--------|
| **1** | **Fix PascalCase bug in test generation** | 2-3h | 10/10 | **5.0x** | 🔴 Blocking |
| **2** | **Add Mocha framework support** | 3-4h | 7/10 | **2.3x** | 🔴 Blocking |
| **3** | **Save container selection to config** | 1-2h | 6/10 | **6.0x** | 🔴 Blocking |
| **4** | **Implement watch mode** | 2h | 6/10 | **3.0x** | 🟡 Quick Win |
| **5** | **Claude AI test suggestions** | 6-8h | 9/10 | **1.5x** | 🟢 Strategic |

---

## Critical Blockers (MUST FIX)

### 1️⃣ PascalCase Template Bug
- **Problem:** `test-rig generate` produces invalid TypeScript (e.g., `import { user-service }`)
- **Files:** `/src/agents/test-generator.ts` (lines 28-89)
- **Fix:** Implement kebab-case → PascalCase conversion
- **Status:** Blocks 100% of test generation feature

### 2️⃣ Mocha Not Supported
- **Problem:** README claims Mocha support, but no implementation
- **Files:** `/src/core/test-runner.ts`, `/src/core/framework-installer.ts`
- **Fix:** Add Mocha JSON reporter parser
- **Status:** Blocks legacy Node.js projects

### 3️⃣ Container Config Not Saved
- **Problem:** During setup, user selects container runtime but it's not saved to config
- **Files:** `/src/core/config-generator.ts`, `/src/cli/commands/setup.ts`
- **Fix:** Persist container selection to YAML
- **Status:** Blocks testcontainers feature

### 4️⃣ Build Broken (Templates Missing)
- **Problem:** Templates must be manually copied after build
- **Files:** `tsconfig.json`, `/package.json`
- **Fix:** Add build step to copy templates
- **Status:** Blocks CI/CD deployments

---

## Quick Wins (2-3 hours each)

| Feature | Effort | Impact | Benefit |
|---------|--------|--------|---------|
| Watch mode (`--watch` flag) | 2h | 6/10 | Live test reload for devs |
| Better error messages | 2-3h | 5/10 | Reduce support burden |
| API documentation | 3h | 4/10 | Enable tool integration |
| Container persistence | 1-2h | 6/10 | Testcontainers work |

---

## Strategic Features (Differentiation)

| Feature | Effort | Impact | Market Value |
|---------|--------|--------|--------------|
| **Claude AI integration** | 6-8h | 9/10 | ⭐⭐⭐⭐⭐ Major differentiator |
| Cross-service testing | 8-10h | 8/10 | ⭐⭐⭐⭐ Microservice teams |
| REST API (server mode) | 5-6h | 6/10 | ⭐⭐⭐ Enterprise teams |
| Test distribution | 6-8h | 7/10 | ⭐⭐⭐⭐ Shared infrastructure |

---

## Features to Remove/Deprecate

| Feature | Reason | Action |
|---------|--------|--------|
| **Playwright support** | Listed but not implemented, overlaps Vitest | Remove from feature claims |
| **Over-engineered abstractions** | `ComponentAnalysis` struct redundancy | Simplify internals |
| **`--non-interactive` flag** | Duplicate of `--headless` | Keep for compatibility, deprecate |

---

## Repositioning Recommendation

### Current:
"Multi-agent testing infrastructure for monoliths and microservices"

### Recommended:
"Testing orchestration for AI-driven development and microservice teams"

**Focus:** CI/CD automation + Coding Agents (Claude, GitHub Copilot, etc.)

**Key Messages:**
- ✅ Works with AI agents (headless by default)
- ✅ Multi-framework support (Vitest, Pytest, Jest, Mocha)
- ✅ AI-powered test suggestions (Claude integration)
- ✅ Microservice-aware testing

---

## Implementation Timeline

| Phase | Duration | Tasks | Output |
|-------|----------|-------|--------|
| **Phase 1** | 1 week | Fix blockers (Priorities 1-3) + build | Production-ready test generation |
| **Phase 2** | 1 week | Quick wins (Priority 4) + docs | Better UX, documented features |
| **Phase 3** | 2 weeks | Strategic (Priority 5) + microservices | AI differentiation, microservice support |
| **Phase 4** | 1+ weeks | Enterprise features (API, distribution) | Shared infrastructure capabilities |

**Total: 4-6 weeks** from "alpha" to "production-ready SaaS"

---

## Success Criteria

### After Priority 1-3 (Phase 1):
- [ ] `test-rig generate` produces valid TypeScript (0 compilation errors)
- [ ] Mocha projects work (no manual workarounds)
- [ ] Containers auto-configure (manual selection not required)

### After Priority 4 (Phase 2):
- [ ] Watch mode reloads in <1 second
- [ ] Error messages guide users
- [ ] Documentation complete

### After Priority 5+ (Phase 3+):
- [ ] Claude generates 5+ test suggestions per component
- [ ] Cross-service tests available
- [ ] 50%+ code coverage improvement reported by users

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| PascalCase fix breaks existing code | High | Comprehensive test coverage |
| Mocha JSON format varies by version | Medium | Test with Mocha 10+, document |
| Claude API costs | Medium | Implement caching, cost estimates |
| Watch mode file watcher bugs | Low | Use battle-tested `chokidar` library |

---

## File Locations Quick Reference

### Source Files
```
/src/agents/test-generator.ts     ← PascalCase bug (Priority 1)
/src/core/test-runner.ts          ← Add Mocha parser (Priority 2)
/src/core/config-generator.ts     ← Container config (Priority 3)
/src/core/config-loader.ts        ← Load container runtime
/src/cli/commands/run.ts          ← Implement watch mode (Priority 4)
/src/server/index.ts              ← REST API (future)
/tsconfig.json                    ← Build fix (blocker)
/package.json                     ← Build scripts
```

### Template Files (Affected by Priority 1)
```
/src/templates/test-template.spec.ts       ← Uses User placeholder
/src/templates/factory-template.ts         ← Uses User placeholder
/src/templates/test-template.integration.ts ← Uses User placeholder
```

### Config Files
```
test-rig.config.yaml              ← Needs containerRuntime field
/src/core/config-generator.ts     ← Generates config
```

---

## Estimated Costs (in hours)

```
Priority 1 (PascalCase):        2-3 hours  [CRITICAL]
Priority 2 (Mocha):             3-4 hours  [CRITICAL]
Priority 3 (Container config):  1-2 hours  [CRITICAL]
Build fix (templates):          1 hour     [CRITICAL]
Priority 4 (Watch mode):        2 hours    [QUICK WIN]
Error messages:                 2-3 hours  [QUICK WIN]
Documentation:                  3 hours    [QUICK WIN]
Priority 5 (Claude AI):         6-8 hours  [STRATEGIC]
Microservices:                  8-10 hours [STRATEGIC]
REST API:                       5-6 hours  [ENTERPRISE]

Total to production: 32-42 hours (4-5 weeks)
```

---

## Conclusion

Test-Rig is **architecturally sound** but **functionally broken**. Focus on Priorities 1-3 (7-10 hours) to reach MVP status, then add differentiation (Priorities 4-5) to compete in market.

**Key insight:** Tool's true potential is as the **testing backbone for AI-driven development**, not as a Vitest replacement.

