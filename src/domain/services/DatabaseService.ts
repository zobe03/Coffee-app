import * as SQLite from 'expo-sqlite';

class DatabaseService {
    private static instance: DatabaseService;
    private db: SQLite.SQLiteDatabase | null = null;

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
            this.db = await SQLite.openDatabaseAsync('coffee_app.db');
            await this.migrate();
        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    }

    private async migrate(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

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

    public getDatabase(): SQLite.SQLiteDatabase {
        if (!this.db) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return this.db;
    }
}

export const databaseService = DatabaseService.getInstance();
