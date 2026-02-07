# Test-Rig ROI - Quick Reference

## One-Sentence Verdict

**MAINTAIN as internal utility, don't invest in growth. Vitest does 80% of the same work natively.**

---

## Investment vs Return

```
┌─────────────────────────────────────────┐
│ Time Already Spent:  8-10 hours         │
│ Annual Maintenance:  60-70 hours        │
│ Value Delivered:     2-5 min/week       │
│ Break-even:          50+ simultaneous   │
│                      users (unrealistic)│
└─────────────────────────────────────────┘
```

---

## What Works

✅ CLI wrapper around Vitest/Pytest
✅ Component spec organization
✅ Parallel test execution scaffolding
✅ Good code structure
✅ Multi-framework detection
✅ Testcontainer templates

## What's Broken

❌ AI test generation (TODO: enhance AST parsing)
❌ Parallel speedup claims (unproven)
❌ IDE integration (none)
❌ Market demand (none)
❌ Competitive advantage (Vitest has it all)

---

## Comparison Matrix

```
                 test-rig    Vitest      Winner
─────────────────────────────────────────────────
Setup            5 min       30 sec      Vitest
Parallel         CLI wrapper Native      Vitest
Watch Mode       Yes         Faster      Vitest
Coverage         Yes         Yes         Vitest
UI               No          Yes         Vitest
Python Support   Yes         No          test-rig
Community        None        Large       Vitest
Maintenance      60h/yr      0h/yr       Vitest
```

---

## Decision Tree

```
Are you polyglot (Node + Python)?
├─ YES → Can you use unified CLI? (rare)
│  └─ YES → test-rig saves 15-30 min/week
│  └─ NO  → Use separate tools
│
└─ NO  → Use Vitest directly (saves 10 hours)
```

---

## Three Options

### 1. MAINTAIN (RECOMMENDED)
- Keep as-is
- Fix bugs if simple
- Deprecate in 2 years
- Cost: ~5-8 hours/month

### 2. DEPRECATE NOW
- Archive repository
- Publish migration guide
- Cost: 4 hours one-time

### 3. INVEST (NOT RECOMMENDED)
- Rebuild as Vitest plugin
- Implement real AST analysis
- Cost: 120+ hours
- Success probability: <10%

---

## Red Flags

🚩 **AI generation is fake**: Just regex matching, TODO comment admits it
🚩 **No performance data**: Claims 3-4x speedup but never measured
🚩 **Single author**: No community traction yet
🚩 **Maintenance burden**: 60+ hours annually for 0 users
🚩 **Feature creep**: Unfinished components everywhere

---

## For Team Use Only

This tool is best suited as:
- Internal automation for specific team
- Educational example (good code structure)
- Not a production-ready alternative to Vitest
- Not a commercial product

---

## If Maintaining: Priority Actions

1. **Honesty**: Document what's broken (AI generation)
2. **Verification**: Benchmark vs `vitest --threads`
3. **Boundaries**: Set 2-year deprecation timeline
4. **Fixes**: Only maintain, don't build new features

---

## Historical Value

- **Learning**: Well-designed codebase
- **Time invested**: 8-10 hours (sunk)
- **Documentation**: Excellent quality
- **Tests**: 60% coverage

## Forward Value

- **Setup automation**: Duplicate effort (Vitest already does this)
- **Multi-framework**: Nice to have, rarely used
- **AI generation**: Broken, expensive to fix
- **Parallel execution**: Vitest --threads achieves same goal

---

## Bottom Line

| Scenario | Use Test-Rig? | Use Vitest? |
|----------|---|---|
| Single Node.js app | ❌ No | ✅ Yes |
| Node + Python monorepo | Maybe | ✅ Yes + pytest |
| Microservices (Node only) | ❌ No | ✅ Yes |
| Microservices (Node + Python) | Maybe | ✅ Yes + pytest |
| Learning/Examples | ✅ Good code | ✅ Also good |
| Commercial product | ❌ No | ✅ Better option |

---

## ROI: Expected Value

```
If used by 0 teams:     -60 hours/year
If used by 1 team:      -50 hours/year
If used by 5 teams:     -10 hours/year
If used by 10 teams:    +40 hours/year
```

Realistic: 0-1 teams, so negative ROI.

---

## Recommendation Summary

| Timeframe | Action | Effort |
|-----------|--------|--------|
| **Now** | MAINTAIN only | 5-8h/month |
| **6 months** | Evaluate usage | 2h |
| **12 months** | Decide to deprecate or invest | 4h |
| **24 months** | Deprecate if no adoption | 4h |

---

*Last Updated: 2026-02-07*
*Next Review: 2026-08-07*
