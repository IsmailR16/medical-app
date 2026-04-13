# Diagnostika

**AI-powered clinical case simulations for medical students.**

> ⚠️ **This app is currently in development mode.** Features may change and data may be reset.
>
> 🇸🇪 The core application (UI, cases, and AI interactions) is in **Swedish**.

🔗 **Live:** [diagnostika.se](https://diagnostika.se)

---

## What is Diagnostika?

Diagnostika lets medical students practice clinical reasoning by interacting with AI-simulated patients. You pick a case, take a history, order tests, and submit a diagnosis — then receive an instant evaluation with feedback on what you did well and what you missed.

### Key Features

- 🩺 **AI Patient Conversations** — Chat with a realistic AI patient that responds based on the clinical case
- 🧪 **Clinical Data** — Request vitals, lab results, and imaging during the consultation
- 📊 **Instant Evaluation** — Get scored on history-taking, clinical reasoning, and diagnostic accuracy
- 💳 **Subscription Plans** — Free tier with limited cases, Pro tier for unlimited access

---

## Test Payments

Stripe is running in **test mode**. To try a Pro subscription, use:

| Field       | Value                    |
|-------------|--------------------------|
| Card number | `4242 4242 4242 4242`    |
| Expiry      | Any future date          |
| CVC         | Any 3 digits             |

---

## Tech Stack

- **Next.js** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Clerk** — Authentication
- **Supabase** — Database (PostgreSQL)
- **OpenAI** — AI patient & evaluation engine
- **Stripe** — Subscription billing
- **Vercel** — Hosting
