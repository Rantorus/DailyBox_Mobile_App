import { StyleSheet, View, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 

import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';
import { dummyBoxes } from '../../fetchBox/dummyBoxes';

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

    const boxData = dummyBoxes.find((data) => data.id == id);

    const [newTodo, setNewTodo] = useState("");
    const [todos, setTodos] = useState([]); 

    // Veri yüklendiğinde state'i doldur
    useEffect(() => {
        if (boxData && boxData.todos) {
            setTodos(boxData.todos);
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
    const activeTodos = todos.filter(todo => todo.isCompleted === false);
    const doneTodos = todos.filter(todo => todo.isCompleted === true);

    // --- ETKİLEŞİM FONKSİYONLARI ---
    const toggleTodoStatus = (todoId) => {
        const updatedTodos = todos.map(todo => {
            if (todo.id === todoId) {
                return { ...todo, isCompleted: !todo.isCompleted };
            }
            return todo;
        });
        setTodos(updatedTodos); 
    };

    const handleAddTodo = () => {
        if (newTodo.trim() === "") return; 

        const newTask = {
            id: `todo_${Date.now()}`, 
            text: newTodo,
            isCompleted: false 
        };

        setTodos([newTask, ...todos]); 
        setNewTodo(""); 
    };

    // YENİ EKLENEN: SİLME FONKSİYONU
    const deleteTodo = (todoId) => {
        // ID'si eşleşmeyenleri tut, eşleşeni (silinmek isteneni) diziden at
        const updatedTodos = todos.filter(todo => todo.id !== todoId);
        setTodos(updatedTodos);
    };

    return (
        <ThemedView style={styles.container} safe={true}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
                
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

                        {activeTodos.map((todo) => (
                            <ThemedCard key={todo.id} style={styles.todoCard}>
                                {/* Sol Kısım: Onay İkonu ve Yazı (Tıklanabilir) */}
                                <TouchableOpacity 
                                    style={styles.todoContent} 
                                    activeOpacity={0.7} 
                                    onPress={() => toggleTodoStatus(todo.id)}
                                >
                                    <Ionicons name="ellipse-outline" size={24} color={theme.textLight} />
                                    <ThemedText style={styles.todoText}>{todo.text}</ThemedText>
                                </TouchableOpacity>

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
                                    onPress={() => toggleTodoStatus(todo.id)}
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
                                    {/* Bitenlerde kırmızı göz yormasın diye gri çöp kutusu daha şık durur */}
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
        padding: 5, // Tıklama (hit) alanını genişletmek için boşluk eklendi
    }
})