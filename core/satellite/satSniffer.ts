import * as Location from 'expo-location';

export interface SatelliteSignal {
  type: 'satellite';
  strength: number;
  open: boolean;
  provider: string;
  accuracy: number | null;
  satelliteCount: number;
}

export async function sniffSatellite(): Promise<SatelliteSignal | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const providerStatus = await Location.getProviderStatusAsync();
    
    // Get current location to verify GPS lock
    let accuracy = null;
    let satelliteCount = 0;

    if (providerStatus.gpsAvailable) {
      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        accuracy = position.coords.accuracy;
        // Estimate satellite count from accuracy
        satelliteCount = accuracy ? Math.max(4, Math.floor(20 - accuracy / 5)) : 0;
      } catch (error) {
        console.log('GPS lock failed:', error);
      }
    }

    const strength = providerStatus.gpsAvailable 
      ? (accuracy ? Math.min(70, 100 - accuracy) : 40)
      : 0;

    return {
      type: 'satellite',
      strength,
      open: providerStatus.gpsAvailable || false,
      provider: 'GPS/GLONASS',
      accuracy,
      satelliteCount
    };
  } catch (error) {
    console.error('Satellite sniff error:', error);
    return null;
  }
}

export async function isSatelliteAvailable(): Promise<boolean> {
  const signal = await sniffSatellite();
  return signal !== null && signal.strength > 20;
}
