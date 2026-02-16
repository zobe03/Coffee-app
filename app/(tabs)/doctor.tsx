import React, { useCallback, useState } from 'react';
import { Modal, FlatList, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, View, Alert, Platform } from 'react-native';
import { Box, Text, useTheme } from '../../src/presentation/theme';
import { Button } from '../../src/presentation/components/Button';
import { Stack, useFocusEffect } from 'expo-router';
import { databaseService } from '../../src/domain/services/DatabaseService';
import { aiService, AdviceContext } from '../../src/domain/services/AIService';
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

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

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

    const bodyLabel = (body: number) => body === 0 ? 'Light' : body === 1 ? 'Medium' : 'Heavy';

    const getAdvice = async () => {
        if (!selectedBrew) return;
        setLoading(true);
        setAdvice('');

        const brewRepo = new BrewRepository();
        const history = await brewRepo.getAll();

        const context: AdviceContext = {
            coffee: selectedBrew.coffeeId ? coffees[selectedBrew.coffeeId] : undefined,
            grinder: selectedBrew.grinderId ? grinders[selectedBrew.grinderId] : undefined,
            allCoffees: coffees,
            allGrinders: grinders,
        };

        const result = await aiService.getAdvice(
            selectedBrew,
            history,
            goal,
            context
        );
        setAdvice(result);
        setLoading(false);
    };

    const handleGenerateData = async () => {
        setLoading(true);
        try {
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
                    <Box height={10} />
                    <Button
                        label="Nuke Data (Clear All)"
                        onPress={() => {
                            const nukeAllData = async () => {
                                await databaseService.nukeAllData();
                                setSelectedBrew(null);
                                setAllBrews([]);
                                setAdvice('');
                                loadData();
                            };

                            if (Platform.OS === 'web') {
                                if (confirm('Are you sure? This will delete all data.')) {
                                    nukeAllData();
                                }
                            } else {
                                Alert.alert(
                                    'Nuke Data',
                                    'Are you sure? This will delete all data.',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        { text: 'Delete All', style: 'destructive', onPress: nukeAllData },
                                    ]
                                );
                            }
                        }}
                        variant="outline"
                    />
                </Box>

                {!selectedBrew ? (
                    <Box backgroundColor="cardPrimaryBackground" padding="l" borderRadius={12} alignItems="center">
                        <Text variant="body" color="textSecondary" textAlign="center">No brews found. Log a brew to get advice!</Text>
                    </Box>
                ) : (
                    <Box marginBottom="l">
                        <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="s">
                            <Text variant="subheader" fontSize={18}>Selected Brew</Text>
                            <TouchableOpacity onPress={() => setModalVisible(true)} style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 }}>
                                <Text color="textPrimary" variant="caption" fontWeight="bold">Change Brew</Text>
                            </TouchableOpacity>
                        </Box>

                        <Box backgroundColor="cardPrimaryBackground" padding="m" borderRadius={12} marginBottom="m">
                            {/* Header: Coffee + Date */}
                            <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start" marginBottom="s">
                                <Box flex={1}>
                                    <Text variant="body" color="primary" fontWeight="bold" fontSize={18}>
                                        {coffees[selectedBrew.coffeeId!]?.name || 'Unknown Coffee'}
                                    </Text>
                                    <Text variant="caption" color="textSecondary">
                                        {coffees[selectedBrew.coffeeId!]?.roastery || ''}
                                        {coffees[selectedBrew.coffeeId!]?.origin ? ` · ${coffees[selectedBrew.coffeeId!]?.origin}` : ''}
                                    </Text>
                                </Box>
                                <Text variant="caption" color="textSecondary">{new Date(selectedBrew.date).toLocaleDateString()}</Text>
                            </Box>

                            {/* Equipment */}
                            <Text variant="caption" color="textSecondary" marginBottom="s">
                                🔧 {grinders[selectedBrew.grinderId!]?.brand} {grinders[selectedBrew.grinderId!]?.model || 'Unknown Grinder'}
                                {selectedBrew.grindSetting ? ` · Grind: ${selectedBrew.grindSetting}` : ''}
                            </Text>

                            <Box height={1} backgroundColor="surface" marginBottom="s" />

                            {/* Recipe Row */}
                            <Box flexDirection="row" justifyContent="space-around" marginBottom="s">
                                <Box alignItems="center">
                                    <Text variant="caption" color="textSecondary">Dose In</Text>
                                    <Text variant="body" fontWeight="bold" color="textPrimary">{selectedBrew.doseIn}g</Text>
                                </Box>
                                <Box alignItems="center">
                                    <Text variant="caption" color="textSecondary">Dose Out</Text>
                                    <Text variant="body" fontWeight="bold" color="textPrimary">{selectedBrew.doseOut}g</Text>
                                </Box>
                                <Box alignItems="center">
                                    <Text variant="caption" color="textSecondary">Time</Text>
                                    <Text variant="body" fontWeight="bold" color="textPrimary">{selectedBrew.timeSeconds}s</Text>
                                </Box>
                                <Box alignItems="center">
                                    <Text variant="caption" color="textSecondary">Ratio</Text>
                                    <Text variant="body" fontWeight="bold" color="primary">1:{selectedBrew.doseIn > 0 ? (selectedBrew.doseOut / selectedBrew.doseIn).toFixed(1) : '?'}</Text>
                                </Box>
                                {selectedBrew.temperature ? (
                                    <Box alignItems="center">
                                        <Text variant="caption" color="textSecondary">Temp</Text>
                                        <Text variant="body" fontWeight="bold" color="textPrimary">{selectedBrew.temperature}°C</Text>
                                    </Box>
                                ) : null}
                            </Box>

                            <Box height={1} backgroundColor="surface" marginBottom="s" />

                            {/* Taste Profile */}
                            <Box flexDirection="row" justifyContent="space-around" marginBottom="xs">
                                <Box alignItems="center">
                                    <Text variant="caption" color="textSecondary">Body</Text>
                                    <Text variant="body" fontWeight="bold" color="textPrimary">{bodyLabel(selectedBrew.score.body)}</Text>
                                </Box>
                                <Box alignItems="center">
                                    <Text variant="caption" color="textSecondary">Acidity</Text>
                                    <Text variant="body" fontWeight="bold" color="textPrimary">{selectedBrew.score.acidity}/10</Text>
                                </Box>
                                <Box alignItems="center">
                                    <Text variant="caption" color="textSecondary">Bitterness</Text>
                                    <Text variant="body" fontWeight="bold" color="textPrimary">{selectedBrew.score.bitterness}/10</Text>
                                </Box>
                            </Box>
                            {selectedBrew.score.tasteNotes.length > 0 && (
                                <Box flexDirection="row" flexWrap="wrap" gap="xs" marginTop="s">
                                    {selectedBrew.score.tasteNotes.map(note => (
                                        <Box key={note} backgroundColor="mainBackground" paddingHorizontal="s" paddingVertical="xs" borderRadius={12}>
                                            <Text variant="caption" color="primary">{note}</Text>
                                        </Box>
                                    ))}
                                </Box>
                            )}
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
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 }}>
                        <Box backgroundColor="mainBackground" borderRadius={16} maxHeight="80%" padding="m">
                            <Text variant="subheader" marginBottom="m">Select a Brew</Text>
                            <FlatList
                                data={allBrews}
                                keyExtractor={(item) => item.id!.toString()}
                                ItemSeparatorComponent={() => <Box height={1} backgroundColor="surface" />}
                                renderItem={({ item }) => {
                                    const isSelected = selectedBrew?.id === item.id;
                                    const coffeeName = coffees[item.coffeeId!]?.name || 'Unknown Coffee';
                                    const ratio = item.doseIn > 0 ? (item.doseOut / item.doseIn).toFixed(1) : '?';
                                    return (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setSelectedBrew(item);
                                                setModalVisible(false);
                                                setAdvice('');
                                            }}
                                            style={{
                                                padding: 14,
                                                backgroundColor: isSelected ? theme.colors.cardPrimaryBackground : 'transparent',
                                                borderLeftWidth: isSelected ? 3 : 0,
                                                borderLeftColor: theme.colors.primary,
                                            }}
                                        >
                                            <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                                                <Text variant="body" color={isSelected ? 'primary' : 'textPrimary'} fontWeight="bold">
                                                    {coffeeName}
                                                </Text>
                                                <Text variant="caption" color="textSecondary">
                                                    {new Date(item.date).toLocaleDateString()}
                                                </Text>
                                            </Box>
                                            <Text variant="caption" color="textSecondary" marginTop="xs">
                                                {item.doseIn}g → {item.doseOut}g in {item.timeSeconds}s · 1:{ratio}
                                                {item.score.tasteNotes.length > 0 ? ` · ${item.score.tasteNotes.slice(0, 2).join(', ')}` : ''}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                            <Box marginTop="m">
                                <Button label="Close" onPress={() => setModalVisible(false)} variant="outline" />
                            </Box>
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
