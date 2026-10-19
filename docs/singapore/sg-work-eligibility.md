---
framework_version: sg-0.1.0
region: SG
extends: 04-job-evaluation.md#eligibility-gate--run-before-scoring
---

# Singapore Work Eligibility Gate

<!-- SETUP: Fill the Pass Status profile field below before any SG posting is scored. -->

This file extends the **Eligibility Gate** in `04-job-evaluation.md` for Singapore postings. It runs **before** the Language Gate and before scoring. The generic gate still applies; this file adds the SG-specific rules: work-pass thresholds, COMPASS, the FCF advertising rule, and how to read SG posting wording.

All figures below are **official thresholds** copied from MOM/EDB pages. They are not market salary data. Re-check every source before relying on a number: MOM revises these regularly, and a scheduled change takes effect on **1 Jan 2027**.

## Profile field (required)

Add this to `01-candidate-profile.md` / CLAUDE.md under eligibility:

```
## Singapore work status
- SG pass status: [UNKNOWN]   # one of: SC | SPR | EP holder | S Pass holder | ONE Pass holder | Tech.Pass holder | DP/LTVP holder | none (needs employer-sponsored pass)
- Current pass expiry / employer-tied?: [UNKNOWN]
- Age (for EP/S Pass qualifying-salary lookup only, never put on a CV): [UNKNOWN]
- Highest qualification + awarding institution (for COMPASS C2): [UNKNOWN]
- Nationality (for COMPASS C3 estimation only, never put on a CV): [UNKNOWN]
```

**While `SG pass status` is `[UNKNOWN]`:** apply the gate as if the candidate needs an employer-sponsored EP (the strictest common case), mark every SG verdict `PROVISIONAL – pass status unknown`, and ask Larry once per session to fill the field. Never guess the status from his name, languages or CV.

## Sources (all checked 2026-10-19)

| Topic | Source |
|---|---|
| EP qualifying salary + COMPASS | MOM, Eligibility for Employment Pass: https://www.mom.gov.sg/passes-and-permits/employment-pass/eligibility |
| COMPASS SOL (C5) | MOM, C5 Skills bonus – SOL: https://www.mom.gov.sg/passes-and-permits/employment-pass/eligibility/compass-c5-skills-bonus-shortage-occupation-list-sol · SOL guidebook PDF: https://www.mom.gov.sg/-/media/mom/documents/work-passes-and-permits/compass/sol-guidebook.pdf |
| 5-year tech EP | MOM: https://www.mom.gov.sg/passes-and-permits/employment-pass/experienced-tech-professionals-with-skills-in-shortage |
| S Pass | MOM, Eligibility for S Pass: https://www.mom.gov.sg/passes-and-permits/s-pass/eligibility |
| FCF | MOM, Fair Consideration Framework: https://www.mom.gov.sg/employment-practices/fair-consideration-framework |
| FCF job advertising (EP) | MOM, Consider all candidates fairly (EP): https://www.mom.gov.sg/passes-and-permits/employment-pass/consider-all-candidates-fairly · (S Pass): https://www.mom.gov.sg/passes-and-permits/s-pass/consider-all-candidates-fairly |
| ONE Pass | MOM, Eligibility for ONE Pass: https://www.mom.gov.sg/passes-and-permits/overseas-networks-expertise-pass/eligibility |
| ONE Pass (AI and Tech) + Tech.Pass sunset | MOM factsheet, 3 Mar 2026: https://www.mom.gov.sg/-/media/mom/documents/press-releases/2026/factsheet-on-foreign-workforce-policies-03032026.pdf · EDB Tech.Pass: https://www.edb.gov.sg/en/how-we-help/incentives-and-facilitation/tech-pass |
| Self-Assessment Tool | MOM SAT: https://www.mom.gov.sg/eservices/services/employment-s-pass-self-assessment-tool |
| Posting wording rules | TAFEP, Tripartite Guidelines on Fair Employment Practices: https://www.tal.sg/tafep/getting-started/fair/tripartite-guidelines |
| PR | ICA, Apply for PR: https://www.ica.gov.sg/reside/PR/apply |

## 1. Pass types that matter for AI/LLM/Agent roles

### Singapore Citizen (SC) / Singapore Permanent Resident (SPR)
No work pass is needed and the employer has no FCF or COMPASS obligation. If the profile says SC or SPR, skip sections 2–4 and only run the **posting-wording check** (section 5).
PR is applied for through ICA (link above). This framework does not estimate PR approval odds; ICA publishes no scoring criteria.

### Employment Pass (EP): the default case for a foreign professional
Two stages (MOM, EP eligibility page):

**Stage 1: EP qualifying salary.** Fixed monthly salary, benchmarked to the top 1/3 of local PMET salaries by age. If a candidate fails Stage 1, COMPASS points do not matter.

