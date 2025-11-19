import { View, ScrollView, Text, StyleSheet, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { aggregateSignals, AggregatedLink } from '../../core/aggregation/signalAggregatorEngine';
import SignalGraph from '../components/SignalGraph';
import MeshNodeList from '../components/MeshNodeList';
import deviceIdentity from '../../core/identity/deviceIdentity';
import { getDTNQueueSize } from '../../core/routing/dtnEngine';
import { predictRoute, getAverageLatency, getSuccessRate } from '../../core/engine/predictiveRouting';

export default function SignalDashboard() {
  const [links, setLinks] = useState<AggregatedLink[]>([]);
  const [deviceId, setDeviceId] = useState<string>('');
  const [dtnQueue, setDTNQueue] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);
  const [routeQuality, setRouteQuality] = useState<string>('unknown');
  const [avgLatency, setAvgLatency] = useState<number>(0);
  const [successRate, setSuccessRate] = useState<number>(0);

  const loadData = async () => {
    const identity = await deviceIdentity.initialize();
    setDeviceId(identity.deviceId);
    
    const aggregated = await aggregateSignals(identity.deviceId);
    setLinks(aggregated);
    
    const queue = await getDTNQueueSize();
    setDTNQueue(queue);
    
    setRouteQuality(predictRoute());
    setAvgLatency(getAverageLatency());
    setSuccessRate(getSuccessRate());
  };

  useEffect(() => {
    loadData();
    
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Signal Engine Dashboard</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Device ID</Text>
          <Text style={styles.statValue}>{deviceId.substring(0, 12)}...</Text>
        </View>
        
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>DTN Queue</Text>
          <Text style={styles.statValue}>{dtnQueue}</Text>
        </View>
        
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Route Quality</Text>
          <Text style={[styles.statValue, styles.quality]}>
            {routeQuality.toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Avg Latency</Text>
          <Text style={styles.statValue}>{Math.round(avgLatency)}ms</Text>
        </View>
        
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Success Rate</Text>
          <Text style={styles.statValue}>{Math.round(successRate)}%</Text>
        </View>
        
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Active Links</Text>
          <Text style={styles.statValue}>{links.length}</Text>
        </View>
      </View>
      
      <SignalGraph links={links} />
      <MeshNodeList />
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Last updated: {new Date().toLocaleTimeString()}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20
  },
  statBox: {
    width: '48%',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginRight: '2%',
    marginBottom: 10
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 8
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  quality: {
    color: '#34C759'
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center'
  },
  footerText: {
    color: '#8E8E93',
    fontSize: 12
  }
});
