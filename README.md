# Zen Scan - Mindful Blockchain Security

**Zen Scan** is a Telegram Mini App that brings mindfulness to blockchain security. By combining AI-powered risk analysis with meditation practices, it encourages users to achieve mental clarity before making critical decisions about TON blockchain contracts.

> *"True security comes not just from analysis, but from the calm, focused mind that interprets it."*

## 🎯 Concept

In the fast-paced world of crypto, users often make hasty decisions that lead to security breaches. Zen Scan introduces a unique approach: when risk is detected, users must complete a meditation session—holding their phone horizontally in stillness—before proceeding. The duration scales with risk level, creating a natural pause for reflection.

### Key Features

- **AI-Powered Risk Analysis**: Amazon Bedrock analyzes TON contract transaction patterns
- **Zen-Inspired Guidance**: Poetic nature metaphors guide users through risk levels
- **Meditation Requirement**: Gyroscope-tracked horizontal meditation for high-risk contracts
- **Real-Time Data**: TonAPI integration for live transaction history
- **Calming Aesthetic**: Ink wash painting style, Enso circles, water ripples

## 🏗️ Architecture

### Technology Stack

**Frontend & Backend:**
- **React Router v7** (Framework mode with SSR)
- **TypeScript** for type safety
- **Telegram Mini Apps SDK** (@tma.js) for device sensors
- **pnpm** monorepo management

**AI & Data:**
- **Amazon Bedrock** (Amazon Nova Lite) for risk analysis
- **TonAPI.io** for TON blockchain data
- **Custom prompt engineering** for zen-inspired responses

**Infrastructure (AWS Serverless):**
- **AWS Lambda** for compute
- **Amazon CloudFront** for CDN
- **Amazon DynamoDB** for session storage
- **AWS WAF** for security
- **AWS CodeCommit + CodeBuild** for CI/CD
- **Amazon CloudWatch** for monitoring

### Architecture Diagram

```
┌─────────────┐
│   Telegram  │
│   Mini App  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│     CloudFront + WAF (DDoS)         │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│   Lambda@Edge (Auth & Routing)      │
└──────┬──────────────────────────────┘
       │
       ├──────────────┬─────────────────┐
       ▼              ▼                 ▼
┌──────────┐   ┌──────────┐     ┌──────────┐
│  Lambda  │   │  Lambda  │     │ DynamoDB │
│  (SSR)   │   │  (Bot)   │     │ Sessions │
└────┬─────┘   └────┬─────┘     └──────────┘
     │              │
     ▼              ▼
┌──────────┐   ┌──────────┐
│ Bedrock  │   │ TonAPI   │
│   AI     │   │  .io     │
└──────────┘   └──────────┘
```

## 🎨 User Experience Flow

1. **Scan Phase**: User enters TON contract/Jetton address
2. **Analysis Phase**: 
   - Fetch transaction history from TonAPI
   - AI analyzes patterns for suspicious activity
   - Generate zen-inspired risk guidance
3. **Meditation Phase** (if risk > 40):
   - Hold phone horizontally
   - Achieve stillness (gyroscope tracking)
   - Duration scales with risk level
4. **Completion**: Proceed with clarity

### Meditation Mechanics

- **Tilt Tolerance**: ±5° (critical) to ±15° (medium) from horizontal
- **Duration**: 15s (medium risk) → 60s (critical risk)
- **Visual Feedback**: Canvas-based water ripples, Enso circle, tilt indicator
- **Haptic Feedback**: Subtle vibrations for state changes

## 🤖 AI Implementation

### Risk Analysis Prompt Engineering

The AI prompt is carefully crafted to:
- Analyze transaction patterns (draining, honeypot, rug pull indicators)
- Generate zen-inspired warnings using nature metaphors
- Provide technical explanations and recommendations
- Return structured JSON responses

### Example AI Output

```json
{
  "score": 65,
  "level": "high",
  "zenWarning": {
    "jp": "危険",
    "en": "Storm clouds gather on the horizon"
  },
  "technicalExplanation": "Contract shows unusual outflow patterns...",
  "redFlags": ["High transaction frequency", "Unknown interactions"],
  "recommendation": "Exercise extreme caution before proceeding"
}
```

### Fallback Strategy

When AI returns unexpected formats, the system:
1. Validates response structure
2. Converts string warnings to proper format
3. Selects level-appropriate Japanese kanji
4. Ensures consistent user experience

## 🔧 Technical Highlights

### 1. Gyroscope-Based Meditation

```typescript
// Real-time device orientation tracking
const { beta, gamma } = orientation;
const tiltAngle = Math.sqrt(beta * beta + gamma * gamma);
const isStable = tiltAngle <= tolerance;
```

### 2. Canvas-Based Water Ripple Animation

