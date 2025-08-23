# CRITICAL FILES TO UPDATE IN YOUR LOCAL PROJECT

## The main issues you're seeing are because these files are different:

### 1. client/src/pages/home.tsx
- Contains the updated search functionality
- Arabic search capability
- Proper filter reset on "Cards" button
- Real-time search with debounce

### 2. server/storage.ts  
- Updated PostgreSQL queries
- Better Arabic text search
- Fixed heresy filtering

### 3. shared/schema.ts
- Latest database structure
- Proper types for all fields

### 4. server/routes.ts
- Updated API endpoints
- Better error handling

## Quick Fix Steps:

1. **In your Replit**, download these files:
   - Right-click each file → Download
   - Or copy the entire content and paste into your local files

2. **Critical files to copy:**
   ```
   client/src/pages/home.tsx
   server/storage.ts
   server/routes.ts
   shared/schema.ts
   package.json
   ```

3. **After copying files:**
   ```bash
   npm install
   npm run db:push
   ```

4. **Import your data:**
   - Copy backups/ folder from Replit
   - Run database restore commands I provided earlier

## Alternative: Use Git/GitHub

1. In Replit: Create a GitHub repository
2. Push all current code
3. In local: Clone or pull the latest changes

This ensures you get the exact same codebase that's working in Replit.