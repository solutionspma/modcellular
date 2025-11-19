import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Story {
  id: string;
  userId: string;
  username: string;
  mediaUrl: string;
  timestamp: string;
  viewed: boolean;
}

export default function StoriesScreen() {
  const [stories, setStories] = useState<Story[]>([]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stories</Text>
        <TouchableOpacity style={styles.cameraButton}>
          <Ionicons name="camera" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.storiesContainer}>
        <TouchableOpacity style={styles.addStory}>
          <View style={styles.addStoryCircle}>
            <Ionicons name="add" size={32} color="#007AFF" />
          </View>
          <Text style={styles.storyUsername}>Your Story</Text>
        </TouchableOpacity>

        {stories.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="play-circle-outline" size={80} color="#8E8E93" />
            <Text style={styles.emptyText}>No stories yet</Text>
            <Text style={styles.emptySubtext}>
              Share what you're up to with disappearing stories
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cameraButton: {
    padding: 8,
  },
  storiesContainer: {
    flex: 1,
    padding: 16,
  },
  addStory: {
    alignItems: 'center',
    marginBottom: 24,
  },
  addStoryCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  storyUsername: {
    color: '#fff',
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
