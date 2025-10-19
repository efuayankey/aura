# AURA - AI Balance Agent

> Your personal wellness-aware productivity assistant that creates intelligent, balanced schedules using AI.

## Hackathon Project

**Team:** Efua, Alicia, Vanessa, Jonathan  
**University:** Lehigh University  
**Theme:** Life Hacking - Building tools that improve everyday routines, productivity, wellness, and personal growth

## What Makes AURA Different

Unlike generic planners or Pomodoro apps, AURA uses **AI reasoning** to understand your energy, mood, and context - creating schedules that prioritize both productivity AND well-being.

## Core Features

- **AI-Powered Scheduling** - Uses OpenAI GPT-4 for intelligent task planning
- **Balance Score System** - Real-time wellness metrics (0-100 scale)
- **Wellness Interventions** - Smart break recommendations based on mood/energy
- **Dynamic Replanning** - Adapts schedule as you complete or skip tasks
- **Beautiful UI** - Calming, professional design with glassmorphism effects

## How It Works

1. **Smart Input**: Tell AURA your tasks, time window, mood, and energy level
2. **AI Reasoning**: Bedrock (Claude) analyzes your context and creates an optimized schedule
3. **Balanced Planning**: Automatically includes appropriate breaks and wellness activities
4. **Live Tracking**: Check off tasks and watch your Balance Score update in real-time
5. **Adaptive Coaching**: Get personalized recommendations based on your progress

## Tech Stack

- **Frontend**: Next.js 15 + React + TypeScript
- **Styling**: Tailwind CSS + Custom animations
- **Icons**: Lucide React
- **Deployment**: AWS Amplify
- **AWS resources**: AWS Bedrock, DynamoDB, Amazon Polly, SNS

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/efuayankey/aura.git
   cd aura
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Add your AWS API key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

## Usage

1. **Add your tasks** with estimated time and priority
2. **Set your time window** (e.g., 2:00 PM - 6:00 PM)
3. **Choose your mood** and energy level
4. **Click "Generate My Perfect Day"**
5. **Watch AI create** your personalized balanced schedule
6. **Track progress** by checking off completed items
7. **Monitor your Balance Score** in real-time

## Design Philosophy

AURA focuses on **balance** - the harmony between focus, rest, and self-care. The interface uses calming colors, smooth animations, and mindful interactions to promote wellness alongside productivity.

## Contributing

This is a hackathon project, but we welcome feedback and suggestions! Feel free to open issues or submit pull requests.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**Built with wellness in mind by students, for students**  
*AURA - Where AI meets mindful productivity*
