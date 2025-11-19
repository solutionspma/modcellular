import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  unread: boolean;
}

export default function MessagesScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('connected');

  const renderMessage = ({ item }: { item: Message }) => (
    <Link href={`/chat/${item.sender}`} asChild>
      <TouchableOpacity style={styles.messageItem}>
        <View style={styles.avatar}>
          <Ionicons name="person-circle" size={50} color="#007AFF" />
        </View>
        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <Text style={styles.senderName}>{item.sender}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleDateString()}
            </Text>
          </View>
          <Text style={styles.messageText} numberOfLines={1}>
            {item.content}
          </Text>
        </View>
        {item.unread && <View style={styles.unreadBadge} />}
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: '#34C759' }]} />
          <Text style={styles.statusText}>Mod Cellular Active</Text>
        </View>
        <Text style={styles.signalStrength}>WiFi • Strong</Text>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={80} color="#8E8E93" />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Start a conversation or wait for incoming messages
            </Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab}>
        <Ionicons name="create" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1C1C1E',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  signalStrength: {
    color: '#8E8E93',
    fontSize: 12,
  },
  list: {
    flex: 1,
  },
  messageItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  senderName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    color: '#8E8E93',
    fontSize: 12,
  },
  messageText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
