import React from 'react';
import { Pressable } from 'react-native';
import { Box, Text } from '../theme';

interface BodySelectorProps {
    value: number; // 0, 1, 2
    onChange: (value: number) => void;
}

const ZONES = [
    {
        id: 0,
        label: 'LIGHT', // LEICHT
        color: '#ADD8E6', // Light Blue
        descriptors: ['WATERY', 'TEA-LIKE', 'SILKY', 'JUICY'],
    },
    {
        id: 1,
        label: 'MEDIUM', // MEDIUM
        color: '#FFD700', // Gold/Orange
        descriptors: ['SMOOTH', 'SYRUPY', 'ROUND', 'CREAMY'],
    },
    {
        id: 2,
        label: 'HEAVY', // SCHWER
        color: '#D32F2F', // Strong Red
        descriptors: ['FULL', 'VELVETY', 'CHEWY', 'COATING'],
    },
];

export const BodySelector: React.FC<BodySelectorProps> = ({ value, onChange }) => {
    return (
        <Box flexDirection="row" height={200} borderRadius={12} overflow="hidden">
            {ZONES.map((zone) => {
                const isActive = value === zone.id;
                return (
                    <Pressable
                        key={zone.id}
                        style={{ flex: 1 }}
                        onPress={() => onChange(zone.id)}
                    >
                        <Box
                            flex={1}
                            backgroundColor={isActive ? 'cardPrimaryBackground' : 'transparent'}
                            style={{ backgroundColor: isActive ? zone.color : `${zone.color}80` }}
                            justifyContent="center"
                            alignItems="center"
                            borderRightWidth={zone.id < 2 ? 1 : 0}
                            borderColor="mainBackground"
                        >
                            <Text
                                variant="subheader"
                                fontSize={16}
                                color={isActive ? 'black' : 'textSecondary'}
                                fontWeight="bold"
                                style={{ transform: [{ rotate: '-90deg' }], width: 120, textAlign: 'center' }}
                            >
                                {zone.label}
                            </Text>
                            <Box marginTop="l">
                                {zone.descriptors.map((desc) => (
                                    <Text
                                        key={desc}
                                        variant="caption"
                                        color={isActive ? 'black' : 'textSecondary'}
                                        fontSize={10}
                                        textAlign="center"
                                        style={{ transform: [{ rotate: '-90deg' }], marginVertical: 2 }}
                                    >
                                        {desc}
                                    </Text>
                                ))}
                            </Box>
                        </Box>
                    </Pressable>
                );
            })}
        </Box>
    );
};
