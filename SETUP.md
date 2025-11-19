# Mod Cellular Setup Instructions

## Installation

```bash
# Navigate to project
cd "Mod Cellular"

# Install dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# iOS specific (if on macOS)
cd ios && pod install && cd ..
```

## Configuration

1. **Create .env file** in root directory:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_SERVER_URL=http://localhost:3000
```

2. **Set up Supabase**:
   - Create project at supabase.com
   - Run `supabase/schema.sql` in SQL editor
   - Copy URL and anon key to .env

3. **Configure server**:
   - Update `config/env.example` with your values
   - Copy to `.env` in server directory

## Running

### Start the Server
```bash
cd server
npm start
# Server runs on port 3000
```

### Start the App
```bash
# In root directory
npm start

# Then press:
# i - for iOS simulator
# a - for Android emulator
# w - for web
```

## Development

### Useful Commands
```bash
# Clear cache
npm start -- --clear

# Run TypeScript checks
npx tsc --noEmit

# Build for production
npm run build
```

### Architecture

**Core Engine** → Signal scanning, aggregation, routing  
**Mesh Layer** → BLE beacon, peer discovery  
**Crypto** → E2E encryption, device identity  
**Server** → WebSocket signaling, real-time sync  
**UI** → React Native screens and navigation  

### Next Steps

1. Test basic messaging flow
2. Implement WebRTC call signaling
3. Enable mesh peer discovery
4. Add DTN offline queue
5. Integrate signal aggregation

## Troubleshooting

**Metro bundler issues**: Run `npm start -- --reset-cache`  
**Expo config errors**: Delete `.expo` folder and restart  
**Bluetooth permissions**: Check iOS Info.plist and Android manifest  
**Supabase connection**: Verify URL and anon key in .env  

## Build Pack A Features

✅ Navigation system (Stack + Tabs)  
✅ Core screens (Home, Chat, Call, Story, Settings)  
✅ Message engine with Supabase  
✅ WebRTC call engine  
✅ BLE mesh beacon  
✅ Device identity system  
✅ Signaling server  

**Ready to expand with Build Pack B**
