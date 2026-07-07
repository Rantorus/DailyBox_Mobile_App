import { StyleSheet, View, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';
import { useBoxStore } from '../../store/boxStore';
import { useTodoStore } from '../../store/todoStore';

import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText';
import ThemedInput from '../../components/ThemedInput';
import ThemedBtn from '../../components/ThemedBtn';
import ThemedCard from '../../components/ThemedCard';
import Spacer from '../../components/Spacer';

const TodoDetail = () => {
    const { id } = useLocalSearchParams();
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    const boxes = useBoxStore((state) => state.boxes);
    const boxData = boxes.find((data) => data.id === id);

    const todos = useTodoStore((state) => state.todos);
    const fetchBoxTodos = useTodoStore((state) => state.fetchBoxTodos);
    const addTodo = useTodoStore((state) => state.addTodo);
    const updateTodo = useTodoStore((state) => state.updateTodo);
    const deleteTodoStore = useTodoStore((state) => state.deleteTodo);
    const updateTodoPositions = useTodoStore((state) => state.updateTodoPositions);
    const isLoading = useTodoStore((state) => state.isLoading);

    const [newTodo, setNewTodo] = useState("");

    // Veri yüklendiğinde fetch at
    useEffect(() => {
        if (boxData) {
            fetchBoxTodos(boxData.id);
        }
    }, [boxData]);

    // Güvenlik duvarı
    if (!boxData) {
        return (
            <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }} safe={true}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ThemedView>
        );
    }

    // --- VERİ AYRIŞTIRMA (FILTERING) ---
    const sortedTodos = [...todos].sort((a, b) => (a.position_index || 0) - (b.position_index || 0));

    const activeTodos = sortedTodos.filter(todo => todo.is_completed === false || todo.isCompleted === false);
    const doneTodos = sortedTodos.filter(todo => todo.is_completed === true || todo.isCompleted === true);

    // --- ETKİLEŞİM FONKSİYONLARI ---
    const toggleTodoStatus = async (todo) => {
        // Toggle ederken Joi şemasının beklediği yapıyı apiPayload olarak yolluyoruz
        const isCompletedNow = todo.is_completed !== undefined ? todo.is_completed : todo.isCompleted;
        await updateTodo(todo.id,
            { isCompleted: !isCompletedNow, is_completed: !isCompletedNow },
            { isCompleted: !isCompletedNow }
        );
    };

    const handleAddTodo = async () => {
        if (newTodo.trim() === "") return;

        const result = await addTodo(boxData.id, { text: newTodo.trim(), positionIndex: activeTodos.length });
        if (result.success) {
            setNewTodo("");
        }
    };

    const deleteTodo = async (todoId) => {
        await deleteTodoStore(todoId);
    };

    // --- YER DEĞİŞTİRME ---
    const handleMoveUp = async (index) => {
        if (index === 0) return;
        const newActive = [...activeTodos];
        const temp = newActive[index - 1];
        newActive[index - 1] = newActive[index];
        newActive[index] = temp;

        newActive.forEach((t, i) => t.position_index = i);

        const newTodos = [...newActive, ...doneTodos];
        await updateTodoPositions(newTodos);
    };

    const handleMoveDown = async (index) => {
        if (index === activeTodos.length - 1) return;
        const newActive = [...activeTodos];
        const temp = newActive[index + 1];
        newActive[index + 1] = newActive[index];
        newActive[index] = temp;

        newActive.forEach((t, i) => t.position_index = i);

        const newTodos = [...newActive, ...doneTodos];
        await updateTodoPositions(newTodos);
    };

    return (
        <ThemedView style={styles.container} safe={true}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>

                {/* --- ADD YENİ TODO ALANI --- */}
                <View style={styles.inputRow}>
                    <ThemedInput
                        style={[styles.titleInput, { borderColor: theme.border }]}
                        placeholder="Add a new task..."
                        placeholderTextColor={theme.textLight}
                        onChangeText={setNewTodo}
                        value={newTodo}
                    />
                    <ThemedBtn
                        style={[styles.addButton, { backgroundColor: theme.primary }]}
                        onPress={handleAddTodo}
                    >
                        <ThemedText title={true}>
                            Add
                        </ThemedText>
                    </ThemedBtn>
                </View>

                <Spacer height={20} />

                {/* --- ACTIVE (DEVAM EDEN) TODOLAR --- */}
                {activeTodos.length > 0 && (
                    <>
                        <View style={styles.sectionHeader}>
                            <ThemedText>Active</ThemedText>
                            <View style={[styles.badge, { backgroundColor: theme.primary + '20' }]}>
                                <ThemedText style={{ color: theme.primary }}>{activeTodos.length}</ThemedText>
                            </View>
                        </View>

                        {activeTodos.map((todo, index) => (
                            <ThemedCard key={todo.id} style={styles.todoCard}>
                                {/* Sol Kısım: Onay İkonu ve Yazı (Tıklanabilir) */}
                                <TouchableOpacity
                                    style={styles.todoContent}
                                    activeOpacity={0.7}
                                    onPress={() => toggleTodoStatus(todo)}
                                >
                                    <Ionicons name="ellipse-outline" size={24} color={theme.textLight} />
                                    <ThemedText style={styles.todoText}>{todo.text}</ThemedText>
                                </TouchableOpacity>

                                {/* Oklar */}
                                <View style={{ flexDirection: 'column', alignItems: 'center', marginLeft: 5, gap: 4 }}>
                                    <TouchableOpacity onPress={() => handleMoveUp(index)} disabled={index === 0}>
                                        <Ionicons name="chevron-up" size={20} color={index === 0 ? theme.border : theme.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleMoveDown(index)} disabled={index === activeTodos.length - 1}>
                                        <Ionicons name="chevron-down" size={20} color={index === activeTodos.length - 1 ? theme.border : theme.primary} />
                                    </TouchableOpacity>
                                </View>

                                {/* Sağ Kısım: Çöp Kutusu (Tıklanabilir) */}
                                <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={() => deleteTodo(todo.id)}
                                >
                                    <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                                </TouchableOpacity>
                            </ThemedCard>
                        ))}

                        <Spacer height={20} />
                    </>
                )}


                {/* --- DONE (BİTEN) TODOLAR --- */}
                {doneTodos.length > 0 && (
                    <>
                        <View style={styles.sectionHeader}>
                            <ThemedText style={{ color: theme.textLight }}>Done</ThemedText>
                            <View style={[styles.badge, { backgroundColor: theme.border }]}>
                                <ThemedText style={{ color: theme.textLight }}>{doneTodos.length}</ThemedText>
                            </View>
                        </View>

                        {doneTodos.map((todo) => (
                            <ThemedCard key={todo.id} style={[styles.todoCard, { opacity: 0.6 }]}>
                                {/* Sol Kısım: Onay İkonu ve Yazı (Tıklanabilir) */}
                                <TouchableOpacity
                                    style={styles.todoContent}
                                    activeOpacity={0.7}
                                    onPress={() => toggleTodoStatus(todo)}
                                >
                                    <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                                    <ThemedText style={[styles.todoText, { textDecorationLine: 'line-through', color: theme.textLight }]}>
                                        {todo.text}
                                    </ThemedText>
                                </TouchableOpacity>

                                {/* Sağ Kısım: Çöp Kutusu (Tıklanabilir) */}
                                <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={() => deleteTodo(todo.id)}
                                >
                                    <Ionicons name="trash-outline" size={22} color={theme.textLight} />
                                </TouchableOpacity>
                            </ThemedCard>
                        ))}
                    </>
                )}

            </ScrollView>
        </ThemedView>
    )
}

export default TodoDetail

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 15,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 10,
        gap: 12,
    },
    titleInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
    },
    addButton: {
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 10,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    todoCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    todoContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    },
    todoText: {
        flex: 1,
        lineHeight: 22,
    },
    deleteBtn: {
        marginLeft: 10,
        padding: 5,
    }
})