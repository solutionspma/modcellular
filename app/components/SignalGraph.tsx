import { View, Text, StyleSheet } from 'react-native';
import { AggregatedLink } from '../../core/aggregation/signalAggregatorEngine';

interface SignalGraphProps {
  links: AggregatedLink[];
}

export default function SignalGraph({ links }: SignalGraphProps) {
  const getBarColor = (score: number): string => {
    if (score > 80) return '#34C759';
    if (score > 60) return '#32D74B';
    if (score > 40) return '#FFD60A';
    if (score > 20) return '#FF9F0A';
    return '#FF3B30';
  };

  const getTypeIcon = (type: string): string => {
    const icons: { [key: string]: string } = {
      wifi: '📡',
      satellite: '🛰️',
      mesh: '🔗',
      bluetooth: '🔵',
      rogue: '📶'
    };
    return icons[type] || '📡';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Signal Sources</Text>
      
      {links.length === 0 && (
        <Text style={styles.noSignals}>No signals detected</Text>
      )}
      
      {links.map((link, index) => (
        <View key={index} style={styles.signalRow}>
          <View style={styles.labelContainer}>
            <Text style={styles.icon}>{getTypeIcon(link.type)}</Text>
            <Text style={styles.typeLabel}>{link.type.toUpperCase()}</Text>
          </View>
          
          <View style={styles.barContainer}>
            <View 
              style={[
                styles.bar, 
                { 
                  width: `${Math.min(100, link.score)}%`,
                  backgroundColor: getBarColor(link.score)
                }
              ]} 
            />
          </View>
          
          <View style={styles.statsContainer}>
            <Text style={styles.scoreText}>{Math.round(link.score)}</Text>
            <Text style={styles.strengthText}>{link.strength} dBm</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16
  },
  noSignals: {
    color: '#8E8E93',
    textAlign: 'center',
    padding: 20
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120
  },
  icon: {
    fontSize: 20,
    marginRight: 8
  },
  typeLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  barContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 8
  },
  bar: {
    height: '100%',
    borderRadius: 10
  },
  statsContainer: {
    width: 80,
    alignItems: 'flex-end'
  },
  scoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  strengthText: {
    color: '#8E8E93',
    fontSize: 11
  }
});
