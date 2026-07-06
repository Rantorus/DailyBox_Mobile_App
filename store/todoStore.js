import { create } from 'zustand';
import api from '../services/api.js';

export const useTodoStore = create((set, get) => ({
    todos: [],
    isLoading: false,
    error: null,

    // Fetch todos for a box
    fetchBoxTodos: async (boxId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/todos/box/${boxId}`);
            set({ todos: response.data.data || response.data || [], isLoading: false });
        } catch (error) {
            set({ 
                error: error.response?.data?.message || 'Failed to fetch todos.', 
                isLoading: false 
            });
        }
    },

    // Add a todo
    addTodo: async (boxId, text) => {
        try {
            const response = await api.post(`/todos/box/${boxId}`, { text });
            const newTodo = response.data.data || response.data;
            set((state) => ({
                todos: [newTodo, ...state.todos]
            }));
            return { success: true, data: newTodo };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to add todo.' };
        }
    },

    // Update a todo (e.g., toggle status)
    updateTodo: async (todoId, updateData) => {
        try {
            // Optimistic update
            set((state) => ({
                todos: state.todos.map(todo => todo.id === todoId ? { ...todo, ...updateData } : todo)
            }));

            const response = await api.patch(`/todos/${todoId}`, updateData);
            return { success: true, data: response.data.data || response.data };
        } catch (error) {
            // Need to fetch again or revert in a real robust scenario, but returning error for now
            return { success: false, error: error.response?.data?.message || 'Failed to update todo.' };
        }
    },

    // Delete a todo
    deleteTodo: async (todoId) => {
        try {
            // Optimistic update
            set((state) => ({
                todos: state.todos.filter(todo => todo.id !== todoId)
            }));

            await api.delete(`/todos/${todoId}`);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to delete todo.' };
        }
    },

    // Clear state
    clearTodos: () => set({ todos: [], error: null })
}));
