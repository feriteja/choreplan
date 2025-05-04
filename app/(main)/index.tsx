import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const sampleTodos: TodoType[] = [
  {
    id: "1",
    title: "Prepare Grocery List",
    content: "Buy fresh produce, dairy, and pantry items for the week.",
    important: true,
    state: "planning", // Gray
    revisionCount: 1,
  },
  {
    id: "2",
    title: "Team Meeting",
    content: "Discuss project updates and upcoming deadlines with the team.",
    important: false,
    state: "progress", // Blue
    revisionCount: 0,
  },
  {
    id: "3",
    title: "Plan Weekend Getaway",
    content: "Research locations, book a hotel, and create an itinerary.",
    important: true,
    state: "pause", // Orange
    revisionCount: 2,
  },
  {
    id: "4",
    title: "Finish UI Design",
    content: "Complete the design for the app’s home screen and navigation.",
    important: true,
    state: "finish", // Green
    revisionCount: 3,
  },
  {
    id: "5",
    title: "Cancel Gym Membership",
    content: "Call gym and cancel membership due to relocation.",
    important: false,
    state: "canceled", // Red
    revisionCount: 1,
  },
  {
    id: "6",
    title: "Read Book on Productivity",
    content: "Finish reading 'Atomic Habits' by James Clear.",
    important: false,
    state: "planning", // Gray
    revisionCount: 0,
  },
  {
    id: "7",
    title: "Update Personal Website",
    content: "Add new portfolio items and update the blog section.",
    important: true,
    state: "progress", // Blue
    revisionCount: 1,
  },
];

const TodoListScreen = () => {
  const [todos, setTodos] = useState<TodoType[]>([]);
  const router = useRouter();

  // Function to load todos from AsyncStorage
  const loadTodos = async () => {
    try {
      const todosJson = await AsyncStorage.getItem("@todos");
      const loadedTodos = todosJson ? JSON.parse(todosJson) : [];
      setTodos(loadedTodos);
    } catch (e) {
      console.error("Error loading todos:", e);
    }
  };

  // Reload todos every time the screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      loadTodos(); // Reload the todos when the screen is focused
    }, [])
  );

  // Map state to colors
  const stateColors = {
    planning: "bg-gray-500",
    progress: "bg-blue-500",
    pause: "bg-orange-500",
    finish: "bg-green-500",
    canceled: "bg-red-500",
  };

  // Render a single todo item
  const renderItem = ({ item }: { item: TodoType }) => (
    <TouchableOpacity
      onPress={() => router.push(`/detail/${item.id}`)} // Navigate to the detail page of the item
      className={`p-4 m-2 rounded-lg ${stateColors[item.state]}`}
    >
      <Text className="text-sm font-bold underline text-white">
        {item.state}
      </Text>
      <Text className="text-lg font-bold text-white">{item.title}</Text>
      <Text className="text-sm text-white">{item.content}</Text>
      <Text className="text-sm text-white">
        {item.important ? "Important" : "Not Important"} | Revisions:{" "}
        {item.revisionCount}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 ">
      <View className="p-4 flex-1 ">
        <Text className="text-xl font-bold mb-12">Plan List</Text>
        {todos.length > 0 ? (
          <FlatList
            data={todos}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <Text>No to-dos available</Text>
        )}
      </View>
      <TouchableOpacity
        className="p-4 bg-blue-500 rounded-lg m-4 mx-20"
        onPress={() => router.push("/(main)/createTodoScreen")}
      >
        <Text className="text-white text-center">What's new ?</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default TodoListScreen;
