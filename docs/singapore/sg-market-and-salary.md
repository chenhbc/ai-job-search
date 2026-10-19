---
framework_version: sg-0.1.0
region: SG
extends: 04-job-evaluation.md#6-salary-benchmark-optional
---

# Singapore Market & Salary Research

<!-- SETUP: No personalization needed. Larry's current/expected pay lives in the profile, never in this file. -->

This file tells the agent **how to find** SG pay data for AI / LLM / Agent roles and how to compare SG offers. It deliberately contains **no market salary figures**. Every number the agent reports must come from a source it opened in the current session, quoted with the source name, URL, the data's reference period, and the date it was checked. If no source gives a figure, say "not found" and list which sources were tried. **Never estimate, average across memory, or round a figure into existence.**

The official numbers below (CPF rates and ceilings) are statutory parameters, not salary data.

## Sources (checked 2026-10-19)

| # | Source | URL | What it gives | Caveats |
|---|---|---|---|---|
| 1 | **MOM Occupational Wages 2025** (released 30 Jun 2026) | https://stats.mom.gov.sg/Pages/Occupational-Wages-Tables2025.aspx | Median, 25th and 75th percentile **monthly basic and gross wages** for 500+ occupations by industry, reference month **June 2025**; xlsx downloads; also by sex, establishment size, age | Full-time **resident** employees only (SC/PR), private establishments with ≥25 staff. **Excludes bonuses.** Occupation coded from the employer's job title (SSOC). There is no "LLM engineer" row, so map to the nearest SSOC occupation (e.g. software/applications developer, data scientist) and say so. Methodology: https://stats.mom.gov.sg/iMAS_Tables1/Wages/Wages_2025/Coverage-and-Methodology-of-OWS-2025.pdf |
| 2 | **MOM Occupational Wage Search** (benchmarking tool) | https://stats.mom.gov.sg/bt/Pages/iMasOWSInput.aspx | Where a given pay sits within an occupation | Same population caveats as #1 |
| 3 | **MOM Report on Wage Practices 2025** (May 2026) | https://stats.mom.gov.sg/iMAS_PdfLibrary/mrsd-report-on-wage-practices-2025.pdf | Wage *changes* and bonus practice by industry | Same-employer employees only; not job-switch raises |
| 4 | **MyCareersFuture (MCF) postings** | https://www.mycareersfuture.gov.sg/ | The salary range on each ad. For EP-linked ads MOM requires the range to be visible, max ≤ 2× min, and to contain the offered salary (MOM FCF page) | The range is monthly and usually excludes bonus. A range shows employer intent, not the pay actually agreed. Record min, max, posting date and job ID |
| 5 | **MOM EP qualifying salary** | https://www.mom.gov.sg/passes-and-permits/employment-pass/eligibility | A legal **floor** for foreign hires by age and sector (see `sg-work-eligibility.md`) | A floor, not a market rate; never present it as "what the job pays" |
| 6 | **Levels.fyi Singapore** | https://www.levels.fyi/t/software-engineer/locations/singapore · ML engineer: https://www.levels.fyi/t/software-engineer/title/machine-learning-engineer/locations/singapore | Self-reported total compensation (base / stock / bonus) by company and level | Self-reported and skewed to big tech; check sample size and date per entry; currency may be shown in USD or SGD, so read the label |
| 7 | **NodeFlair Salaries** | https://nodeflair.com/salaries (jobs: https://nodeflair.com/jobs) | SG/Asia tech salaries by company, role and seniority; many job listings show ranges | Mix of self-reported and posted data; note which. The page loaded slowly in testing (resolved on retry) |
| 8 | **Glassdoor Singapore** | https://www.glassdoor.sg/Salaries/index.htm | Self-reported salaries by company and title | Blocked automated fetch (HTTP 403) on 2026-10-19; open in the box browser. Small samples are common, so report the sample count |
| 9 | **Robert Walters Salary Survey 2026 (Singapore)** | https://www.robertwalters.com.sg/our-services/salary-survey.html | Recruiter salary bands by function and seniority (gated download) | Blocked automated fetch (403) on 2026-10-19; open in the browser. A public highlights factsheet (via BritCham) is at https://www.britcham.org.sg/sites/default/files/content-files/Factsheet%20-%20Robert%20Walters%20Salary%20Survey%202026.pdf: it lists Data/AI engineers among top in-demand tech professions and says AI, cloud and cybersecurity skills command premiums. It gives **no** figures to quote |
| 10 | **Hays Salary Guide (Singapore)** | https://www.hays.com.sg/salary-guide | Recruiter salary ranges by role | Usually gated behind a form. Record the edition year |
| 11 | **Michael Page Salary Guide (Singapore)** | https://www.michaelpage.com.sg/salary-guide | Recruiter salary ranges by role | Same as above |
| 12 | **eFinancialCareers SG** | https://www.efinancialcareers.sg/jobs/in-singapore | Postings (sometimes with ranges) for bank/fintech AI roles | The FS sector also has a higher EP floor |

## Research procedure (per role)

