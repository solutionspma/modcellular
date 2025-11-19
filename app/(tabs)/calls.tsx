import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface Call {
  id: string;
  name: string;
  type: 'audio' | 'video' | 'missed';
  timestamp: string;
  duration?: number;
}

export default function CallsScreen() {
  const [calls, setCalls] = useState<Call[]>([]);

  const renderCall = ({ item }: { item: Call }) => {
    const getIcon = () => {
      if (item.type === 'missed') return 'call-outline';
      if (item.type === 'video') return 'videocam';
      return 'call';
    };

    const getIconColor = () => {
      return item.type === 'missed' ? '#FF3B30' : '#34C759';
    };

    return (
      <TouchableOpacity style={styles.callItem}>
        <View style={styles.callIcon}>
          <Ionicons name={getIcon()} size={24} color={getIconColor()} />
        </View>
        <View style={styles.callContent}>
          <Text style={styles.callerName}>{item.name}</Text>
          <Text style={styles.callInfo}>
            {item.type === 'missed' ? 'Missed' : `${item.duration}s`} •{' '}
            {new Date(item.timestamp).toLocaleTimeString()}
          </Text>
        </View>
        <TouchableOpacity style={styles.callButton}>
          <Ionicons 
            name={item.type === 'video' ? 'videocam' : 'call'} 
            size={20} 
            color="#007AFF" 
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.callTypeButton}>
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.callTypeText}>Audio Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.callTypeButton}>
          <Ionicons name="videocam" size={20} color="#fff" />
          <Text style={styles.callTypeText}>Video Call</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={calls}
        renderItem={renderCall}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="call-outline" size={80} color="#8E8E93" />
            <Text style={styles.emptyText}>No calls yet</Text>
            <Text style={styles.emptySubtext}>
              Make your first call with Mod Cellular's mesh network
            </Text>
          </View>
        }
      />
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
    padding: 16,
    gap: 12,
  },
  callTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1E',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  callTypeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  callItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
    alignItems: 'center',
  },
  callIcon: {
    marginRight: 12,
  },
  callContent: {
    flex: 1,
  },
  callerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  callInfo: {
    color: '#8E8E93',
    fontSize: 14,
  },
  callButton: {
    padding: 8,
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
