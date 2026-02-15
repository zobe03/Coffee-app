import React, { useEffect, useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { Box, Text, useTheme } from '../../src/presentation/theme';
import { BrewRepository } from '../../src/data/repositories/BrewRepository';
import { BrewLog } from '../../src/domain/entities/BrewLog';
import { CoffeeRepository } from '../../src/data/repositories/CoffeeRepository';
import { Coffee } from '../../src/domain/entities/Coffee';
import { useFocusEffect } from 'expo-router';

export default function HistoryScreen() {
    const theme = useTheme();
    const [brews, setBrews] = useState<BrewLog[]>([]);
    const [coffees, setCoffees] = useState<Record<number, Coffee>>({});
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        const brewRepo = new BrewRepository();
        const allBrews = await brewRepo.getAll();
        // Sort by date descending
        allBrews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setBrews(allBrews);

        const coffeeRepo = new CoffeeRepository();
        const allCoffees = await coffeeRepo.getAll();
        const coffeeMap: Record<number, Coffee> = {};
        allCoffees.forEach(c => coffeeMap[c.id!] = c);
        setCoffees(coffeeMap);
    };

    useFocusEffect(
        React.useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    return (
        <Box flex={1} backgroundColor="mainBackground">
            <ScrollView
                contentContainerStyle={{ padding: theme.spacing.m }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
            >
                {brews.length === 0 ? (
                    <Box padding="xl" alignItems="center">
                        <Text variant="body" color="textSecondary">No brews logged yet.</Text>
                    </Box>
                ) : (
                    brews.map((brew) => (
                        <Box
                            key={brew.id}
                            backgroundColor="cardPrimaryBackground"
                            padding="m"
                            borderRadius={12}
                            marginBottom="m"
                            borderLeftWidth={4}
                            borderLeftColor="primary"
                        >
                            <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="s">
                                <Text variant="subheader" fontSize={16} color="textPrimary">
                                    {coffees[brew.coffeeId]?.name || 'Unknown Coffee'}
                                </Text>
                                <Text variant="caption" color="textSecondary">
                                    {new Date(brew.date).toLocaleDateString()}
                                </Text>
                            </Box>

                            <Box flexDirection="row" gap="m" marginBottom="s">
                                <Text variant="body" fontSize={14}>
                                    in: <Text variant="body" color="primary" fontWeight="bold">{brew.doseIn}g</Text>
                                </Text>
                                <Text variant="body" fontSize={14}>
                                    out: <Text variant="body" color="primary" fontWeight="bold">{brew.doseOut}g</Text>
                                </Text>
                                <Text variant="body" fontSize={14}>
                                    time: <Text variant="body" color="primary" fontWeight="bold">{brew.timeSeconds}s</Text>
                                </Text>
                            </Box>

                            {brew.score && (
                                <Box flexDirection="row" gap="s" flexWrap="wrap">
                                    {brew.score.tasteNotes?.map((note, idx) => (
                                        <Box key={idx} backgroundColor="mainBackground" paddingHorizontal="s" paddingVertical="xs" borderRadius={4}>
                                            <Text variant="caption" fontSize={10} color="textSecondary">{note}</Text>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    ))
                )}
            </ScrollView>
        </Box>
    );
}
