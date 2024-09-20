import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Button,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";
import { styled } from "nativewind";
import { SafeAreaView } from "react-native-safe-area-context";

const DetailTodoScreen = () => {
  const [todo, setTodo] = useState<TodoType>();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [important, setImportant] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Get the to-do ID from the URL params

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

    const updatedTodo = {
      ...todo,
      title,
      content,
      important,
      revisionCount: todo!.revisionCount + 1,
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
    }
  };

  // Change the to-do state (with color animation if needed)
  const changeState = async (newState: TodoStateType) => {
    const updatedTodo = {
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
      Alert.alert("Success", "To-do state updated!");
      router.back();
    } catch (e) {
      console.error("Error updating state:", e);
    }
  };

  const deleteTodo = async () => {
    try {
      const todosJson = await AsyncStorage.getItem("@todos");
      let todos = todosJson ? JSON.parse(todosJson) : [];

      // Remove the todo with the matching id
      todos = todos.filter((item: TodoType) => item.id !== id);

      // Save the updated list back to AsyncStorage
      await AsyncStorage.setItem("@todos", JSON.stringify(todos));

      // Navigate back to the ListTodoScreen
      router.back();
    } catch (e) {
      console.error("Error deleting todo:", e);
    }
  };

  // Confirmation Alert before deleting
  const confirmDelete = () => {
    Alert.alert("Delete To-Do", "Are you sure you want to delete this to-do?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: deleteTodo,
        style: "destructive",
      },
    ]);
  };

  if (!todo) return <Text>Loading...</Text>;

  return (
    <SafeAreaView className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-4">To-Do Details</Text>
      <View className="mb-4">
        <Text className="text-lg">Title:</Text>
        <TextInput
          className={`border ${
            isEditable ? "border-gray-300" : "border-gray-400 bg-gray-200"
          } p-2 rounded-lg mt-2`}
          editable={isEditable}
          value={title}
          onChangeText={setTitle}
        />
      </View>
      <View className="mb-4">
        <Text className="text-lg">Content:</Text>
        <TextInput
          className={`border ${
            isEditable ? "border-gray-300" : "border-gray-400 bg-gray-200"
          } p-2 rounded-lg mt-2`}
          editable={isEditable}
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={4}
        />
      </View>
      <View className="flex-row items-center mb-4">
        <Text className="text-lg">Important:</Text>
        <TouchableOpacity
          disabled={!isEditable}
          className={`ml-4 p-2 rounded-full ${
            important ? "bg-red-500" : "bg-gray-300"
          } ${!isEditable && "opacity-50"}`}
          onPress={() => setImportant(!important)}
        >
          <Text className="text-white">{important ? "Yes" : "No"}</Text>
        </TouchableOpacity>
      </View>

      {isEditable ? (
        <TouchableOpacity
          className="p-4 bg-blue-500 rounded-lg mb-4"
          onPress={updateTodo}
        >
          <Text className="text-white text-center">Save Changes</Text>
        </TouchableOpacity>
      ) : (
        <Text className="text-red-500 mb-4">Cannot edit in current state</Text>
      )}

      {/* State Change Buttons */}
      <View className="mb-4">
        <Text className="text-lg mb-2">Change To-Do State:</Text>
        <View className="flex-row justify-between">
          <TouchableOpacity
            className="p-2 bg-gray-500 rounded-lg"
            onPress={() => changeState("planning")}
          >
            <Text className="text-white">Planning</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="p-2 bg-blue-500 rounded-lg"
            onPress={() => changeState("progress")}
          >
            <Text className="text-white">Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="p-2 bg-orange-500 rounded-lg"
            onPress={() => changeState("pause")}
          >
            <Text className="text-white">Pause</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="p-2 bg-green-500 rounded-lg"
            onPress={() => changeState("finish")}
          >
            <Text className="text-white">Finish</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="p-2 bg-red-500 rounded-lg"
            onPress={() => changeState("canceled")}
          >
            <Text className="text-white">Canceled</Text>
          </TouchableOpacity>
        </View>
        <Pressable
          onPress={confirmDelete}
          className="bg-red-600 justify-center items-center py-3 rounded-md mt-4"
        >
          <Text className="text-white">Delete To-Do</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default DetailTodoScreen;
