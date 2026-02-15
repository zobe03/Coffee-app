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
    { label: 'SWEET', color: '#FFA500', sub: ['SYRUP', 'CARAMEL', 'CREAM', 'HONEY', 'VANILLA'] }, // Sweet - Orange
    { label: 'FLORAL', color: '#FFB6C1', sub: [] }, // Floral - Hellrosa
];

const RADIUS = 150;
const INNER_RADIUS = 60;
const CENTER = { x: RADIUS, y: RADIUS };

export const TasteWheel: React.FC<TasteWheelProps> = ({ onNotesChange, selectedNotes }) => {
    const theme = useTheme();
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const toggleNote = (note: string) => {
        if (selectedNotes.includes(note)) {
            onNotesChange(selectedNotes.filter(n => n !== note));
        } else {
            onNotesChange([...selectedNotes, note]);
        }
    };

    const handleCategoryPress = (category: typeof WHEEL_DATA[0]) => {
        if (category.sub.length === 0) {
            toggleNote(category.label);
        } else {
            if (activeCategory === category.label) {
                setActiveCategory(null);
            } else {
                setActiveCategory(category.label);
            }
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
    const anglePerCategory = 360 / WHEEL_DATA.length;

    return (
        <Box alignItems="center" marginBottom="l">
            <Text variant="subheader" marginBottom="m">Taste Profile</Text>
            <Svg height={RADIUS * 2} width={RADIUS * 2}>
                {WHEEL_DATA.map((category, index) => {
                    const startAngle = index * anglePerCategory;
                    const endAngle = (index + 1) * anglePerCategory;
                    const isSelected = selectedNotes.includes(category.label);
                    const isActive = activeCategory === category.label;
                    const hasSubs = category.sub.length > 0;

                    // If active and has subs, shrink main arc to make room
                    const outerRadius = (isActive && hasSubs) ? RADIUS * 0.6 : RADIUS;

                    const midAngle = (startAngle + endAngle) / 2;
                    const textRadius = (INNER_RADIUS + outerRadius) / 2;
                    const textPos = polarToCartesian(CENTER.x, CENTER.y, textRadius, midAngle);
                    const rotation = midAngle > 180 ? midAngle + 90 : midAngle - 90;

                    return (
                        <G key={category.label}>
                            <Path
                                onPress={() => handleCategoryPress(category)}
                                onLongPress={() => toggleNote(category.label)}
                                d={createArc(startAngle, endAngle, INNER_RADIUS, outerRadius)}
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
                                opacity={isActive && hasSubs ? 0 : 1}
                                transform={`rotate(${rotation}, ${textPos.x}, ${textPos.y})`}
                            >
                                {category.label}
                            </SvgText>

                            {/* Outer Ring for subcategories - Only show if Active */}
                            {isActive && hasSubs && category.sub.map((sub, subIndex) => {
                                const subAngleStep = (endAngle - startAngle) / category.sub.length;
                                const subStart = startAngle + (subIndex * subAngleStep);
                                const subEnd = subStart + subAngleStep;
                                const subMid = (subStart + subEnd) / 2;
                                const isSubSelected = selectedNotes.includes(sub);

                                const subTextRadius = (RADIUS * 0.6 + RADIUS) / 2;
                                const subTextPos = polarToCartesian(CENTER.x, CENTER.y, subTextRadius, subMid);
                                const subRotation = subMid > 180 ? subMid + 90 : subMid - 90;

                                return (
                                    <G key={sub}>
                                        <Path
                                            d={createArc(subStart, subEnd, RADIUS * 0.6, RADIUS)}
                                            fill={category.color}
                                            opacity={isSubSelected ? 1 : 0.5}
                                            stroke={theme.colors.mainBackground}
                                            strokeWidth="1"
                                            onPress={() => toggleNote(sub)}
                                        />
                                        <SvgText pointerEvents="none"
                                            x={subTextPos.x}
                                            y={subTextPos.y}
                                            textAnchor="middle"
                                            alignmentBaseline="middle"
                                            fill="white"
                                            fontSize="8"
                                            fontWeight="bold"
                                            transform={`rotate(${subRotation}, ${subTextPos.x}, ${subTextPos.y})`}
                                        >
                                            {sub}
                                        </SvgText>
                                    </G>
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
                    TAP TO EXPAND
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
