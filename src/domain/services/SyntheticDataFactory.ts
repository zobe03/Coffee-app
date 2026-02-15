import { GrinderRepository } from '../../data/repositories/GrinderRepository';
import { CoffeeRepository } from '../../data/repositories/CoffeeRepository';
import { BrewRepository } from '../../data/repositories/BrewRepository';
import { Grinder } from '../entities/Grinder';
import { Coffee } from '../entities/Coffee';
import { BrewLog } from '../entities/BrewLog';

export class SyntheticDataFactory {
    private grinderRepo: GrinderRepository;
    private coffeeRepo: CoffeeRepository;
    private brewRepo: BrewRepository;

    constructor() {
        this.grinderRepo = new GrinderRepository();
        this.coffeeRepo = new CoffeeRepository();
        this.brewRepo = new BrewRepository();
    }

    async generateEssentialData(): Promise<void> {
        const grinders = await this.grinderRepo.getAll();
        if (grinders.length > 0) return; // Data already exists

        const grinderId = await this.createGrinder();
        const coffeeId = await this.createCoffee();
        await this.createBrewLogs(grinderId, coffeeId);
    }

    private async createGrinder(): Promise<number> {
        const grinder: Grinder = {
            name: 'Comandante C40',
            brand: 'Comandante',
            model: 'C40 MK4',
            description: 'The standard for hand grinders.',
        };
        return await this.grinderRepo.create(grinder);
    }

    private async createCoffee(): Promise<number> {
        const coffee: Coffee = {
            name: 'Ethiopia Yirgacheffe',
            roastery: 'The Barn',
            origin: 'Ethiopia',
            variety: 'Heirloom',
            process: 'Washed',
            roastDate: new Date().toISOString().split('T')[0],
            notes: 'Jasmine, Bergamot, Peach',
        };
        return await this.coffeeRepo.create(coffee);
    }

    private async createBrewLogs(grinderId: number, coffeeId: number): Promise<void> {
        const brew: BrewLog = {
            coffeeId,
            grinderId,
            date: new Date().toISOString(),
            doseIn: 15,
            doseOut: 250,
            timeSeconds: 165,
            temperature: 93,
            grindSetting: '22 Clicks',
            score: {
                body: 1, // Medium
                acidity: 7,
                bitterness: 3,
                tasteNotes: ['Jasmine', 'Peach', 'Tea-like'],
            },
        };
        await this.brewRepo.create(brew);
    }
}
