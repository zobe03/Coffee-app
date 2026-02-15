import React, { useState } from 'react';
import Svg, { G, Path, Text as SvgText, Circle } from 'react-native-svg';
import { View, Dimensions, TouchableOpacity } from 'react-native';
import { Box, Text, useTheme } from '../theme';

interface TasteWheelProps {
    onNotesChange: (notes: string[]) => void;
    selectedNotes: string[];
}

// Simplified data structure for the wheel
const WHEEL_DATA = [
    { label: 'FRUITY', color: '#D87093', sub: ['STONE FRUIT', 'BERRY', 'TROPICAL', 'CITRUS', 'DRIED FRUIT'] }, // Fruits - DarkRosa
    { label: 'CHOCOLATE', color: '#8B4513', sub: [] }, // Chocolate - Braun
    { label: 'NUTTY', color: '#DAA520', sub: [] }, // Nutty - Ockergelb
    { label: 'SWEET', color: '#FFA500', sub: ['SYRUP', 'CARAMEL', 'MARSHMALLOW', 'CREAM', 'HONEY', 'VANILLA'] }, // Sweet - Orange
    { label: 'FLORAL', color: '#FFB6C1', sub: [] }, // Floral - Hellrosa
];

const RADIUS = 150;
const INNER_RADIUS = 60;
const CENTER = { x: RADIUS, y: RADIUS };

export const TasteWheel: React.FC<TasteWheelProps> = ({ onNotesChange, selectedNotes }) => {
    const theme = useTheme();

    const toggleNote = (note: string) => {
        if (selectedNotes.includes(note)) {
            onNotesChange(selectedNotes.filter(n => n !== note));
        } else {
            onNotesChange([...selectedNotes, note]);
        }
    };

    // Helper to create arc path
    const createArc = (startAngle: number, endAngle: number, innerR: number, outerR: number) => {
        const start = polarToCartesian(CENTER.x, CENTER.y, outerR, endAngle);
        const end = polarToCartesian(CENTER.x, CENTER.y, outerR, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        const start2 = polarToCartesian(CENTER.x, CENTER.y, innerR, endAngle);
        const end2 = polarToCartesian(CENTER.x, CENTER.y, innerR, startAngle);

        return [
            "M", start.x, start.y,
            "A", outerR, outerR, 0, largeArcFlag, 0, end.x, end.y,
            "L", end2.x, end2.y,
            "A", innerR, innerR, 0, largeArcFlag, 1, start2.x, start2.y,
            "Z"
        ].join(" ");
    };

    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    };

    // Render logic
    let currentAngle = 0;
    const totalWeight = WHEEL_DATA.reduce((acc, item) => acc + (item.sub.length || 1), 0); // basic weighting
    // Actually, let's just split equally for main categories to simplify
    const anglePerCategory = 360 / WHEEL_DATA.length;

    return (
        <Box alignItems="center" marginBottom="l">
            <Text variant="subheader" marginBottom="m">Taste Profile</Text>
            <Svg height={RADIUS * 2} width={RADIUS * 2}>
                {WHEEL_DATA.map((category, index) => {
                    const startAngle = index * anglePerCategory;
                    const endAngle = (index + 1) * anglePerCategory;
                    const isSelected = selectedNotes.includes(category.label);

                    const midAngle = (startAngle + endAngle) / 2;
                    // Calculate text position
                    const textPos = polarToCartesian(CENTER.x, CENTER.y, RADIUS * 0.8, midAngle);

                    return (
                        <G key={category.label} onPress={() => toggleNote(category.label)}>
                            <Path
                                d={createArc(startAngle, endAngle, INNER_RADIUS, category.sub.length > 0 ? RADIUS * 0.6 : RADIUS)}
                                fill={category.color}
                                opacity={isSelected ? 1 : 0.7}
                                stroke={theme.colors.mainBackground}
                                strokeWidth="2"
                            />
                            {/* Category Label */}
                            <SvgText pointerEvents="none"
                                x={textPos.x}
                                y={textPos.y}
                                textAnchor="middle"
                                alignmentBaseline="middle"
                                fill="white"
                                fontSize="10"
                                fontWeight="bold"
                                transform={`rotate(${midAngle - 90}, ${textPos.x}, ${textPos.y})`}
                            >
                                {category.label}
                            </SvgText>

                            {/* Outer Ring for subcategories */}
                            {category.sub.length > 0 && category.sub.map((sub, subIndex) => {
                                const subAngleStep = (endAngle - startAngle) / category.sub.length;
                                const subStart = startAngle + (subIndex * subAngleStep);
                                const subEnd = subStart + subAngleStep;
                                const isSubSelected = selectedNotes.includes(sub);

                                return (
                                    <Path
                                        key={sub}
                                        d={createArc(subStart, subEnd, RADIUS * 0.6, RADIUS)}
                                        fill={category.color}
                                        opacity={isSubSelected ? 1 : 0.5}
                                        stroke={theme.colors.mainBackground}
                                        strokeWidth="1"
                                        onPress={() => toggleNote(sub)}
                                    />
                                );
                            })}
                        </G>
                    );
                })}
                <Circle cx={CENTER.x} cy={CENTER.y} r={INNER_RADIUS} fill={theme.colors.mainBackground} />
                <SvgText pointerEvents="none"
                    x={CENTER.x}
                    y={CENTER.y}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fill={theme.colors.textPrimary}
                    fontSize="14"
                    fontWeight="bold"
                >
                    TAP TO SELECT
                </SvgText>
            </Svg>
            <Box flexDirection="row" flexWrap="wrap" gap="s" marginTop="m" justifyContent="center">
                {selectedNotes.map(note => (
                    <Box key={note} backgroundColor="primary" paddingHorizontal="m" paddingVertical="s" borderRadius={16}>
                        <Text variant="caption" color="white">{note}</Text>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};
