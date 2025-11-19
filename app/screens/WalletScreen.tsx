import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { getWalletInfo, exportPrivateKey } from '../../blockchain/wallet';
import { getTotalEarnings, getEarningsByType, getReputationMetrics, calculateReputationScore } from '../../blockchain/rewardsEngine';
import { getDePINMetrics, updateDePINMetrics, exportDePINReport, getNetworkImpact } from '../../blockchain/depinMetrics';
import * as Clipboard from 'expo-clipboard';

export default function WalletScreen() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [reputation, setReputation] = useState<number>(0);
  const [metrics, setMetrics] = useState<any>(null);
  const [networkImpact, setNetworkImpact] = useState<string>('');

  useEffect(() => {
    loadWalletData();
    
    const interval = setInterval(loadWalletData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadWalletData = async () => {
    const info = await getWalletInfo();
    setWalletAddress(info.address);
    
    const earnings = getTotalEarnings();
    setTotalEarnings(earnings);
    
    const score = calculateReputationScore();
    setReputation(score);
    
    const depinMetrics = updateDePINMetrics();
    setMetrics(depinMetrics);
    
    setNetworkImpact(getNetworkImpact());
  };

  const copyAddress = async () => {
    await Clipboard.setStringAsync(walletAddress);
    Alert.alert('Copied', 'Wallet address copied to clipboard');
  };

  const exportKey = async () => {
    Alert.alert(
      'Export Private Key',
      'Your private key gives full access to your wallet. Keep it safe!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          style: 'destructive',
          onPress: async () => {
            const pk = await exportPrivateKey();
            await Clipboard.setStringAsync(pk);
            Alert.alert('Exported', 'Private key copied to clipboard');
          }
        }
      ]
    );
  };

  const viewReport = async () => {
    const report = await exportDePINReport();
    Alert.alert('DePIN Report', report);
  };

  const meshEarnings = getEarningsByType('mesh');
  const dtnEarnings = getEarningsByType('dtn');
  const fallbackEarnings = getEarningsByType('fallback');

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Modular Wallet</Text>
      
      <View style={styles.walletCard}>
        <Text style={styles.label}>Wallet Address</Text>
        <TouchableOpacity onPress={copyAddress}>
          <Text style={styles.address}>{walletAddress}</Text>
        </TouchableOpacity>
        
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Total Earnings</Text>
          <Text style={styles.balance}>{totalEarnings.toFixed(4)} MODX</Text>
        </View>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Network Reputation</Text>
        
        <View style={styles.reputationContainer}>
          <View style={styles.reputationCircle}>
            <Text style={styles.reputationScore}>{reputation}</Text>
            <Text style={styles.reputationMax}>/100</Text>
          </View>
          <View style={styles.impactContainer}>
            <Text style={styles.impactLabel}>Network Impact</Text>
            <Text style={styles.impactValue}>{networkImpact}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Contribution Breakdown</Text>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Mesh Relay</Text>
          <Text style={styles.statValue}>{meshEarnings.toFixed(4)} MODX</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>DTN Storage</Text>
          <Text style={styles.statValue}>{dtnEarnings.toFixed(4)} MODX</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Fallback Routing</Text>
          <Text style={styles.statValue}>{fallbackEarnings.toFixed(4)} MODX</Text>
        </View>
      </View>

      {metrics && (
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>DePIN Metrics</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Packets Relayed</Text>
            <Text style={styles.statValue}>{metrics.packetsRelayed.toLocaleString()}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Data Contributed</Text>
            <Text style={styles.statValue}>
              {(metrics.bytesContributed / 1000000).toFixed(2)} MB
            </Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Uptime</Text>
            <Text style={styles.statValue}>{metrics.uptimeHours.toFixed(1)} hrs</Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={viewReport}>
        <Text style={styles.buttonText}>📊 View Full Report</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={exportKey}>
        <Text style={styles.buttonText}>🔑 Export Private Key</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Your wallet is secured on-device. Mod Cellular never has access to your private keys.
      </Text>
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
  walletCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20
  },
  label: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 8
  },
  address: {
    color: '#007AFF',
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 20
  },
  balanceContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E'
  },
  balanceLabel: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 8
  },
  balance: {
    color: '#34C759',
    fontSize: 32,
    fontWeight: 'bold'
  },
  statsCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16
  },
  reputationContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  reputationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20
  },
  reputationScore: {
    color: '#34C759',
    fontSize: 36,
    fontWeight: 'bold'
  },
  reputationMax: {
    color: '#8E8E93',
    fontSize: 14
  },
  impactContainer: {
    flex: 1
  },
  impactLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 4
  },
  impactValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E'
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 14
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12
  },
  dangerButton: {
    backgroundColor: '#FF3B30'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  disclaimer: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 40
  }
});
