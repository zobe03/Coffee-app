import { databaseService } from '../../domain/services/DatabaseService';
import { Coffee } from '../../domain/entities/Coffee';

export class CoffeeRepository {
    async getAll(): Promise<Coffee[]> {
        const db = databaseService.getDatabase();
        return await db.getAllAsync<Coffee>('SELECT * FROM coffees');
    }

    async getById(id: number): Promise<Coffee | null> {
        const db = databaseService.getDatabase();
        return await db.getFirstAsync<Coffee>('SELECT * FROM coffees WHERE id = ?', [id]);
    }

    async create(coffee: Coffee): Promise<number> {
        const db = databaseService.getDatabase();
        const result = await db.runAsync(
            'INSERT INTO coffees (name, roastery, origin, variety, process, roast_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [coffee.name, coffee.roastery, coffee.origin || null, coffee.variety || null, coffee.process || null, coffee.roastDate || null, coffee.notes || null]
        );
        return result.lastInsertRowId;
    }

    // Update and Delete methods omitted for brevity but follow same pattern
}
