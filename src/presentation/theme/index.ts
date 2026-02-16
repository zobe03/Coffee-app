import { createTheme, createBox, createText, useTheme as useRestyleTheme } from '@shopify/restyle';

const palette = {
    // Backgrounds — spaced for clear layering
    onyx: '#0E0E0E',       // deepest background
    graphite: '#1A1A1A',   // card background — more contrast from onyx
    iron: '#2C2C2C',       // surface/elevated elements

    // Text
    cream: '#F5F0EB',      // primary text — warm white
    mist: '#9E9E9E',       // secondary text — clearly dimmer

    // Accent — coffee-toned, brightened for visibility
    espresso: '#D4943A',   // primary — warm amber, golden not brown
    bronze: '#DBA04D',     // secondary — bright gold
    sage: '#8F9779',       // accent — earthy green

    // Functional
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    error: '#FF453A',
    success: '#4CAF50',
};

const theme = createTheme({
    colors: {
        mainBackground: palette.onyx,
        cardPrimaryBackground: palette.graphite,
        textPrimary: palette.cream,
        textSecondary: palette.mist,
        primary: palette.espresso,
        secondary: palette.bronze,
        surface: palette.iron,
        accent: palette.sage,
        error: palette.error,
        success: palette.success,
        transparent: palette.transparent,
        black: palette.black,
        white: palette.white,
        overlayBackground: 'rgba(0,0,0,0.6)',
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 40,
    },
    textVariants: {
        header: {
            fontFamily: 'Inter_700Bold',
            fontWeight: 'bold',
            fontSize: 34,
            color: 'textPrimary',
        },
        subheader: {
            fontFamily: 'Inter_600SemiBold',
            fontWeight: '600',
            fontSize: 28,
            color: 'textSecondary',
        },
        body: {
            fontFamily: 'Inter_400Regular',
            fontSize: 16,
            lineHeight: 24,
            color: 'textPrimary',
        },
        caption: {
            fontFamily: 'Inter_400Regular',
            fontSize: 12,
            color: 'textSecondary',
        },
        mono: {
            fontFamily: 'JetBrainsMono_400Regular',
            fontSize: 16,
            color: 'textPrimary',
        },
        defaults: {
            fontFamily: 'Inter_400Regular',
            fontSize: 16,
            color: 'textPrimary',
        },
    },
    breakpoints: {
        phone: 0,
        tablet: 768,
    },
});

export type Theme = typeof theme;
export const Box = createBox<Theme>();
export const Text = createText<Theme>();
export const useTheme = () => useRestyleTheme<Theme>();

export default theme;
