# Database Schema for Minesweeper Pro

## Tables

### profiles
- id: uuid (primary key, references auth.users)
- username: text (unique)
- avatar_url: text
- city: text
- created_at: timestamp

### games
- id: uuid (primary key)
- user_id: uuid (references profiles.id)
- difficulty: text (beginner, intermediate, expert, daily)
- time_seconds: integer
- status: text (won, lost)
- created_at: timestamp

### daily_challenges
- date: date (primary key)
- seed: text
- mines_count: integer
- grid_size: text (e.g., "16x30")

## Policies (RLS)
- Profiles: Publicly readable, only owner can update.
- Games: Publicly readable, only owner can insert.
