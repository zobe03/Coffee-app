
## 6. UML-Diagramme

### 6.1 Klassendiagramm

Das Klassendiagramm zeigt alle relevanten Klassen und Interfaces der Anwendung mit ihren Beziehungen. Die Entities (`Coffee`, `Grinder`, `BrewLog`, `Score`) sind als Interfaces modelliert, die Services als Singletons, und die Repositories als Datenzugriffsschicht.

```mermaid
classDiagram
    direction TB

    class Coffee {
        <<interface>>
        +id?: number
        +name: string
        +roastery: string
        +origin?: string
        +variety?: string
        +process?: string
        +roastDate?: string
        +notes?: string
    }

    class Grinder {
        <<interface>>
        +id?: number
        +name: string
        +brand: string
        +model: string
        +description?: string
    }

    class Score {
        <<interface>>
        +body: number
        +acidity: number
        +bitterness: number
        +tasteNotes: string[]
    }

    class BrewLog {
        <<interface>>
        +id?: number
        +coffeeId: number
        +grinderId: number
        +date: string
        +doseIn: number
        +doseOut: number
        +timeSeconds: number
        +temperature?: number
        +grindSetting?: string
        +score: Score
    }

    class BrewLogRow {
        <<interface>>
        +id: number
        +coffee_id: number
        +grinder_id: number
        +date: string
        +dose_in: number
        +dose_out: number
        +time_seconds: number
        +temperature: number | null
        +grind_setting: string | null
        +rating_body: number
        +rating_acidity: number
        +rating_bitterness: number
        +taste_notes: string | null
    }

    class DBInterface {
        <<interface>>
        +getAllAsync(sql, params): Promise~T[]~
        +getFirstAsync(sql, params): Promise~T|null~
        +runAsync(sql, params): Promise~lastInsertRowId~
        +execAsync(sql): Promise~void~
    }

    class WebDatabaseAdapter {
        -getTableName(sql): string | null
        -getData(table): any[]
        -saveData(table, data)
        -getLastId(table): number
        -saveLastId(table, id)
        +getAllAsync(sql, params): Promise~T[]~
        +getFirstAsync(sql, params): Promise~T|null~
        +runAsync(sql, params): Promise~lastInsertRowId~
        +execAsync(sql): Promise~void~
    }

    class DatabaseService {
        -static instance: DatabaseService
        -db: DBInterface|null
        -constructor()
        +static getInstance(): DatabaseService
        +initialize(): Promise~void~
        -migrate(): Promise~void~
        +getDatabase(): DBInterface
        +nukeAllData(): Promise~void~
    }

    class AIService {
        -static instance: AIService
        -genAI: GoogleGenerativeAI
        -model: GenerativeModel
        -constructor()
        +static getInstance(): AIService
        +setApiKey(key: string)
        -bodyLabel(body: number): string
        -formatBrewSummary(brew, context): string
        +getAdvice(currentLog, history, goal?, context?): Promise~string~
    }

    class AdviceContext {
        <<interface>>
        +coffee?: Coffee
        +grinder?: Grinder
        +allCoffees?: Record~number-Coffee~
        +allGrinders?: Record~number-Grinder~
    }

    class BrewBuilder {
        -brew: Partial~BrewLog~
        +constructor()
        +setEquipment(coffeeId, grinderId): BrewBuilder
        +setRecipe(doseIn, doseOut, timeSeconds, temp?): BrewBuilder
        +setGrindSetting(setting): BrewBuilder
        +setScore(score): BrewBuilder
        +build(): BrewLog
    }

    class CoffeeRepository {
        +getAll(): Promise~Coffee[]~
        +getById(id): Promise~Coffee|null~
        +create(coffee): Promise~number~
        +delete(id): Promise~void~
    }

    class GrinderRepository {
        +getAll(): Promise~Grinder[]~
        +getById(id): Promise~Grinder|null~
        +create(grinder): Promise~number~
        +update(grinder): Promise~void~
        +delete(id): Promise~void~
    }

    class BrewRepository {
        +getAll(): Promise~BrewLog[]~
        +create(brew): Promise~number~
        +delete(id): Promise~void~
        -mapRowToBrewLog(row): BrewLog
    }

    class SyntheticDataFactory {
        -grinderRepo: GrinderRepository
        -coffeeRepo: CoffeeRepository
        -brewRepo: BrewRepository
        +constructor()
        +generateEssentialData(): Promise~void~
        -createGrinder(): Promise~number~
        -createCoffee(): Promise~number~
        -createBrewLogs(grinderId, coffeeId): Promise~void~
    }

    BrewLog *-- Score : enthält
    BrewLog --> Coffee : referenziert via coffeeId
    BrewLog --> Grinder : referenziert via grinderId

    DBInterface <|.. WebDatabaseAdapter : implements
    DatabaseService --> DBInterface : nutzt
    DatabaseService --> WebDatabaseAdapter : erzeugt auf Web

    CoffeeRepository --> DatabaseService : nutzt
    GrinderRepository --> DatabaseService : nutzt
    BrewRepository --> DatabaseService : nutzt
    BrewRepository --> BrewLogRow : mappt intern

    BrewBuilder --> BrewLog : erzeugt
    AIService --> AdviceContext : nutzt
    SyntheticDataFactory --> CoffeeRepository : nutzt
    SyntheticDataFactory --> GrinderRepository : nutzt
    SyntheticDataFactory --> BrewRepository : nutzt
```

