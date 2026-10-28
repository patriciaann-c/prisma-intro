# ⚡ Prisma ORM Setup & Introduction

A practical introduction and starter setup for **Prisma ORM 7** using **Node.js (ES Modules)**, **MySQL / MariaDB**, and the official **MariaDB Driver Adapter** (`@prisma/adapter-mariadb`).

This project demonstrates how to structure and configure a modern Prisma 7 application, manage schema migrations with a shadow database, instantiate Prisma Client with connection pooling, and inspect data using Prisma Studio.

---

## 📋 Table of Contents

- [Features & Concepts](#-features--concepts)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [1. Clone and Install Dependencies](#1-clone-and-install-dependencies)
  - [2. Configure Database & Shadow Database](#2-configure-database--shadow-database)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
  - [4. Apply Migrations](#4-apply-migrations)
  - [5. Generate Prisma Client](#5-generate-prisma-client)
- [Prisma 7 Architecture Highlights](#-prisma-7-architecture-highlights)
  - [Prisma Config (`prisma.config.ts`)](#prisma-config-prismaconfigts)
  - [Driver Adapter Pattern (`prisma.js`)](#driver-adapter-pattern-prismajs)
  - [Schema Definition (`prisma/schema.prisma`)](#schema-definition-prismaschemaprisma)
- [Available Scripts](#-available-scripts)
- [Example Usage](#-example-usage)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🚀 Features & Concepts

- **Prisma ORM v7**: Implements the modern configuration separation where CLI settings, migration paths, and connection URLs live in `prisma.config.ts` rather than `schema.prisma`.
- **Driver Adapter Pattern**: Uses `@prisma/adapter-mariadb` to manage direct connections and pooling to MySQL / MariaDB databases at runtime.
- **Shadow Database Workflow**: Configured for accurate development migrations (`prisma migrate dev`) on MySQL/MariaDB.
- **Schema & Migrations**: Defined data model (`Product`) with schema tracking, auto-incrementing IDs, precise monetary decimals (`@db.Decimal(10, 2)`), timestamps, and boolean flags.
- **Prisma Studio**: Integrated GUI to view, edit, and manage records directly in the browser.

---

## 🛠 Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules, `"type": "module"`)
- **Package Manager**: [pnpm](https://pnpm.io/) (`v11.x`+)
- **ORM**: [Prisma ORM](https://www.prisma.io/) `v7.10.0`
- **Driver Adapter**: `@prisma/adapter-mariadb`
- **Database**: MySQL 8+ / MariaDB 10+
- **HTTP Server Ready**: [Express](https://expressjs.com/) `v5.x`
- **Environment**: `dotenv`

---

## 📁 Project Structure

```text
prisma-intro/
├── prisma/
│   ├── migrations/              # SQL migration history files
│   │   ├── 20261028164516_init/
│   │   └── 20261028170304_add_in_stock/
│   └── schema.prisma            # Data models and client generator definition
├── .env.example                 # Environment variables template
├── .gitignore                   # Ignored files (node_modules, .env)
├── package.json                 # Project scripts and dependencies
├── pnpm-lock.yaml               # Pnpm lockfile
├── prisma.config.ts             # Prisma 7 CLI, datasource & shadow DB config
├── prisma.js                    # Runtime PrismaClient instance with MariaDB adapter
└── README.md                    # Project documentation
```

---

## ⚙️ Prerequisites

Before you begin, ensure you have installed:

1. **Node.js** (v20+ recommended)
2. **pnpm** (Install via Corepack: `corepack enable` or `npm install -g pnpm`)
3. **MySQL Server** or **MariaDB Server** (e.g., local install, XAMPP, or Docker)

---

## 🏁 Getting Started

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd prisma-intro
pnpm install
```

### 2. Configure Database & Shadow Database

Prisma requires two databases in development when using `prisma migrate dev` with MySQL:
1. **Primary Database**: `express_store` (your application database)
2. **Shadow Database**: `express_store_shadow` (used temporarily by Prisma CLI to detect schema drift and validate migrations)

Connect to your MySQL / MariaDB server (via CLI, phpMyAdmin, MySQL Workbench, or DBeaver) and run:

```sql
-- Create application database
CREATE DATABASE IF NOT EXISTS express_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create shadow database for Prisma CLI
CREATE DATABASE IF NOT EXISTS express_store_shadow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Optional: Create a dedicated user with permissions on both databases
CREATE USER IF NOT EXISTS 'prisma_user'@'localhost' IDENTIFIED BY 'prisma_password';
GRANT ALL PRIVILEGES ON express_store.* TO 'prisma_user'@'localhost';
GRANT ALL PRIVILEGES ON express_store_shadow.* TO 'prisma_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configure Environment Variables

Duplicate `.env.example` into `.env`:

```bash
cp .env.example .env
```

Open `.env` and verify the credentials match your MySQL server:

```dotenv
# Prisma CLI connection string
DATABASE_URL="mysql://prisma_user:prisma_password@localhost:3306/express_store"

# Shadow database connection string for migrations
SHADOW_DATABASE_URL="mysql://prisma_user:prisma_password@localhost:3306/express_store_shadow"

# Runtime adapter parameters (used in prisma.js)
DATABASE_HOST="localhost"
DATABASE_PORT="3306"
DATABASE_USER="prisma_user"
DATABASE_PASSWORD="prisma_password"
DATABASE_NAME="express_store"
```

### 4. Apply Migrations

Run existing migrations to create the database tables:

```bash
pnpm run migrate
```

This command executes `prisma migrate dev`, which:
- Runs pending migrations against your main database
- Updates the shadow database to verify schema consistency
- Automatically triggers `prisma generate`

### 5. Generate Prisma Client

If you modify `prisma/schema.prisma` in the future without creating a migration yet:

```bash
pnpm run generate
```

---

## 🔍 Prisma 7 Architecture Highlights

### Prisma Config (`prisma.config.ts`)

In Prisma 7, connection URLs and CLI behaviors are configured in TypeScript using `defineConfig` from `prisma/config`:

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    url: env("DATABASE_URL"),
    shadowDatabaseUrl: env("SHADOW_DATABASE_URL")
  }
});
```

### Driver Adapter Pattern (`prisma.js`)

Prisma 7 uses dedicated driver adapters for high performance and standard pooling. In `prisma.js`, `@prisma/adapter-mariadb` handles database connections:

```javascript
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5
});

export const client = new PrismaClient({ adapter });
```

### Schema Definition (`prisma/schema.prisma`)

Data models are declared inside `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
}

model Product {
  id          Int      @id @default(autoincrement())
  name        String
  price       Decimal  @db.Decimal(10, 2)
  description String?
  createdAt   DateTime @default(now())
  inStock     Boolean  @default(true)
}
```

- **`@id @default(autoincrement())`**: Primary key with auto-increment.
- **`Decimal @db.Decimal(10, 2)`**: Precise financial numeric representation.
- **`String?`**: Optional (nullable) column.
- **`@default(now())`**: Automatic timestamp on creation.

---

## 📜 Available Scripts

The project includes convenient shortcut scripts defined in `package.json`:

| Command | Script | Description |
|---|---|---|
| `pnpm run migrate` | `prisma migrate dev` | Applies migrations in development and checks the shadow database. |
| `pnpm run generate` | `prisma generate` | Generates or updates the `@prisma/client` code. |
| `pnpm run studio` | `prisma studio` | Opens an interactive web interface at `http://localhost:5555` to view and edit database records. |
| `pnpm run validate` | `prisma validate` | Validates your `schema.prisma` file for syntax errors. |

---

## 💡 Example Usage

Import the initialized `client` from `prisma.js` into your application or scripts:

```javascript
// example.js
import { client } from "./prisma.js";

async function main() {
  // 1. Create a product
  const newProduct = await client.product.create({
    data: {
      name: "Mechanical Keyboard",
      price: 89.99,
      description: "RGB Backlit, tactile blue switches",
      inStock: true
    }
  });
  console.log("Created:", newProduct);

  // 2. Fetch all products
  const products = await client.product.findMany({
    where: { inStock: true },
    orderBy: { createdAt: "desc" }
  });
  console.log("In-stock products:", products);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await client.$disconnect();
  });
```

---

## ❓ Troubleshooting & FAQs

### Why do I need a `SHADOW_DATABASE_URL`?
When running `prisma migrate dev`, Prisma needs to detect schema drift and verify that all migration steps run cleanly from scratch. For MySQL/MariaDB, Prisma relies on a pre-created empty database (the shadow database) because it does not create databases automatically on MySQL engines.

### "Access denied for user ..."
Ensure that your database user (`prisma_user` or `root`) has permissions on **both** the primary database (`express_store`) and the shadow database (`express_store_shadow`).

### Changes in `schema.prisma` are not reflected in code
Remember to run:
```bash
pnpm run migrate
# or
pnpm run generate
```
to regenerate the TypeScript/JavaScript types and query engine inside `@prisma/client`.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
