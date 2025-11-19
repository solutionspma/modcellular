# Mod Cellular

**Software-defined communication chassis + universal messaging app**

A revolutionary communication platform that aggregates ANY available signal (Wi-Fi, open hotspots, BT mesh, P2P relays, weak cellular, opportunistic satellite) into a usable data channel.

## Features

✅ **Operates without cellular service**  
✅ **Auto-connects to any available signal**  
✅ **Mesh network fallback**  
✅ **Delay-tolerant messaging**  
✅ **WebRTC calls on micro-bandwidth**  
✅ **Works on old phones**  
✅ **Works internationally**  
✅ **Developer SDK available**

## Architecture

### Core Modules

- **Signal Scanners** - WiFi, Bluetooth, Satellite, Mesh detection
- **Aggregation Layer** - Signal combining, packet balancing, micro-packet engine
- **Routing Engine** - Smart routing, fallback, mesh relay, DTN
- **Crypto & Identity** - E2E encryption, device fingerprinting, session management
- **Server** - WebSocket signaling, WebRTC STUN/TURN, real-time messaging

### Mobile App

- React Native + Expo
- Cross-platform (iOS, Android)
- Tabs: Messages, Calls, Stories, Settings
- Offline-first architecture
- Real-time connection monitoring

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Supabase account

### Installation

```bash
# Clone repository
cd "Mod Cellular"

# Install dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Start development
npm run dev
```

### Environment Setup

Copy `config/env.example` to `.env` and configure:

```bash
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
PORT=3000
```

### Database Setup

Run the Supabase schema:

```bash
# In Supabase dashboard, run supabase/schema.sql
```

### Run the App

```bash
# Start Expo
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Start server
npm run server
```

## SDK Usage

```typescript
import ModCellular from 'modcellular-sdk';

await ModCellular.initialize({
  serverUrl: 'https://your-server.com',
  enableMesh: true,
  enableDTN: true
});

ModCellular.onConnectionChange((status) => {
  console.log('Signal:', status.primarySource?.name);
});

await ModCellular.sendMessage(userId, 'Hello!');
```

## Monetization

### Free Tier
- Unlimited messaging
- Limited VoIP minutes

### Premium ($9.99/month)
- Unlimited calling
- Satellite opportunistic routing
- Cloud stories backup
- Custom usernames

### Enterprise SDK License
- Other apps use Mod Cellular as signal stack
- Revenue share model

## Technology Stack

- **Frontend**: React Native, Expo, TypeScript
- **Backend**: Node.js, Express, Socket.io
- **Database**: Supabase (PostgreSQL)
- **Real-time**: WebSocket, WebRTC
- **Crypto**: E2E encryption (Signal Protocol concepts)

## Project Structure

```
modcellular/
├── app/                    # React Native UI
│   ├── (tabs)/            # Tab navigation
│   └── screens/           # App screens
├── core/                  # Core communication engine
│   ├── scanners/          # Signal detection
│   ├── aggregation/       # Signal combining
│   ├── routing/           # Packet routing
│   ├── crypto/            # Encryption
│   └── identity/          # Device identity
├── server/                # Backend server
│   └── index.js           # WebSocket + API
├── sdk/                   # Developer SDK
│   └── index.ts           # Public API
├── supabase/              # Database schema
└── config/                # Configuration
```

## Contributing

Contributions welcome! This is a revolutionary communication platform.

## License

MIT

---

**Mod Cellular** - Communication without boundaries.
