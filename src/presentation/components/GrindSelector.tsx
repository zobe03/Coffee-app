import React, { useRef, useState, useEffect } from 'react';
import { View, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent, StyleSheet, Platform } from 'react-native';
import { Box, Text, useTheme } from '../theme';
import * as Haptics from 'expo-haptics';

interface GrindSelectorProps {
    value: string;
    onChange: (value: string) => void;
    min?: number;
    max?: number;
    step?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TICK_WIDTH = 10; // Width of one tick area (space between ticks)
const TICK_HEIGHT_MAJOR = 30;
const TICK_HEIGHT_MINOR = 15;
const VISIBLE_ITEMS = 50; // Render optimization

export const GrindSelector: React.FC<GrindSelectorProps> = ({
    value,
    onChange,
    min = 0,
    max = 40,
    step = 0.1
}) => {
    const theme = useTheme();
    const scrollRef = useRef<ScrollView>(null);
    const [isScrolling, setIsScrolling] = useState(false);

    // Convert string value to number, default to middle if empty
    const numericValue = value ? parseFloat(value) : 15.0;

    const [containerWidth, setContainerWidth] = useState(SCREEN_WIDTH);

    // Calculate total ticks
    const totalTicks = Math.round((max - min) / step);

    // Padding to center the first and last items
    // Center of screen is containerWidth / 2.
    // We want tick 0 to be at center.
    // Padding to center the first and last items
    // We want the first tick (min) to be at the center of the screen when scrolled to 0.
    // We want the last tick (max) to be at the center of the screen when scrolled to end.
    const paddingHorizontal = containerWidth / 2 - TICK_WIDTH / 2;

    // Initial scroll position
    useEffect(() => {
        if (scrollRef.current && !isScrolling) {
            const initialOffset = (numericValue - min) / step * TICK_WIDTH;
            scrollRef.current.scrollTo({ x: initialOffset, animated: false });
        }
    }, []); // Only run once on mount or we might fight the user scrolling

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;

        // Calculate value from offset using index rounding to avoid float drift
        const index = Math.round(offsetX / TICK_WIDTH);
        let rawValue = min + index * step;

        // Clamp and snap
        rawValue = Math.max(min, Math.min(max, rawValue));

        // Ensure strictly snapped to step (e.g. 6.09999 -> 6.1)
        const formatValue = rawValue.toFixed(1);

        if (formatValue !== value) {
            onChange(formatValue);
            // Verify Haptics on web?
            if (Platform.OS !== 'web') {
                Haptics.selectionAsync();
            }
        }
    };

    const renderTicks = () => {
        const ticks = [];
        for (let i = 0; i <= totalTicks; i++) {
            const currentValue = min + i * step;
            const isMajor = Math.abs(currentValue % 1) < 0.001 || Math.abs(currentValue % 1 - 1) < 0.001; // Integer check safe for floats
            const isHalf = Math.abs(currentValue % 0.5) < 0.001;

            ticks.push(
                <View key={i} style={{ width: TICK_WIDTH, alignItems: 'center', justifyContent: 'flex-start' }}>
                    <Box
                        width={2}
                        height={isMajor ? TICK_HEIGHT_MAJOR : (isHalf ? 22 : TICK_HEIGHT_MINOR)}
                        backgroundColor={isMajor ? 'primary' : 'textSecondary'}
                        opacity={isMajor ? 1 : 0.5}
                        borderRadius={1}
                    />
                    {isMajor && (
                        <Text variant="caption" fontSize={10} color="textSecondary" style={{ position: 'absolute', top: 35, width: 40, textAlign: 'center' }}>
                            {currentValue.toFixed(0)}
                        </Text>
                    )}
                </View>
            );
        }
        return ticks;
    };

    return (
        <Box onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
            <Box alignItems="center" marginBottom="s">
                <Text variant="subheader" fontSize={32} color="primary" fontWeight="bold">
                    {value || "15.0"}
                </Text>
                <Text variant="caption" color="textSecondary">GRIND SIZE</Text>
            </Box>

            <Box height={80} justifyContent="center" style={{ position: 'relative' }}>
                {/* Center Indicator Line */}
                <View style={[styles.centerLine, { left: '50%', marginLeft: -1, backgroundColor: theme.colors.primary }]} />

                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    scrollEventThrottle={16}
                    decelerationRate="fast"
                    snapToInterval={TICK_WIDTH}
                    onScroll={handleScroll}
                    onScrollBeginDrag={() => setIsScrolling(true)}
                    onMomentumScrollEnd={() => setIsScrolling(false)}
                    contentContainerStyle={{
                        paddingHorizontal: paddingHorizontal,
                        height: 80,
                        alignItems: 'center'
                    }}
                >
                    {renderTicks()}
                </ScrollView>
            </Box>
        </Box>
    );
};

const styles = StyleSheet.create({
    centerLine: {
        position: 'absolute',
        top: 10,
        bottom: 10,
        width: 2,
        zIndex: 10,
        height: 60,
        pointerEvents: 'none' // Ensure clicks pass through on web
    }
});

