import { View, Text, StyleSheet, Image } from 'react-native';

interface ChatBubbleProps {
  message: {
    id: string;
    sender: string;
    content: string;
    media_url?: string;
    created_at: string;
  };
  isMe: boolean;
}

export default function ChatBubble({ message, isMe }: ChatBubbleProps) {
  return (
    <View style={[styles.bubble, isMe ? styles.me : styles.them]}>
      {message.media_url && (
        <Image 
          source={{ uri: message.media_url }} 
          style={styles.media}
          resizeMode="cover"
        />
      )}
      {message.content && (
        <Text style={[styles.text, isMe ? styles.textMe : styles.textThem]}>
          {message.content}
        </Text>
      )}
      <Text style={styles.timestamp}>
        {new Date(message.created_at).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    padding: 12,
    margin: 8,
    borderRadius: 16,
    maxWidth: '75%',
  },
  me: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4
  },
  them: {
    backgroundColor: '#1C1C1E',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4
  },
  text: {
    fontSize: 16,
    lineHeight: 20
  },
  textMe: {
    color: '#fff'
  },
  textThem: {
    color: '#fff'
  },
  media: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8
  },
  timestamp: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
    alignSelf: 'flex-end'
  }
});
