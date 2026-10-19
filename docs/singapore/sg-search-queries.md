---
framework_version: sg-0.1.0
region: SG
extends: job-scraper/search-queries.md
---

# Search Queries for Job Scraper: Singapore (AI / LLM / Agent)

<!-- SETUP: Region defaults to SG (see region-defaults.md). Add or remove titles to match the user's profile once /setup has run. -->

## Installed portal CLIs (primary for `/scrape`)

Run the installed CLIs first, scoped to Singapore:
- `mycareersfuture-search`: Singapore government board via its public API. Personal low-volume use; do not republish listings. See `.agents/skills/mycareersfuture-search/SKILL.md`.
- `freehire-search`: pass Singapore as the location. **Known issue (tested 2026-10-19):** its country filter let at least one non-SG posting (Portugal) through, so drop any result whose location is not Singapore before ranking.
- `linkedin-search`: location "Singapore". Personal-use / ToS caveat as in upstream.

The `site:` queries below are the **WebSearch fallback**, used for SG boards without a CLI and for employer career pages.

**Language scope:** English for all categories. SG job ads are overwhelmingly in English. A posting that requires another language as a job condition (e.g. Mandarin for a China-facing role) goes through the Language Gate in `04-job-evaluation.md`. Note that TAFEP's guidelines discourage language requirements unless they are job-related, so treat a stated language requirement as real.

## Search Sites (each URL checked 2026-10-19)

Primary SG boards:
| Board | URL | Fetch status 2026-10-19 | Notes |
|---|---|---|---|
| **MyCareersFuture (MCF)** | https://www.mycareersfuture.gov.sg/ · search: https://www.mycareersfuture.gov.sg/search?search=LLM | 200 | Government board. Every ad has a salary range. Employers hiring EP/S Pass holders must advertise here first (FCF), so it is the most important SG source for an EP-dependent candidate |
| **LinkedIn Jobs** | https://www.linkedin.com/jobs/search/?keywords=LLM&location=Singapore | 200 | Also covered by the `linkedin-search` CLI |
| **JobStreet SG** | https://sg.jobstreet.com/ | 403 to curl; loads via the fetch tool | Large general board |
| **NodeFlair Jobs** | https://nodeflair.com/jobs | 200 (slow; timed out once) | Tech-only, SG-focused, often shows salary |
| **Tech in Asia Jobs** | https://www.techinasia.com/jobs · SG filter: https://www.techinasia.com/jobs/search?country_name[]=Singapore | 200 | Start-up heavy |
| **eFinancialCareers SG** | https://www.efinancialcareers.sg/jobs/in-singapore | 200 | Bank/fintech AI roles (FS sector, so the higher EP floor applies) |
| **Careers@Gov** | https://www.careers.gov.sg/ | 200 | Public service and statutory boards. Read each posting's eligibility line (see `sg-work-eligibility.md`) |
| Glints SG (optional) | https://glints.com/sg/opportunities/jobs/explore | 200 | Start-ups / SMEs |

## Query Categories

Grouped by function, with several title variants each (upstream rule: organise by function, not job title).

### Priority 1: LLM / GenAI application engineering
Titles: AI Engineer, LLM Engineer, Generative AI Engineer, GenAI Engineer, Applied AI Engineer, Machine Learning Engineer (LLM), AI Software Engineer, Forward Deployed Engineer, Solutions Engineer (AI)

```
site:mycareersfuture.gov.sg "LLM" engineer
site:mycareersfuture.gov.sg "generative AI" engineer
site:mycareersfuture.gov.sg "AI engineer"
site:linkedin.com/jobs "LLM engineer" Singapore
site:linkedin.com/jobs "applied AI engineer" Singapore
site:sg.jobstreet.com "generative AI" engineer
site:nodeflair.com/jobs LLM Singapore
site:techinasia.com/jobs "AI engineer" Singapore
```

### Priority 2: AI agents & agentic systems
Titles: Agent Engineer, AI Agent Developer, Agentic AI Engineer, Autonomous Agents Engineer, AI Automation Engineer, Conversational AI Engineer
Keywords: "AI agents", "agentic", "multi-agent", "tool calling", "function calling", "MCP", "LangGraph", "orchestration", "RAG"

```
site:mycareersfuture.gov.sg "AI agents"
site:mycareersfuture.gov.sg agentic
site:linkedin.com/jobs "agentic AI" Singapore
site:linkedin.com/jobs ("AI agent" OR "multi-agent") engineer Singapore
site:nodeflair.com/jobs agent LLM Singapore
site:sg.jobstreet.com "agentic"
```

### Priority 3: ML platform, evaluation & reliability
Titles: ML Platform Engineer, MLOps Engineer, LLMOps Engineer, AI Infrastructure Engineer, Evaluation Engineer, AI Reliability / Safety Engineer
Keywords: "LLM evaluation", "evals", "inference", "vLLM", "model serving", "guardrails", "AI governance"

```
site:mycareersfuture.gov.sg MLOps
site:linkedin.com/jobs ("LLMOps" OR "LLM evaluation") Singapore
site:linkedin.com/jobs "AI infrastructure" engineer Singapore
site:efinancialcareers.sg "machine learning" engineer
```

