import { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { startGroupMeshRelay, stopGroupMeshRelay, MeshNode } from '../../core/mesh/groupMeshRelay';

export default function MeshNodeList() {
  const [nodes, setNodes] = useState<MeshNode[]>([]);

  useEffect(() => {
    const uniqueNodes = new Map<string, MeshNode>();

    startGroupMeshRelay((device) => {
      uniqueNodes.set(device.id, device);
      setNodes(Array.from(uniqueNodes.values()));
    });

    return () => {
      stopGroupMeshRelay();
    };
  }, []);

  const activeNodes = nodes.filter(n => n.isActive);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Mesh Network ({activeNodes.length} active)
      </Text>
      
      {nodes.length === 0 && (
        <Text style={styles.noNodes}>Scanning for mesh peers...</Text>
      )}
      
      {nodes.map((node, index) => (
        <View key={index} style={styles.nodeRow}>
          <View style={styles.nodeInfo}>
            <Text style={[styles.nodeName, !node.isActive && styles.inactive]}>
              {node.name}
            </Text>
            <Text style={styles.nodeId}>{node.id.substring(0, 8)}...</Text>
          </View>
          
          <View style={styles.signalContainer}>
            <View style={[
              styles.signalDot,
              { backgroundColor: getSignalColor(node.rssi) }
            ]} />
            <Text style={styles.rssiText}>{node.rssi} dBm</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function getSignalColor(rssi: number): string {
  if (rssi > -50) return '#34C759';
  if (rssi > -70) return '#FFD60A';
  if (rssi > -85) return '#FF9F0A';
  return '#FF3B30';
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginTop: 16
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16
  },
  noNodes: {
    color: '#8E8E93',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic'
  },
  nodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E'
  },
  nodeInfo: {
    flex: 1
  },
  nodeName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4
  },
  inactive: {
    color: '#8E8E93'
  },
  nodeId: {
    color: '#8E8E93',
    fontSize: 12,
    fontFamily: 'monospace'
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  signalDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8
  },
  rssiText: {
    color: '#8E8E93',
    fontSize: 12,
    fontFamily: 'monospace'
  }
});
