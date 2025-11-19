import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [meshEnabled, setMeshEnabled] = useState(true);
  const [dtnEnabled, setDtnEnabled] = useState(true);
  const [relayEnabled, setRelayEnabled] = useState(false);

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onValueChange, 
    type = 'toggle' 
  }: any) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={24} color="#007AFF" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'toggle' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#3A3A3C', true: '#007AFF' }}
          thumbColor="#fff"
        />
      )}
      {type === 'arrow' && (
        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CONNECTION</Text>
        
        <SettingItem
          icon="wifi"
          title="WiFi Scanning"
          subtitle="Scan for open networks"
          value={true}
          onValueChange={() => {}}
        />
        
        <SettingItem
          icon="bluetooth"
          title="Bluetooth Mesh"
          subtitle="Connect via nearby devices"
          value={meshEnabled}
          onValueChange={setMeshEnabled}
        />
        
        <SettingItem
          icon="satellite"
          title="Satellite Opportunistic"
          subtitle="Use satellite when available"
          value={false}
          onValueChange={() => {}}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FEATURES</Text>
        
        <SettingItem
          icon="time"
          title="Delay-Tolerant Networking"
          subtitle="Queue messages when offline"
          value={dtnEnabled}
          onValueChange={setDtnEnabled}
        />
        
        <SettingItem
          icon="git-network"
          title="Act as Relay Node"
          subtitle="Help route messages for others"
          value={relayEnabled}
          onValueChange={setRelayEnabled}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        
        <SettingItem
          icon="person-circle"
          title="Profile"
          subtitle="Edit your profile"
          type="arrow"
        />
        
        <SettingItem
          icon="shield-checkmark"
          title="Privacy & Security"
          subtitle="End-to-end encryption"
          type="arrow"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ADVANCED</Text>
        
        <SettingItem
          icon="bar-chart"
          title="Network Stats"
          subtitle="View connection analytics"
          type="arrow"
        />
        
        <SettingItem
          icon="build"
          title="Developer Mode"
          subtitle="Debug tools and logs"
          type="arrow"
        />
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Mod Cellular Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Device ID:</Text>
          <Text style={styles.statusValue}>MCL-A3F8-92B1</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Active Peers:</Text>
          <Text style={styles.statusValue}>3 devices</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Relay Status:</Text>
          <Text style={styles.statusValue}>{relayEnabled ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>

      <Text style={styles.version}>Mod Cellular v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1C1C1E',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 2,
  },
  statusCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
  },
  statusTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    color: '#8E8E93',
    fontSize: 14,
  },
  statusValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  version: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 24,
  },
});
