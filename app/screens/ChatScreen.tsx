import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

export default function ChatScreen() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Simulated message stream
    // In production, this connects to core/routing/messageEngine
  }, []);

  const sendMessage = () => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setText("");
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageBubble,
      item.sender === 'me' ? styles.myMessage : styles.theirMessage
    ]}>
      <Text style={styles.messageText}>{item.content}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
        <Text style={styles.headerTitle}>Chat</Text>
        <Ionicons name="videocam" size={24} color="#007AFF" />
      </View>

      <FlatList 
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="add-circle" size={28} color="#007AFF" />
        </TouchableOpacity>

        <TextInput 
          style={styles.input}
          onChangeText={setText}
          value={text}
          placeholder="Message..."
          placeholderTextColor="#8E8E93"
          multiline
        />

        <TouchableOpacity 
          style={styles.sendButton}
          onPress={sendMessage}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#1C1C1E',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff'
  },
  messageList: {
    flex: 1
  },
  messageListContent: {
    padding: 16
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF'
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#1C1C1E'
  },
  messageText: {
    color: '#fff',
    fontSize: 16
  },
  timestamp: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 4
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1C1C1E',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E'
  },
  attachButton: {
    marginRight: 8
  },
  input: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100
  },
  sendButton: {
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
