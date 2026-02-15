import React, { useState, useEffect } from 'react';
import { ScrollView, TextInput } from 'react-native';
import { Box, Text, useTheme } from '../../src/presentation/theme';
import { Stack, useRouter } from 'expo-router';
import { Button } from '../../src/presentation/components/Button';
import { BodySelector } from '../../src/presentation/components/BodySelector';
import { ScaleSlider } from '../../src/presentation/components/ScaleSlider';
import { TasteWheel } from '../../src/presentation/components/TasteWheel';
import { BrewBuilder } from '../../src/domain/builders/BrewBuilder';
import { BrewRepository } from '../../src/data/repositories/BrewRepository';
import { CoffeeRepository } from '../../src/data/repositories/CoffeeRepository';
import { GrinderRepository } from '../../src/data/repositories/GrinderRepository';
import { Coffee } from '../../src/domain/entities/Coffee';
import { Grinder } from '../../src/domain/entities/Grinder';

export default function BrewLogScreen() {
    const router = useRouter();
    const theme = useTheme();
    const [coffees, setCoffees] = useState<Coffee[]>([]);
    const [grinders, setGrinders] = useState<Grinder[]>([]);

    // State for BrewBuilder
    const [selectedCoffeeId, setSelectedCoffeeId] = useState<number | undefined>();
    const [selectedGrinderId, setSelectedGrinderId] = useState<number | undefined>();
    const [doseIn, setDoseIn] = useState('18');
    const [doseOut, setDoseOut] = useState('36');
    const [time, setTime] = useState('30');
    const [temp, setTemp] = useState('93');
    const [grindSetting, setGrindSetting] = useState('');

    // Scoring
    const [body, setBody] = useState(1);
    const [acidity, setAcidity] = useState(5);
    const [bitterness, setBitterness] = useState(5);
    const [tasteNotes, setTasteNotes] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setCoffees(await new CoffeeRepository().getAll());
            setGrinders(await new GrinderRepository().getAll());
        };
        fetchData();
    }, []);

    const handleSave = async () => {
        if (!selectedCoffeeId || !selectedGrinderId) {
            alert('Please select Coffee and Grinder');
            return;
        }

        try {
            const builder = new BrewBuilder();
            const brew = builder
                .setEquipment(selectedCoffeeId, selectedGrinderId)
                .setRecipe(parseFloat(doseIn), parseFloat(doseOut), parseFloat(time), parseFloat(temp))
                .setGrindSetting(grindSetting)
                .setScore({ body, acidity, bitterness, tasteNotes })
                .build();

            await new BrewRepository().create(brew);
            alert('Brew Logged!');
            router.back();
        } catch (e) {
            alert('Error saving brew: ' + e);
        }
    };

    return (
        <Box flex={1} backgroundColor="mainBackground">
            <Stack.Screen options={{ title: 'Log Brew', headerBackTitle: 'Back' }} />
            <ScrollView contentContainerStyle={{ padding: theme.spacing.m, paddingBottom: 100 }}>

                {/* Equipment Selection (Simplified) */}
                <Box marginBottom="l">
                    <Text variant="subheader" marginBottom="m">Equipment</Text>
                    <Box flexDirection="row" gap="m">
                        <Button
                            label={selectedCoffeeId ? `Coffee: ${coffees.find(c => c.id === selectedCoffeeId)?.name}` : "Select Coffee"}
                            onPress={() => {
                                const next = coffees.find(c => c.id !== selectedCoffeeId)?.id || coffees[0]?.id;
                                setSelectedCoffeeId(next);
                            }}
                            variant="outline"
                        />
                        <Button
                            label={selectedGrinderId ? `Grinder: ${grinders.find(g => g.id === selectedGrinderId)?.name}` : "Select Grinder"}
                            onPress={() => {
                                const next = grinders.find(g => g.id !== selectedGrinderId)?.id || grinders[0]?.id;
                                setSelectedGrinderId(next);
                            }}
                            variant="outline"
                        />
                    </Box>
                </Box>

                {/* Recipe */}
                <Box marginBottom="l">
                    <Text variant="subheader" marginBottom="m">Recipe</Text>
                    <Box flexDirection="row" gap="m" marginBottom="m">
                        <InputField label="Dose In (g)" value={doseIn} onChange={setDoseIn} keyboardType="decimal-pad" />
                        <InputField label="Dose Out (g)" value={doseOut} onChange={setDoseOut} keyboardType="decimal-pad" />
                    </Box>
                    <Box flexDirection="row" gap="m" marginBottom="m">
                        <InputField label="Time (s)" value={time} onChange={setTime} keyboardType="decimal-pad" />
                        <InputField label="Temp (°C)" value={temp} onChange={setTemp} keyboardType="decimal-pad" />
                    </Box>
                    <InputField label="Grind Setting" value={grindSetting} onChange={setGrindSetting} placeholder="e.g. 2.4" keyboardType="decimal-pad" />
                </Box>

                {/* Scoring */}
                <Box marginBottom="l">
                    <Text variant="subheader" marginBottom="m">Scoring</Text>

                    <Text variant="body" marginBottom="s">Body</Text>
                    <BodySelector value={body} onChange={setBody} />

                    <Box height={20} />

                    <ScaleSlider
                        label="ACIDITY"
                        value={acidity}
                        onChange={setAcidity}
                        gradientColors={['#90EE90', '#FFFF00', '#FFA500']}
                    />

                    <ScaleSlider
                        label="BITTERNESS"
                        value={bitterness}
                        onChange={setBitterness}
                        gradientColors={['#FFC0CB', '#8B0000']}
                    />

                    <Box height={20} />
                    <TasteWheel selectedNotes={tasteNotes} onNotesChange={setTasteNotes} />
                </Box>

                <Button label="Save Brew Log" onPress={handleSave} />
            </ScrollView>
        </Box>
    );
}

const InputField = ({ label, value, onChange, placeholder, keyboardType = 'numeric' }: any) => {
    const theme = useTheme();
    return (
        <Box flex={1}>
            <Text variant="caption" marginBottom="s">{label}</Text>
            <TextInput
                style={{
                    backgroundColor: theme.colors.cardPrimaryBackground,
                    color: theme.colors.textPrimary,
                    padding: theme.spacing.m,
                    borderRadius: 8,
                }}
                value={value}
                onChangeText={onChange}
                keyboardType={keyboardType}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.textSecondary}
            />
        </Box>
    );
};
