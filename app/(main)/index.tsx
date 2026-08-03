import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const sampleTodos: TodoType[] = [
  {
    id: "1",
    title: "Prepare Grocery List",
    content: "Buy fresh produce, dairy, and pantry items for the week.",
    important: true,
    state: "planning",
    revisionCount: 1,
  },
  {
    id: "2",
    title: "Team Meeting",
    content: "Discuss project updates and upcoming deadlines with the team.",
    important: false,
    state: "progress",
    revisionCount: 0,
  },
  {
    id: "3",
    title: "Plan Weekend Getaway",
    content: "Research locations, book a hotel, and create an itinerary.",
    important: true,
    state: "pause",
    revisionCount: 2,
  },
  {
    id: "4",
    title: "Finish UI Design",
    content: "Complete the design for the app’s home screen and navigation.",
    important: true,
    state: "finish",
    revisionCount: 3,
  },
  {
    id: "5",
    title: "Cancel Gym Membership",
    content: "Call gym and cancel membership due to relocation.",
    important: false,
    state: "canceled",
    revisionCount: 1,
  },
  {
    id: "6",
    title: "Read Book on Productivity",
    content: "Finish reading 'Atomic Habits' by James Clear.",
    important: false,
    state: "planning",
    revisionCount: 0,
  },
  {
    id: "7",
    title: "Update Personal Website",
    content: "Add new portfolio items and update the blog section.",
    important: true,
    state: "progress",
    revisionCount: 1,
  },
];

type FilterCategory = "all" | TodoStateType;

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

const TodoListScreen = () => {
  const [todos, setTodos] = useState<TodoType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const router = useRouter();

  // Function to load todos from AsyncStorage
  const loadTodos = async () => {
    try {
      const todosJson = await AsyncStorage.getItem("@todos");
      if (todosJson) {
        setTodos(JSON.parse(todosJson));
      } else {
        // Initialize with sample data on first run
        await AsyncStorage.setItem("@todos", JSON.stringify(sampleTodos));
        setTodos(sampleTodos);
      }
    } catch (e) {
      console.error("Error loading todos:", e);
      setTodos(sampleTodos);
    }
  };

  // Reload todos every time the screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      loadTodos();
    }, [])
  );

  // Filtered todos based on search query & active category filter
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const matchesSearch =
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        activeFilter === "all" || todo.state === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [todos, searchQuery, activeFilter]);

  // Compute counts for filter tabs
  const counts = useMemo(() => {
    const res: Record<string, number> = { all: todos.length };
    todos.forEach((t) => {
      res[t.state] = (res[t.state] || 0) + 1;
    });
    return res;
  }, [todos]);

  // Render a single todo item card
  const renderItem = ({ item }: { item: TodoType }) => {
    const config = statusConfig[item.state] || statusConfig.planning;

    return (
      <Pressable
        onPress={() => router.push(`/detail/${item.id}`)}
        style={({ pressed }) => [
          {
            transform: [{ scale: pressed ? 0.98 : 1 }],
            opacity: pressed ? 0.9 : 1,
          },
        ]}
        className="bg-white p-4 mb-3 rounded-2xl border border-slate-100 shadow-sm"
      >
        {/* Card Header: Status badge & Badges */}
        <View className="flex-row items-center justify-between mb-2">
          {/* Status Pill */}
          <View
            className={`flex-row items-center px-2.5 py-1 rounded-full border ${config.bg} ${config.border}`}
          >
            <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.dot}`} />
            <Text className={`text-xs font-semibold ${config.text}`}>
              {config.label}
            </Text>
          </View>

          {/* Badges Row */}
          <View className="flex-row items-center gap-1.5">
            {item.important && (
              <View className="flex-row items-center bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                <Ionicons name="flame" size={12} color="#e11d48" />
                <Text className="text-[11px] font-bold text-rose-600 ml-1">
                  Important
                </Text>
              </View>
            )}
            {item.revisionCount > 0 && (
              <View className="flex-row items-center bg-slate-100 px-2 py-0.5 rounded-md">
                <Ionicons name="sync-outline" size={11} color="#64748b" />
                <Text className="text-[11px] font-medium text-slate-600 ml-1">
                  {item.revisionCount}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Card Body */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-2">
            <Text className="text-base font-bold text-slate-900 mb-1">
              {item.title}
            </Text>
            <Text
              className="text-sm text-slate-500 leading-relaxed"
              numberOfLines={2}
            >
              {item.content}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
        </View>
      </Pressable>
    );
  };

  const filterTabs: { id: FilterCategory; label: string }[] = [
    { id: "all", label: "All" },
    { id: "progress", label: "In Progress" },
    { id: "planning", label: "Planning" },
    { id: "pause", label: "On Hold" },
    { id: "finish", label: "Done" },
    { id: "canceled", label: "Canceled" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header Bar */}
      <View className="px-5 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-2xl font-extrabold text-slate-900 tracking-tight">
              ChorePlan
            </Text>
            <Text className="text-xs font-medium text-slate-500 mt-0.5">
              Organize your daily goals & tasks
            </Text>
          </View>
          <View className="bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
            <Text className="text-xs font-bold text-indigo-600">
              {todos.length} {todos.length === 1 ? "Task" : "Tasks"}
            </Text>
          </View>
        </View>

        {/* Search Input */}
        <View className="flex-row items-center bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-sm mb-3">
          <Ionicons name="search-outline" size={18} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-2.5 text-sm text-slate-800 p-0"
            placeholder="Search plans..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} className="p-1">
              <Ionicons name="close-circle" size={16} color="#cbd5e1" />
            </Pressable>
          )}
        </View>

        {/* Horizontal Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row py-1"
        >
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            const count = counts[tab.id] || 0;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveFilter(tab.id)}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className={`flex-row items-center px-3.5 py-1.5 rounded-full mr-2 border ${
                  isActive
                    ? "bg-slate-900 border-slate-900"
                    : "bg-white border-slate-200"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isActive ? "text-white" : "text-slate-600"
                  }`}
                >
                  {tab.label}
                </Text>
                <View
                  className={`ml-1.5 px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-slate-700" : "bg-slate-100"
                  }`}
                >
                  <Text
                    className={`text-[10px] font-bold ${
                      isActive ? "text-slate-200" : "text-slate-500"
                    }`}
                  >
                    {count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Task List */}
      <View className="flex-1 px-5 pt-2">
        {filteredTodos.length > 0 ? (
          <FlatList
            data={filteredTodos}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 90 }}
          />
        ) : (
          <View className="flex-1 items-center justify-center py-12">
            <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-3">
              <Ionicons name="clipboard-outline" size={32} color="#94a3b8" />
            </View>
            <Text className="text-base font-bold text-slate-700">
              No tasks found
            </Text>
            <Text className="text-xs text-slate-400 text-center mt-1 max-w-[200px]">
              {searchQuery
                ? "Try adjusting your search query or category filter."
                : "Tap the button below to add your first chore or plan!"}
            </Text>
          </View>
        )}
      </View>

      {/* Floating Bottom Button */}
      <View className="absolute bottom-5 left-5 right-5">
        <Pressable
          style={({ pressed }) => [
            {
              transform: [{ scale: pressed ? 0.97 : 1 }],
              opacity: pressed ? 0.9 : 1,
            },
          ]}
          className="flex-row items-center justify-center bg-indigo-600 py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-200"
          onPress={() => router.push("/(main)/createTodoScreen")}
        >
          <Ionicons name="add-circle" size={20} color="#ffffff" />
          <Text className="text-white text-base font-bold ml-2">
            What's new ?
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default TodoListScreen;

