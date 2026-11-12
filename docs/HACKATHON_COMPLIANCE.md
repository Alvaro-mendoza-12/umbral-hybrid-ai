# Hackathon compliance and competition strategy

Status: discovery baseline, not an eligibility certification or submitted entry. Reviewed: 2026-11-12. Jury-facing document in English. No application, submission, deployment, or runtime evidence has been created by this document.

## 1. Requirements published on the event overview (not the complete legal rules)

[Organizer's event page](https://firebasehybridaihackathon.devpost.com/), accessed 2026-11-12, establishes:

- All application AI inference through Firebase AI Logic, combining local and cloud execution.
- At least one supported platform: Web/Chrome, Android, or iOS. App Check required; debug tokens accepted for entries.
- Public GitHub/GitLab repository with necessary source, assets, instructions, and actual runtime SDK use; an open-source license is required, Apache preferred.
- Working demonstration, feature/value description, and video publicly visible on YouTube. Video maximum three minutes, English or English subtitles. Submission materials English; application free to use. Hosted demo encouraged.
- Existing apps need significant competition-period updates and a description of new work; existing public apps also describe their prior value.
- Adults above their jurisdiction's age of majority; most countries, individuals, teams, and organizations, subject to complete rules.
- Awards: Grand Prize USD 10,000; runners-up USD 7,000 and 4,000; best iOS, Android, Web/Chrome USD 3,000 each. Total USD 30,000.
- Judging: technical implementation, design, potential impact, and idea quality. Multiplatform receives strong consideration; a single-platform project can still win.

## 2. Deadline and unresolved legal rules

[Official schedule](https://firebasehybridaihackathon.devpost.com/details/dates), accessed 2026-11-12: submissions November 11, 09:00 PST to November 30, 14:00 PST; judging December 9–16; winners December 21. Deadline conversion: **November 30, 2026, 17:00 Peru (UTC−05:00), equal to 22:00 UTC**. PST is UTC−08:00, so Peru is three hours ahead. Do not confuse PST with daylight time.

[Official Rules URL](https://firebasehybridaihackathon.devpost.com/rules): direct retrieval returned HTTP 403 on this review. Search-indexed text reports that rules are not yet available. These are different observations: an index can be stale, and a blocked live request does not establish absence. Therefore **full current legal rules are unverified**. The main page is usable evidence of published submission expectations, not a substitute for the complete legal rules.

Unresolved: excluded jurisdictions, individual/team eligibility details, intellectual-property warranties, whether prizes can be combined, pre-existing-code boundaries, and any conflicts with the earlier UMBRAL contest. Do not invent an exclusion list or guarantee that a Peruvian entrant is eligible. Before entry, the owner must read the accessible current rules and resolve these points. No contest terms were accepted in this phase.

## 3. Evidence-based release gate

Every item below is a **release gate**, not a claim that the production entry has passed. Evidence established during discovery, such as repository identity, must be linked separately; runtime and submission evidence remains pending.

| ID | Gate | Required evidence | Owner |
|---|---|---|---|
| HC-01 | Complete legal rules reviewed | Dated owner review and applicable eligibility decisions | Product owner |
| HC-02 | Original UMBRAL protected | Separate repository URL; diff and history limited to new repository | Engineering |
| HC-03 | New work identified | Baseline SHA and dated change ledger; attribution of any permitted reuse | Engineering |
| HC-04 | Hybrid inference genuinely runs | Real local and cloud traces, platform versions, provenance and failure tests | AI/QA |
| HC-05 | No bypass model providers | Source/dependency audit; no OpenRouter or direct provider calls | Security |
| HC-06 | App Check configured safely | Attestation validation; debug token omitted from public source | Security |
| HC-07 | Reproducible public source | Clean checkout instructions tested by someone other than author | QA |
| HC-08 | License and assets lawful | Owner-selected license; dependency/asset attribution review | Product owner |
| HC-09 | Working demo available | Actual browser run; unavailable features honestly labeled | QA |
| HC-10 | English materials/video ready | Public video ≤180 seconds, captions, no private information | Product owner |
| HC-11 | Final rules rechecked | Manual recheck on November 29 and before owner submission | Product owner |
| HC-12 | Submission authorized | Owner performs/authorizes submission after legal review | Product owner |

No background monitoring is implied. HC-11 is a scheduled project activity, not an automation installed by this phase. Publishing the repository, adding a legal license, hosting an app, or submitting the entry are not performed here.

## 4. Recommended competitive position

**Recommendation, not a contest guarantee:** build Web/Chrome first. The differentiator is an understandable next step from a verified opportunity, not another unrestricted chat window. Show why local inference matters for a short, saved opportunity explanation and why cloud inference matters for a more demanding contextual task. Keep the same user-facing result contract and make the execution source auditable. Technical capability must be assessed using [HYBRID_AI_ARCHITECTURE.md](HYBRID_AI_ARCHITECTURE.md), not inferred from the existence of a contest platform category. A responsive mobile website is not evidence of native Android/iOS local inference. A completed cloud-only fallback path is also not sufficient evidence of the intended hybrid product.

Do not add native platforms merely for a category label. Android/iOS may start only after the Web release gates pass, the SDK/device spike is proven, and a genuinely staffed parallel track will not reduce quality. With the November 30 deadline, native apps are post-hackathon scope by default. This sacrifices potential cross-platform breadth in exchange for a coherent, tested product.

### Proposed demonstration storyboard (not recorded)

| Time | Demonstration | Proof |
|---|---|---|
| 0:00–0:20 | A student cannot confidently interpret an opportunity | Specific audience and task, no fabricated interview |
| 0:20–0:50 | Find one verified opportunity; inspect original source and date | Provenance and concise information hierarchy |
| 0:50–1:20 | Explain a bounded requirement on a compatible local device | Actual execution metadata, not a decorative label |
| 1:20–1:50 | Repeat under an unsupported/local-unavailable condition, with cloud permission already granted | Real cloud fallback; show LOCAL_ONLY refusing cloud separately |
| 1:50–2:20 | Save it and turn requirements into Mi Ruta actions | Integrated product outcome |
| 2:20–2:45 | Keyboard/mobile/reduced-motion interaction and source limits | Usability, accessibility, honest scope |
| 2:45–3:00 | Architecture, measured results and remaining limits | Numbers only after testing; no invented impact |

Avoid claiming end-to-end offline operation solely because an inference ran locally. Authentication, fresh catalog data, SDK initialization and first model download may still need connectivity. Record `result.response.inferenceSource` from the real SDK; a requested preference is not execution proof. Recorded fallback must be reproducible; mocks belong only in clearly labeled tests, never as proof of real inference.

## 5. Final owner decision checklist

- Confirm entrant identity, legal age and applicable jurisdiction against final rules.
- Confirm rights to reuse original branding/content and obligations of the earlier hackathon.
- Select the public-release license after that review; Apache preference is not a mandatory choice.
- Verify public repository visibility (already observed for the new repository) and separately authorize any actual deployment in the implementation phase.
- Confirm final platform category and who owns submission, video and support access.

The documentation branch alone is not a functioning contest entry. No prize probability, acceptance, security certification or eligibility is promised.
