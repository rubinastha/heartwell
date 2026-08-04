# HeartWell

A wellbeing app for cardiac patients and their families — helping people understand medical terms in plain language, track symptoms and mood, and feel more prepared going into appointments.

## Why this exists

Patients diagnosed with a cardiac condition often leave appointments without a clear grasp of their diagnosis or what comes next. Between visits, there's no easy way to track how symptoms, mood, or medication adherence are changing — and that information gap often pushes people toward unreliable self-diagnosis online. HeartWell aims to close that gap with plain-language explanations and a simple daily check-in, tied together in one connected loop.

## Features

- **Word lookup** — search cardiac terms and diagnoses, get a plain-language explanation, and save the ones relevant to you with a personal note
- **Daily check-in** — log mood, symptoms, and medication adherence, optionally tagged to a saved word
- **Timeline** — a single, filterable feed of saved words and check-ins, click into any entry for full detail
- **Summary** — pick a date range to see aggregate stats: mood trends, symptom frequency, and medication adherence
- **Profile** — store your medications, diagnosis, and doctor's contact info in one place

## Status

Early-stage MVP / prototype, built to validate the core concept with real users before further development. See [`heartwell_prd.md`](./prd-cardioclear.md) for the full product requirements and success metrics, and [`project-brief.md`](./project-brief.md) for the problem background and research behind it.

Not currently built for production use with real patient data — no authentication, and data handling hasn't been reviewed for HIPAA compliance.

## Getting started

```bash
# Install dependencies
npm install

# Run the app locally
npm run dev
```

Then open the local URL shown in your terminal (typically `http://localhost:3000` or `http://localhost:5173`, depending on setup).

> Note: adjust the commands above if this project's `package.json` uses different scripts — check the `scripts` section there to confirm.

## Roadmap

- [ ] User testing with a small group of patients
- [ ] Define a lightweight clinician review process for term definitions
- [ ] Revisit scope for v2 based on testing feedback

## License

TBD
