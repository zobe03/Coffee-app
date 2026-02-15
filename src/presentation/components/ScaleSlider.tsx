import React from 'react';
import { View } from 'react-native';
import { Box, Text, useTheme } from '../theme';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';

interface ScaleSliderProps {
    label: string;
    value: number; // 0-10
    onChange: (value: number) => void;
    gradientColors: readonly [string, string, ...string[]];
}

export const ScaleSlider: React.FC<ScaleSliderProps> = ({ label, value, onChange, gradientColors }) => {
    const theme = useTheme();

    return (
        <Box marginBottom="l">
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="s">
                <Text variant="subheader" fontSize={16}>{label}</Text>
                <Text variant="body" fontWeight="bold">{value.toFixed(1)}</Text>
            </Box>
            <Box height={10} borderRadius={5} overflow="hidden">
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                />
            </Box>
            <Slider
                style={{ width: '100%', height: 40, marginTop: -25, zIndex: 1 }}
                minimumValue={0}
                maximumValue={10}
                step={0.1}
                value={value}
                onValueChange={onChange}
                minimumTrackTintColor="transparent"
                maximumTrackTintColor="transparent"
                thumbTintColor={theme.colors.textPrimary}
            />
            <Box flexDirection="row" justifyContent="space-between" paddingHorizontal="s">
                {[0, 2, 4, 6, 8, 10].map((v) => (
                    <Text key={v} variant="caption" color="textSecondary">{v}</Text>
                ))}
            </Box>
        </Box>
    );
};
