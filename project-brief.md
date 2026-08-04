# Project brief: cardiac diagnosis + journaling app (working title)

## The problem

Patients diagnosed with a cardiac condition often leave the doctor's office without a real grasp of what their diagnosis means or what comes next. Between appointments, there's no easy way to track how symptoms, mood, or medication adherence are actually changing day to day. That information gap creates anxiety on its own — and it pushes people toward unreliable self-diagnosis on search engines, which can create friction with their own care team.

## Where this comes from

My mom was diagnosed with heart failure and atrial fibrillation in 2024. I interviewed her directly as early research for this project.

## What we heard

- **Information gap.** She's consistently felt like she never has enough information about her diagnoses or what her next steps should be.
- **No easy symptom tracking.** She has no simple way to look back at how she's actually been feeling day to day.
- **Family as a safety net.** She prefers to bring me or my dad to appointments — partly for a slight language barrier, but just as much so nothing important gets missed. The family member's role isn't just translation, it's information insurance.
- **The "Dr. Google" problem.** Her doctors have repeatedly flagged that she tries to self-diagnose using Google. The need for accessible information is clearly real — she's already trying to fill it herself — but the current way she's filling it isn't trustworthy, and it creates tension with her care team.

## Why this approach

- Plain-language explanations that are **developed or reviewed with clinicians** directly address the "Dr. Google" complaint — this becomes a credible alternative to searching, not another symptom-checker.
- A combined symptom/mood/medication journal gives the patient (and family) a running record, so less has to be reconstructed from memory during an appointment — potentially easing the reliance on a family member attending purely to catch details.
- Because a language barrier is part of what drives my mom to bring family along, plain-language, low-jargon content may also help other patients with limited English proficiency — worth exploring further, even if not in the MVP.

## Open questions for feedback

- What's a realistic way to involve clinicians in vetting definitions early on — informal review, a partnership, something else?
- Should the app explicitly design for a second user type — the family member/caregiver — or stay focused on the patient for now?
- Is language accessibility a v2 feature, or worth building in from the start given how central it was to my mom's experience?

*Note: this is grounded in one in-depth interview (my mom). Useful as a strong starting anchor, but the next step would be validating these patterns with a few more patients or caregivers.*

<div style="page-break-before: always;"></div>

# Thinking about this like a PM

## The loop so far

This project maps onto a standard PM loop: **problem → users → hypothesis & metrics → build MVP → test & learn → back to problem.**

**Done:**
- **Problem** — the information gap around a cardiac diagnosis causes anxiety (see page 1).
- **Users** — patient and family caregiver, informed directly by the interview with my mom.
- **Build MVP** — scoped to three screens and one core loop: term lookup, daily check-in, and timeline.

**Next:**
- **Hypothesis & metrics** — not yet written down explicitly.
- **Test & learn** — no real user testing yet.

## Hypothesis

If patients and families get clinician-reviewed, plain-language explanations tied to a symptom journal, they'll feel more prepared for appointments and less anxious between them.

## Success metrics to watch for early on

- Do people save terms and come back to them again?
- Do journal entries reference a saved term — does the "one loop" idea actually hold, or do people use the two features separately?
- Qualitatively: after using it, do patients or caregivers say they feel more prepared going into an appointment?

## Riskiest assumption to test first

The core bet isn't the UI — it's whether clinician-reviewed content actually beats "Dr. Google" in someone's mind. A cheap test: show the same term explained two ways, one flagged as clinician-reviewed and one not, and see if it changes trust or behavior.

## Stakeholders beyond the user

- A clinician willing to review content
- A clinic or hospital that might pilot it
- The caregiver, as a persona distinct from the patient

## Still to check before going further

A quick competitive scan — what MyChart, CardioSmart, or existing symptom trackers already do, and where they fall short for a patient like my mom.
