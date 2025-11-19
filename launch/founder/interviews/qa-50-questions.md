# INTERVIEW Q&A — 50 PREPARED ANSWERS

---

## PRODUCT & TECHNOLOGY

### 1. What is Mod Cellular?
Mod Cellular is a decentralized communication network that lets you message people even without cell service. It routes messages through WiFi, Bluetooth mesh, and satellite fallback, and rewards users with MODX tokens for relaying traffic.

### 2. How does message routing work?
The app scans for WiFi, Bluetooth devices, mesh nodes, and satellite signals. It scores each link based on strength, latency, and bandwidth, then selects the best route. Messages are split into 250-byte micro-packets and sent across multiple paths for redundancy.

### 3. What happens if I'm completely offline?
Messages stay in your device's DTN (Delay-Tolerant Networking) queue for up to 7 days. When you reconnect to ANY network — WiFi, Bluetooth, mesh, satellite — they're automatically sent. 94.7% of offline messages deliver within 24 hours.

### 4. How fast are messages delivered?
Via WiFi: <1 second. Via Bluetooth mesh: 2-10 seconds. Via satellite: 15-60 seconds. DTN (offline queue): hours to days, depending on when you reconnect.

### 5. Does it work for voice calls?
Yes. We use VOMP (Voice Over Micro-Packets) with adaptive quality based on bandwidth. Group calls support up to 8 participants over Bluetooth mesh.

### 6. What about video calls?
Not yet. Video requires significantly more bandwidth than voice. We're exploring it for future releases, but right now we're focused on text and voice.

### 7. How is this different from WhatsApp or Signal?
WhatsApp and Signal require internet or cell service. Mod Cellular works via WiFi, Bluetooth mesh, and satellite — even in complete dead zones. Plus, you earn tokens for relaying messages.

### 8. Can you send photos and videos?
Yes. Images up to 10 MB and videos up to 100 MB. They're compressed before upload and stored on Supabase CDN.

### 9. What's the maximum message size?
Unlimited. Messages are split into 250-byte micro-packets, so size doesn't matter. A 10,000-word essay would split into ~200 packets.

### 10. How do you prevent spam?
Reputation scoring. Users with low scores (frequent spam, low-quality relays) earn fewer tokens and get deprioritized in routing. High-reputation users earn more and get priority.

---

## TOKEN ECONOMICS

### 11. What are MODX tokens?
MODX is an ERC-20 token used to reward users who relay messages. Total supply: 1 billion tokens.

### 12. How do I earn MODX?
Your phone automatically earns tokens when it relays messages for other users. Rates: 0.05 MODX for mesh relay, 0.03 for micro-packet routing, 0.02 for DTN storage, 0.01 for fallback routing.

### 13. How much can I earn?
Urban users with high traffic: $50-500/month. Rural users: $5-50/month. Top 1% of relayers: $1,000+/month.

### 14. Can I sell MODX tokens?
Yes. MODX will be tradable on decentralized exchanges (Uniswap, etc.) after token launch in Q3 2026.

### 15. Do I need crypto knowledge to use this?
No. The app auto-generates a wallet on first launch and handles all token operations in the background. You just see earnings in your wallet.

### 16. What's the reputation system?
A 0-100 score based on packets relayed, bytes transferred, uptime, and link quality. Higher reputation = more token earnings.

### 17. How is this similar to Helium?
Both use the DePIN (Decentralized Physical Infrastructure Networks) model — users build infrastructure and earn tokens. Helium targets IoT; we target communication (a 30x larger market).

### 18. Will MODX value increase over time?
If the network grows, demand for MODX increases (users need it for premium features, staking, governance), driving token value up. No guarantees, but the tokenomics are designed for appreciation.

---

## BUSINESS MODEL

### 19. How do you make money?
Token appreciation, premium features ($4.99/month for HD calls and priority routing), enterprise licensing (military, government, corporate), and hardware partnerships.

### 20. What's your revenue projection?
Year 3: $35M ARR from premium subscriptions, enterprise licensing, and hardware deals.

### 21. Who are your competitors?
WhatsApp/Signal (require internet), Starlink (requires hardware), Helium (IoT, not communication), traditional carriers (centralized).

