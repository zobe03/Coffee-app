/**
 * ============================================================
 *  test_unit.ts — Unit Tests (4 Tests)
 * ============================================================
 *
 * Testet die reine Geschäftslogik des BrewBuilders isoliert,
 * ohne externe Abhängigkeiten (Datenbank, Netzwerk, Dateisystem).
 *
 * Prinzipien:
 *   - AAA-Muster (Arrange – Act – Assert)
 *   - FIRST (Fast, Independent, Repeatable, Self-Validating, Timely)
 *   - Keine Mocks nötig — BrewBuilder ist eine reine Klasse
 *
 * Framework: Jest + ts-jest
 */

import { BrewBuilder } from '../src/domain/builders/BrewBuilder';
import { BrewLog } from '../src/domain/entities/BrewLog';

describe('Unit Tests — BrewBuilder', () => {

    // ─────────────────────────────────────────────────────────
    // Test 1: Erfolgreicher Build mit allen Pflichtfeldern
    // ─────────────────────────────────────────────────────────
    test('build() erzeugt ein valides BrewLog mit korrekten Feldern und ISO-Datum', () => {
        // Arrange
        const builder = new BrewBuilder();

        // Act
        const brew: BrewLog = builder
            .setEquipment(1, 2)
            .setRecipe(18, 36, 30, 93)
            .setGrindSetting('22 Clicks')
            .setScore({ body: 2, acidity: 7, bitterness: 3, tasteNotes: ['Jasmine'] })
            .build();

        // Assert
        expect(brew.coffeeId).toBe(1);
        expect(brew.grinderId).toBe(2);
        expect(brew.doseIn).toBe(18);
        expect(brew.doseOut).toBe(36);
        expect(brew.timeSeconds).toBe(30);
        expect(brew.temperature).toBe(93);
        expect(brew.grindSetting).toBe('22 Clicks');
        expect(brew.score.body).toBe(2);
        expect(brew.score.acidity).toBe(7);
        expect(brew.score.bitterness).toBe(3);
        expect(brew.score.tasteNotes).toEqual(['Jasmine']);
        // Datum muss ein gültiger ISO-8601-String sein
        expect(new Date(brew.date).toISOString()).toBe(brew.date);
    });

    // ─────────────────────────────────────────────────────────
    // Test 2: Fehlende Pflichtfelder werfen einen Fehler
    // ─────────────────────────────────────────────────────────
    test('build() wirft einen Fehler wenn Pflichtfelder fehlen', () => {
        // Arrange — Builder ohne setEquipment() und setRecipe()
        const builder = new BrewBuilder();

        // Act & Assert
        expect(() => builder.build()).toThrow('Missing required brew fields');
    });

    // ─────────────────────────────────────────────────────────
    // Test 3: Partieller Score wird mit Defaults gemerged
    // ─────────────────────────────────────────────────────────
    test('setScore() mergt partielle Werte mit den Default-Scores', () => {
        // Arrange
        const builder = new BrewBuilder();

        // Act — nur acidity überschreiben, rest bleibt Default
        const brew = builder
            .setEquipment(1, 1)
            .setRecipe(18, 36, 28)
            .setScore({ acidity: 9 })
            .build();

        // Assert — Default-Werte (body=1, bitterness=5) bleiben erhalten
        expect(brew.score.acidity).toBe(9);      // überschrieben
        expect(brew.score.body).toBe(1);          // Default beibehalten
        expect(brew.score.bitterness).toBe(5);    // Default beibehalten
        expect(brew.score.tasteNotes).toEqual([]); // Default beibehalten
    });

    // ─────────────────────────────────────────────────────────
    // Test 4: Fluent API — jede Setter-Methode gibt dieselbe
    //         Builder-Instanz zurück (Method Chaining)
    // ─────────────────────────────────────────────────────────
    test('Setter-Methoden geben dieselbe Builder-Instanz zurück (Fluent API)', () => {
        // Arrange
        const builder = new BrewBuilder();

        // Act
        const afterEquipment = builder.setEquipment(1, 1);
        const afterRecipe = afterEquipment.setRecipe(18, 36, 30);
        const afterGrind = afterRecipe.setGrindSetting('20 Clicks');
        const afterScore = afterGrind.setScore({ body: 0 });

        // Assert — alle Rückgabewerte zeigen auf dieselbe Instanz
        expect(afterEquipment).toBe(builder);
        expect(afterRecipe).toBe(builder);
        expect(afterGrind).toBe(builder);
        expect(afterScore).toBe(builder);
    });

});
