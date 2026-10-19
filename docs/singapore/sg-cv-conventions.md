---
framework_version: sg-0.1.0
region: SG
extends: 05-cv-templates.md, 08-application-forms.md
---

# Singapore CV & Application Conventions (AI / LLM / Agent roles)

<!-- SETUP: No personalization needed. Pass status, age and nationality come from the profile and follow the rules below. -->

This file adjusts `05-cv-templates.md` (CV content) and `08-application-forms.md` (portal free-text fields) for Singapore applications. It does **not** change the honesty rules: nothing here permits adding a claim the profile does not support.

Each rule is tagged **[Official]** with a source, or **[Practice]** where it is common practice with no authoritative source. Treat [Practice] rules as defaults the user can override.

## Sources (checked 2026-10-19)
- TAFEP, *Fair Job and Employment Application Forms*: https://www.tal.sg/tafep/employment-practices/recruitment/preparing-job-application-forms
- TAFEP, *Tripartite Guidelines on Fair Employment Practices*: https://www.tal.sg/tafep/getting-started/fair/tripartite-guidelines
- TAFEP, *Fair Recruitment & Selection Handbook* (Nov 2025 edition): https://www.tal.sg/tafep/-/media/tal/tafep/resources/tools-and-templates/files/2026/fair-recruitment--selection-publication-nov-2025.pdf
- PDPC, *Advisory Guidelines on the PDPA for NRIC and other National Identification Numbers*: https://www.pdpc.gov.sg/organisations/regulations-decisions/regulatory-guidance/advisory-guidelines-on-the-personal-data-protection-act-for-nric-and-other-national-identification-numbers
- TAFEP, *Workplace Fairness*: https://www.tal.sg/tafep/workplace-fairness · Workplace Fairness Act 2025 text: https://sso.agc.gov.sg/Acts-Supp/8-2025/

## What SG fair-hiring guidance says employers should not ask for **[Official]**

TAFEP tells employers to remove these from application forms unless there is a stated job-related reason, and to collect them at offer stage instead:
- age / date of birth (including via NRIC), gender, race, religion, marital status and family responsibilities, disability, mental health conditions
- **photographs**
- **National Service liability**
- the Nov 2025 handbook also lists **nationality** among the items that "should not be asked for in an application form" without a job-related reason
- where legal ID is needed, employers should accept **passport details as an alternative to NRIC**, because NRIC numbers can reveal age

Separately, the **Workplace Fairness Act 2025** (protected characteristics include age, nationality, sex, marital status, pregnancy, caregiving, race, religion, language, disability and mental health) has passed. TAFEP says it is "slated to take effect in end-2027", and no commencement date has been gazetted as of 2026-10-19. Until then the Tripartite Guidelines are the operative standard.

**Implication for the CV:** the employer isn't supposed to need these fields, so leave them off by default.

## CV rules for SG

