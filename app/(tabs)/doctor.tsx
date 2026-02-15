import React, { useEffect, useState } from 'react';
import { Modal, FlatList, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, View } from 'react-native';
import { Box, Text, useTheme } from '../../src/presentation/theme';
import { Button } from '../../src/presentation/components/Button';
import { Stack } from 'expo-router';
import { aiService } from '../../src/domain/services/AIService';
import { BrewRepository } from '../../src/data/repositories/BrewRepository';
import { BrewLog } from '../../src/domain/entities/BrewLog';
import { CoffeeRepository } from '../../src/data/repositories/CoffeeRepository';
import { Coffee } from '../../src/domain/entities/Coffee';
import { GrinderRepository } from '../../src/data/repositories/GrinderRepository';
import { Grinder } from '../../src/domain/entities/Grinder';
import { generateMockData } from '../../src/utils/mockData';
import Markdown from 'react-native-markdown-display';

export default function AdvisorScreen() {
    const theme = useTheme();
    const [advice, setAdvice] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [selectedBrew, setSelectedBrew] = useState<BrewLog | null>(null);
    const [allBrews, setAllBrews] = useState<BrewLog[]>([]);
    const [coffees, setCoffees] = useState<Record<number, Coffee>>({});
    const [grinders, setGrinders] = useState<Record<number, Grinder>>({});
    const [goal, setGoal] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    // Removed loadLastBrew effect

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const brewRepo = new BrewRepository();
        const brews = await brewRepo.getAll();
        brews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAllBrews(brews);

        if (brews.length > 0) {
            setSelectedBrew(brews[0]);
        }

        const coffeeRepo = new CoffeeRepository();
        const allCoffees = await coffeeRepo.getAll();
        const coffeeMap: Record<number, Coffee> = {};
        allCoffees.forEach(c => coffeeMap[c.id!] = c);
        setCoffees(coffeeMap);

        const grinderRepo = new GrinderRepository();
        const allGrinders = await grinderRepo.getAll();
        const grinderMap: Record<number, Grinder> = {};
        allGrinders.forEach(g => grinderMap[g.id!] = g);
        setGrinders(grinderMap);
    };

    const getAdvice = async () => {
        if (!selectedBrew) return;
        setLoading(true);
        setAdvice('');

        const brewRepo = new BrewRepository();
        const history = await brewRepo.getAll();
        // Use last 5 brews for context
        const recentHistory = history.slice(-5);

        // Get Names
        const coffeeName = selectedBrew.coffeeId ? coffees[selectedBrew.coffeeId]?.name : 'Unknown';
        const grinder = selectedBrew.grinderId ? grinders[selectedBrew.grinderId] : null;
        const grinderName = grinder ? `${grinder.brand} ${grinder.model}` : 'Unknown';

        const result = await aiService.getAdvice(
            selectedBrew,
            recentHistory,
            goal,
            { coffeeName, grinderName }
        );
        setAdvice(result);
        setLoading(false);
    };

    const handleGenerateData = async () => {
        setLoading(true);
        try {
            await generateMockData(50);
            alert('Generated 50 mock brews!');
            await generateMockData(50);
            alert('Generated 50 mock brews!');
            loadData();
        } catch (e) {
            alert('Error generating data: ' + e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box flex={1} backgroundColor="mainBackground" padding="m">
            <Stack.Screen options={{ title: 'AI Advisor', headerBackTitle: 'Back' }} />
            <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
                <Text variant="header" marginBottom="m">Brew Doctor</Text>

                <Box marginBottom="l">
                    <Text variant="subheader" fontSize={18} marginBottom="s">Dev Tools</Text>
                    <Button
                        label="Generate 50 Mock Brews"
                        onPress={handleGenerateData}
                        variant="outline"
                    />
                </Box>

                {!selectedBrew ? (
                    <Text variant="body" color="textSecondary">No brews found. Log a brew to get advice!</Text>
                ) : (
                    <Box marginBottom="l">
                        <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="s">
                            <Text variant="subheader" fontSize={18}>Analysis for Brew</Text>
                            <TouchableOpacity onPress={() => setModalVisible(true)}>
                                <Text color="primary" variant="body" fontWeight="bold">Change</Text>
                            </TouchableOpacity>
                        </Box>

                        <Box backgroundColor="cardPrimaryBackground" padding="m" borderRadius={8} marginBottom="m">
                            <Text variant="body" color="textSecondary" fontSize={12} marginBottom="xs">{new Date(selectedBrew.date).toLocaleString()}</Text>
                            <Text variant="body" color="textPrimary" fontWeight="bold" marginBottom="xs">
                                {coffees[selectedBrew.coffeeId!]?.name || 'Unknown Coffee'}
                            </Text>
                            <Text variant="body" color="textPrimary">
                                Grinder: {grinders[selectedBrew.grinderId!]?.brand} {grinders[selectedBrew.grinderId!]?.model}
                            </Text>
                            <Box height={1} backgroundColor="surface" marginVertical="s" />
                            <Box flexDirection="row" justifyContent="space-between">
                                <Text variant="body" color="textPrimary">Time: {selectedBrew.timeSeconds}s</Text>
                                <Text variant="body" color="textPrimary">Ratio: 1:{Math.round(selectedBrew.doseOut / selectedBrew.doseIn)}</Text>
                            </Box>
                            <Text variant="body" color="textPrimary" marginTop="xs">Taste: {selectedBrew.score.tasteNotes.join(', ') || 'None'}</Text>
                        </Box>

                        <Text variant="subheader" fontSize={18} marginBottom="s">Your Goal</Text>
                        <TextInput
                            style={{
                                backgroundColor: theme.colors.cardPrimaryBackground,
                                color: theme.colors.textPrimary,
                                padding: theme.spacing.m,
                                borderRadius: 8,
                                marginBottom: theme.spacing.m,
                            }}
                            placeholder="e.g. More sweetness, less acidity..."
                            placeholderTextColor={theme.colors.textSecondary}
                            value={goal}
                            onChangeText={setGoal}
                        />

                        <Button
                            label={loading ? "Analyzing..." : "Get AI Advice"}
                            onPress={getAdvice}
                            variant="primary"
                        />
                    </Box>
                )}

                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 }}>
                        <Box backgroundColor="mainBackground" borderRadius={12} maxHeight="80%" padding="m">
                            <Text variant="subheader" marginBottom="m">Select a Brew</Text>
                            <FlatList
                                data={allBrews}
                                keyExtractor={(item) => item.id!.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setSelectedBrew(item);
                                            setModalVisible(false);
                                            setAdvice(''); // Clear old advice
                                        }}
                                        style={{
                                            padding: 16,
                                            borderBottomWidth: 1,
                                            borderBottomColor: theme.colors.surface,
                                            backgroundColor: selectedBrew?.id === item.id ? theme.colors.cardPrimaryBackground : 'transparent'
                                        }}
                                    >
                                        <Text variant="body" color="textPrimary" fontWeight="bold">
                                            {coffees[item.coffeeId!]?.name || 'Unknown Coffee'}
                                        </Text>
                                        <Text variant="caption" color="textSecondary">
                                            {new Date(item.date).toLocaleString()}
                                        </Text>

                                    </TouchableOpacity>
                                )}
                            />
                            <Button label="Close" onPress={() => setModalVisible(false)} variant="outline" />
                        </Box>
                    </View>
                </Modal>

                {loading && <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />}

                {advice ? (
                    <Box backgroundColor="surface" padding="m" borderRadius={8} marginTop="m">
                        <Text variant="subheader" fontSize={20} color="primary" marginBottom="s">Suggestion</Text>
                        <Markdown
                            style={{
                                body: { color: theme.colors.textPrimary, fontSize: 16, lineHeight: 24 },
                                heading1: { color: theme.colors.primary, marginVertical: 10 },
                                list_item: { marginVertical: 5 },
                            }}
                        >
                            {advice}
                        </Markdown>
                    </Box>
                ) : null}
            </ScrollView>
        </Box>
    );
}
