import { createTheme, createBox, createText, useTheme as useRestyleTheme } from '@shopify/restyle';

const palette = {
    onyx: '#121212',
    slate: '#1E1E1E',
    cloud: '#E0E0E0',
    rust: '#8D4E32',
    bronze: '#CD7F32',
    sage: '#8F9779',
    paper: '#F5F5F0',
    charcoal: '#36454F',

    // Functional
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    error: '#FF453A',
};

const theme = createTheme({
    colors: {
        mainBackground: palette.onyx,
        cardPrimaryBackground: palette.slate,
        textPrimary: palette.white,
        textSecondary: palette.cloud,
        primary: palette.rust,
        secondary: palette.bronze,
        surface: palette.charcoal,
        accent: palette.sage,
        error: palette.error,
        transparent: palette.transparent,
        black: palette.black,
        white: palette.white,
        overlayBackground: 'rgba(0,0,0,0.5)',
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
            fontWeight: 'bold',
            fontSize: 34,
            color: 'textPrimary',
        },
        subheader: {
            fontWeight: '600',
            fontSize: 28,
            color: 'textSecondary',
        },
        body: {
            fontSize: 16,
            lineHeight: 24,
            color: 'textPrimary',
        },
        caption: {
            fontSize: 12,
            color: 'textSecondary',
        },
        defaults: {
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
