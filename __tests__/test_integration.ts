/**
 * ============================================================
 *  test_integration.ts — Integrationstests (2 Tests)
 * ============================================================
 *
 * Testet das Zusammenspiel zwischen Repository-Schicht und
 * DatabaseService. Die echte Datenbank wird durch eine
 * InMemoryDatabase ersetzt, die dasselbe DBInterface
 * implementiert.
 *
 * Fokus: Interaktionsketten über Schichtgrenzen hinweg.
 *
 * Prinzipien:
 *   - AAA-Muster (Arrange – Act – Assert)
 *   - Realistisch aber kontrollierbar
 *   - Deterministisch (kein Netzwerk, kein Dateisystem)
 *
 * Framework: Jest + ts-jest
 */

import { InMemoryDatabase } from './helpers/InMemoryDatabase';

// ── Mock: DatabaseService so umprogrammieren, dass er die
//    InMemoryDatabase statt expo-sqlite / localStorage nutzt ──

const testDb = new InMemoryDatabase();

jest.mock('../src/domain/services/DatabaseService', () => ({
    databaseService: {
        getDatabase: () => testDb,
        initialize: jest.fn().mockResolvedValue(undefined),
    },
}));

import { CoffeeRepository } from '../src/data/repositories/CoffeeRepository';
import { GrinderRepository } from '../src/data/repositories/GrinderRepository';
import { Coffee } from '../src/domain/entities/Coffee';
import { Grinder } from '../src/domain/entities/Grinder';

describe('Integrationstests — Repository + DatabaseService', () => {

    // Vor jedem Test die In-Memory-Datenbank zurücksetzen
    beforeEach(() => {
        testDb.reset();
    });

    // ─────────────────────────────────────────────────────────
    // Test 1: Coffee erstellen und wieder abrufen
    //
    // Komponenten: CoffeeRepository → DatabaseService (InMemoryDB)
    // ─────────────────────────────────────────────────────────
    test('CoffeeRepository: create() speichert einen Kaffee, getAll() gibt ihn zurück', async () => {
        // Arrange
        const repo = new CoffeeRepository();
        const coffee: Coffee = {
            name: 'Ethiopia Yirgacheffe',
            roastery: 'The Barn',
            origin: 'Ethiopia',
            variety: 'Heirloom',
            process: 'Washed',
        };

        // Act
        const insertedId = await repo.create(coffee);
        const allCoffees = await repo.getAll();

        // Assert
        expect(insertedId).toBe(1);
        expect(allCoffees).toHaveLength(1);
        expect(allCoffees[0].id).toBe(1);
        expect(allCoffees[0].name).toBe('Ethiopia Yirgacheffe');
        expect(allCoffees[0].roastery).toBe('The Barn');
        expect(allCoffees[0].origin).toBe('Ethiopia');
    });

    // ─────────────────────────────────────────────────────────
    // Test 2: Grinder erstellen, löschen, Konsistenz prüfen
    //
    // Komponenten: GrinderRepository → DatabaseService (InMemoryDB)
    // ─────────────────────────────────────────────────────────
    test('GrinderRepository: nach create() + delete() ist die Liste leer', async () => {
        // Arrange
        const repo = new GrinderRepository();
        const grinder: Grinder = {
            name: 'Comandante C40',
            brand: 'Comandante',
            model: 'C40 MK4',
            description: 'Premium hand grinder',
        };

        // Act
        const insertedId = await repo.create(grinder);
        const afterCreate = await repo.getAll();

        await repo.delete(insertedId);
        const afterDelete = await repo.getAll();

        // Assert
        expect(afterCreate).toHaveLength(1);
        expect(afterCreate[0].name).toBe('Comandante C40');

        expect(afterDelete).toHaveLength(0);
    });

});
