import sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'

let openConnection: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export interface Row {
    id: number;
    exclude: boolean;
    success: boolean;
}

export async function connect() {
    if (openConnection) return openConnection;

    openConnection = await open({
        filename: 'tmp/database.sqlite',
        driver: sqlite3.cached.Database
    });

    await openConnection.run('CREATE TABLE IF NOT EXISTS media (id INTEGER PRIMARY KEY, exclude BOOLEAN, success BOOLEAN)');

    return openConnection;
}