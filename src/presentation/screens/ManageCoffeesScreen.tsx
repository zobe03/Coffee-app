import React, { useEffect, useState } from 'react';
import { FlatList, Modal, TextInput } from 'react-native';
import { Box, Text } from '../theme';
import { CoffeeRepository } from '../../data/repositories/CoffeeRepository';
import { Coffee } from '../../domain/entities/Coffee';
import { Button } from '../components/Button';
import { Stack, useRouter } from 'expo-router';

export const ManageCoffeesScreen = () => {
    const [coffees, setCoffees] = useState<Coffee[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState('');
    const [roastery, setRoastery] = useState('');
    const repo = new CoffeeRepository();
    const router = useRouter();

    const loadCoffees = async () => {
        const data = await repo.getAll();
        setCoffees(data);
    };

    useEffect(() => {
        loadCoffees();
    }, []);

    const handleAdd = async () => {
        if (!name) return;
        await repo.create({ name, roastery: roastery || 'Unknown', origin: 'Unknown', process: 'Washed' });
        setModalVisible(false);
        setName('');
        setRoastery('');
        loadCoffees();
    };

    const renderItem = ({ item }: { item: Coffee }) => (
        <Box
            backgroundColor="cardPrimaryBackground"
            padding="m"
            marginBottom="s"
            borderRadius={8}
        >
            <Text variant="subheader" fontSize={18}>{item.name}</Text>
            <Text variant="body" color="textSecondary">{item.roastery}</Text>
            <Text variant="caption">{item.origin} - {item.process}</Text>
        </Box>
    );

    return (
        <Box flex={1} backgroundColor="mainBackground" padding="m">
            <Stack.Screen options={{ title: 'Manage Coffees', headerBackTitle: 'Back' }} />
            <FlatList
                data={coffees}
                renderItem={renderItem}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                ListEmptyComponent={
                    <Text variant="body" textAlign="center" marginTop="xl">No coffees found.</Text>
                }
            />
            <Box marginTop="m">
                <Button label="Add New Coffee" onPress={() => setModalVisible(true)} />
            </Box>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="overlayBackground">
                    <Box width="80%" backgroundColor="cardPrimaryBackground" padding="l" borderRadius={10}>
                        <Text variant="subheader" marginBottom="m">Add New Coffee</Text>

                        <TextInput
                            placeholder="Coffee Name"
                            placeholderTextColor="#666"
                            value={name}
                            onChangeText={setName}
                            style={{
                                backgroundColor: '#2a2a2a',
                                color: 'white',
                                padding: 10,
                                borderRadius: 5,
                                marginBottom: 10
                            }}
                        />
                        <TextInput
                            placeholder="Roastery"
                            placeholderTextColor="#666"
                            value={roastery}
                            onChangeText={setRoastery}
                            style={{
                                backgroundColor: '#2a2a2a',
                                color: 'white',
                                padding: 10,
                                borderRadius: 5,
                                marginBottom: 20
                            }}
                        />

                        <Box flexDirection="row" justifyContent="space-between">
                            <Button label="Cancel" variant="outline" onPress={() => setModalVisible(false)} />
                            <Box width={10} />
                            <Button label="Save" onPress={handleAdd} />
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};
