import React, { useEffect, useState } from 'react';
import { ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { Box, Text, useTheme } from '../../src/presentation/theme';
import { Button } from '../../src/presentation/components/Button';
import { Stack } from 'expo-router';
import { aiService } from '../../src/domain/services/AIService';
import { BrewRepository } from '../../src/data/repositories/BrewRepository';
import { BrewLog } from '../../src/domain/entities/BrewLog';
import { generateMockData } from '../../src/utils/mockData';
import Markdown from 'react-native-markdown-display';

export default function AdvisorScreen() {
    const theme = useTheme();
    const [advice, setAdvice] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [lastBrew, setLastBrew] = useState<BrewLog | null>(null);
    const [goal, setGoal] = useState('');

    useEffect(() => {
        loadLastBrew();
    }, []);

    const loadLastBrew = async () => {
        const repo = new BrewRepository();
        const brews = await repo.getAll();
        if (brews.length > 0) {
            setLastBrew(brews[brews.length - 1]);
        }
    };

    const getAdvice = async () => {
        if (!lastBrew) return;
        setLoading(true);
        setAdvice('');

        // In a real app, we'd pass history too (mocking fetching history here if needed)
        // For now, pass empty history or maybe fetch last 5
        const repo = new BrewRepository();
        const history = await repo.getAll(); // Getting all might be too much for prompt, usually slice

        const result = await aiService.getAdvice(lastBrew, history.slice(-5), goal);
        setAdvice(result);
        setLoading(false);
    };

    const handleGenerateData = async () => {
        setLoading(true);
        try {
            await generateMockData(50);
            alert('Generated 50 mock brews!');
            loadLastBrew();
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

                {!lastBrew ? (
                    <Text variant="body" color="textSecondary">No brews found. Log a brew to get advice!</Text>
                ) : (
                    <Box marginBottom="l">
                        <Text variant="subheader" fontSize={18} marginBottom="s">Last Brew Analysis</Text>
                        <Box backgroundColor="cardPrimaryBackground" padding="m" borderRadius={8} marginBottom="m">
                            <Text variant="body" color="textPrimary">Time: {lastBrew.timeSeconds}s</Text>
                            <Text variant="body" color="textPrimary">Ratio: 1:{Math.round(lastBrew.doseOut / lastBrew.doseIn)}</Text>
                            <Text variant="body" color="textPrimary">Taste: {lastBrew.score.tasteNotes.join(', ') || 'None'}</Text>
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
