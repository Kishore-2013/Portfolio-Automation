# Setup Guide - Visme AI Portfolio Generator

Follow these steps to configure your local development environment.

## 1. Environment Variables (.env)

The project requires several keys to function. Create a `.env` file in both `web/` and `server1/`.

### Server Configuration (`server1/.env`)
- `OPENAI_API_KEY`: Required for resume parsing and image generation.
- `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`: Required for database storage.
- `GITHUB_TOKEN`: A Personal Access Token (classic) with `repo` scopes.
- `INSTANCES_PATH`: Use an absolute path on your machine (e.g., `C:\Users\Name\Project\server1\instances`).
- `VERCEL_TOKEN`: Required for automated Vercel deployments.

### Dashboard Configuration (`web/.env`)
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
- `NEXT_PUBLIC_API_URL`: Should be `http://localhost:3001` for local development.

## 2. Supabase Database Schema

Ensure your Supabase project has the following tables:
- `users`: Managed by Supabase Auth.
- `resumes`: (id, user_id, parsed_json, file_path, created_at).
- `projects`: (id, user_id, template_id, portfolio_data, disk_path, github_url, vercel_url, created_at).

## 3. Windows Specific Notes

- **Path Slashes**: When setting `INSTANCES_PATH` or `TEMPLATES_PATH` in `.env`, use double backslashes `\` or forward slashes `/`.
- **Git Bash / PowerShell**: Use a modern terminal to ensure `npm run dev` handles the concurrent processes correctly.
- **Node Version**: Ensure you are using Node 18 or 20.

## 4. Troubleshooting

- **"fatal: not a git repository"**: This is expected in the console logs for folders in `server1/instances/` because they are generated dynamically and are not standalone repositories.
- **AI Latency**: DALL-E 3 image generation takes about 15-20 seconds. If images don't appear immediately in the preview, wait 30 seconds and refresh.
展