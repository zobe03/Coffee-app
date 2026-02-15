import React, { useEffect, useState, useCallback } from 'react';
import { Box, Text, useTheme } from '../../src/presentation/theme';
import { RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { BrewRepository } from '../../src/data/repositories/BrewRepository';
import { BrewLog } from '../../src/domain/entities/BrewLog';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { databaseService } from '../../src/domain/services/DatabaseService';
import { Button } from '../../src/presentation/components/Button';
import { SyntheticDataFactory } from '../../src/domain/services/SyntheticDataFactory';

export default function DashboardScreen() {
    const theme = useTheme();
    const router = useRouter();
    const [lastBrew, setLastBrew] = useState<BrewLog | null>(null);
    const [totalBrews, setTotalBrews] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const init = async () => {
            // Ensure DB is ready
            try {
                await databaseService.initialize();
            } catch (e) { console.error(e); }
        };
        init();
    }, []);

    const loadData = async () => {
        const repo = new BrewRepository();
        const all = await repo.getAll();
        setTotalBrews(all.length);
        if (all.length > 0) {
            // Sort by ID desc or date desc
            all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setLastBrew(all[0]);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const generateData = async () => {
        const factory = new SyntheticDataFactory();
        await factory.generateEssentialData();
        alert('Data Generated!');
        loadData();
    };

    return (
        <Box flex={1} backgroundColor="mainBackground">
            <ScrollView
                contentContainerStyle={{ padding: theme.spacing.m }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
            >
                <Box marginBottom="l" paddingTop="m">
                    <Text variant="header" fontSize={28} color="primary" opacity={0.9}>BrewRef</Text>
                    <Text variant="body" color="textSecondary">Your Coffee Journey</Text>
                </Box>

                <Box flexDirection="row" gap="m" marginBottom="l">
                    <Box flex={1} backgroundColor="cardPrimaryBackground" padding="m" borderRadius={12} alignItems="center">
                        <MaterialCommunityIcons name="coffee" size={32} color={theme.colors.primary} />
                        <Text variant="subheader" fontSize={24} marginTop="s">{totalBrews}</Text>
                        <Text variant="caption" color="textSecondary">Total Brews</Text>
                    </Box>
                </Box>

                <Text variant="subheader" marginBottom="m">Last Brew</Text>
                {lastBrew ? (
                    <Box backgroundColor="cardPrimaryBackground" padding="m" borderRadius={12} borderLeftWidth={4} borderLeftColor="primary" marginBottom="l">
                        <Text variant="body" color="textSecondary" marginBottom="xs">{new Date(lastBrew.date).toLocaleDateString()}</Text>
                        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Text variant="body" fontWeight="bold" fontSize={16}>{lastBrew.doseIn}g <Text fontWeight="normal" color="textSecondary" fontSize={14}>in</Text></Text>
                                <Text variant="body" fontWeight="bold" fontSize={16}>{lastBrew.doseOut}g <Text fontWeight="normal" color="textSecondary" fontSize={14}>out</Text></Text>
                            </Box>
                            <Box alignItems="flex-end">
                                <Text variant="body" fontWeight="bold" fontSize={16}>{lastBrew.timeSeconds}s</Text>

                            </Box>
                        </Box>
                    </Box>
                ) : (
                    <Box backgroundColor="cardPrimaryBackground" padding="m" borderRadius={12} alignItems="center" marginBottom="l">
                        <Text variant="body" color="textSecondary">No brews yet. Start logging!</Text>
                    </Box>
                )}



            </ScrollView>
        </Box>
    );
}
