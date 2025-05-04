import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import uuid from "react-native-uuid";

const CreateTodoScreen = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [important, setImportant] = useState(false);
  const router = useRouter();

  // Function to save the new to-do item
  const saveTodo = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Error", "Title and content cannot be empty!");
      return;
    }

    const newTodo = {
      id: uuid.v4(), // Unique ID for each todo
      title,
      content,
      important,
      state: "planning", // Default state
      revisionCount: 0, // No revisions yet
    };

    try {
      const existingTodosJson = await AsyncStorage.getItem("@todos");
      const existingTodos = existingTodosJson
        ? JSON.parse(existingTodosJson)
        : [];
      const updatedTodos = [...existingTodos, newTodo];

      // Save updated to-do list to AsyncStorage
      await AsyncStorage.setItem("@todos", JSON.stringify(updatedTodos));

      // Navigate back to the list screen
      router.back();
    } catch (e) {
      console.error("Error saving todo:", e);
    }
  };

  return (
    <SafeAreaView className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-4">Let's set the goal</Text>
      <View className="mb-4">
        <Text className="text-lg">Title:</Text>
        <TextInput
          className="border border-gray-300 p-2 rounded-lg mt-2"
          placeholder="Enter title"
          value={title}
          onChangeText={setTitle}
        />
      </View>
      <View className="mb-4">
        <Text className="text-lg">Content:</Text>
        <TextInput
          className="border border-gray-300 p-2 rounded-lg mt-2"
          placeholder="Enter content"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={4}
        />
      </View>
      <View className="flex-row items-center mb-4">
        <Text className="text-lg">Important:</Text>
        <TouchableOpacity
          className={`ml-4 p-2 rounded-full ${
            important ? "bg-red-500" : "bg-gray-300"
          }`}
          onPress={() => setImportant(!important)}
        >
          <Text className="text-white">{important ? "Yes" : "No"}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="px-4 py-3 bg-blue-500 rounded-xl"
        onPress={saveTodo}
      >
        <Text className="text-white text-center">Save It!</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default CreateTodoScreen;
