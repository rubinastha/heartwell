# **Product Requirements Document: HeartWell**

## **1\. Overview**

HeartWell helps cardiac patients and their families understand medical terms in plain language and track symptoms, mood, and medication adherence over time — reducing the anxiety that comes from not understanding a diagnosis, and giving patients a clearer, more organized picture to bring into appointments.

## **2\. Problem statement**

Patients diagnosed with a cardiac condition often leave appointments without a real grasp of what their diagnosis means or what comes next. Between visits, there's no easy way to track how symptoms, mood, or medication adherence are changing. That information gap creates anxiety on its own, and pushes people toward unreliable self-diagnosis on search engines — creating friction with their own care team rather than resolving it.

## **3\. Goals for this phase (MVP)**

* Validate that a single, connected loop — look up a term, save it, log a check-in tagged to it — is more useful than either feature alone.  
* Get a working prototype in front of real users (starting with a small circle of patients/caregivers) to test the core hypothesis below.  
* Keep scope small enough to build and iterate quickly.

## **4\. Non-goals (explicitly out of scope for now)**

* No login or multi-account system — single-user only  
* No clinician-facing portal or review workflow (clinician involvement is a future phase)  
* No push notifications  
* No care-team messaging or data sharing/export  
* Not built or reviewed for HIPAA-level data handling yet — not for real patient data at scale

## **5\. Users**

* **Primary: the patient.** Recently diagnosed or living with a cardiac condition, wants to understand their diagnosis and track how they're doing.  
* **Secondary: the family caregiver.** Often accompanies the patient to appointments — partly for language support, partly to make sure nothing important gets missed. Benefits from the same information, may use the app on the patient's behalf.

## **6\. Features & requirements**

| Feature | Description | Key requirement |
| ----- | ----- | ----- |
| Word lookup | Search or browse cardiac terms; see a plain-language explanation | Saving a word prompts for an optional personal note, stored with it |
| Daily check-in | Log mood, symptoms, medication taken, optional note | Can be tagged to a saved word |
| Timeline | Chronological feed of saved words \+ check-ins | Every entry is clickable into a full detail view; filterable by All / Saved words / Entries |
| Summary | Date-range view of check-in data | Shows mood trend, symptom frequency, medication adherence rate, and total check-ins for the selected range |
| Profile | User's name, medications, diagnosis, doctor contact info | Simple editable form, no authentication required |

## **7\. Success metrics**

Success here isn't one number — it's a few different questions, each answered by a different kind of metric.

**Does the core loop actually hold together?**

| Metric | What it tells you |
| ----- | ----- |
| % of check-ins tagged to a saved word | Whether people use the loop as one connected flow, or treat lookup and journaling as separate features |
| % of saved words revisited later | Whether saved definitions are actually useful reference material, not just a one-time read |

**Is it being used at all?**

| Metric | What it tells you |
| ----- | ----- |
| Check-ins per user per week | Baseline engagement |
| 7-day retention | Whether people come back after the first session |

**Is it solving the actual problem?**

| Metric | What it tells you |
| ----- | ----- |
| Self-reported "I felt prepared for my appointment" (simple survey, before/after use) | Whether the tool addresses the core anxiety/information-gap problem, not just whether it's used |
| Self-reported trust in the plain-language explanations vs. searching on their own | Tests the "Dr. Google" differentiation directly — this is the riskiest assumption in the whole project |

**Who's actually using it?**

| Metric | What it tells you |
| ----- | ----- |
| % of sessions from a caregiver vs. the patient themselves | Whether the app needs to more explicitly design for two user types going forward |

## **8\. Risks & open assumptions**

* **Unproven core bet:** that clinician-reviewed, plain-language content will be trusted more than searching independently. Worth testing cheaply and early (e.g., A/B a definition with and without a "clinician-reviewed" label).  
* **Research base is thin:** current problem understanding comes from one in-depth interview. Useful as a strong starting anchor, but should be validated with a few more patients/caregivers before assuming it generalizes.  
* **Clinician content pipeline is undefined:** who reviews or writes the plain-language definitions, and how that's sourced or maintained, isn't decided yet.

## **9\. Next milestones**

1. Working MVP prototype (in progress)  
2. Small-scale user testing (a handful of patients/caregivers, including follow-up interviews)  
3. Revisit scope for v2 based on what testing shows