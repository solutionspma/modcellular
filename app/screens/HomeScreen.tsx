import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import ConnectionIndicator from '../components/ConnectionIndicator';
import { aggregateSignals, AggregatedLink } from '../../core/aggregation/signalAggregatorEngine';
import deviceIdentity from '../../core/identity/deviceIdentity';

export default function HomeScreen({ navigation }: any) {
  const [connection, setConnection] = useState<AggregatedLink | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const identity = await deviceIdentity.initialize();
      setDeviceId(identity.deviceId);
      
      // Scan signals
      const links = await aggregateSignals(identity.deviceId);
      setConnection(links[0] || null);
      
      // Refresh every 10 seconds
      const interval = setInterval(async () => {
        const updated = await aggregateSignals(identity.deviceId);
        setConnection(updated[0] || null);
      }, 10000);
      
      return () => clearInterval(interval);
    }
    
    init();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mod Cellular</Text>
      
      <View style={styles.statusContainer}>
        <ConnectionIndicator link={connection} />
      </View>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate("Chat")}
      >
        <Text style={styles.buttonText}>Messages</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate("Call")}
      >
        <Text style={styles.buttonText}>Calls</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate("Story")}
      >
        <Text style={styles.buttonText}>Stories</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate("Settings")}
      >
        <Text style={styles.buttonText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#000'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20
  },
  statusContainer: {
    marginBottom: 30
  },
  button: {
    width: 200,
    padding: 16,
    marginVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: { 
    fontSize: 18,
    color: '#fff',
    fontWeight: '600'
  }
});
