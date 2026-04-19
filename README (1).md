# GDC — Public Voting Portal

> One voice. One vote. **Zero noise.**

A full-stack civic voting platform built with FastAPI + MongoDB + React + Tailwind.

---

## Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Backend   | FastAPI, Motor (async MongoDB), Uvicorn |
| Database  | MongoDB 7                               |
| Frontend  | React 18, React Router v6, Tailwind CSS |
| UI        | Sonner (toasts), Lucide React (icons)   |
| Fonts     | Clash Display, IBM Plex Sans/Mono       |
| Deploy    | Docker Compose                          |

---

## Quick Start

### With Docker (recommended)

```bash
cd gdc-portal
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Local Development

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

Requires MongoDB running locally on port 27017.

---

## API Endpoints

| Method | Path                          | Description                         |
|--------|-------------------------------|-------------------------------------|
| POST   | /api/elections                | Create a new election               |
| GET    | /api/elections                | List all elections with status      |
| GET    | /api/elections/{id}           | Get election detail + has_voted     |
| POST   | /api/elections/{id}/vote      | Cast a vote (409 on duplicate)      |
| DELETE | /api/elections/{id}           | Delete election + votes             |

---

## Privacy Design

- Voter IPs are **never stored raw**. Every vote stores `SHA256(ip + election_id)`.
- A background scheduler runs every 30 seconds. When an election's `end_time` passes, **all `ip_hash` fields** on its votes are set to `null`.
- Vote counts are preserved after purge — only the identity link is destroyed.
- No cookies. No tracking pixels. No external analytics.

---

## Frontend Routes

| Path                       | Page                         |
|----------------------------|------------------------------|
| `/`                        | Home — election registry     |
| `/create`                  | Create election form         |
| `/election/:id`            | Ballot / voting page         |
| `/election/:id/results`    | Live results + bar chart     |

---

## Testing

### Duplicate vote prevention (409)
```bash
# Vote once
curl -X POST http://localhost:8000/api/elections/{ID}/vote \
  -H "Content-Type: application/json" \
  -d '{"candidate_id": "{CANDIDATE_ID}"}'

# Vote again from same IP → should return 409
curl -X POST http://localhost:8000/api/elections/{ID}/vote \
  -H "Content-Type: application/json" \
  -d '{"candidate_id": "{CANDIDATE_ID}"}'
```

### Time-window enforcement (400)
```bash
# Vote on upcoming election → 400
# Vote on ended election → 400
```

### data-testid attributes
Every interactive element carries a `data-testid` in kebab-case for E2E test targeting.

Key testids:
- `navbar`, `navbar-logo`, `nav-home`, `nav-create`
- `hero-section`, `hero-stats`, `stat-active`, `stat-scheduled`, `stat-total-votes`
- `filter-tabs`, `filter-tab-all`, `filter-tab-live`, `filter-tab-upcoming`, `filter-tab-ended`
- `election-list`, `election-card-{id}`, `card-vote-btn-{id}`, `card-results-btn-{id}`
- `create-election-form`, `input-title`, `input-description`, `input-start-time`, `input-end-time`
- `add-candidate-btn`, `candidates-list`, `candidate-row-{i}`, `candidate-name-{i}`, `candidate-desc-{i}`
- `submit-election-btn`
- `election-title`, `election-description`, `total-vote-count`
- `candidates-grid`, `candidate-card-{id}`, `vote-bar-{id}`
- `cast-vote-btn`, `already-voted-banner`, `upcoming-banner`
- `results-chart`, `result-row-{id}`, `result-votes-{id}`, `result-pct-{id}`, `result-bar-{id}`
- `leader-card`, `leader-name`, `leader-votes`
- `countdown`, `status-badge-{live|upcoming|ended}`
- `empty-state`, `loading-state`, `footer`

---

## Design System

**Swiss & High-Contrast editorial design:**
- No gradients, no shadows, no rounded corners
- 2px black borders on all major blocks
- Grid-line background on hero
- "Control room" cell layout (border-l/t on container, border-r/b on cells)
- Uppercase mono labels everywhere
- Huge mono numbers for stats
- Pulsing dot on LIVE badge
- Red→white flash animation when vote count increments
- Blinking cursor `_` on loading states
- Countdown in `DDd HHh MMm SSs` format