| Item | SG rule | vs US / EU |
|---|---|---|
| **Photo** | **Omit.** [Official] TAFEP tells employers not to request photos at application stage. | US: omitted. Parts of continental Europe (e.g. DACH) still often include one [Practice]. Our EU rule files decide for EU. |
| **Age / date of birth** | **Omit.** [Official] (TAFEP). Graduation years are fine, but don't add a DOB. | Same as US/UK. |
| **Gender, marital status, religion, race** | **Omit.** [Official] (TAFEP). | Same as US/UK. |
| **NRIC / FIN number** | **Never on the CV or in a cover letter.** [Official] PDPC guidelines restrict collecting NRIC numbers to cases required by law or needing high-accuracy ID verification, and TAFEP tells employers to collect it at offer stage or accept a passport instead. If a form demands NRIC/FIN before an offer, flag it to the user and suggest asking whether a passport number or a later stage is acceptable. Do not fill it in automatically. | Equivalent caution to SSN (US) and national ID numbers (EU). |
| **Nationality** | **Omit by default** [Official/Practice]. Exception: if the profile says SC or SPR, an optional one-line `Work status: Singapore Citizen` / `Singapore PR` in the header is allowed and useful, because it tells the employer no work pass or MCF ad is needed. That is the user's call; ask once and record it. [Practice] | US: "authorized to work" lines are common. EU: varies. |
| **Pass status line** | If the candidate needs an EP, **don't advertise it on the CV.** Answer pass questions truthfully where a form asks. If they hold a pass that doesn't need employer sponsorship (ONE Pass, a valid Tech.Pass), a header line such as `Work status: ONE Pass holder (no sponsorship needed)` is a positive signal, but only if the profile confirms it. [Practice] | US: "Requires H-1B sponsorship" is usually asked on the form, not put on the CV. |
| **National Service** | Omit NS liability. [Official] For SC/PR males, listing completed NS as an experience entry is a personal choice, not required. [Practice] | n/a |
| **Length** | Keep the stock 2-page target from `05-cv-templates.md`. No official SG standard exists. [Practice] | US: 1 page for junior roles is common. EU: 2 pages common. |
| **Contact block** | Name, SG mobile (+65) if they have one, email, LinkedIn, GitHub / portfolio, and city ("Singapore" or "Relocating to Singapore" if true). No home address. [Practice] | Same. |
| **Notice period** | Optional one line in the header or the cover letter: `Notice period: [from profile]`. SG recruiters frequently ask for it, and it changes how quickly the employer can plan an EP. Use the contractual figure from the candidate's current contract; never guess. [Practice] (Statutory defaults only apply when the contract is silent; see `sg-market-and-salary.md`.) | US: rarely stated. UK/EU: often stated. |
| **Spelling** | British English spelling (organisation, optimise) to match SG convention. [Practice] | US: American spelling. |

## Application forms (MCF, company ATS, agency forms) **[Practice unless noted]**

- **Expected salary / current salary fields** are common on SG portals and agency forms. Rules:
  1. Use only the figure the user has put in the profile for SG roles (monthly, SGD, stating whether it is base or gross, and whether AWS/bonus is excluded).
  2. If the profile has none, **stop and ask the user**. Never fill it from benchmark data.
  3. If the field is optional, leave it blank unless the user says otherwise.
  4. Note: for an EP-dependent candidate, an expected salary below the MOM EP floor for their age and sector would make the hire impossible. Warn them if their number is below the floor (see `sg-work-eligibility.md`).
- **"Are you a Singapore Citizen / PR?" / "Do you require a work pass?"**: answer truthfully from the profile. If the profile field is `[UNKNOWN]`, stop and ask; do not answer.
- **Questions TAFEP says shouldn't be asked** (DOB, race, religion, marital status, photo, NRIC before offer): if a form makes one mandatory, fill nothing automatically. Show the user the field and let them decide. They may also report discriminatory forms or ads to TAFEP (https://www.tal.sg/tafep).

## AI / LLM / Agent content emphasis for SG **[Practice]**

These are tailoring hints that feed `05-cv-templates.md`. They are not claims; every bullet still has to be grounded in the profile.
- Lead with **shipped, production** LLM/agent systems: evaluation, reliability, latency and cost, guardrails. The Robert Walters 2026 SG highlights say employers are moving to "skills-first" hiring with practical assessments and proof of skills (factsheet linked in `sg-market-and-salary.md`).
- For bank/insurer roles (FS sector), surface governance, risk, data-residency and model-risk experience **if the profile has it**.
- If the role title matches an MOM **Shortage Occupation List** title (AI engineer, AI researcher/scientist, data scientist/engineer), mirror the SOL duty wording **only where it truthfully describes the candidate's work**. This can help the employer file under the right occupation. Never inflate.
- Public-sector and GovTech roles: name the impact and the stakeholders, and avoid unverifiable confidential detail.

## Quick checklist before generating an SG CV
- [ ] No photo, DOB, gender, marital status, religion, race, NRIC/FIN
- [ ] Nationality or pass line only if the profile allows it and the rules above say it helps
- [ ] Notice period from the profile (or omitted)
- [ ] British spelling
- [ ] 2 pages (stock template rule)
- [ ] Expected salary fields: profile value or ask the user, never benchmark data
