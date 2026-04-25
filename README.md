# @supercat1337/mysql-schema-parser

A library for parsing and working with MySQL database schema metadata.

## Installation

```bash
npm install @supercat1337/mysql-schema-parser
```

## Usage

```javascript
import fs from 'node:fs';
import path from 'node:path';
import * as url from 'url';
import { parseMySQLSchema } from '@supercat1337/mysql-schema-parser';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// Parse schema from JSON file
const db = parseMySQLSchema(
    JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf-8'))
);

console.log(db);
```

## API Reference

### Main Functions

#### `parseMySQLSchema(schema: ColumnMetadataRaw[]): MySQLDatabase`

Parses MySQL schema metadata into a structured `MySQLDatabase` object.

#### `enrichWithStatistics(db: MySQLDatabase, indexes: IndexStatisticsRaw[]): void`

Adds index statistics (from `INFORMATION_SCHEMA.STATISTICS`) to an existing `MySQLDatabase` object.  
Enables advanced index analysis and improved `CREATE TABLE` generation (composite keys, FULLTEXT, SPATIAL, etc.).

### Classes

#### `MySQLDatabase`

- ... (existing methods)
- `loadIndexStatistics(indexesStats: IndexStatisticsRaw[]): void` – internal, used by `enrichWithStatistics`.

#### `MySQLTable`

- ... (existing methods)
- `addIndexStatistics(idxRaw: IndexStatisticsRaw): void` – adds index info.
- `getIndexes(): Map<string, IndexStatistics[]>` – returns all indexes.
- `getIndex(indexName: string): IndexStatistics[] | null` – returns index columns.
- `getIndexCardinality(indexName: string): number | null` – returns cardinality.
- `getPrimaryKey(): string[] | null` – returns an array of primary key column names (ordered) or null if none.

#### `MySQLTableColumn`

- ... (unchanged)

### Types

- `IndexStatisticsRaw` – raw index metadata from `INFORMATION_SCHEMA.STATISTICS`.
- `IndexStatistics` – normalized camelCase version.

## Example with Statistics

```javascript
import { parseMySQLSchema, enrichWithStatistics } from '@supercat1337/mysql-schema-parser';

const columns = await db.query(
    `SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'mydb'`
);
const dbSchema = parseMySQLSchema(columns);

const indexes = await db.query(
    `SELECT * FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = 'mydb'`
);
enrichWithStatistics(dbSchema, indexes);

const usersTable = dbSchema.tables.get('users');
console.log(usersTable.getPrimaryKey()); // '["id"]'
console.log(usersTable.getIndexCardinality('idx_email')); // e.g. 15234

// Generate CREATE TABLE with composite indexes and special types
console.log(usersTable.generateCreateTableQuery());
```

## Features

- Parse raw MySQL schema metadata into structured objects
- Generate CREATE TABLE statements from metadata
- Type-safe access to database schema information
- Comprehensive column metadata representation
- Helper methods for common column checks (PK, nullable, etc.)

## License

MIT
