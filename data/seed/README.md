# Seed Data

Technology-agnostic JSON seed data for the RealWorld Conduit API.

## Files

| File | Description |
|------|-------------|
| `users.json` | 15 users across 4 roles |
| `articles.json` | 40 AI/Claude Code themed articles |
| `comments.json` | 105 comments on articles |

## Data Overview

### Users (15 total)

| Role | Count | Users |
|------|-------|-------|
| Admin | 2 | alex_admin, sarah_admin |
| Editor | 3 | mike_editor, emma_editor, david_editor |
| Author | 5 | lisa_writes, james_codes, anna_dev, tom_builder, nina_tech |
| Reader | 5 | chris_learns, maya_curious, ryan_newdev, zoe_explorer, oliver_watches |

**Password for all users:** `password123`

### Articles

Topics cover AI-assisted development including:
- Claude Code getting started and features
- Prompting techniques
- MCP servers and integrations
- Code review and testing with AI
- Team workflows and adoption
- Framework-specific tips (NestJS, Angular, Python)

### Relationships

- **Following**: Users follow other users (defined in `users.json`)
- **Favorites**: Users favorite articles (defined in `articles.json`)
- **Comments**: Comments reference both articles and authors

## JSON Schema

### User
```json
{
  "id": "user_001",
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "bio": "User bio",
  "image": "https://api.dicebear.com/7.x/avatars/svg?seed=username",
  "role": "admin|editor|author|reader",
  "following": ["user_002", "user_003"]
}
```

### Article
```json
{
  "id": "article_001",
  "title": "Article Title",
  "slug": "article-title",
  "description": "Short description",
  "body": "Full markdown content",
  "tagList": ["tag1", "tag2"],
  "authorId": "user_001",
  "favouritedBy": ["user_002", "user_003"],
  "createdAt": "2024-12-01T10:00:00Z"
}
```

### Comment
```json
{
  "id": "comment_001",
  "body": "Comment text",
  "authorId": "user_002",
  "articleId": "article_001",
  "createdAt": "2024-12-01T12:00:00Z"
}
```

## Usage

### Node.js/NestJS
```bash
npm run seed         # Seed database
npm run seed:fresh   # Clear and reseed
```

### Python
```python
import json

with open('data/seed/users.json') as f:
    users = json.load(f)
```

### Any Language
Read JSON files and insert into your database. Remember to:
1. Hash passwords before insertion
2. Convert string IDs to your database's ID format
3. Insert in order: users → articles → comments
4. Handle follow and favorite relationships

## Notes

- All timestamps are ISO 8601 format
- Image URLs use DiceBear for avatar generation
- Article bodies are markdown formatted
- The `role` field is for documentation only (not in DB schema)