| Sector | Current (new applications before 1 Jan 2027; renewals expiring before 1 Jan 2028) | From 1 Jan 2027 (new) / passes expiring from 1 Jan 2028 (renewals) |
|---|---|---|
| All sectors except financial services | S$5,600 at age ≤23, rising with age to S$10,700 at 45+ | S$6,000 at ≤23, rising to S$11,500 at 45+ |
| Financial services | S$6,200 at ≤23, rising with age to S$11,800 at 45+ | S$6,600 at ≤23, rising to S$12,700 at 45+ |

The MOM page has an age-by-age table (ages 23–45). **Look up the exact row for the candidate's age; do not interpolate.** Example rows copied verbatim from MOM, current / from 2027: age 30 non-FS S$7,223 / S$7,750; age 30 FS S$7,982 / S$8,541; age 35 non-FS S$8,382 / S$9,000; age 35 FS S$9,255 / S$9,927.

Which column applies: if Larry would start (application filed) **on or after 1 Jan 2027**, use the 2027 column. A posting found in Oct–Dec 2026 with a start date in 2027 will very likely be filed under the new thresholds.

**Financial services sector**: banks, insurers, asset managers and payments firms fall under the FS column. Classification is by the **employer's** registered sector, not the job title. An AI engineer at a bank is FS, while an AI engineer at a cloud vendor that sells to banks is not. If unsure, assume FS (stricter) and flag it.

**Stage 2: COMPASS.** Needs **40 points**. Exempt if fixed monthly salary ≥ **S$22,500**, if the candidate is an overseas intra-corporate transferee, or if the role lasts ≤1 month.

