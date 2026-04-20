# Diagnostika

AI-powered clinical case simulations for medical students.

> ⚠️ **This app is currently in development mode. Features may change and data may be reset.**
>
> The core application (UI, cases, and AI interactions) is available in Swedish.

**Live site:** [diagnostika.se](https://diagnostika.se)

---

## Overview

Diagnostika enables medical students to practice clinical reasoning through interactive, AI-simulated patient encounters. Users select a case, conduct a patient history, order diagnostic tests, and submit a final diagnosis. Each session concludes with an automated evaluation that highlights strengths and identifies gaps in clinical reasoning.

## Features

- **AI Patient Conversations.** Realistic, case-driven dialogue with a simulated patient.
- **Clinical Data Access.** Request vital signs, laboratory results, and imaging during the consultation.
- **Automated Evaluation.** Scoring across history-taking, clinical reasoning, and diagnostic accuracy.
- **Subscription Plans.** Free tier with limited cases; Pro tier for unlimited access.

## Test Payments

Stripe is configured in **test mode**. To trial a Pro subscription, use the following card details:

| Field       | Value                    |
|-------------|--------------------------|
| Card number | `4242 4242 4242 4242`    |
| Expiry      | Any future date          |
| CVC         | Any 3 digits             |

## Tech Stack

| Layer            | Technology                                   |
|------------------|----------------------------------------------|
| Framework        | Next.js (App Router), React 19, TypeScript   |
| Styling          | Tailwind CSS, shadcn/ui                      |
| Authentication   | Clerk                                        |
| Database         | Supabase (PostgreSQL)                        |
| AI Engine        | OpenAI                                       |
| Payments         | Stripe                                       |
| Hosting          | Vercel                                       |
