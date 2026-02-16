import { databaseService } from '../../domain/services/DatabaseService';
import { BrewLog, Score } from '../../domain/entities/BrewLog';

interface BrewLogRow {
    id: number;
    coffee_id: number;
    grinder_id: number;
    date: string;
    dose_in: number;
    dose_out: number;
    time_seconds: number;
    temperature: number | null;
    grind_setting: string | null;
    rating_body: number;
    rating_acidity: number;
    rating_bitterness: number;
    taste_notes: string | null;
}

export class BrewRepository {
    async getAll(): Promise<BrewLog[]> {
        const db = databaseService.getDatabase();
        const rows = await db.getAllAsync<BrewLogRow>('SELECT * FROM brew_logs');
        return rows.map(this.mapRowToBrewLog);
    }

    async create(brew: BrewLog): Promise<number> {
        const db = databaseService.getDatabase();
        const result = await db.runAsync(
            `INSERT INTO brew_logs (
        coffee_id, grinder_id, date, dose_in, dose_out, time_seconds,
        temperature, grind_setting, rating_body, rating_acidity, rating_bitterness, taste_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                brew.coffeeId, brew.grinderId, brew.date, brew.doseIn, brew.doseOut, brew.timeSeconds,
                brew.temperature || null, brew.grindSetting || null,
                brew.score.body, brew.score.acidity, brew.score.bitterness, JSON.stringify(brew.score.tasteNotes)
            ]
        );
        return result.lastInsertRowId;
    }

    async delete(id: number): Promise<void> {
        const db = databaseService.getDatabase();
        await db.runAsync('DELETE FROM brew_logs WHERE id = ?', [id]);
    }

    private mapRowToBrewLog(row: BrewLogRow): BrewLog {
        return {
            id: row.id,
            coffeeId: row.coffee_id,
            grinderId: row.grinder_id,
            date: row.date,
            doseIn: row.dose_in,
            doseOut: row.dose_out,
            timeSeconds: row.time_seconds,
            temperature: row.temperature ?? undefined,
            grindSetting: row.grind_setting ?? undefined,
            score: {
                body: row.rating_body,
                acidity: row.rating_acidity,
                bitterness: row.rating_bitterness,
                tasteNotes: JSON.parse(row.taste_notes || '[]'),
            }
        };
    }
}
