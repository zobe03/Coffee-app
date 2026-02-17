/**
 * ============================================================
 *  test_e2e.spec.ts — End-to-End-Test (1 Test)
 * ============================================================
 *
 * Testet einen realen Benutzerfluss über die Web-Version der App
 * mit Playwright als Browser-Automation-Framework.
 *
 * Voraussetzung: Die App muss lokal laufen (`npx expo start --web`).
 *
 * Der Test simuliert einen echten Benutzer, der:
 *   1. Die App im Browser öffnet
 *   2. Verifiziert, dass das Dashboard korrekt gerendert wird
 *   3. Zur Log-Seite navigiert und prüft, dass die Eingabefelder
 *      vorhanden sind
 *
 * Framework: Playwright Test
 */

import { test, expect } from '@playwright/test';

test.describe('E2E-Test — BrewRef Web App', () => {

    // ─────────────────────────────────────────────────────────
    // E2E-Test: Dashboard laden und Brew Logger navigierbar
    //
    // Benutzerfluss:
    //   App öffnen → Dashboard sichtbar → Statistik-Boxen prüfen
    //   → zum Brew Logger navigieren → Eingabefelder vorhanden
    //
    // Verifiziert:
    //   - Full-Stack-Rendering (Expo Web → React Native Web → UI)
    //   - Navigation funktioniert
    //   - Kernkomponenten werden gerendert
    // ─────────────────────────────────────────────────────────
    test('Dashboard lädt korrekt und Navigation zum Brew Logger funktioniert', async ({ page }) => {
        // Arrange — App öffnen
        await page.goto('http://localhost:8081');

        // Act & Assert — Dashboard prüfen
        // Warten bis die App geladen ist (DB-Initialisierung + Font-Loading)
        await page.waitForTimeout(3000);

        // Dashboard-Titel sollte sichtbar sein
        const dashboardTitle = page.getByText('BrewRef');
        await expect(dashboardTitle).toBeVisible({ timeout: 10000 });

        // Mindestens eine Statistik-Box sollte sichtbar sein
        const beansLabel = page.getByText('Beans Stashed');
        await expect(beansLabel).toBeVisible({ timeout: 5000 });

        // Act — Zum Brew Logger navigieren (Tab-Klick)
        const logTab = page.getByText('Log');
        await logTab.click();

        // Assert — Brew Logger Formularfelder prüfen
        await page.waitForTimeout(1000);

        // Der "Save Brew" oder "Dose In" Text sollte sichtbar sein
        const doseInLabel = page.getByText('Dose In');
        await expect(doseInLabel).toBeVisible({ timeout: 5000 });
    });

});
