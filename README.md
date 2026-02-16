# BrewRef — Specialty Coffee Logging App

**BrewRef** ist eine Cross-Plattform-App (iOS, Android, Web) zum Loggen, Analysieren und Verbessern von Kaffee-Brühvorgängen. Die App folgt dem Designprinzip "Industrial Zen" mit einer dunklen, minimalistischen Ästhetik.

---

## Inhaltsverzeichnis

1. [Technologie-Stack](#technologie-stack)
2. [Projektstruktur](#projektstruktur)
3. [Funktionale Anforderungen](#funktionale-anforderungen)
4. [Nicht-funktionale Anforderungen](#nicht-funktionale-anforderungen)
5. [Qualitätsanforderungen](#qualitätsanforderungen)
6. [Architektur](#architektur)
7. [Design Patterns](#design-patterns)
8. [Usability-Heuristiken nach Nielsen](#usability-heuristiken-nach-nielsen)
9. [Installation & Start](#installation--start)

---

## Technologie-Stack

| Komponente | Technologie |
|---|---|
| Framework | Expo SDK 54, React Native 0.81, TypeScript |
| Navigation | Expo Router v6 (dateibasiertes Tab-Layout) |
| Styling / Design System | Shopify Restyle (Theme-basiert) |
| Datenbank | `expo-sqlite` (nativ) / `localStorage`-Adapter (Web) |
| KI-Integration | Google Generative AI (Gemini) |
| Grafiken | `react-native-svg` (Taste Wheel) |
| Animationen & Haptik | `react-native-reanimated`, `expo-haptics` |
| Gestensteuerung | `react-native-gesture-handler` (Swipe-to-Delete) |

---

## Projektstruktur

```
Coffee-app/
├── app/                          # Navigation Layer (Expo Router)
│   ├── _layout.tsx               # Root-Layout mit DB-Initialisierung, Web-Container
│   └── (tabs)/
│       ├── _layout.tsx           # Tab-Navigator (6 Tabs)
│       ├── index.tsx             # Home / Dashboard
│       ├── log.tsx               # Brew Logger
│       ├── history.tsx           # Brühverlauf
│       ├── coffees.tsx           # Kaffee-Verwaltung
│       ├── grinders.tsx          # Mühlen-Verwaltung
│       └── doctor.tsx            # KI-Berater
│
└── src/
    ├── presentation/             # UI-Schicht
    │   ├── theme/index.ts        # Shopify Restyle Theme
    │   ├── components/           # Wiederverwendbare UI-Komponenten
    │   │   ├── GrindSelector     # Scrollbarer Mahlgrad-Selector
    │   │   ├── BodySelector      # Body-Auswahl (Light/Medium/Heavy)
    │   │   ├── TasteWheel        # SVG-Geschmacksrad
    │   │   ├── SelectionModal    # Bottom-Sheet Auswahl-Modal
    │   │   ├── ScaleSlider       # Gradient-Slider (0–10)
    │   │   └── Button            # Theme-basierter Button
    │   └── screens/              # Vollbild-Komponenten
    │       ├── ManageCoffeesScreen
    │       └── ManageGrindersScreen
    │
    ├── domain/                   # Domänen-/Geschäftslogik-Schicht
    │   ├── entities/             # Datenmodelle
    │   │   ├── Coffee.ts
    │   │   ├── Grinder.ts
    │   │   └── BrewLog.ts        # Inkl. Score-Interface
    │   ├── services/
    │   │   ├── DatabaseService   # Singleton – DB-Verwaltung
    │   │   ├── AIService         # Singleton – Gemini-API
    │   │   └── SyntheticDataFactory # Seed-Daten (Factory)
    │   └── builders/
    │       └── BrewBuilder       # Builder-Pattern für BrewLog
    │
    ├── data/                     # Datenzugriffs-Schicht
    │   └── repositories/
    │       ├── CoffeeRepository
    │       ├── GrinderRepository
    │       └── BrewRepository
    │
    └── utils/
        └── mockData.ts           # Generierung von Testdaten
```

---

## Funktionale Anforderungen

Die App erfüllt die folgenden **acht** funktionalen Anforderungen:

| # | Anforderung | Beschreibung | Umsetzung |
|---|---|---|---|
| FA1 | **Brew Logging** | Vollständige Erfassung eines Brühvorgangs mit Rezeptdaten | `app/(tabs)/log.tsx`, `BrewBuilder` |
| FA2 | **Kaffee-Verwaltung (CRUD)** | Kaffeebohnen anlegen, anzeigen und löschen | `ManageCoffeesScreen`, `CoffeeRepository` |
| FA3 | **Mühlen-Verwaltung (CRUD)** | Kaffeemühlen anlegen, anzeigen und löschen | `ManageGrindersScreen`, `GrinderRepository` |
| FA4 | **Brühverlauf** | Chronologische Anzeige aller Brühvorgänge mit Detailansicht | `app/(tabs)/history.tsx` |
| FA5 | **KI-basierte Brühberatung** | Analyse einzelner Brühvorgänge mit Gemini-KI inkl. Zielformulierung | `app/(tabs)/doctor.tsx`, `AIService` |
| FA6 | **Shot-Timer** | Integrierter Timer mit Start/Stop/Reset (0,1s Genauigkeit) | `app/(tabs)/log.tsx` (Timer-Sektion) |
| FA7 | **Geschmacksprofil-Erfassung** | Body-Auswahl (3 Zonen) und Taste Wheel (6 Kategorien mit Sub-Notes) | `BodySelector`, `TasteWheel` |
| FA8 | **Dashboard mit Statistiken** | Übersichtsseite mit Beans Stashed, Days Since Last Brew, Total Brews, Top Coffee, Last Brew | `app/(tabs)/index.tsx` |

---

## Nicht-funktionale Anforderungen

Die App erfüllt die folgenden **drei** nicht-funktionalen Anforderungen:

| # | Anforderung | Beschreibung | Umsetzung |
|---|---|---|---|
| NFA1 | **Cross-Plattform** | Lauffähig auf iOS, Android und Web aus einer Codebasis | Expo/React Native; `WebDatabaseAdapter` als plattformspezifische Abstraktion; `Platform.OS`-Abfragen in Layout und Komponenten |
| NFA2 | **Offline-First** | Alle Daten lokal gespeichert, keine Internetverbindung für Kernfunktionen nötig | `expo-sqlite` (nativ) / `localStorage` (Web); KI-Feature explizit als Online-Feature gekennzeichnet |
| NFA3 | **Responsiveness & Performance** | Flüssige UI mit haptischem Feedback und Snap-Animationen | `expo-haptics` im GrindSelector, `snapToInterval` für ScrollView, `decelerationRate="fast"`, `scrollEventThrottle={16}` |

---

## Qualitätsanforderungen

### UI-Konsistenz

- **Globales Theme-System** (`src/presentation/theme/index.ts`): Alle Farben, Abstände und Textvarianten sind zentral über Shopify Restyle definiert. Keine hartcodierten Styles in Screens — alle Komponenten nutzen `Box`, `Text` und `useTheme()`.
- **Einheitliche Kartenstile**: Alle Listenelemente (Brews, Coffees, Grinders) verwenden identische `cardPrimaryBackground`-Farbgebung, `borderRadius`, und Spacing.
- **Konsistente Navigationsstruktur**: Alle Tabs verwenden das gleiche Header-Styling und Tab-Bar-Konfiguration.

### Fehlerfreiheit

- **Validierung**: `BrewBuilder.build()` wirft einen Error bei fehlenden Pflichtfeldern (coffeeId, grinderId, doseIn, doseOut, timeSeconds).
- **Graceful Error Handling**: `DatabaseService.initialize()` fängt Fehler ab und zeigt eine Fehlerseite (`_layout.tsx` Zeile 41–48). `AIService.getAdvice()` fängt API-Fehler und gibt eine fallback-Nachricht zurück.
- **Löschen mit Bestätigung**: `history.tsx` und `doctor.tsx` verwenden `confirm()`-Dialoge vor destruktiven Aktionen.

### Cross-Plattform-Ausführbarkeit

- **Native**: `expo-sqlite` für persistente Datenhaltung, `expo-haptics` für haptisches Feedback.
- **Web**: `WebDatabaseAdapter` als Adapter für `localStorage`; `Platform.OS === 'web'`-Abfragen für Layout-Anpassungen (Phone-Frame-Container, angepasste Tab-Bar-Höhe, deaktivierte Haptics).
- **Universell**: Alle UI-Komponenten verwenden React Native Primitives, die automatisch auf allen Plattformen rendern.

---

## Architektur

### Schichtenarchitektur (Layered Architecture)

Die App verwendet eine **Drei-Schichten-Architektur** mit strikter Abhängigkeitsrichtung:

```
┌─────────────────────────────────────────┐
│  Presentation Layer (UI)                │
│  app/, src/presentation/                │
│  Screens, Components, Theme, Navigation │
├─────────────────────────────────────────┤
│  Domain Layer (Geschäftslogik)          │
│  src/domain/                            │
│  Entities, Services, Builders           │
├─────────────────────────────────────────┤
│  Data Layer (Datenzugriff)              │
│  src/data/                              │
│  Repositories → DatabaseService         │
└─────────────────────────────────────────┘
```

**Abhängigkeitsrichtung:** Presentation → Domain ← Data. Die Domain-Schicht hat keine Abhängigkeiten zu UI- oder Datenbankdetails (die Entities sind reine Interfaces).

### Repository-Architektur

Zusätzlich zur Schichtenarchitektur wird das **Repository-Pattern** als Architekturmuster eingesetzt:

- `CoffeeRepository` — Zugriff auf die `coffees`-Tabelle
- `GrinderRepository` — Zugriff auf die `grinders`-Tabelle
- `BrewRepository` — Zugriff auf die `brew_logs`-Tabelle (inkl. Row-Mapping)

Die Repositories kapseln sämtliche SQL-Logik und bieten den Screens eine saubere API (`getAll()`, `getById()`, `create()`, `delete()`).

---

## Design Patterns

Die App setzt **vier** der aufgelisteten Design Patterns ein:

### 1. Singleton Pattern

**Dateien:** `DatabaseService.ts`, `AIService.ts`

Beide Services verwenden das klassische Singleton-Pattern mit privater `constructor`-Methode und statischer `getInstance()`-Methode:

```typescript
// DatabaseService.ts
class DatabaseService {
    private static instance: DatabaseService;
    private constructor() { }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
}
export const databaseService = DatabaseService.getInstance();
```

**Begründung:** Es darf nur eine Datenbankverbindung und eine KI-Service-Instanz existieren, um Ressourcenkonflikte zu vermeiden.

### 2. Builder Pattern

**Datei:** `BrewBuilder.ts`

Der `BrewBuilder` implementiert das Builder-Pattern mit Fluent-API zum schrittweisen zusammenbauen eines `BrewLog`-Objekts:

```typescript
const brew = new BrewBuilder()
    .setEquipment(coffeeId, grinderId)
    .setRecipe(18, 36, 30, 93)
    .setGrindSetting('22 Clicks')
    .setScore({ body: 1, acidity: 7, bitterness: 3, tasteNotes: ['Jasmine'] })
    .build(); // Validierung + Datum-Erzeugung
```

**Begründung:** Ein `BrewLog` hat viele optionale und pflichtfelder. Der Builder stellt sicher, dass nur valide Objekte erzeugt werden (`build()` wirft bei fehlenden Pflichtfeldern).

### 3. Adapter Pattern

**Datei:** `DatabaseService.ts` — `WebDatabaseAdapter`

Der `WebDatabaseAdapter` implementiert das gleiche `DBInterface` wie die native `expo-sqlite`-Instanz, adaptiert die Aufrufe aber auf `localStorage`:

```typescript
interface DBInterface {
    getAllAsync<T>(sql: string, params?: any[]): Promise<T[]>;
    getFirstAsync<T>(sql: string, params?: any[]): Promise<T | null>;
    runAsync(sql: string, params?: any[]): Promise<{ lastInsertRowId: number }>;
    execAsync(sql: string): Promise<void>;
}

class WebDatabaseAdapter implements DBInterface {
    async getAllAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
        // localStorage-basierte Implementierung
    }
    // ...
}
```

**Begründung:** Die Web-Plattform unterstützt kein `expo-sqlite`. Der Adapter ermöglicht es, denselben Repository-Code auf allen Plattformen zu verwenden, ohne die Repositories anzupassen.

### 4. Factory Pattern

**Datei:** `SyntheticDataFactory.ts`

Die `SyntheticDataFactory` erzeugt zusammenhängende Testdaten (Grinder + Coffee + BrewLog) über die Methode `generateEssentialData()`:

```typescript
class SyntheticDataFactory {
    async generateEssentialData(): Promise<void> {
        const grinderId = await this.createGrinder();   // Comandante C40
        const coffeeId = await this.createCoffee();     // Ethiopia Yirgacheffe
        await this.createBrewLogs(grinderId, coffeeId); // Sample Brew
    }
}
```

**Begründung:** Die Factory kapselt die Erzeugungslogik für zusammenhängende Entitäten und stellt sicher, dass Seed-Daten konsistent sind (Foreign Keys stimmen).

---

## Usability-Heuristiken nach Nielsen

Alle zehn Heuristiken von Jakob Nielsen werden in der App konsequent umgesetzt:

### 1. Sichtbarkeit des Systemstatus

| Umsetzung | Datei |
|---|---|
| `ActivityIndicator` während DB-Initialisierung | `_layout.tsx` Zeile 34–38 |
| `RefreshControl` mit Pull-to-Refresh auf Dashboard und History | `index.tsx`, `history.tsx` |
| Shot-Timer zeigt Echtzeit-Sekundenanzeige (0,1s Updates) | `log.tsx` Zeile 187–189 |
| "Analyzing..." Label während KI-Verarbeitung + Spinner | `doctor.tsx` Zeile 165, 213 |
| "Brew Logged!" / "Data Generated!" Bestätigungsmeldungen | `log.tsx`, `doctor.tsx` |

### 2. Übereinstimmung zwischen System und realer Welt

| Umsetzung | Datei |
|---|---|
| Fachterminologie der Kaffee-Domäne: Dose In/Out, Grind Setting, Body, Acidity, Shot Timer | Alle Logging-Screens |
| Taste Wheel mit branchenüblichen Kategorien (Fruity, Sweet, Nutty, Spiced, Roasted, Floral) | `TasteWheel.tsx` |
| Body-Zonen mit deskriptiven Labels: "WATERY", "TEA-LIKE", "SYRUPY", "VELVETY" | `BodySelector.tsx` |
| GrindSelector als physische Skala (Tick-Lineal) — imitiert reale Mühlen-Einstellung | `GrindSelector.tsx` |

### 3. Benutzerkontrolle und Freiheit

| Umsetzung | Datei |
|---|---|
| Tab-Navigation erlaubt freies Wechseln zwischen allen Bereichen | `(tabs)/_layout.tsx` |
| Modals haben Close-Buttons und Backdrop-Tap zum Schließen | `SelectionModal.tsx`, `history.tsx` |
| Shot-Timer: Start/Stop/Reset — volle Kontrolle über den Timer | `log.tsx` Zeile 56–65 |
| `router.back()` nach Speichern eines Brews | `log.tsx` Zeile 94 |
| Löschen von Brews, Coffees, Grinders jederzeit möglich | `history.tsx`, `ManageCoffeesScreen`, `ManageGrindersScreen` |

### 4. Konsistenz und Standards

| Umsetzung | Datei |
|---|---|
| Globales Theme mit einheitlichen Farben, Spacing und Text-Varianten | `theme/index.ts` |
| Alle Karten verwenden identische `cardPrimaryBackground` + `borderRadius` | Alle Screens |
| Einheitliche Modale (selbes Dark-Theme, gleiche Animationsart `slide`) | `SelectionModal`, `history.tsx`, `ManageCoffeesScreen` |
| Tab-Icons aus konsistenter Icon-Familie (MaterialCommunityIcons) | `(tabs)/_layout.tsx` |
| Swipe-to-Delete auf Coffees UND Grinders gleich implementiert | `ManageCoffeesScreen`, `ManageGrindersScreen` |

### 5. Fehlervermeidung

| Umsetzung | Datei |
|---|---|
| `BrewBuilder.build()` validiert Pflichtfelder vor Speicherung | `BrewBuilder.ts` Zeile 42–49 |
| "Please select Coffee and Grinder"-Warnung bei fehlendem Equipment | `log.tsx` Zeile 78–81 |
| `GrindSelector` mit `snapToInterval` verhindert ungültige Zwischenwerte | `GrindSelector.tsx` |
| Default-Werte für Rezeptfelder (18g in, 36g out, 30s, 93°C) | `log.tsx` Zeile 30–33 |
| `confirm()`-Dialog vor Datenlöschung | `history.tsx` Zeile 46, `doctor.tsx` Zeile 111 |

### 6. Wiedererkennen statt Erinnern

| Umsetzung | Datei |
|---|---|
| `SelectionModal` zeigt alle verfügbaren Coffees/Grinders als Liste | `SelectionModal.tsx` |
| Ausgewähltes Coffee/Grinder wird im Selector-Feld angezeigt | `log.tsx` Zeile 122, 141 |
| Taste Wheel zeigt alle Kategorien visuell auf einen Blick | `TasteWheel.tsx` |
| Body-Selector zeigt alle drei Optionen gleichzeitig mit Deskriptoren | `BodySelector.tsx` |
| History-Cards zeigen Kaffee, Datum, Rezeptdaten und Geschmacksnotizen direkt | `history.tsx` |

### 7. Flexibilität und Effizienz

| Umsetzung | Datei |
|---|---|
| Shot-Timer füllt Zeitfeld automatisch aus | `log.tsx` Zeile 58–59 |
| Pull-to-Refresh auf Dashboard und History für schnelle Aktualisierung | `index.tsx`, `history.tsx` |
| GrindSelector: Scroll mit Snap + manuelle Eingabe möglich | `GrindSelector.tsx` |
| Brew Doctor: Brew-Auswahl + eigene Zielformulierung | `doctor.tsx` Zeile 149–162 |
| Dev Tools: "Generate 50 Mock Brews" für schnelles Testing | `doctor.tsx` Zeile 101–106 |

### 8. Ästhetisches und minimalistisches Design

| Umsetzung | Datei |
|---|---|
| "Industrial Zen"-Farbpalette: Onyx, Slate, Rust, Bronze, Sage | `theme/index.ts` |
| Jeder Screen zeigt nur das kontextuell Relevante (keine Überladung) | Alle Screens |
| Dashboard: verdichtete Statistiken in 2×2 Grid + fokussierter Last-Brew-Card | `index.tsx` |
| Web: Phone-Frame-Container (500px, abgerundete Ecken, Schatten) | `_layout.tsx` Zeile 56–73 |
| Sparsamer Einsatz von Farbe — Rust nur für aktive/wichtige Elemente | Konsequent im Theme |

### 9. Fehler erkennen, diagnostizieren und beheben

| Umsetzung | Datei |
|---|---|
| "Database Initialization Failed" + Fehlernachricht bei DB-Fehler | `_layout.tsx` Zeile 41–48 |
| "Error saving brew: [Details]" bei Speicherfehler | `log.tsx` Zeile 96 |
| "Unable to get advice. Please check your API Key and internet connection." | `AIService.ts` Zeile 66 |
| `alert()`-Aufrufe mit konkreten Fehlermeldungen (nicht nur generische Fehler) | Durchgängig |

### 10. Hilfe und Dokumentation

| Umsetzung | Datei |
|---|---|
| KI-Berater (Brew Doctor) gibt kontextbezogene, aktionale Tipps | `doctor.tsx`, `AIService.ts` |
| Markdown-Rendering der KI-Antworten für strukturierte Darstellung | `doctor.tsx` Zeile 218–226 |
| Platzhaltertexte als Hilfestellung ("e.g. More sweetness, less acidity...") | `doctor.tsx` Zeile 158 |
| Empty-States mit Handlungsaufforderung ("No brews recorded yet. Start your journey...") | `index.tsx` Zeile 250–254 |
| Deskriptoren in BodySelector erklären die Optionen ("WATERY", "SYRUPY", etc.) | `BodySelector.tsx` |

---

## Installation & Start

### Voraussetzungen

- Node.js ≥ 18
- npm oder yarn
- Expo CLI (optional, `npx expo` funktioniert ebenfalls)

### Installation

```bash
cd Coffee-app
npm install
```

### Start

```bash
# Web
npx expo start --web

# iOS (Simulator oder Gerät)
npx expo start --ios

# Android (Emulator oder Gerät)
npx expo start --android
```
