import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Web Adapter Interface to match expo-sqlite's basic usage
interface DBInterface {
    getAllAsync<T>(sql: string, params?: any[] | undefined): Promise<T[]>;
    getFirstAsync<T>(sql: string, params?: any[] | undefined): Promise<T | null>;
    runAsync(sql: string, params?: any[] | undefined): Promise<{ lastInsertRowId: number }>;
    execAsync(sql: string): Promise<void>;
}

class WebDatabaseAdapter implements DBInterface {
    async getAllAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
        const table = this.getTableName(sql);
        if (!table) return [];
        const data = this.getData(table);
        // Very basic filtering if WHERE id = ?
        if (sql.toLowerCase().includes('where id =')) {
            const id = params[0];
            return data.filter((item: any) => item.id === id) as T[];
        }
        // Basic sorting for brew_logs (descending date/id) if needed, but repo handles sorting usually
        return data as T[];
    }

    async getFirstAsync<T>(sql: string, params: any[] = []): Promise<T | null> {
        const rows = await this.getAllAsync<T>(sql, params);
        return rows.length > 0 ? rows[0] : null;
    }

    async runAsync(sql: string, params: any[] = []): Promise<{ lastInsertRowId: number }> {
        const table = this.getTableName(sql);
        if (!table) return { lastInsertRowId: 0 };

        const operation = sql.split(' ')[0].toUpperCase();
        let data = this.getData(table);
        let lastId = 0;

        if (operation === 'INSERT') {
            // Simple mapping: we assume params match the order of columns in schema
            // BUT repositories use named columns.
            // We'll create a simple object. ID is auto-increment.
            lastId = this.getLastId(table) + 1;
            const newItem: any = { id: lastId };

            // Very naive parser for: INSERT INTO table (col1, col2) VALUES (?, ?)
            const columnsMatch = sql.match(/\(([\s\S]*?)\)/);
            if (columnsMatch) {
                const columns = columnsMatch[1].split(',').map(c => c.trim());
                columns.forEach((col, index) => {
                    newItem[col] = params[index];
                });
            }
            data.push(newItem);
            this.saveData(table, data);
            this.saveLastId(table, lastId);
        } else if (operation === 'DELETE') {
            if (sql.toLowerCase().includes('where id =')) {
                const id = params[0];
                data = data.filter((item: any) => item.id !== id);
                this.saveData(table, data);
            } else {
                // DELETE FROM table (no WHERE) — wipe all rows
                this.saveData(table, []);
                this.saveLastId(table, 0);
            }
        } else if (operation === 'UPDATE') {
            // Not implemented yet
        }

        return { lastInsertRowId: lastId };
    }

    async execAsync(sql: string): Promise<void> {
        // No-op for web (create tables logic handled dynamically or ignored)
        // We can just init empty arrays in storage if missing
        if (!localStorage.getItem('coffees')) localStorage.setItem('coffees', '[]');
        if (!localStorage.getItem('grinders')) localStorage.setItem('grinders', '[]');
        if (!localStorage.getItem('brew_logs')) localStorage.setItem('brew_logs', '[]');
    }

    private getTableName(sql: string): string | null {
        // extracts table name roughly
        const match = sql.match(/(FROM|INTO|UPDATE)\s+(\w+)/i);
        return match ? match[2] : null;
    }

    private getData(table: string): any[] {
        const json = localStorage.getItem(table);
        return json ? JSON.parse(json) : [];
    }

    private saveData(table: string, data: any[]) {
        localStorage.setItem(table, JSON.stringify(data));
    }

    private getLastId(table: string): number {
        const id = localStorage.getItem(`${table}_last_id`);
        return id ? parseInt(id) : 0;
    }

    private saveLastId(table: string, id: number) {
        localStorage.setItem(`${table}_last_id`, id.toString());
    }
}

class DatabaseService {
    private static instance: DatabaseService;
    private db: DBInterface | null = null;

    private constructor() { }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    public async initialize(): Promise<void> {
        if (this.db) return;

        try {
            if (Platform.OS === 'web') {
                this.db = new WebDatabaseAdapter();
                await this.db.execAsync(''); // ensure tables init
            } else {
                this.db = await SQLite.openDatabaseAsync('coffee_app.db') as any;
                await this.migrate();
            }
        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    }

    private async migrate(): Promise<void> {
        if (!this.db || Platform.OS === 'web') return;

        await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS grinders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        brand TEXT,
        model TEXT,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS coffees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        roastery TEXT NOT NULL,
        origin TEXT,
        variety TEXT,
        process TEXT,
        roast_date TEXT,
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS brew_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        coffee_id INTEGER,
        grinder_id INTEGER,
        date TEXT NOT NULL,
        dose_in REAL NOT NULL,
        dose_out REAL NOT NULL,
        time_seconds REAL NOT NULL,
        temperature REAL,
        grind_setting TEXT,
        rating_body INTEGER,
        rating_acidity INTEGER,
        rating_bitterness INTEGER,
        taste_notes TEXT,
        FOREIGN KEY (coffee_id) REFERENCES coffees(id),
        FOREIGN KEY (grinder_id) REFERENCES grinders(id)
      );
    `);
    }

    public getDatabase(): DBInterface {
        if (!this.db) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return this.db;
    }

    public async nukeAllData(): Promise<void> {
        const db = this.getDatabase();
        await db.runAsync('DELETE FROM brew_logs');
        await db.runAsync('DELETE FROM coffees');
        await db.runAsync('DELETE FROM grinders');
    }
}

export const databaseService = DatabaseService.getInstance();
