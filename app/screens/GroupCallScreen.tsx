import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { getActiveNodes, getActiveNodeCount } from '../../core/mesh/groupMeshRelay';
import { shapeAudioBandwidth } from '../../core/engine/adaptiveBandwidth';
import { getBestLink } from '../../core/aggregation/signalAggregatorEngine';
import deviceIdentity from '../../core/identity/deviceIdentity';

export default function GroupCallScreen() {
  const [nodeCount, setNodeCount] = useState(0);
  const [bandwidth, setBandwidth] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      const count = getActiveNodeCount();
      setNodeCount(count);
      
      const identity = await deviceIdentity.initialize();
      const link = await getBestLink(identity.deviceId);
      const bw = shapeAudioBandwidth(link);
      setBandwidth(bw);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Group Mesh Call</Text>
      <Text style={styles.subtitle}>Multi-hop voice relay</Text>
      
      <View style={styles.statusContainer}>
        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>Mesh Nodes</Text>
          <Text style={styles.statusValue}>{nodeCount}</Text>
        </View>
        
        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>Audio Quality</Text>
          <Text style={styles.statusValue}>
            {Math.round(bandwidth * 100)}%
          </Text>
        </View>
        
        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>Status</Text>
          <Text style={[styles.statusValue, isActive && styles.active]}>
            {isActive ? 'ACTIVE' : 'READY'}
          </Text>
        </View>
      </View>
      
      <View style={styles.routingInfo}>
        <Text style={styles.infoTitle}>Routing Strategy</Text>
        <Text style={styles.infoText}>• Multi-hop Mesh Relay</Text>
        <Text style={styles.infoText}>• BestLink Failover</Text>
        <Text style={styles.infoText}>• DTN Backup Queue</Text>
        <Text style={styles.infoText}>• VOMP Micro-packet Encoding</Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.callButton, isActive && styles.callButtonActive]}
        onPress={() => setIsActive(!isActive)}
      >
        <Text style={styles.callButtonText}>
          {isActive ? 'End Group Call' : 'Start Group Call'}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.disclaimer}>
        Prototype • Uses mesh relay for voice transmission
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 40
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 40
  },
  statusBox: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    minWidth: 100,
    alignItems: 'center'
  },
  statusLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 8
  },
  statusValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold'
  },
  active: {
    color: '#34C759'
  },
  routingInfo: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
    width: '100%'
  },
  infoTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12
  },
  infoText: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 6
  },
  callButton: {
    backgroundColor: '#34C759',
    borderRadius: 50,
    paddingVertical: 20,
    paddingHorizontal: 60,
    marginBottom: 20
  },
  callButtonActive: {
    backgroundColor: '#FF3B30'
  },
  callButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  disclaimer: {
    color: '#8E8E93',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center'
  }
});
