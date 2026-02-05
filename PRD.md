# Product Requirements Document: Coffee Log & AI Barista

## 1. Core Concept
Eine Specialty Coffee App für Enthusiasten. Ziel: Referenzwerte speichern, Rezepte tracken und AI-gestützte Fehlerbehebung ("Fix my Coffee") bieten.
**Tech Stack:** React Native (Expo), TypeScript, Firebase (Firestore/Auth), Google Gemini API.

## 2. Aesthetic Direction ("Industrial Zen")
*Siehe SKILL.md für Details.*
- **Vibe:** Roh, präzise, wissenschaftlich. Kein "Coffee-Shop-Braun".
- **Farben:** Bone White (#F2F0E9), Deep Black (#1A1A1A), International Orange (#FF4400).
- **Typo:** 'Cormorant Garamond' (Headlines), 'Space Mono' (Daten/Werte).

## 3. Key Features & Requirements

### A. Input (The "Lab")
- Erfassung von: Mühle, Bohne, Input (g), Output (g), Zeit (s).
- **UI:** Muss sich anfühlen wie ein Labor-Instrument. Große Zahlen, Monospace-Fonts.

### B. Scoring (The "Vibe Check")
1. **Körper:** Custom Slider (3 Zonen: Wässrig/Blau, Cremig/Orange, Zäh/Rot). Keine Standard-UI!
2. **Geschmack:** Kaskadierende Auswahl (Kein komplexes SVG-Rad). Kategorien: Fruchtig, Nussig, Schoko, Süß, Blumig -> Drilldown in Nuancen.
3. **Säure/Bitter:** 2 Slider mit Gradient-Hintergrund (Grün->Gelb / Rosa->Dunkelrot).

### C. AI Barista (Gemini Integration)
- **Trigger:** Button "Fix my Coffee".
- **Input:** Letzte Brüh-Parameter + User Feedback (z.B. "Zu bitter").
- **Output:** Konkrete Handlungsanweisung (z.B. "Mahlgrad 2 Stufen gröber").
- **UX:** Während des Ladens minimalistische Status-Texte ("Analysiere Extraktion...", "Vergleiche Referenzwerte...").

## 4. Architecture Rules
- **Repository Pattern:** Logik vom UI trennen (`CoffeeRepository`, `GeminiService`).
- **Singleton:** Für API-Clients.
- **Builder Pattern:** Für das Erstellen komplexer `CoffeeLog` Objekte.