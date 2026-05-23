# AI Cabinet Intake OS - Dr Amraoui Demo

Clickable frontend demo for a future cardiology/rhythmology intake operating system. It visualizes a Notion-like cockpit for booking intake, secretary validation, doctor-ready queues, draft reports, automation logs, and a quiet Doctor's Specialities / Second Brain module.

## Tech Stack

- Next.js
- TypeScript
- React local state with `localStorage`
- CSS dashboard system with healthcare SaaS styling
- `lucide-react` icons
- No backend, no database, no external APIs, no real LLM calls

## Local Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Test

```bash
npm run build
npm run start
```

## GitHub Setup

```bash
git init
git add .
git commit -m "Initial AI Cabinet Intake OS demo"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

## Render Deployment

1. Push the repo to GitHub.
2. Create a new Render Web Service.
3. Connect the GitHub repository.
4. Use Runtime: Node.
5. Use Build Command: `npm install && npm run build`.
6. Use Start Command: `npm run start`.
7. Deploy and open the Render URL.

The included `render.yaml` sets `NODE_VERSION=20` and `NEXT_PUBLIC_DEMO_MODE=true`.

## Demo Data

The app generates 200 pseudonymous synthetic patients and about 280 appointment/case records in `src/lib/mockPatients.ts`. Patient identities are represented only by Patient Secure IDs such as `PSID-1001`. Medication data is fictional or class-based and clearly marked as fake/demo data with no dosage guidance.

## Compliance / Demo Disclaimer

This is not a real medical product. It stores no real patient names, contact details, addresses, dates of birth, or medical documents. Secure records are represented by placeholders such as `HDS://record/PSID-1001`. The app does not claim real GDPR or HDS compliance, does not diagnose, does not suggest treatment, and does not call any external service.

## Known Limitations

- Local browser state is stored in `localStorage`; reset from Admin Rules if needed.
- All reports, insights, rules, logs, and data controls are deterministic mock behavior.
- No authentication, backend, notifications, Doctolib integration, email, WhatsApp, Notion, or LLM integration is included.
