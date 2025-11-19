export type ThermalState = 'OK' | 'WARM' | 'HOT' | 'THROTTLE' | 'CRITICAL';

export interface ThermalStatus {
  state: ThermalState;
  cpuUsage: number;
  temperature: number;
  recommendation: string;
  shouldReduceLoad: boolean;
}

export function checkThermals(cpuUsage: number, temperature: number): ThermalStatus {
  let state: ThermalState = 'OK';
  let recommendation = 'Normal operation';
  let shouldReduceLoad = false;

  // Temperature thresholds (Celsius)
  if (temperature > 95) {
    state = 'CRITICAL';
    recommendation = 'Emergency shutdown - reduce all operations';
    shouldReduceLoad = true;
  } else if (temperature > 85) {
    state = 'THROTTLE';
    recommendation = 'High temperature - throttling CPU intensive tasks';
    shouldReduceLoad = true;
  } else if (temperature > 75) {
    state = 'HOT';
    recommendation = 'Elevated temperature - reducing background operations';
    shouldReduceLoad = true;
  } else if (temperature > 65) {
    state = 'WARM';
    recommendation = 'Temperature rising - monitoring closely';
    shouldReduceLoad = false;
  }

  // CPU usage thresholds
  if (cpuUsage > 95) {
    state = state === 'OK' ? 'THROTTLE' : state;
    recommendation = 'CPU maxed - reducing load';
    shouldReduceLoad = true;
  } else if (cpuUsage > 85) {
    state = state === 'OK' ? 'HOT' : state;
    recommendation = 'High CPU usage - optimizing';
    shouldReduceLoad = true;
  }

  return {
    state,
    cpuUsage,
    temperature,
    recommendation,
    shouldReduceLoad
  };
}

export function getRecommendedOperationMode(status: ThermalStatus): 'full' | 'reduced' | 'minimal' | 'emergency' {
  switch (status.state) {
    case 'OK':
    case 'WARM':
      return 'full';
    case 'HOT':
      return 'reduced';
    case 'THROTTLE':
      return 'minimal';
    case 'CRITICAL':
      return 'emergency';
  }
}

export function shouldDisableFeature(feature: string, status: ThermalStatus): boolean {
  const mode = getRecommendedOperationMode(status);

  const featureProfiles = {
    'video-call': ['emergency', 'minimal'],
    'mesh-relay': ['emergency'],
    'background-sync': ['emergency', 'minimal', 'reduced'],
    'encryption': [], // Never disable
    'signal-scan': ['emergency', 'minimal']
  };

  const disabledModes = featureProfiles[feature as keyof typeof featureProfiles] || [];
  return disabledModes.includes(mode);
}

export function calculateCoolingDelay(status: ThermalStatus): number {
  switch (status.state) {
    case 'CRITICAL':
      return 60000; // 1 minute
    case 'THROTTLE':
      return 30000; // 30 seconds
    case 'HOT':
      return 15000; // 15 seconds
    case 'WARM':
      return 5000;  // 5 seconds
    default:
      return 0;
  }
}
