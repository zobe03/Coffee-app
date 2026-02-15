import React from 'react';
import { Modal, FlatList, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Box, Text, useTheme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

interface SelectionItem {
    id: number | string;
    label: string;
    subLabel?: string;
}

interface SelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (item: SelectionItem) => void;
    items: SelectionItem[];
    title: string;
    selectedId?: number | string;
}

export const SelectionModal: React.FC<SelectionModalProps> = ({ visible, onClose, onSelect, items, title, selectedId }) => {
    const theme = useTheme();

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
                <Box
                    backgroundColor="cardPrimaryBackground"
                    borderTopLeftRadius={20}
                    borderTopRightRadius={20}
                    padding="m"
                    maxHeight="80%"
                    width="100%"
                    style={styles.modalView}
                >
                    <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
                        <Text variant="subheader">{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </Box>

                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                                style={{
                                    paddingVertical: 16,
                                    borderBottomWidth: 1,
                                    borderBottomColor: theme.colors.mainBackground,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <Box>
                                    <Text variant="body" fontWeight={item.id === selectedId ? 'bold' : 'normal'} color={item.id === selectedId ? 'primary' : 'textPrimary'}>
                                        {item.label}
                                    </Text>
                                    {item.subLabel && (
                                        <Text variant="caption" color="textSecondary">{item.subLabel}</Text>
                                    )}
                                </Box>
                                {item.id === selectedId && (
                                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                                )}
                            </TouchableOpacity>
                        )}
                    />
                </Box>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    }
});
