import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@shopify/restyle';
import theme from '../src/presentation/theme';
import { useColorScheme } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { databaseService } from '../src/domain/services/DatabaseService';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, Platform } from 'react-native';

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
                    {/* Web Container Wrapper */}
                    <View style={{ flex: 1, backgroundColor: Platform.OS === 'web' ? '#121212' : theme.colors.mainBackground, alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{
                            flex: 1,
                            width: '100%',
                            maxWidth: Platform.OS === 'web' ? 500 : '100%', // Reduced width slightly for better proportion
                            maxHeight: Platform.OS === 'web' ? '95%' : '100%', // Simulate phone height on large screens
                            backgroundColor: theme.colors.mainBackground,
                            borderRadius: Platform.OS === 'web' ? 20 : 0, // Rounded corners for "Phone" look
                            overflow: 'hidden', // Clip content to rounded corners
                            // Add shadow/border on web
                            ...(Platform.OS === 'web' ? {
                                borderWidth: 1,
                                borderColor: '#333',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 10 },
                                shadowOpacity: 0.5,
                                shadowRadius: 20,
                                paddingBottom: 0, // No extra padding for sleek look
                            } : {})
                        }}>
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
                        </View>
                    </View>
                    <StatusBar style="light" />
                </NavigationThemeProvider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}
