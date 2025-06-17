# @supercat1337/mysql-schema-parser

A library for parsing and working with MySQL database schema metadata.

## Installation

```bash
npm install @supercat1337/mysql-schema-parser
```

## Usage

```javascript
import fs from "node:fs";
import * as url from "url";
import { parseMySQLSchema } from "@supercat1337/mysql-schema-parser";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

// Parse schema from JSON file
const db = parseMySQLSchema(
    JSON.parse(fs.readFileSync(__dirname + "data.json", "utf-8"))
);

console.log(db);
```

## API Reference

### Main Functions

#### `parseMySQLSchema(schema: ColumnMetadataRaw[]): MySQLDatabase`

Parses MySQL schema metadata into a structured `MySQLDatabase` object.

### Classes

#### `MySQLDatabase`

Represents a MySQL database with its tables.

-   **Properties**:

    -   `databaseName: string` - Name of the database
    -   `tables: Map<string, MySQLTable>` - Map of tables in the database

-   **Methods**:
    -   `addTable(table: MySQLTable): void` - Adds a table to the database

#### `MySQLTable`

Represents a MySQL table with its columns.

-   **Properties**:

    -   `tableName: string` - Name of the table
    -   `columns: Map<string, MySQLTableColumn>` - Map of columns in the table

-   **Methods**:
    -   `addColumn(column: MySQLTableColumn): void` - Adds a column to the table
    -   `getColumns(): MySQLTableColumn[]` - Returns all columns in the table
    -   `getColumn(columnName: string): MySQLTableColumn | null` - Gets a column by name
    -   `generateCreateTableQuery(options): string` - Generates CREATE TABLE SQL statement

#### `MySQLTableColumn`

Represents a column in a MySQL table.

-   **Properties**: All properties from `ColumnMetadataParams` type
-   **Methods**:
    -   `importFromRawData(rawMetadata: ColumnMetadataRaw): void` - Imports raw metadata
    -   `isPrimaryKey(): boolean` - Checks if column is a primary key
    -   `allowsNull(): boolean` - Checks if column allows NULL values
    -   `isAutoIncrement(): boolean` - Checks if column auto-increments
    -   `getColumnDefinition(): string` - Gets full column definition
    -   `toJSON(): ColumnMetadataParams` - Returns JSON representation

### Types

#### `ColumnMetadataRaw`

Raw MySQL column metadata in snake_case format (direct from INFORMATION_SCHEMA).

#### `ColumnMetadataParams`

Normalized column metadata in camelCase format.

## Features

-   Parse raw MySQL schema metadata into structured objects
-   Generate CREATE TABLE statements from metadata
-   Type-safe access to database schema information
-   Comprehensive column metadata representation
-   Helper methods for common column checks (PK, nullable, etc.)

## License

MIT
