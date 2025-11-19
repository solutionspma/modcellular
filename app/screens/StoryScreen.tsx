import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function StoryScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.userInfo}>
          <Text style={styles.username}>Username</Text>
          <Text style={styles.timestamp}>2h ago</Text>
        </View>
        
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.storyContent}>
        <Text style={styles.storyText}>Story content appears here</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.inputContainer}>
          <TouchableOpacity>
            <Ionicons name="camera" size={24} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.replyText}>Send message</Text>
          
          <TouchableOpacity>
            <Ionicons name="send" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  userInfo: {
    flex: 1,
    marginLeft: 12
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2
  },
  storyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  storyText: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center'
  },
  footer: {
    padding: 16,
    paddingBottom: 30
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12
  },
  replyText: {
    flex: 1,
    color: '#8E8E93',
    fontSize: 16
  }
});
