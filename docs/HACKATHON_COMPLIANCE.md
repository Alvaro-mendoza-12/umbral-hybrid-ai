# Hackathon compliance and competition strategy

Status: discovery baseline, not an eligibility certification or submitted entry. Independently rechecked: 2026-11-12. Jury-facing document in English. No application, submission, deployment, or runtime evidence has been created by this document.

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

## 2. Deadline and newly accessible legal rules

[Official schedule](https://firebasehybridaihackathon.devpost.com/details/dates), rechecked 2026-11-12: submissions November 11, 13:30 PST to November 30, 14:00 PST. Deadline: **November 30, 2026, 17:00 Peru (UTC−05:00), equal to 22:00 UTC**. The earlier 09:00 opening time is superseded. Schedule shows judging December 9 and announcement December 21 at 14:00; legal rules show judging December 10 and announcement around December 21 at noon. Closing time agrees; reconfirm the other dates before relying on them.

[Official Rules](https://firebasehybridaihackathon.devpost.com/rules), successfully retrieved 2026-11-12, supersede the earlier access-blocked finding. Key owner-review points (not legal advice):

- Majority age; Taiwan requires 20. Excluded: Brazil, Italy, Quebec, Crimea, Cuba, Iran, Syria, North Korea, Sudan, Belarus, Russia, plus sanctions/export restrictions. Peru is not expressly listed; eligibility is not thereby established.
- Government-agency employment, contest-entity relationships and conflicts can disqualify. Team members must all qualify; organizational entry needs authority.
- Disclose incorporated prior work and significant competition-period improvements. Verify third-party rights, ownership and prior sponsorship restrictions.
- Ownership remains with entrants; entry grants Google a broad perpetual, irrevocable, royalty-free evaluation/promotional license.
- One grand prize and one Best-of prize may combine. Judging criteria are equally weighted.
- Entry accepts binding terms, including legal releases and dispute provisions. No entry or acceptance occurred here.

Owner eligibility, original-project obligations and rights are **pending**, not certified. Keep personal eligibility evidence outside this public repository. This review changes the legal-information status from inaccessible to available, not the project's compliance status.

## 3. Evidence-based release gate

Every item below is a **release gate**, not a claim that the production entry has passed. Evidence established during discovery, such as repository identity, must be linked separately; runtime and submission evidence remains pending.

| ID | Gate | Required evidence | Owner |
|---|---|---|---|
| HC-01 | Owner eligibility and legal review | Rules now retrieved; owner assessment of eligibility, IP, obligations and terms remains pending | Product owner |
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

No background monitoring is implied. HC-11 is a scheduled project activity, not an automation installed by this phase. Only documentation publication is authorized in this mission. Adding a legal license, hosting an app, or submitting the entry is outside this review; actual branch publication is recorded separately in the final audit.

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
