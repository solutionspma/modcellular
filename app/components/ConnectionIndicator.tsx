import { View, Text, StyleSheet } from 'react-native';
import { AggregatedLink } from '../../core/aggregation/signalAggregatorEngine';

interface ConnectionIndicatorProps {
  link: AggregatedLink | null;
  protocol?: string;
}

export default function ConnectionIndicator({ link, protocol }: ConnectionIndicatorProps) {
  if (!link) {
    return (
      <View style={styles.container}>
        <View style={[styles.dot, styles.offline]} />
        <Text style={styles.textBad}>Offline • DTN Mode</Text>
      </View>
    );
  }

  const getStatusColor = () => {
    if (link.score > 80) return styles.excellent;
    if (link.score > 60) return styles.good;
    if (link.score > 40) return styles.moderate;
    return styles.weak;
  };

  const getStatusText = () => {
    const type = link.type.toUpperCase();
    const strength = Math.round(link.strength);
    const proto = protocol ? ` • ${protocol}` : '';
    return `${type} • ${strength} dBm${proto}`;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.dot, getStatusColor()]} />
      <Text style={styles.textGood}>{getStatusText()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#1C1C1E',
    borderRadius: 8
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8
  },
  excellent: {
    backgroundColor: '#34C759'
  },
  good: {
    backgroundColor: '#32D74B'
  },
  moderate: {
    backgroundColor: '#FFD60A'
  },
  weak: {
    backgroundColor: '#FF9F0A'
  },
  offline: {
    backgroundColor: '#FF3B30'
  },
  textGood: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  textBad: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600'
  }
});