### 6.2 Komponentendiagramm

Das Komponentendiagramm visualisiert die Schichtenarchitektur und die Abhängigkeiten zwischen den Komponenten sowie zu externen Systemen.

```mermaid
graph TB
    subgraph Presentation["Presentation Layer"]
        direction TB
        RootLayout["_layout.tsx<br/>(Root: DB-Init, Fonts, Web-Container)"]
        TabLayout["(tabs)/_layout.tsx<br/>(Tab-Navigator)"]
        
        subgraph Screens["Screens"]
            Home["index.tsx<br/>Dashboard"]
            Log["log.tsx<br/>Brew Logger"]
            History["history.tsx<br/>Brühverlauf"]
            Coffees["coffees.tsx<br/>Kaffee-Verwaltung"]
            Grinders["grinders.tsx<br/>Mühlen-Verwaltung"]
            Doctor["doctor.tsx<br/>KI-Berater"]
        end

        subgraph Components["Wiederverwendbare Komponenten"]
            GrindSel["GrindSelector"]
            BodySel["BodySelector"]
            TasteW["TasteWheel"]
            SelModal["SelectionModal"]
            Btn["Button"]
        end

        subgraph ManageScreens["Manage-Screens"]
            ManageCoffees["ManageCoffeesScreen"]
            ManageGrinders["ManageGrindersScreen"]
        end

        Theme["theme/index.ts<br/>(Restyle Theme)"]
    end

    subgraph Domain["Domain Layer"]
        direction TB
        subgraph Entities["Entities (Interfaces)"]
            CoffeeE["Coffee"]
            GrinderE["Grinder"]
            BrewLogE["BrewLog / Score"]
        end
        
        subgraph Services["Services (Singletons)"]
            DBService["DatabaseService"]
            AIServ["AIService"]
            SynFactory["SyntheticDataFactory"]
        end
        
        Builder["BrewBuilder"]
    end

    subgraph Data["Data Layer"]
        CoffeeRepo["CoffeeRepository"]
        GrinderRepo["GrinderRepository"]
        BrewRepo["BrewRepository"]
    end

    subgraph Utils["Utilities"]
        MockData["mockData.ts<br/>(generateMockData)"]
    end

    subgraph External["Externe Systeme"]
        SQLite["expo-sqlite<br/>(Native)"]
        LocalStorage["localStorage<br/>(Web)"]
        Gemini["Google Gemini API"]
    end

    RootLayout --> TabLayout
    TabLayout --> Screens
    Screens --> Components
    Screens --> Theme
    Coffees --> ManageCoffees
    Grinders --> ManageGrinders

    Log --> Builder
    Log --> SelModal
    Log --> GrindSel
    Log --> BodySel
    Log --> TasteW
    Doctor --> AIServ
    Doctor --> MockData
    Screens --> Data
    MockData --> Data

    Data --> DBService
    DBService --> SQLite
    DBService --> LocalStorage
    AIServ --> Gemini
```

### 6.3 Aktivitätsdiagramm — Brew Logging

Das Aktivitätsdiagramm modelliert den vollständigen Ablauf eines Brew-Logging-Vorgangs durch den Benutzer von der Eingabe bis zur Persistierung.