### Priority 4: Research-leaning & data science (SOL-matching titles)
Titles: AI Scientist, AI Researcher, Research Engineer, Data Scientist (GenAI), NLP Engineer. Of these, **AI engineer, AI researcher/scientist, data scientist/data engineer** are MOM Shortage Occupation List titles (see `sg-work-eligibility.md`).

```
site:mycareersfuture.gov.sg "AI scientist" OR "AI researcher"
site:linkedin.com/jobs "research engineer" LLM Singapore
site:careers.gov.sg "artificial intelligence"
```

### Priority 5: Product & customer-facing AI
Titles: AI Product Manager, Technical Product Manager (AI), AI Solutions Architect, Applied AI Architect

```
site:linkedin.com/jobs "AI product manager" Singapore
site:mycareersfuture.gov.sg "solutions architect" "generative AI"
```

## Notable AI employers with an SG presence (career URLs checked 2026-10-19)

"Resolves" means the URL returned HTTP 200 (after redirects) from the box on 2026-10-19. Use each page's own location filter set to Singapore. The **SG evidence** column says how SG presence was established this session; "not re-checked" means the URL works but SG hiring was not independently confirmed today.

### Frontier labs / AI platforms
| Employer | Careers URL | URL status | SG evidence |
|---|---|---|---|
| OpenAI | https://jobs.ashbyhq.com/openai (openai.com/careers returns 403 to curl) | 200 | SG postings found 2026-10-19, e.g. "Applied AI Engineer – Singapore", "Forward Deployed Engineer – Singapore" (hybrid, 3 office days, relocation assistance) |
| Anthropic | https://www.anthropic.com/careers/jobs | 200 | Anthropic news, 14 Oct 2026: Singapore office opened (Raffles Place), "now open and hiring" — https://www.anthropic.com/news/singapore-office-opening |
| Google | https://www.google.com/about/careers/applications/jobs/results/?location=Singapore | 200 | Not re-checked |
| Microsoft | https://apply.careers.microsoft.com/careers (the SG-filtered URL redirects here; set location manually) | 200 | Not re-checked |
| Amazon / AWS | https://www.amazon.jobs/en/search?base_query=&loc_query=Singapore | 200 | Not re-checked |
| NVIDIA | https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite | 200 | Not re-checked |
| Databricks | https://www.databricks.com/company/careers/open-positions?location=Singapore | 200 | Not re-checked |
| Salesforce | https://www.salesforce.com/company/careers/jobs/?search=&country=Singapore | 200 | Not re-checked |
| Stripe | https://stripe.com/careers/search?office_locations=Asia+Pacific--Singapore | 200 | The office filter "Asia Pacific – Singapore" exists; openings not re-checked |

### SG-headquartered tech / platforms
| Employer | Careers URL | URL status | SG evidence |
|---|---|---|---|
| Grab | https://www.grab.careers/en/jobs/?location=Singapore | 200 | Widely reported as SG-HQ; not re-checked |
| Sea Group | https://www.sea.com/careers | 200 | Widely reported as SG-HQ; not re-checked |
| Shopee | https://careers.shopee.sg/jobs | 200 | SG domain; not re-checked |
| ByteDance | https://joinbytedance.com/search | 200 | Not re-checked |
| TikTok | https://lifeattiktok.com/search | 200 | Not re-checked |
| Ant International | https://www.antintl.com/careers/ | 200 | Not re-checked |
| Alibaba (incl. Alibaba Cloud) | https://talent.alibaba.com/en/home | 200 | Not re-checked |

### Public sector & research (check SC/PR restrictions per posting)
| Employer | Careers URL | URL status |
|---|---|---|
| GovTech Singapore | https://www.tech.gov.sg/careers/ | 200 |
| AI Singapore | https://aisingapore.org/home/careers/ | 200 |
| A*STAR | https://careers.a-star.edu.sg/ | 200 (www.a-star.edu.sg/careers returned 404) |
| Careers@Gov (all agencies) | https://www.careers.gov.sg/ | 200 |

### Banks (FS sector, so the higher EP floor applies)
| Employer | Careers URL | URL status |
|---|---|---|
| DBS | https://www.dbs.com/careers/default.page (the /careers/jobs.page path redirects here with an error flag) | 200 |
| OCBC | https://www.ocbc.com/group/careers/ | 200 |

**Dropped after checking:** Meta careers (HTTP 400 to curl, SG presence not checked), Google DeepMind and Cohere (URLs resolve, but no SG presence evidence found this session), Mistral and Ant Group global (no response).

Company page queries (WebSearch fallback):
```
site:jobs.ashbyhq.com/openai Singapore
site:anthropic.com/careers Singapore
site:grab.careers "machine learning" OR LLM
site:careers.shopee.sg "LLM" OR "AI engineer"
site:tech.gov.sg careers "AI"
site:aisingapore.org careers
```

## Filtering rules (SG)
1. Drop any result whose location is not Singapore (or "Remote – Singapore") unless the user asked for remote-APAC.
2. Keep the MCF job ID and salary range when a role appears on MCF. `sg-work-eligibility.md` uses it.
3. Deduplicate LinkedIn and MCF twins by employer + title. Prefer the MCF record for salary and the employer page for the full description.
4. Run the SG Eligibility Gate (`sg-work-eligibility.md`) before scoring.
