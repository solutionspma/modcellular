/**
 * Phone Dialer Screen
 * 
 * Full-featured dial pad for making PSTN calls.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { initiateOutboundCall } from '../../telecom/pstnGateway';
import { routeOutboundCall } from '../../telecom/callRouter';

export default function PhoneDialerScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleDigitPress = (digit: string) => {
    setPhoneNumber(prev => prev + digit);
  };

  const handleBackspace = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleCall = async () => {
    if (!phoneNumber) return;

    try {
      // Route call through intelligent router
      const route = await routeOutboundCall({
        userId: 'current-user-id',
        fromNumber: '+12255551234',  // User's assigned number
        toNumber: phoneNumber,
        subscriptionTier: 'premium',
        networkQuality: 'excellent'
      });

      // Initiate call via selected route
      if (route.selectedRoute.method === 'pstn') {
        await initiateOutboundCall({
          from: '+12255551234',
          to: phoneNumber,
          userId: 'current-user-id'
        });
      }

      // Navigate to CallScreen
      console.log('Call initiated:', phoneNumber);
    } catch (error) {
      console.error('Call failed:', error);
    }
  };

  const DialButton = ({ digit, letters }: { digit: string; letters?: string }) => (
    <TouchableOpacity
      style={styles.dialButton}
      onPress={() => handleDigitPress(digit)}
    >
      <Text style={styles.digit}>{digit}</Text>
      {letters && <Text style={styles.letters}>{letters}</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.displayContainer}>
        <Text style={styles.phoneNumber}>{phoneNumber || 'Enter number'}</Text>
      </View>

      <View style={styles.dialPad}>
        <View style={styles.row}>
          <DialButton digit="1" />
          <DialButton digit="2" letters="ABC" />
          <DialButton digit="3" letters="DEF" />
        </View>
        <View style={styles.row}>
          <DialButton digit="4" letters="GHI" />
          <DialButton digit="5" letters="JKL" />
          <DialButton digit="6" letters="MNO" />
        </View>
        <View style={styles.row}>
          <DialButton digit="7" letters="PQRS" />
          <DialButton digit="8" letters="TUV" />
          <DialButton digit="9" letters="WXYZ" />
        </View>
        <View style={styles.row}>
          <DialButton digit="*" />
          <DialButton digit="0" letters="+" />
          <DialButton digit="#" />
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.backspaceButton} onPress={handleBackspace}>
          <Text style={styles.backspaceText}>⌫</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.callButton} onPress={handleCall}>
          <Text style={styles.callIcon}>📞</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  displayContainer: { height: 100, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  phoneNumber: { fontSize: 32, color: '#fff', fontWeight: '300' },
  dialPad: { flex: 1, justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  dialButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1c1c1e', justifyContent: 'center', alignItems: 'center' },
  digit: { fontSize: 32, color: '#fff', fontWeight: '400' },
  letters: { fontSize: 12, color: '#8e8e93', marginTop: 2 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  backspaceButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#1c1c1e', justifyContent: 'center', alignItems: 'center' },
  backspaceText: { fontSize: 28, color: '#fff' },
  callButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#34c759', justifyContent: 'center', alignItems: 'center' },
  callIcon: { fontSize: 32 }
});
