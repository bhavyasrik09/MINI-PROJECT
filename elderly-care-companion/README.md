# Elderly Care Companion — Phase-1 Web Prototype

Phase-1 focuses on building a reliable, voice-first web prototype that ensures medicine adherence, appointment reminders, emergency response, and caregiver visibility using browser-based technologies.

## What this scaffold includes
- `index.html` — Elder interface (voice, medicine, SOS)
- `caregiver.html` — Caregiver dashboard
- `css/` — styles
- `js/` — core logic stubs (`storage.js`, `voice.js`, `medicine.js`, `sos.js`, `assistant.js`, `dashboard.js`)
- `data/sample-data.json` — demo data
- `assets/` — placeholders for icons and audio

## Run
Open `index.html` and `caregiver.html` in Chrome for full Web Speech API support.

## Quick tests
- Open `index.html` in Chrome. Add a medicine and set a time a minute ahead to test reminders.
- Click the microphone button to try voice assistant commands: "Next medicine", "Today's schedule", "Call my son".

## On-screen usage guide
- `index.html` (Elder):
	- Add medicines with name + time. When a reminder plays, say "Taken" to confirm.
	- Use the Voice button (🎤) and say: "Next medicine", "Today's schedule", or "Call my son".
	- Press SOS (🚨) to log an emergency with location (browser permission required).

- `caregiver.html` (Caregiver):
	- Shows medicine compliance and SOS events. Click Refresh or leave open; it polls every 5s.

## Voice commands (examples)
- "Next medicine" — hears next pending medicine and time.
- "Today's schedule" — summary of appointments.
- "Call my son" — assistant prompts (for demo it suggests calling).
- "Help" or "What can I say" — assistant reads usage tips aloud.

If you'd like, I can also add an onboarding modal or short demo walkthrough that runs on first load.

## Notes
- This is a Phase-1 prototype: voice features rely on the browser's Web Speech API (Chrome recommended).
- Add real icons/audio into `assets/` for a better demo.

## Phase-1 Scope Statement
“Phase-1 focuses on building a reliable, voice-first web prototype that ensures medicine adherence, appointment reminders, emergency response, and caregiver visibility using browser-based technologies.”