| Criterion | 20 pts | 10 pts | 0 pts | Can we estimate from outside? |
|---|---|---|---|---|
| C1 Salary vs local PMET salaries **in the employer's sector, by age** | ≥90th pct | 65th–<90th pct | <65th pct | **Only roughly.** MOM's sector benchmarks sit behind the employer's SAT login. Use the posting's salary range only as a signal; never assert a percentile. |
| C2 Qualifications | Degree from QS top-100 / other highly reputed Asian universities / SG autonomous universities / field-recognised institutions | Other degree-equivalent (UK-bachelor-comparable, per UK ENIC) or endorsed professional qualification | No degree-equivalent | **Yes**, from the profile's qualification field. Check the current year's QS ranking; MOM updates its lists yearly. |
| C3 Diversity (share of candidate's nationality among firm's PMETs) | <5% | 5%–<25% | ≥25% | **No.** Firms with <25 PMETs get 10 by default. Otherwise only the employer's Workforce Insights tool knows. |
| C4 Support for local employment (firm's local PMET share vs sector) | ≥50th pct | 20th–<50th pct | <20th pct | **No.** Firms with <25 PMETs get 10 by default; firms with ≥70% local PMET share get at least 10. |
| C5 Skills bonus (Shortage Occupation List) | Job on SOL and nationality share <1/3 | Job on SOL and share ≥1/3 | Not on SOL | **Partly.** See below. |
| C6 Strategic Economic Priorities bonus | n/a | 10 if the firm is in an eligible programme | 0 | **No.** Awarded at agency discretion; shown only in the employer's SAT. |

**SOL and AI roles** (SOL released Nov 2025, applies to applications from 1 Jan 2026): the infocomm list includes **AI engineer** and **AI researcher / AI scientist**, and **Data scientist** (covering chief data scientist, data engineer, data scientist and head of data analytics), as well as cloud and cybersecurity titles. To get C5 the candidate must actually do the listed duties and meet the additional requirement: a bachelor's in Computer Science / IT / Programming & Systems Analysis / Science (Computer Studies), **or** at least three years of work experience in the listed job title. A candidate who needed SOL points can only be employed in that occupation. Check the SOL guidebook for exact wording; "LLM engineer", "agent engineer" and "prompt engineer" are **not** SOL titles. Whether the employer would file such a role as "AI engineer" is the employer's call, so treat C5 as `possible`, never `confirmed`.

**5-year EP for SOL tech roles** (MOM): requires an SOL infocomm occupation, passing COMPASS with ≥10 points on C3, and a fixed salary of at least S$10,700 (age ≤36, rising to S$14,270 at 45+) for new applications from 1 Jan 2025, or S$11,500 (age ≤36, rising to S$15,499 at 45+) for new applications from 1 Jan 2027. This only affects pass duration, not eligibility. Note it as a positive, never as a gate.

**SAT:** only the employer (or its employment agent) can run MOM's enhanced Self-Assessment Tool, which needs an EP eService login. MOM says an "eligible" SAT result means roughly a 90% chance of approval. The candidate cannot run the firm-level parts, which is why C1/C3/C4/C6 stay `unknown` in our estimate.

### S Pass
For associate professionals and technicians. Current minimum S$3,300 (non-FS, age ≤23, rising to S$4,800 at 45+) and S$3,800 (FS, rising to S$5,650). From 1 Jan 2027 for new applications: S$3,600 (non-FS, rising to S$5,100) and S$4,000 (FS, rising to S$5,650). S Pass is also subject to employer quota and levy. For AI/LLM engineering roles an S Pass is unusual. If a posting's salary range is below the EP floor for Larry's age, flag that the employer may only be able to offer an S Pass (or nothing), and treat it as a FLAG for Larry to judge, not a PASS.

### ONE Pass (Overseas Networks & Expertise Pass)
Individual pass, not tied to one employer, valid 5 years. Main salary route: at least S$30,000 fixed monthly salary for the 12 consecutive months before application, from one established employer (market cap ≥US$500m or revenue ≥US$200m), or prospective SG employment at that level. There is also an "outstanding achievements" route (sports, arts and culture, academia and research).
**ONE Pass (AI and Tech) track, applications open 28 Jan 2027** (MOM ONE Pass page and 3 Mar 2026 factsheet): S$30,000/month over 12 months, of which at least S$22,500 must be fixed salary and the rest may be vested ESOP/ESOW (subject to assessment). It also needs ≥5 cumulative years in a founder/C-suite or technical role (e.g. senior software engineer) within the last 10 years, with the current/last employer being a tech company, tech division or tech VC meeting a size test (valuation ≥US$500m, revenue ≥US$200m, AUM ≥US$500m, or for start-ups ≥US$30m raised).
If the profile says `ONE Pass holder`, the gate is PASS for any employer (no FCF/COMPASS needed for the hire).

### Tech.Pass (EDB): closing
EDB: from **28 Jan 2027**, MOM/EDB will no longer accept new or renewal Tech.Pass applications. Existing holders keep the pass until expiry and may move to ONE Pass (AI and Tech) or other passes. Current Tech.Pass eligibility (EDB page): last-drawn fixed monthly salary ≥S$22,500 in the last year, plus ≥5 cumulative years in a leading role at a tech company valued ≥US$500m or that raised ≥US$30m, or at a tech VC with ≥US$500m AUM. **Do not recommend applying for a new Tech.Pass** unless it can realistically be filed before 28 Jan 2027. If the profile says `Tech.Pass holder`, record the expiry date and treat the gate as PASS until then.

### Other statuses
`DP/LTVP holder` and other pass types: this file does not encode their work rules. Check the relevant MOM page for the pass held and record the outcome in the profile before scoring. (Unverified this session.)

## 2. Fair Consideration Framework (FCF) and the MyCareersFuture rule

What it means for the candidate (MOM FCF page and "Consider all candidates fairly"):
- Before filing an EP or S Pass, the employer must advertise the job on **MyCareersFuture (MCF)** for at least **14 consecutive days**, and must not make a job offer during that window. Changing the employer UEN, occupation, salary or vacancy count restarts the 14 days. An ad closed or expired for more than 3 months cannot be used.
- The ad salary range must be visible, **max ≤ 2× min**, and must contain the salary offered to the EP candidate. The advertised occupation must match the EP application.
- **Exemptions from advertising:** firms with <10 employees, fixed monthly salary ≥ S$22,500, roles of ≤1 month, local transferees, and overseas intra-corporate transferees. Fair hiring still applies.

How to use this in evaluation:
1. **For an EP-dependent candidate, an MCF listing is a strong signal** that the employer is set up to sponsor. Search MCF for the same employer and title. If found, record the MCF salary range (it is the legally visible range) and the posting date.
2. If the role is only on LinkedIn or a company site, it is **not** a red flag by itself: the employer may post to MCF later, or be exempt. Note `MCF: not found` and add ≥14 days to the expected timeline from interview to offer.
3. If the MCF range's **maximum** is below the EP qualifying salary for Larry's age and sector, the job **cannot** support an EP at the advertised pay. That is a FAIL for an EP-dependent candidate unless the employer confirms a different band (which needs a new ad).

## 3. Posting wording (TAFEP) and how to read it

TAFEP's guidelines allow employers to state **"Only Singaporeans"**, and tell them **not** to write phrases preferring non-Singaporeans ("EP/S Pass holders welcome", "work passes will be applied for successful candidates", "S Pass quota available"). Practical consequence: **SG ads almost never say "we sponsor visas"**, so the generic gate's "explicit sponsorship = PASS" row rarely fires in SG. Silence is the normal case.

| Posting wording (verbatim) | Verdict for a non-SC/SPR candidate |
|---|---|
| "Singaporeans only", "SC only", "open to Singapore Citizens", government/statutory board roles stating citizenship | **FAIL – hard stop.** Quote it. |
| "Singaporeans and PRs only", "SC/PR only", "must have the right to work in Singapore without sponsorship" | **FAIL – hard stop** unless the profile says SPR (or a non-sponsored pass such as ONE Pass). Quote it. |
| Security clearance / government-sensitive work | **FAIL in most cases.** Verify the specific scheme rather than assuming. |
| Silent on nationality (the usual case) | **PROCEED, mark `SG pass: unverified`.** Run the salary check (section 4). |
| Company careers page or recruiter states it hires internationally / provides relocation for SG roles (e.g. a posting saying it offers relocation assistance) | **PASS signal**, but still run the salary check, because EP rules still bind the employer. |

**Careers@Gov** (public service) roles: read each posting's eligibility line and quote it. If the posting is silent, mark it **FLAG – check the agency's eligibility terms** for non-SC/SPR candidates rather than passing it silently (unverified how many roles are SC/PR-restricted).

## 4. Decision procedure for scoring a SG posting

Run in order and stop at the first FAIL.

1. **Read the profile `SG pass status`.**
   - SC / SPR → go to step 2 only, then score normally.
   - ONE Pass / valid Tech.Pass → step 2 only, then score. Record pass expiry.
   - EP holder (changing jobs) / none / UNKNOWN → run all steps (a job change needs a new EP application by the new employer).
2. **Wording check** (section 3). FAIL → stop, quote the wording.
3. **Determine sector**: FS or non-FS, from the employer's business (bank, insurer, asset manager, payments → FS). Unsure → FS and flag.
4. **Determine the application date column**: will the EP likely be filed before or from 1 Jan 2027?
5. **Salary vs EP floor**: take the posted salary range (prefer the MCF ad; otherwise the posting; otherwise `unknown`). Compare against the MOM EP qualifying salary for Larry's age, sector and date column.
   - Range max < floor → **FAIL (EP not possible at advertised pay)**. Quote both numbers and the MOM link.
   - Range straddles the floor → **FLAG**: EP only possible near the top of the band. Tell Larry this before applying.
   - Range min ≥ floor → **PASS Stage 1**.
   - No salary visible → **UNKNOWN Stage 1**: proceed, flag, and suggest asking the recruiter early. Never invent a figure.
6. **COMPASS estimate** (skip if the posted fixed salary is ≥ S$22,500 → exempt):
   - C2 from the profile: 20 / 10 / 0.
   - C5: `possible +20/+10` only if the role's duties clearly match an SOL title (AI engineer, AI researcher/scientist, data scientist/engineer, cloud, cybersecurity) **and** Larry meets the degree-or-3-years rule; else 0.
   - C1, C3, C4, C6: mark `unknown (employer-side)`. Small firm (<25 PMETs, e.g. an early start-up) → C3 = 10 and C4 = 10 by default.
   - Report as **"known points X + possible bonus Y; employer-side criteria unknown"**, never as a pass/fail. Say plainly that only the employer's SAT gives a real score. If known points + possible bonus is already ≥40, call it `COMPASS outlook: favourable`; if C2 = 0 and no SOL match, call it `COMPASS outlook: depends heavily on employer`.
7. **FCF check** (section 2): search MCF for the role. Record `MCF: found (range, date)` / `not found` / `exempt-likely (salary ≥ S$22,500 or firm <10 staff)`.
8. **Output** (add to the `04-job-evaluation.md` output block, above "Verdict"):

```
### SG Work Eligibility
- Pass status (profile): [value]  [PROVISIONAL if UNKNOWN]
- Wording check: PASS / FAIL — "[quote]"
- Sector column: non-FS / FS (reason)   Date column: current / from 1 Jan 2027
- EP Stage 1: PASS / FLAG / FAIL / UNKNOWN — posted [range or "not shown"] vs MOM floor S$[x] for age [n] ([MOM link], checked [date])
- COMPASS outlook: exempt / favourable / depends on employer — C2 [pts], C5 [possible pts or 0], C1/C3/C4/C6 employer-side
- FCF/MCF: found [range, date] / not found / exempt-likely
- Gate verdict: PASS / FLAG / FAIL
```

A FAIL here means no scoring and no draft (same as the generic gate). Report it to Larry with the quote and source, because he may know something about his status that the profile doesn't.

## Re-verification rule

Before trusting any number in this file, check the "checked" date. If it is more than **90 days** old, or the date is past **1 Jan 2027** or **28 Jan 2027** (the scheduled changes above), re-open the MOM/EDB pages, update the figures, and update the checked date.
