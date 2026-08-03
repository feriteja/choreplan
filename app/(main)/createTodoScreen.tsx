import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import uuid from "react-native-uuid";

const stateOptions: { id: TodoStateType; label: string }[] = [
  { id: "planning", label: "Planning" },
  { id: "progress", label: "In Progress" },
  { id: "pause", label: "On Hold" },
  { id: "finish", label: "Completed" },
];

const CreateTodoScreen = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [important, setImportant] = useState(false);
  const [state, setState] = useState<TodoStateType>("planning");
  const router = useRouter();

  // Function to save the new to-do item
  const saveTodo = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Missing Details", "Please enter both a title and description for your task.");
      return;
    }

    const newTodo: TodoType = {
      id: String(uuid.v4()),
      title: title.trim(),
      content: content.trim(),
      important,
      state,
      revisionCount: 0,
    };

    try {
      const existingTodosJson = await AsyncStorage.getItem("@todos");
      const existingTodos = existingTodosJson
        ? JSON.parse(existingTodosJson)
        : [];
      const updatedTodos = [newTodo, ...existingTodos];

      // Save updated to-do list to AsyncStorage
      await AsyncStorage.setItem("@todos", JSON.stringify(updatedTodos));

      // Navigate back to the list screen
      router.back();
    } catch (e) {
      console.error("Error saving todo:", e);
      Alert.alert("Error", "Could not save task. Please try again.");
    }
  };

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
            Create New Plan
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView
          className="flex-1 px-5 pt-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Section: Title */}
          <View className="mb-5">
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Title
            </Text>
            <View className="flex-row items-center bg-white px-3.5 py-3 rounded-2xl border border-slate-200 shadow-sm focus:border-indigo-500">
              <Ionicons name="create-outline" size={18} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-2.5 text-base text-slate-900 font-medium p-0"
                placeholder="What needs to be done?"
                placeholderTextColor="#94a3b8"
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          {/* Section: Description / Content */}
          <View className="mb-5">
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Description
            </Text>
            <View className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <TextInput
                className="text-sm text-slate-800 leading-relaxed min-h-[110px] p-0"
                placeholder="Add details, sub-tasks, or notes..."
                placeholderTextColor="#94a3b8"
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Section: Initial Status Selection */}
          <View className="mb-5">
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Initial Status
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {stateOptions.map((opt) => {
                const isSelected = state === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setState(opt.id)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                    className={`px-4 py-2.5 rounded-xl border flex-row items-center ${
                      isSelected
                        ? "bg-indigo-600 border-indigo-600 shadow-sm"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <View
                      className={`w-2 h-2 rounded-full mr-2 ${
                        isSelected ? "bg-white" : "bg-slate-400"
                      }`}
                    />
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected ? "text-white" : "text-slate-700"
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Section: High Priority Toggle Card */}
          <View className="mb-6">
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Priority
            </Text>
            <Pressable
              onPress={() => setImportant(!important)}
              style={({ pressed }) => [
                { opacity: pressed ? 0.9 : 1 },
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
                    Mark as Important
                  </Text>
                  <Text
                    className={`text-xs ${
                      important ? "text-rose-600" : "text-slate-400"
                    }`}
                  >
                    Highlight this task on your plan list
                  </Text>
                </View>
              </View>

              {/* Switch pill representation */}
              <View
                className={`w-12 h-7 rounded-full p-1 justify-center ${
                  important ? "bg-rose-500 items-end" : "bg-slate-200 items-start"
                }`}
              >
                <View className="w-5 h-5 rounded-full bg-white shadow-sm" />
              </View>
            </Pressable>
          </View>
        </ScrollView>

        {/* Bottom Save Action Button */}
        <View className="p-5 bg-white border-t border-slate-100">
          <Pressable
            onPress={saveTodo}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.9 : 1,
              },
            ]}
            className="flex-row items-center justify-center bg-indigo-600 py-4 px-6 rounded-2xl shadow-lg shadow-indigo-200"
          >
            <Ionicons name="checkmark-circle" size={22} color="#ffffff" />
            <Text className="text-white text-base font-bold ml-2">
              Save Plan
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateTodoScreen;