```mermaid
flowchart TD
    Start([Brew Logger öffnen]) --> LoadData["Stammdaten laden<br/>(CoffeeRepository + GrinderRepository)"]
    LoadData --> SelectEquipment[Kaffee und Mühle auswählen<br/>via SelectionModal]
    SelectEquipment --> EnterRecipe[Rezeptdaten eingeben<br/>Dose In, Dose Out, Temperatur]
    EnterRecipe --> GrindSelect[Mahlgrad einstellen<br/>via GrindSelector]
    GrindSelect --> Timer{Shot-Timer<br/>verwenden?}
    
    Timer -->|Ja| StartTimer[Timer starten]
    StartTimer --> StopTimer[Timer stoppen]
    StopTimer --> AutoFill[Gestoppte Zeit wird<br/>automatisch übernommen]
    AutoFill --> TasteProfile
    
    Timer -->|Nein| ManualTime[Zeit manuell eingeben]
    ManualTime --> TasteProfile

    TasteProfile[Geschmacksprofil erfassen<br/>BodySelector + TasteWheel]
    TasteProfile --> Save[Speichern drücken]
    
    Save --> ValidateEquipment{Coffee und Grinder<br/>ausgewählt?}
    ValidateEquipment -->|Nein| ShowWarning["Warnung: 'Please select<br/>Coffee and Grinder'"]
    ShowWarning --> SelectEquipment

    ValidateEquipment -->|Ja| BuildBrew["BrewBuilder.build()<br/>Pflichtfelder validieren"]
    BuildBrew --> Persist["BrewRepository.create()<br/>In Datenbank speichern"]
    Persist --> Confirm["Bestätigung: 'Brew Logged!'"]
    Confirm --> Navigate["Navigation zurück<br/>via router.back()"]
```

### 6.4 Sequenzdiagramm — KI-Brühberatung

Das Sequenzdiagramm zeigt die Interaktion zwischen den beteiligten Klassen bei der Anforderung einer KI-basierten Brühberatung.

```mermaid
sequenceDiagram
    actor User
    participant Doctor as doctor.tsx
    participant AIService as AIService
    participant BrewRepo as BrewRepository
    participant CoffeeRepo as CoffeeRepository
    participant GrinderRepo as GrinderRepository
    participant Gemini as Gemini API

    Note over User,Doctor: Screen-Fokus löst Datenladung aus
    Doctor->>BrewRepo: getAll()
    BrewRepo-->>Doctor: BrewLog[]
    Doctor->>Doctor: Neuester Brew als selectedBrew setzen

    Doctor->>CoffeeRepo: getAll()
    CoffeeRepo-->>Doctor: Coffee[]
    Doctor->>Doctor: Coffee-Map aufbauen (Record~number,Coffee~)

    Doctor->>GrinderRepo: getAll()
    GrinderRepo-->>Doctor: Grinder[]
    Doctor->>Doctor: Grinder-Map aufbauen (Record~number,Grinder~)

    User->>Doctor: Optional: Brew auswählen (Modal)
    User->>Doctor: Optional: Ziel formulieren (TextInput)
    User->>Doctor: "Get AI Advice" drücken
    activate Doctor
    Doctor->>Doctor: CoffeeLoadingAnimation starten<br/>(Cup-Filling-Animation + zyklische Nachrichten)

    Doctor->>BrewRepo: getAll()
    BrewRepo-->>Doctor: BrewLog[] (History)

    Doctor->>Doctor: AdviceContext aufbauen<br/>(coffee, grinder, allCoffees, allGrinders)

    Doctor->>AIService: getAdvice(selectedBrew, history, goal, context)
    activate AIService

    AIService->>AIService: formatBrewSummary()<br/>Prompt mit Brew-Daten aufbauen

    AIService->>Gemini: generateContent(prompt)
    activate Gemini
    Gemini-->>AIService: Response (Markdown)
    deactivate Gemini

    alt Erfolg
        AIService-->>Doctor: Advice-String (Markdown)
    else API-Fehler
        AIService-->>Doctor: Fallback-Fehlermeldung
    end
    deactivate AIService

    Doctor->>Doctor: Loading-Animation stoppen
    Doctor->>Doctor: Markdown rendern<br/>(Diagnose → Anpassungen → Ergebnis)
    Doctor-->>User: Strukturierte Empfehlung anzeigen
    deactivate Doctor
```
