import { BrewRepository } from '../data/repositories/BrewRepository';
import { BrewLog } from '../domain/entities/BrewLog';
import { CoffeeRepository } from '../data/repositories/CoffeeRepository';
import { GrinderRepository } from '../data/repositories/GrinderRepository';

export const generateMockData = async (count: number = 50) => {
    const brewRepo = new BrewRepository();
    const coffeeRepo = new CoffeeRepository();
    const grinderRepo = new GrinderRepository();

    // Ensure we have at least one coffee and grinder
    let coffees = await coffeeRepo.getAll();
    if (coffees.length === 0) {
        await coffeeRepo.create({ name: 'Ethiopia Sidamo', roastery: 'The Barn', roastDate: new Date().toISOString().split('T')[0] });
        coffees = await coffeeRepo.getAll();
    }

    let grinders = await grinderRepo.getAll();
    if (grinders.length === 0) {
        await grinderRepo.create({ name: 'Niche Zero', brand: 'Niche', model: 'Zero' });
        grinders = await grinderRepo.getAll();
    }

    const coffeeId = coffees[0].id;
    const grinderId = grinders[0].id;

    if (!coffeeId || !grinderId) {
        throw new Error('Failed to get coffee or grinder ID for mock data generation');
    }

    const baseRecipe = {
        doseIn: 18,
        doseOut: 36,
        time: 30,
        temp: 93,
        grind: 15,
    };

    for (let i = 0; i < count; i++) {
        // Add some random variation
        const doseIn = baseRecipe.doseIn + (Math.random() - 0.5) * 0.5; // +/- 0.25g
        const doseOut = baseRecipe.doseOut + (Math.random() - 0.5) * 5; // +/- 2.5g

        // Logic: Finer grind (lower number) -> Slower time (higher number)
        // Base grind is 15. Range +/- 5.
        const grindOffset = (Math.random() - 0.5) * 10; // -5 to +5
        const grindSetting = (baseRecipe.grind + grindOffset).toFixed(1);

        // Time affected by grind: finer (-offset) = slower (+time)
        // e.g. grind 10 (-5 offset) -> time +10s?
        const timeBase = baseRecipe.time - (grindOffset * 2); // if grind is 20 (+5), time is 20 (-10) = fast. if grind is 10 (-5), time is 40 (+10) = slow.
        const time = timeBase + (Math.random() - 0.5) * 4; // Add some noise +/- 2s

        const temp = baseRecipe.temp + Math.floor((Math.random() - 0.5) * 2); // +/- 1C

        // Simulate taste based on extraction
        let body = 1; // Light
        let acidity = 5;
        let bitterness = 5;
        let notes: string[] = [];

        const ratio = doseOut / doseIn;

        if (ratio < 1.8) {
            // Ristretto-ish: More body, high acidity/sourness? Or salty?
            body = 2; // Heavy
            acidity = Math.min(10, 7 + Math.random() * 2);
            notes.push('SOUR', 'SALTY');
        } else if (ratio > 2.5) {
            // Lungo-ish: Watery body, high bitterness
            body = 0; // Watery (if 0 was mapped, but we have 0,1,2)
            bitterness = Math.min(10, 7 + Math.random() * 2);
            notes.push('BITTER', 'DRY', 'ASTRINGENT');
        } else {
            // Balanced
            body = 1;
            acidity = 4 + Math.random() * 4;
            bitterness = 4 + Math.random() * 4;
            notes.push('SWEET', 'FRUITY', 'CHOCOLATE');
        }

        // Randomize notes a bit more
        if (Math.random() > 0.7) notes.push('FLORAL');
        if (Math.random() > 0.7) notes.push('NUTTY');

        const brew: Omit<BrewLog, 'id'> = {
            date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toISOString(), // Last 30 days
            coffeeId,
            grinderId,
            doseIn: parseFloat(doseIn.toFixed(1)),
            doseOut: parseFloat(doseOut.toFixed(1)),
            timeSeconds: parseFloat(time.toFixed(1)),
            temperature: temp,
            grindSetting: grindSetting,
            score: {
                body,
                acidity: Math.round(acidity),
                bitterness: Math.round(bitterness),
                tasteNotes: notes
            }
        };

        await brewRepo.create(brew);
    }
    console.log(`Generated ${count} mock brew logs.`);
};
