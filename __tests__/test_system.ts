/**
 * ============================================================
 *  test_system.ts — Systemtest (1 Test)
 * ============================================================
 *
 * Testet den vollständigen technischen Ablauf über alle Schichten
 * hinweg: Domain (BrewBuilder) → Data (BrewRepository) → Database.
 *
 * Im Gegensatz zu Integrationstests wird hier der komplette
 * vertikale Durchstich geprüft — vom Erzeugen eines BrewLog-
 * Objekts über die Persistierung bis zum Abruf und Vergleich
 * aller Felder.
 *
 * Kein Mocking einzelner Schichten — nur die Infrastrukturebene
 * (expo-sqlite) wird durch InMemoryDatabase ersetzt.
 *
 * Prinzipien:
 *   - Use-Case-basiert (nicht methodenbasiert)
 *   - Deterministisch
 *   - Realistischer Durchstich
 *
 * Framework: Jest + ts-jest
 */

import { InMemoryDatabase } from './helpers/InMemoryDatabase';

// ── Infrastruktur-Ersatz: InMemoryDatabase statt expo-sqlite ──

const testDb = new InMemoryDatabase();

jest.mock('../src/domain/services/DatabaseService', () => ({
    databaseService: {
        getDatabase: () => testDb,
        initialize: jest.fn().mockResolvedValue(undefined),
    },
}));

import { BrewBuilder } from '../src/domain/builders/BrewBuilder';
import { CoffeeRepository } from '../src/data/repositories/CoffeeRepository';
import { GrinderRepository } from '../src/data/repositories/GrinderRepository';
import { BrewRepository } from '../src/data/repositories/BrewRepository';

describe('Systemtest — Vollständiger Brew-Logging-Workflow', () => {

    beforeEach(() => {
        testDb.reset();
    });

    // ─────────────────────────────────────────────────────────
    // Systemtest: Kompletter Workflow über alle Schichten
    //
    // Use Case: Benutzer legt Kaffee + Mühle an, erstellt
    //           einen Brew via Builder, speichert ihn, und
    //           ruft ihn anschließend erfolgreich ab.
    //
    // Schichten: BrewBuilder (Domain)
    //          → BrewRepository.create() (Data)
    //          → InMemoryDatabase (Infrastruktur)
    //          → BrewRepository.getAll() (Data)
    //          → Vergleich mit Originaldaten (Assertion)
    // ─────────────────────────────────────────────────────────
    test('Brew erstellen, persistieren und abrufen — alle Felder konsistent', async () => {
        // Arrange — Stammdaten anlegen
        const coffeeRepo = new CoffeeRepository();
        const grinderRepo = new GrinderRepository();
        const brewRepo = new BrewRepository();

        const coffeeId = await coffeeRepo.create({
            name: 'Colombia Huila',
            roastery: 'Five Elephant',
            origin: 'Colombia',
            variety: 'Caturra',
            process: 'Washed',
        });

        const grinderId = await grinderRepo.create({
            name: 'Comandante C40',
            brand: 'Comandante',
            model: 'C40 MK4',
        });

        // Act — Brew über BrewBuilder erzeugen und persistieren
        const brew = new BrewBuilder()
            .setEquipment(coffeeId, grinderId)
            .setRecipe(18, 36, 28, 93)
            .setGrindSetting('22 Clicks')
            .setScore({
                body: 1,
                acidity: 7,
                bitterness: 3,
                tasteNotes: ['Jasmine', 'Peach'],
            })
            .build();

        const brewId = await brewRepo.create(brew);
        const allBrews = await brewRepo.getAll();

        // Assert — Verifizierung des gesamten Datendurchstichs
        expect(allBrews).toHaveLength(1);

        const savedBrew = allBrews[0];
        expect(savedBrew.id).toBe(brewId);
        expect(savedBrew.coffeeId).toBe(coffeeId);
        expect(savedBrew.grinderId).toBe(grinderId);
        expect(savedBrew.doseIn).toBe(18);
        expect(savedBrew.doseOut).toBe(36);
        expect(savedBrew.timeSeconds).toBe(28);
        expect(savedBrew.temperature).toBe(93);
        expect(savedBrew.grindSetting).toBe('22 Clicks');
        expect(savedBrew.score.body).toBe(1);
        expect(savedBrew.score.acidity).toBe(7);
        expect(savedBrew.score.bitterness).toBe(3);
        expect(savedBrew.score.tasteNotes).toEqual(['Jasmine', 'Peach']);
    });

});
