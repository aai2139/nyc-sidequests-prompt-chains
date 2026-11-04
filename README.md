# NYC Sidequests Prompt Chain Studio

A superadmin-only Next.js application for designing, ordering, and executing multimodal prompt chains. It shares Supabase authentication and data with the public NYC Sidequests application.

## Features

- Create, edit, delete, activate, and run prompt chains
- Create, edit, delete, and reorder text or image steps
- Text, image, and text-plus-image starting inputs
- Gemini text and image generation with per-step model overrides
- Private generated-media storage and complete execution traces
- Light, dark, and system color themes
- Server-side `profiles.is_superadmin` authorization on every page and mutation

## Local setup

Copy `.env.example` to `.env.local`, fill in the shared Supabase credentials and Gemini key, then run:

```bash
npm install
npm run dev
```

The shared database migration is maintained in the public app repository at `supabase/migrations/202611040001_prompt_chain_studio.sql`.

## Verification

```bash
npm run lint
npm run build
```