```typescript
// Dynamic ripple count based on intensity
const rippleCount = 3 + Math.floor(intensity * 4);

// Ripple distortion for organic feel
const distortion = intensity * 10 * Math.sin(t * 3 + i);
const r = radius + distortion * Math.sin(angle * 3 + t);
```

### 3. iOS-Style Glassmorphism

```css
background: rgba(30, 35, 46, 0.20);
backdrop-filter: blur(8px);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 16px;
```

### 4. Meditation Configuration by Risk Level

| Risk Level | Duration | Tilt Tolerance | Stability Required |
|------------|----------|----------------|-------------------|
| Medium (41-60) | 15s | ±15° | 60% |
| High (61-80) | 30s | ±10° | 75% |
| Critical (81-100) | 60s | ±5° | 90% |

### 5. Serverless Scalability

- **Cold start optimization**: < 500ms
- **Auto-scaling**: 0 to 1000+ concurrent users
- **Cost efficiency**: Pay-per-request model
- **Global CDN**: Low latency worldwide

## 📊 AWS Services & Costs

| Service | Purpose | Pricing Model |
|---------|---------|---------------|
| **Lambda** (ARM, 256MB) | Compute | ~$0.20 per million requests |
| **Bedrock** (Nova Lite) | AI inference | ~$0.06 per million input tokens |
| **CloudFront** | CDN | $0.085 per GB + $0.01 per 10K requests |
| **DynamoDB** | Session storage | $0.625 per million writes |
| **WAF** | Security | $5/month base + $0.60 per million requests |

**Estimated cost for 1000 active users/month**: ~$15-30

## 🚀 Deployment

### Prerequisites

- AWS CLI v2
- Node.js v22+
- pnpm v10.20+
- Telegram Bot Token (from @BotFather)

### Quick Start

> ⚠️ Both `gui/` and `bot/` directories contain customizations from the original template. Make sure to clone the entire repository.

```bash
# Clone repository
git clone <repository-url>
cd zen-scan

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Deploy to AWS
pnpm run deploy

# Configure Telegram Bot
# Follow instructions in docs/REPORT.md
```

### Local Development

```bash
# Start dev server
pnpm dev

# Access at http://localhost:5173
```

## 🎓 Development Insights

### Challenges Overcome

1. **AI Response Consistency**: Bedrock models struggled with nested JSON objects. Solution: Implemented robust validation and fallback logic.

2. **Gyroscope Accuracy**: Device sensors vary across platforms. Solution: Circular tolerance calculation and smoothing algorithms.

3. **Meditation UX**: Balancing strictness with usability. Solution: Visual feedback, haptic cues, and progressive difficulty.

4. **Serverless SSR**: React Router v7 in Lambda. Solution: Custom build pipeline and edge routing.

### Key Learnings

- **Prompt Engineering**: Iterative refinement crucial for AI reliability
- **Sensor Fusion**: Combining gyroscope, haptics, and visual feedback
- **Zen Philosophy**: Simplicity and clarity in design decisions
- **Serverless Patterns**: Cold start optimization and stateless architecture

## 📱 Demo

**Telegram Mini App:** [https://t.me/zen_scan_bot/app](https://t.me/zen_scan_bot/app)

**Web App:** [https://d3nowvfeajy85g.cloudfront.net/app](https://d3nowvfeajy85g.cloudfront.net/app)

> 📲 This app uses the gyroscope for meditation tracking. For the best experience, use the Telegram Mini App on your mobile device.

**Test Addresses:**
- Safe: [EQBRBreA0bxgUMSzl-C4mWMaEMlne4R1e3ne8TlBcn2Eq8SY](https://tonviewer.com/EQBRBreA0bxgUMSzl-C4mWMaEMlne4R1e3ne8TlBcn2Eq8SY)
- Risky: [EQBenYZM6nFbinA7QGAOSvNwWsGP79n3wuOgQL7g8JpKJ0o6](https://tonviewer.com/EQBenYZM6nFbinA7QGAOSvNwWsGP79n3wuOgQL7g8JpKJ0o6)

## 🏆 Hackathon Submission

### Innovation Points

1. **Novel UX Pattern**: First app to combine meditation with security analysis
2. **AI Integration**: Advanced prompt engineering for zen-inspired guidance
3. **Technical Excellence**: Serverless architecture, sensor fusion, smooth animations
4. **User Psychology**: Addresses impulsive decision-making in crypto
5. **Production Ready**: Full CI/CD, monitoring, scalability


## 📄 License

MIT-0 License - See LICENSE file for details

## 🙏 Acknowledgments

- **TON Foundation** for blockchain infrastructure
- **AWS** for serverless platform
- **Telegram** for Mini Apps SDK
- **TonAPI.io** for blockchain data
- **Zen philosophy** for inspiration

---

Built with ❤️ for the TON Hackathon 2026
