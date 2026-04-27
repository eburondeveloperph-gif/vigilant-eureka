<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c8dac667-93c2-4cfa-a958-28f001e00bf9

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the required keys in `.env.local`:
   - `GEMINI_API_KEY` for Gemini Live voice conversations
   - `DEEPGRAM_API_KEY` for realtime speech-to-text through the local `/api/deepgram/listen` WebSocket proxy
   - `HEYGEN_API_KEY` for HeyGen v3 video generation through the local `/api/heygen` proxy
3. Run the app:
   `npm run dev`