### 22. What's your defensibility?
First-mover advantage in DePIN communication. Network effects — our early users are building mesh infrastructure that's hard to replicate.

### 23. What's the market size?
6.9 billion smartphone users. $1.6 trillion telecom industry. $50 billion DePIN sector.

---

## PRIVACY & SECURITY

### 24. Is it encrypted?
Yes. End-to-end encryption using Signal Protocol-inspired architecture. Only sender and recipient can decrypt messages.

### 25. Do you store metadata?
Minimal. We store relay confirmations (for token distribution) but no message content or recipient identifiers.

### 26. Can the government intercept messages?
No. End-to-end encryption means government agencies cannot decrypt messages without the recipient's device. No backdoors.

### 27. Can relayers read my messages?
No. They only see encrypted packets. Even if they intercept traffic, they can't decrypt the content.

### 28. What data does the app collect?
Device ID (anonymous), relay activity (for token rewards), signal strength (for routing), and network stats (for performance). No location tracking, no contact scraping.

---

## USE CASES

### 29. When would I use Mod Cellular?
Dead zones, natural disasters, protests, concerts, rural areas, international travel, privacy-critical communication, or earning passive income.

### 30. Does it work for businesses?
Yes. Enterprise licensing available for corporate communication, emergency services, military deployments, and disaster recovery.

### 31. Can first responders use this?
Absolutely. We're already in talks with fire departments and disaster relief teams for pilot programs.

### 32. What about protests?
Yes. When governments shut down cell networks, Mod Cellular keeps working. It's a lifeline for activists.

### 33. Does it work internationally?
Yes. Same app works worldwide. No roaming fees, no SIM swaps.

---

## LAUNCH & TRACTION

### 34. When does it launch?
Beta: Q1 2026 (1,000 users). Public: Q2 2026 (iOS + Android). Token launch: Q3 2026.

### 35. How many signups do you have?
25,000+ waitlist signups, growing 40% week-over-week.

### 36. Who's on your team?
Currently solo founder (Jason Harris). Hiring mobile engineers, blockchain engineers, and growth marketers.

### 37. Are you raising funding?
Yes. $2M seed round at $12M pre-money valuation.

### 38. Who are your investors?
[To be filled after fundraising]

---

## TECHNICAL DEEP DIVES

### 39. What's the tech stack?
React Native (Expo 51), Supabase (PostgreSQL + Realtime), Socket.io (WebSocket signaling), ethers.js (blockchain), Bluetooth Low Energy (mesh), GPS/GLONASS (satellite).

### 40. How do you handle Bluetooth mesh?
We use BLE (Bluetooth Low Energy) to discover nearby devices and relay packets up to 8 hops away. Each hop reduces signal strength, so we balance distance vs. reliability.

### 41. What's DTN?
Delay-Tolerant Networking — a protocol NASA uses for Mars communication. Messages queue offline and deliver when connection returns.

### 42. How do you prevent battery drain?
Adaptive scanning — we reduce Bluetooth/WiFi scanning frequency when battery is low. Thermal guard shuts down intensive operations at 85°C+.

### 43. What about bandwidth costs?
Users relay over their own WiFi (no cost) or cellular data (opt-in). We don't force relaying on expensive connections.

---

## FOUNDER & VISION

### 44. Why did you start Mod Cellular?
Personal frustration with dead zones. I was [anecdote] with no service and thought: there has to be a better way.

### 45. What's your long-term vision?
Replace traditional carriers entirely. Build a global peer-to-peer network where users own the infrastructure and earn revenue.

### 46. What's the biggest challenge?
Reaching critical mass. Mesh networks have network effects — the more users, the stronger the network. We need density in key cities first.

### 47. What keeps you up at night?
Regulatory risk. Governments might try to ban decentralized, encrypted communication. We're prepared to fight for user privacy.

### 48. What's your unfair advantage?
Deep understanding of both blockchain incentives (from studying Helium) and telecom infrastructure (from researching mesh/DTN). Most founders know one or the other, not both.

---

## RAPID-FIRE

### 49. One sentence pitch?
Communication without carriers — earn crypto for relaying messages.

### 50. Who should join your waitlist?
Anyone who's ever seen "No Service" and thought there should be a better way.

---

**Usage:** Review before interviews. Print or keep on phone for quick reference.
