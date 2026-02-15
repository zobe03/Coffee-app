import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@shopify/restyle';
import theme from '../src/presentation/theme';
import { useColorScheme } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { databaseService } from '../src/domain/services/DatabaseService';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [dbInitialized, setDbInitialized] = useState(false);
    const [dbError, setDbError] = useState<Error | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                await databaseService.initialize();
            } catch (e) {
                console.error("DB Init Failed", e);
                setDbError(e as Error);
            } finally {
                setDbInitialized(true);
            }
        };
        init();
    }, []);

    if (!dbInitialized) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.colors.mainBackground, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (dbError) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.colors.mainBackground, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Text style={{ color: theme.colors.error, fontSize: 18, marginBottom: 10 }}>Database Initialization Failed</Text>
                <Text style={{ color: theme.colors.textSecondary, marginBottom: 20 }}>{dbError.message}</Text>
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider theme={theme}>
                <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                    <Stack
                        screenOptions={{
                            headerStyle: {
                                backgroundColor: theme.colors.mainBackground,
                            },
                            headerTintColor: theme.colors.textPrimary,
                            contentStyle: {
                                backgroundColor: theme.colors.mainBackground,
                            },
                        }}
                    >
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    </Stack>
                    <StatusBar style="light" />
                </NavigationThemeProvider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}
