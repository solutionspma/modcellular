import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatInputProps {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  onMedia: () => void;
}

export default function ChatInput({ value, onChange, onSend, onMedia }: ChatInputProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onMedia} style={styles.mediaButton}>
        <Ionicons name="add-circle" size={32} color="#007AFF" />
      </TouchableOpacity>

      <TextInput 
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder="Message..."
        placeholderTextColor="#8E8E93"
        multiline
        maxLength={1000}
      />

      {value.trim().length > 0 && (
        <TouchableOpacity onPress={onSend} style={styles.sendButton}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1C1C1E',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E'
  },
  mediaButton: {
    marginRight: 8
  },
  input: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
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
