# Scholarship Data Schema Notes

## Language Proficiency

Every record should include `languageProficiency`.

```json
{
  "summary": "Programme-specific summary",
  "tests": "IELTS / TOEFL / PTE / Duolingo / other / unspecified",
  "minimums": "Exact official thresholds or unspecified",
  "waiver": "Available / conditional / not stated / unspecified",
  "prepare": "Concrete preparation guidance for the applicant",
  "notes": "Important caveats"
}
```

Rule: do not assume that a prior English-medium degree automatically creates an IELTS/TOEFL waiver. Record the official scholarship or university rule.

Preparation should distinguish:

- standardized English tests: IELTS, TOEFL, PTE, Duolingo, Cambridge English, or programme-specific alternatives
- proof of taught language: Medium of Instruction letter, transcript language note, or university letter
- local-language proof: French, German, Korean, Japanese, Chinese or Turkish proof where a programme is not English-taught
- waiver evidence: only valid if the official scholarship or university policy permits it

## Application Fees

Every record should include `fees`.

```json
{
  "scholarshipApplication": "Fee for the scholarship application itself",
  "degreeApplication": "Fee for the university/programme application",
  "feeWaiver": "Available / conditional / not stated / unspecified",
  "notes": "Important caveats"
}
```

Rule: scholarship application fees and university degree-application fees must stay separate.

Examples:

- Knight-Hennessy: no scholarship application fee, but Stanford graduate programme fees apply.
- McCall MacBain: scholarship application is separate from McGill admission; McGill graduate application fees may apply and are not covered by the scholarship.
- KAUST: current admissions FAQ says there is no cost to submit a KAUST application.
- GIST: current official pages state a KRW 680,000 matriculation fee at enrollment, with possible exemptions.

When a fee is not clearly confirmed by an official source, write `unspecified`.
