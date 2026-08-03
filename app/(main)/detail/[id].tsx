import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const statusConfig: Record<
  TodoStateType,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
    icon: keyof typeof Ionicons.glyphMap;
  }
> = {
  planning: {
    label: "Planning",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-400",
    icon: "document-text-outline",
  },
  progress: {
    label: "In Progress",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
    icon: "time-outline",
  },
  pause: {
    label: "On Hold",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-500",
    icon: "pause-circle-outline",
  },
  finish: {
    label: "Completed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    icon: "checkmark-circle-outline",
  },
  canceled: {
    label: "Canceled",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
    icon: "close-circle-outline",
  },
};

const stateOptions: { id: TodoStateType; label: string }[] = [
  { id: "planning", label: "Planning" },
  { id: "progress", label: "In Progress" },
  { id: "pause", label: "On Hold" },
  { id: "finish", label: "Completed" },
  { id: "canceled", label: "Canceled" },
];

const DetailTodoScreen = () => {
  const [todo, setTodo] = useState<TodoType>();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [important, setImportant] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Load the specific to-do based on ID
  useEffect(() => {
    const loadTodo = async () => {
      try {
        const todosJson = await AsyncStorage.getItem("@todos");
        const todos = todosJson ? JSON.parse(todosJson) : [];
        const todoItem = todos.find((item: TodoType) => item.id === id);
        if (todoItem) {
          setTodo(todoItem);
          setTitle(todoItem.title);
          setContent(todoItem.content);
          setImportant(todoItem.important);
          setIsEditable(
            todoItem.state === "planning" || todoItem.state === "pause"
          );
        }
      } catch (e) {
        console.error("Error loading todo:", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadTodo();
  }, [id]);

  // Update the to-do in AsyncStorage
  const updateTodo = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Error", "Title and content cannot be empty!");
      return;
    }

    if (!todo) return;

    const updatedTodo: TodoType = {
      ...todo,
      title: title.trim(),
      content: content.trim(),
      important,
      revisionCount: todo.revisionCount + 1,
    };

    try {
      const todosJson = await AsyncStorage.getItem("@todos");
      const todos = todosJson ? (JSON.parse(todosJson) as TodoType[]) : [];
      const updatedTodos = todos.map((item) =>
        item.id === id ? updatedTodo : item
      );

      await AsyncStorage.setItem("@todos", JSON.stringify(updatedTodos));
      Alert.alert("Success", "To-do updated successfully!");
      router.back();
    } catch (e) {
      console.error("Error updating todo:", e);
      Alert.alert("Error", "Failed to update task.");
    }
  };

  // Change the to-do state
  const changeState = async (newState: TodoStateType) => {
    if (!todo) return;

    const updatedTodo: TodoType = {
      ...todo,
      state: newState,
    };

    try {
      const todosJson = await AsyncStorage.getItem("@todos");
      const todos = todosJson ? JSON.parse(todosJson) : [];
      const updatedTodos = todos.map((item: TodoType) =>
        item.id === id ? updatedTodo : item
      );

      await AsyncStorage.setItem("@todos", JSON.stringify(updatedTodos));
      Alert.alert("Success", `Plan status changed to ${statusConfig[newState].label}!`);
      router.back();
    } catch (e) {
      console.error("Error updating state:", e);
      Alert.alert("Error", "Failed to update status.");
    }
  };

  const deleteTodo = async () => {
    try {
      const todosJson = await AsyncStorage.getItem("@todos");
      let todos = todosJson ? JSON.parse(todosJson) : [];

      todos = todos.filter((item: TodoType) => item.id !== id);

      await AsyncStorage.setItem("@todos", JSON.stringify(todos));
      router.back();
    } catch (e) {
      console.error("Error deleting todo:", e);
      Alert.alert("Error", "Failed to delete task.");
    }
  };

  const confirmDelete = () => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", onPress: deleteTodo, style: "destructive" },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="text-sm font-medium text-slate-500 mt-3">
          Loading plan details...
        </Text>
      </SafeAreaView>
    );
  }

  if (!todo) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center p-6">
        <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-3">
          <Ionicons name="alert-circle-outline" size={32} color="#94a3b8" />
        </View>
        <Text className="text-lg font-bold text-slate-800">Task Not Found</Text>
        <Text className="text-xs text-slate-500 text-center mt-1 mb-5">
          This plan may have been deleted or removed.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-indigo-600 px-5 py-2.5 rounded-xl"
        >
          <Text className="text-white text-sm font-bold">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const currentStatus = statusConfig[todo.state] || statusConfig.planning;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header Bar */}
        <View className="px-5 pt-4 pb-3 flex-row items-center justify-between border-b border-slate-100 bg-white">
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#334155" />
          </Pressable>

          <Text className="text-lg font-bold text-slate-900">
            Plan Details
          </Text>

          <Pressable
            onPress={confirmDelete}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 items-center justify-center"
          >
            <Ionicons name="trash-outline" size={18} color="#e11d48" />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1 px-5 pt-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Status & Revisions Info Card */}
          <View className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View
                  className={`flex-row items-center px-3 py-1 rounded-full border ${currentStatus.bg} ${currentStatus.border}`}
                >
                  <View
                    className={`w-2 h-2 rounded-full mr-2 ${currentStatus.dot}`}
                  />
                  <Text
                    className={`text-xs font-semibold ${currentStatus.text}`}
                  >
                    {currentStatus.label}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center bg-slate-100 px-2.5 py-1 rounded-lg">
                <Ionicons name="sync-outline" size={12} color="#64748b" />
                <Text className="text-xs font-medium text-slate-600 ml-1.5">
                  {todo.revisionCount}{" "}
                  {todo.revisionCount === 1 ? "Revision" : "Revisions"}
                </Text>
              </View>
            </View>

            {!isEditable && (
              <View className="flex-row items-center bg-amber-50 border border-amber-200 p-2.5 rounded-xl mt-3">
                <Ionicons name="lock-closed-outline" size={14} color="#d97706" />
                <Text className="text-xs text-amber-800 ml-2 font-medium">
                  Editing is locked in state "{currentStatus.label}".
                </Text>
              </View>
            )}
          </View>

          {/* Section: Title */}
          <View className="mb-5">
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Title
            </Text>
            <View
              className={`flex-row items-center p-3.5 rounded-2xl border ${
                isEditable
                  ? "bg-white border-slate-200 shadow-sm"
                  : "bg-slate-100 border-slate-200 opacity-80"
              }`}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={isEditable ? "#94a3b8" : "#cbd5e1"}
              />
              <TextInput
                className={`flex-1 ml-2.5 text-base font-medium p-0 ${
                  isEditable ? "text-slate-900" : "text-slate-600"
                }`}
                editable={isEditable}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter title"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          {/* Section: Description / Content */}
          <View className="mb-5">
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Description
            </Text>
            <View
              className={`p-3.5 rounded-2xl border ${
                isEditable
                  ? "bg-white border-slate-200 shadow-sm"
                  : "bg-slate-100 border-slate-200 opacity-80"
              }`}
            >
              <TextInput
                className={`text-sm leading-relaxed min-h-[100px] p-0 ${
                  isEditable ? "text-slate-800" : "text-slate-600"
                }`}
                editable={isEditable}
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
                placeholder="Enter content description"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          {/* Section: Priority Toggle */}
          <View className="mb-6">
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Priority
            </Text>
            <Pressable
              disabled={!isEditable}
              onPress={() => setImportant(!important)}
              style={({ pressed }) => [
                { opacity: !isEditable ? 0.6 : pressed ? 0.9 : 1 },
              ]}
              className={`flex-row items-center justify-between p-4 rounded-2xl border ${
                important
                  ? "bg-rose-50 border-rose-200"
                  : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              <View className="flex-row items-center">
                <View
                  className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${
                    important ? "bg-rose-500" : "bg-slate-100"
                  }`}
                >
                  <Ionicons
                    name="flame"
                    size={18}
                    color={important ? "#ffffff" : "#64748b"}
                  />
                </View>
                <View>
                  <Text
                    className={`text-sm font-bold ${
                      important ? "text-rose-900" : "text-slate-900"
                    }`}
                  >
                    High Priority
                  </Text>
                  <Text
                    className={`text-xs ${
                      important ? "text-rose-600" : "text-slate-400"
                    }`}
                  >
                    {important ? "Marked as important" : "Normal priority task"}
                  </Text>
                </View>
              </View>

              <View
                className={`w-12 h-7 rounded-full p-1 justify-center ${
                  important ? "bg-rose-500 items-end" : "bg-slate-200 items-start"
                }`}
              >
                <View className="w-5 h-5 rounded-full bg-white shadow-sm" />
              </View>
            </Pressable>
          </View>

          {/* Section: Transition Plan State */}
          <View className="mb-6">
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Update Status
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {stateOptions.map((opt) => {
                const isCurrent = todo.state === opt.id;
                const cfg = statusConfig[opt.id];
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => changeState(opt.id)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                    className={`px-3.5 py-2.5 rounded-xl border flex-row items-center ${
                      isCurrent
                        ? "bg-slate-900 border-slate-900 shadow-sm"
                        : `${cfg.bg} ${cfg.border}`
                    }`}
                  >
                    <View
                      className={`w-2 h-2 rounded-full mr-2 ${
                        isCurrent ? "bg-white" : cfg.dot
                      }`}
                    />
                    <Text
                      className={`text-xs font-semibold ${
                        isCurrent ? "text-white" : cfg.text
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions Bar */}
        <View className="p-5 bg-white border-t border-slate-100 flex-row gap-3">
          {isEditable && (
            <Pressable
              onPress={updateTodo}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
              className="flex-1 flex-row items-center justify-center bg-indigo-600 py-3.5 px-5 rounded-2xl shadow-lg shadow-indigo-200"
            >
              <Ionicons name="save-outline" size={20} color="#ffffff" />
              <Text className="text-white text-sm font-bold ml-2">
                Save Changes
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={confirmDelete}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.9 : 1,
              },
            ]}
            className={`${
              isEditable ? "w-14" : "flex-1"
            } flex-row items-center justify-center bg-rose-50 border border-rose-200 py-3.5 px-4 rounded-2xl`}
          >
            <Ionicons name="trash-outline" size={20} color="#e11d48" />
            {!isEditable && (
              <Text className="text-rose-600 text-sm font-bold ml-2">
                Delete Task
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DetailTodoScreen;

