import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Box, Text, Theme } from '../theme';
import { useTheme } from '@shopify/restyle';

interface ButtonProps {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ label, onPress, variant = 'primary' }) => {
    const theme = useTheme<Theme>();

    const bg = variant === 'primary' ? 'primary' : variant === 'secondary' ? 'secondary' : 'transparent';
    const textColor = variant === 'outline' ? 'primary' : 'textPrimary';
    const border = variant === 'outline' ? 1 : 0;

    return (
        <TouchableOpacity onPress={onPress}>
            <Box
                backgroundColor={bg}
                paddingVertical="m"
                paddingHorizontal="l"
                borderRadius={8}
                borderWidth={border}
                borderColor="primary"
                alignItems="center"
                justifyContent="center"
            >
                <Text variant="body" fontWeight="bold" color={textColor}>
                    {label}
                </Text>
            </Box>
        </TouchableOpacity>
    );
};
