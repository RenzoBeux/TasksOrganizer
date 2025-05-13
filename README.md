# Task Organizer Monorepo

## Shared API Contract (`api-contract`)

This monorepo contains a shared TypeScript API contract package, `api-contract`, which defines the types and endpoints for the backend API using [ts-rest](https://ts-rest.com/) and [zod](https://zod.dev/). This contract ensures type safety and consistency between backend and frontend.

- **Location:** `api-contract/`
- **Exports:**
  - Zod schemas and TypeScript types for DTOs
  - The `contract` object for use with ts-rest clients and servers

### How to Use the Contract

**In your backend or frontend:**
```ts
import { contract } from '@renzobeux/taskorganizer-api-contract';
```

You can use the contract with ts-rest clients or servers to ensure your API and client are always in sync.

### How to Build the Contract
```sh
yarn workspace @renzobeux/taskorganizer-api-contract run build
```

### How to Publish the Contract (GitHub Packages)
```sh
yarn workspace @renzobeux/taskorganizer-api-contract publish
```

### How to Install the Contract in Other Projects
Add this to your `.npmrc`:
```
@renzobeux:registry=https://npm.pkg.github.com/
```
Then:
```sh
yarn add @renzobeux/taskorganizer-api-contract
```

---

## ⚠️ Yarn Workspaces Now Used

This project now uses **Yarn** (not npm) for dependency management and workspaces. This change was made to support a shared `api-contract` package and resolve deep dependency issues that npm cannot handle in monorepos.

**Do not use `npm install` or `npm run ...` for dependency management or scripts. Use `yarn` instead.**

---

## Getting Started

1. **Install dependencies:**
   ```sh
   yarn install
   ```

2. **Build the shared contract package:**
   ```sh
   yarn workspace @renzobeux/taskorganizer-api-contract run build
   ```

3. **Develop as usual:**
   - Backend and frontend can import from `@renzobeux/taskorganizer-api-contract` directly.
   - All packages are managed via Yarn workspaces.

4. **Publish the contract package (optional):**
   ```sh
   yarn workspace @renzobeux/taskorganizer-api-contract publish
   ```

---

## Why Yarn?

- Yarn workspaces allow you to share code (like the API contract) between backend and frontend without npm publish or copy-paste.
- Yarn's `resolutions` and workspace features solve dependency conflicts that npm cannot handle in monorepos.
- You can still publish packages to npm or GitHub Packages, but use Yarn for all local development and dependency management.

---

## Migration Note

- If you previously used `npm install`, **delete `node_modules` and `package-lock.json`** before running `yarn install`.
- Always use `yarn` commands from now on for adding/removing dependencies and running scripts.

---

## Example: Importing the Contract

In your backend or frontend:
```ts
import { contract } from '@renzobeux/taskorganizer-api-contract';
```

---
