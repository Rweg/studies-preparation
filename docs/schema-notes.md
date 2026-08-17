# Scholarship Data Schema Notes

## Language Proficiency

Every record should include `languageProficiency`.

```json
{
  "summary": "Programme-specific summary",
  "tests": "IELTS / TOEFL / PTE / Duolingo / other / unspecified",
  "minimums": "Exact official thresholds or unspecified",
  "waiver": "Available / conditional / not stated / unspecified",
  "notes": "Important caveats"
}
```

Rule: do not assume that a prior English-medium degree automatically creates an IELTS/TOEFL waiver. Record the official scholarship or university rule.

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
