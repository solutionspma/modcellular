import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function CallScreen() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const startCall = () => {
    setIsCallActive(true);
    // Integrate with core/routing/callEngine
  };

  const endCall = () => {
    setIsCallActive(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.callerName}>John Doe</Text>
        <Text style={styles.callStatus}>
          {isCallActive ? 'Connected' : 'Calling...'}
        </Text>
      </View>

      <View style={styles.videoContainer}>
        <View style={styles.localVideo}>
          <Ionicons name="person" size={60} color="#fff" />
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => setIsMuted(!isMuted)}
        >
          <Ionicons 
            name={isMuted ? 'mic-off' : 'mic'} 
            size={28} 
            color="#fff" 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlButton, styles.endCallButton]}
          onPress={endCall}
        >
          <Ionicons name="call" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => setIsVideoOn(!isVideoOn)}
        >
          <Ionicons 
            name={isVideoOn ? 'videocam' : 'videocam-off'} 
            size={28} 
            color="#fff" 
          />
        </TouchableOpacity>
      </View>

      {!isCallActive && (
        <TouchableOpacity 
          style={styles.startButton}
          onPress={startCall}
        >
          <Text style={styles.startButtonText}>Start Call</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center'
  },
  callerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  callStatus: {
    fontSize: 16,
    color: '#8E8E93'
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  localVideo: {
    width: 120,
    height: 160,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    right: 20
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
    gap: 30
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center'
  },
  endCallButton: {
    backgroundColor: '#FF3B30'
  },
  startButton: {
    position: 'absolute',
    bottom: 150,
    alignSelf: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff'
  }
});
