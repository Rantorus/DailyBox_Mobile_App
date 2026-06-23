import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useRouter, Stack } from 'expo-router'; // Sağ üst buton ve geri dönmek için Stack ve router
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';

import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText';
import ThemedInput from '../../components/ThemedInput';
import ThemedBtn from '../../components/ThemedBtn';
import ThemedCard from '../../components/ThemedCard';
import Spacer from '../../components/Spacer';

const CreateTodoPage = () => {
    const { themeName } = useTheme();
    const theme = Colors[themeName];
    const router = useRouter();

    const [newTodo, setNewTodo] = useState("");
    // Başlangıçta boş bir dizi. Kullanıcı ekledikçe dolacak.
    const [todos, setTodos] = useState([]); 

    // --- ETKİLEŞİM FONKSİYONLARI ---
    const handleSave = () => {
        // İleride burada 'todos' state'ini alıp ilgili Box'ın veritabanına kaydedeceğiz.
        console.log("Saved Todos to Box:", todos);
        // Kaydettikten sonra bir önceki ekrana dön
        router.back();
    };

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

    const deleteTodo = (todoId) => {
        const updatedTodos = todos.filter(todo => todo.id !== todoId);
        setTodos(updatedTodos);
    };

    // --- VERİ AYRIŞTIRMA (Göstermek için) ---
    const activeTodos = todos.filter(todo => todo.isCompleted === false);
    const doneTodos = todos.filter(todo => todo.isCompleted === true);

    return (
        <ThemedView style={styles.container} safe={true}>
            
            {/* --- HEADER ALANI (CREATE BUTONU) --- */}
            <Stack.Screen
                options={{
                    title: "Create Checklist",
                    headerRight: () => (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={handleSave}
                            style={[styles.editButton, { backgroundColor: theme.primary + '20' }]}
                        >
                            <Ionicons name="checkmark-outline" size={20} color={theme.primary} />
                            <ThemedText style={{ color: theme.primary, fontWeight: "bold", fontSize: 15 }}>
                                Create
                            </ThemedText>
                        </TouchableOpacity>
                    )
                }}
            />

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

                {/* --- BAŞLANGIÇ EKRANI (HİÇ TODO YOKKEN) --- */}
                {todos.length === 0 && (
                    <ThemedText style={{ alignSelf: "center", color: theme.textLight, marginTop: 40, textAlign: "center", lineHeight: 24 }}>
                        Your checklist is empty.{"\n"}Add some tasks to get started!
                    </ThemedText>
                )}

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
                                <TouchableOpacity 
                                    style={styles.todoContent} 
                                    activeOpacity={0.7} 
                                    onPress={() => toggleTodoStatus(todo.id)}
                                >
                                    <Ionicons name="ellipse-outline" size={24} color={theme.textLight} />
                                    <ThemedText style={styles.todoText}>{todo.text}</ThemedText>
                                </TouchableOpacity>

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

export default CreateTodoPage

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 15,
    },
    editButton: {
        marginRight: 15,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
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