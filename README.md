# Launch nextjs dev server
 
```bash
bun install
bun dev
```

# Launch db studio

```bash
bun db:studio
```

# Modify database schema

- If you modify the tables in [lib/drizzle/schema.ts](lib/drizzle/schema.ts),
  run these commands to get the latest schema, generate the new schema and update the database.

```bash
git pull origin dev
bun db:gen
bun db:mig
```

#### import grouping comments

- `external` is for external dependencies like next-intl, cn, zod, etc
- `ui` is for ui components made by others online
- `pui` is for custom made ui components by ourself
- `db` is for code from drizzle folder
- `services` is for code found in services folder
  <br><br>

![Simplified Diagram for GitHub Collaboration](https://raw.githubusercontent.com/haocloo/github-collaboration-guide/main/simplified%20diagram.png)
