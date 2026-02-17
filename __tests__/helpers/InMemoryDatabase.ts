/**
 * InMemoryDatabase — implementiert das DBInterface für Tests.
 *
 * Diese Klasse simuliert eine Datenbank im Arbeitsspeicher und wird
 * in Integration- und Systemtests anstelle von expo-sqlite oder
 * localStorage verwendet, um deterministische und isolierte Tests
 * zu ermöglichen.
 */

interface DBInterface {
    getAllAsync<T>(sql: string, params?: any[]): Promise<T[]>;
    getFirstAsync<T>(sql: string, params?: any[]): Promise<T | null>;
    runAsync(sql: string, params?: any[]): Promise<{ lastInsertRowId: number }>;
    execAsync(sql: string): Promise<void>;
}

export class InMemoryDatabase implements DBInterface {
    private tables: Map<string, any[]> = new Map();
    private autoIncrements: Map<string, number> = new Map();

    async getAllAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
        const table = this.getTableName(sql);
        if (!table) return [];
        const data = this.tables.get(table) || [];

        if (sql.toLowerCase().includes('where id =') && params.length > 0) {
            return data.filter((item: any) => item.id === params[0]) as T[];
        }

        return [...data] as T[];
    }

    async getFirstAsync<T>(sql: string, params: any[] = []): Promise<T | null> {
        const rows = await this.getAllAsync<T>(sql, params);
        return rows.length > 0 ? rows[0] : null;
    }

    async runAsync(sql: string, params: any[] = []): Promise<{ lastInsertRowId: number }> {
        const table = this.getTableName(sql);
        if (!table) return { lastInsertRowId: 0 };

        const operation = sql.split(' ')[0].toUpperCase();

        if (operation === 'INSERT') {
            const currentId = (this.autoIncrements.get(table) || 0) + 1;
            this.autoIncrements.set(table, currentId);

            const newItem: any = { id: currentId };
            const columnsMatch = sql.match(/\(([\s\S]*?)\)/);
            if (columnsMatch) {
                const columns = columnsMatch[1].split(',').map(c => c.trim());
                columns.forEach((col, index) => {
                    newItem[col] = params[index];
                });
            }

            const data = this.tables.get(table) || [];
            data.push(newItem);
            this.tables.set(table, data);
            return { lastInsertRowId: currentId };
        }

        if (operation === 'DELETE') {
            if (sql.toLowerCase().includes('where id =') && params.length > 0) {
                const data = (this.tables.get(table) || []).filter(
                    (item: any) => item.id !== params[0]
                );
                this.tables.set(table, data);
            } else {
                this.tables.set(table, []);
                this.autoIncrements.set(table, 0);
            }
        }

        return { lastInsertRowId: 0 };
    }

    async execAsync(_sql: string): Promise<void> {
        // No-op — Tabellen werden dynamisch erzeugt
    }

    private getTableName(sql: string): string | null {
        const match = sql.match(/(FROM|INTO|UPDATE)\s+(\w+)/i);
        return match ? match[2] : null;
    }

    /** Hilfsmethode: gibt alle Einträge einer Tabelle zurück (für Assertions) */
    getTableData(table: string): any[] {
        return [...(this.tables.get(table) || [])];
    }

    /** Hilfsmethode: setzt die gesamte Datenbank zurück */
    reset(): void {
        this.tables.clear();
        this.autoIncrements.clear();
    }
}