1. **Pin the role.** Title, seniority, and the employer's sector (FS vs non-FS, from `sg-work-eligibility.md`).
2. **Posting first.** If the posting or its MCF twin shows a range, that is the primary figure. Quote it verbatim with the job ID/date.
3. **Official baseline.** Pull the nearest SSOC occupation from MOM Occupational Wages 2025 (#1): median plus P25/P75 **gross** monthly, for the closest industry. State the mapping you used and that it covers residents only and excludes bonus.
4. **Market cross-check.** Levels.fyi (#6) for the same company and level if it exists; otherwise NodeFlair (#7), then Glassdoor (#8). Report each separately with sample size; **do not blend** them into one number.
5. **Recruiter guides** (#9–#11) only if Larry or the user has downloaded the guide (they are gated). Cite edition and page.
6. **Floor check.** Compare against the EP qualifying salary only for eligibility, never as a benchmark.
7. **Output** in the `04-job-evaluation.md` Salary Benchmark block:

```
### Salary Benchmark (SG)
- Posted range: S$[min]–[max]/month (source: MCF job [id], posted [date]) | not shown
- MOM OWS 2025 ([SSOC occupation], [industry]): P25/median/P75 gross S$[..] (June 2025 data; residents; excl. bonus) | not found
- Levels.fyi / NodeFlair / Glassdoor: [figure, n=…, date] each, or "no data"
- Checked: [YYYY-MM-DD]
- Not verified: [list]
```

## Comparing SG offers: CPF, bonus, notice

### CPF (Central Provident Fund)
Source: CPF Board, "CPF-related changes taking place in 2026" https://www.cpf.gov.sg/member/infohub/news/news-releases/cpf-related-changes-taking-place-in-2026-what-you-need-to-know and the rates table https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/CPFcontributionratesfrom1Jan2026.pdf (checked 2026-10-19).

- **Who:** Singapore Citizens and PRs. CPF Board's employer guidance says employers do **not** make CPF contributions for EP, S Pass or Work Permit holders. New PRs are on **graduated** rates in their first two years of PR status (higher rates optional by joint application). Source: CPF "Who do you need to pay CPF for" https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/Who_do_you_need_to_pay_cpf_for.pdf. The PDF was found through search; it was not opened in this session.
- **Rates from 1 Jan 2026, age 55 and below (SC / 3rd-year+ PR):** employee **20%**, employer **17%** of wages (total 37%). Older age bands have lower rates (see the table).
- **Ordinary Wage ceiling:** **S$8,000/month** from 1 Jan 2026 (the last step of a phased increase). **Annual wage ceiling: S$102,000** (unchanged). The Additional Wage ceiling = S$102,000 minus ordinary wages subject to CPF in the year.
- **Offer comparison rule:**
  - For an SC/PR, a quoted SG salary is **gross before the employee's 20%**. The employer's 17% sits on top and is not in the quoted number, but it goes into CPF accounts, not cash.
  - For an EP holder there is no CPF, so gross monthly ≈ cash before tax.
  - When comparing with EU/US offers, compare like with like: base, guaranteed bonus, variable bonus, equity, and retirement contributions as separate lines. Never compare an SG "monthly" figure to an annual figure without multiplying out the stated number of months (see AWS).

### AWS / 13th month and bonuses
Source: MOM, Variable wage components https://www.mom.gov.sg/employment-practices/salary/variable-wage-components (checked 2026-10-19).
- The **Annual Wage Supplement (AWS)**, the "13th month", is **not compulsory**. It is owed only if the employment contract or a collective agreement provides it. Performance bonuses and variable payments are likewise not compulsory unless contracted.
- So when an offer says "S$X/month", ask and record: **Is AWS contractual (fixed 13th month) or discretionary? Is there a target bonus, and is it guaranteed?** Annualise as `monthly × 12 + contractual AWS + (target bonus, labelled as non-guaranteed)`.
- MOM's wage tables (#1) exclude bonuses, so a benchmark comparison is on monthly basic/gross only.

### Notice periods
Source: MOM, Termination with notice https://www.mom.gov.sg/employment-practices/termination-of-employment/termination-with-notice (checked 2026-10-19).
- **The contract governs.** Notice must be the same length for employer and employee, given in writing, and either side can pay salary in lieu. Notice can be waived by mutual agreement in writing.
- **If the contract is silent,** the statutory default by length of service is: <26 weeks: 1 day; 26 weeks–<2 years: 1 week; 2–<5 years: 2 weeks; ≥5 years: 4 weeks.
- Annual leave can offset notice only with the employer's agreement. Reservist (NS) training does not count toward notice.
- **Market norm for tech roles:** no official source found. Read the current contract and the new offer; do not state a "typical" notice length as fact. For the CV/application form, see `sg-cv-conventions.md`.
- **Timeline impact for EP hires:** offer → EP application → in-principle approval adds time on top of notice. For roles that need an MCF ad, the employer cannot make the offer during the ≥14-day advertising window (see `sg-work-eligibility.md`).

### Income tax (pointer only)
IRAS individual income tax rates: https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-residency-and-tax-rates/individual-income-tax-rates. Tax residency (IRAS, checked 2026-10-19): a foreigner is a tax resident if they stayed or worked in SG for at least 183 days in the previous calendar year (or meet the other listed tests), and holders of a work pass valid for at least a year are treated as residents, subject to review at tax clearance. Tax is on a preceding-year basis. Use IRAS's own calculator; do not hand-compute net pay in this framework.

## Rules
1. **No invented numbers.** If a figure is not on an opened page, write how to find it (source + path), not a number.
2. **Always label** each figure with: monthly or annual, base or gross or total comp, SGD or USD, data period, and source.
3. **Keep official, posted and self-reported figures in separate lines.** Never average them.
4. **Re-check** CPF parameters every January and MOM wage tables each June (OWS release).
