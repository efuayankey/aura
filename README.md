# AURA: Your AI Balance Agent 🌱✨

**Where wellness meets productivity** — A fully functional Next.js 14 app that creates personalized, balanced schedules using AI.

![AURA Banner](https://img.shields.io/badge/AURA-AI%20Balance%20Agent-00b377?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)

---

## 🎨 Design Features

- **Soft Mint Gradient Background**: Beautiful `#e6fff5 → #f8fff9` gradient
- **Emerald Green Theme**: Bold headings in `#007b55`
- **Teal Action Buttons**: `#00b377` with gradient hover effects
- **Clean Typography**: Inter & Poppins fonts
- **Glassmorphism Effects**: Subtle transparency and backdrop blur
- **Smooth Animations**: Fade-in, slide-up transitions throughout
- **Fully Responsive**: Mobile-first design that works on all devices

---

## ✨ Core Features

### 📋 1. Task Management
- Add unlimited tasks with custom names
- Set priority levels (Low, Medium, High)
- Define estimated time per task (in minutes)
- Delete tasks easily
- Real-time task list updates

### ⏰ 2. Availability Window
- Custom start and end time pickers
- Live calculation of available hours
- Flexible scheduling from any time range

### 🌱 3. Mood & Energy Tracking
- **4 Mood States**:
  - ⚡ Energized
  - 🍃 Balanced (default)
  - 🌙 Tired
  - ⚠️ Stressed
- **Energy Slider**: 1-10 scale with visual feedback
- AI adjusts schedule based on your current state

### 🤖 4. AI Schedule Generation
- Intelligent task prioritization
- Automatic break insertion (15-min intervals)
- Wellness breaks after 90 minutes of work
- Mood-adaptive scheduling
- Energy-aware time estimates

### 📆 5. Smart Schedule Display
- Time-blocked schedule cards with pastel colors
- **Three action buttons per task**:
  - ✅ **Complete** → +10 points
  - ⏭ **Skip** → -5 points
  - 🔁 **Reschedule** → -2 points
- Visual distinction between work, wellness, and break activities
- Completed tasks show with strikethrough and green highlighting

### 📊 6. Balance Score System
- **Overall Score** (0-100) with circular progress indicator
- **Three Sub-Scores**:
  - 🎯 **Productivity**: Task completion and work efficiency
  - ❤️ **Wellness**: Break adherence and self-care
  - 📈 **Consistency**: Schedule balance and sustainability
- Real-time score updates based on actions
- Color-coded feedback (green = great, yellow = good, red = needs improvement)

### 📈 7. Today's Stats Panel
- **Completed Tasks**: X/Y tracker
- **Progress Bar**: Visual percentage completion
- **Work Time**: Total hours of productive work
- **Energy Level**: Current energy rating
- **Total Points**: Cumulative score from all actions

### 🔔 8. Smart Notifications
- **10-Minute Warning**: Modal appears before task ends
- Ask: "Are you done with [Task Name]?"
- **Options**:
  - "Yes, I'm Done!" → Mark complete
  - "Reschedule (-2 pts)" → Move to next slot

### 💾 9. LocalStorage Persistence
- Automatic save on every state change
- Restore schedule on page reload
- Maintains completed tasks and points
- No data loss on browser refresh

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Lucide React** | Beautiful icon library |
| **OpenAI API** | AI-powered schedule generation (optional) |
| **LocalStorage** | Client-side data persistence |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx            # Main app component
│   ├── globals.css         # Global styles & mint gradient
│   └── api/
│       ├── schedule/       # AI schedule generation endpoint
│       └── wellness/       # Wellness recommendations endpoint
├── components/
│   ├── TaskInput.tsx       # Task input & management
│   ├── AvailabilityPicker.tsx  # Time range selector
│   ├── FeelingSelector.tsx     # Mood & energy inputs
│   ├── LoadingScreen.tsx       # AI generation loading state
│   ├── Schedule.tsx            # Schedule display with actions
│   ├── ScoreBoard.tsx          # Balance score & stats
│   └── NotificationModal.tsx   # 10-min warning modal
├── lib/
│   ├── aiScheduler.ts      # Local AI scheduling logic
│   ├── balanceScore.ts     # Score calculation algorithms
│   └── openaiScheduler.ts  # OpenAI API integration
└── types/
    └── index.ts            # TypeScript interfaces
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd aura

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Optional: OpenAI Integration

For enhanced AI scheduling, set up OpenAI API:

```bash
# Create .env.local file
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env.local
```

**Note**: The app works perfectly without OpenAI — it falls back to intelligent local scheduling.

---

## 🎮 How to Use

### Step 1: Add Your Tasks
1. Type a task name (e.g., "Study for calc exam")
2. Click the green **+** button
3. Set priority and estimated time
4. Repeat for all tasks

### Step 2: Set Your Availability
1. Choose start time (default: 09:00 AM)
2. Choose end time (default: 05:00 PM)
3. See available hours calculated automatically

### Step 3: Select Your Mood
1. Pick your current mood:
   - ⚡ Energized (high motivation)
   - 🍃 Balanced (stable & steady)
   - 🌙 Tired (low energy)
   - ⚠️ Stressed (anxious)
2. Adjust energy slider (1-10)

### Step 4: Generate Schedule
1. Click **✨ Generate My Perfect Day**
2. Wait for AI to create your schedule
3. Review your personalized schedule

### Step 5: Follow & Track
1. Complete tasks as you go (✅ +10 points)
2. Skip if needed (⏭ -5 points)
3. Reschedule when necessary (🔁 -2 points)
4. Watch your Balance Score improve!

---

## 🎯 Scoring System

| Action | Points | Effect |
|--------|--------|--------|
| ✅ Complete Task | **+10** | Boosts all scores |
| ⏭ Skip Task | **-5** | Reduces productivity |
| 🔁 Reschedule | **-2** | Minor consistency penalty |

### Balance Score Calculation

```typescript
Overall Score = (Productivity + Wellness + Consistency) / 3

Productivity: Based on task completion rate
Wellness: Based on break adherence and mood management
Consistency: Based on schedule adherence and reschedules
```

---

## 🎨 Color Palette

```css
/* Primary Colors */
--emerald: #007b55;      /* Headings, titles */
--teal: #00b377;         /* Buttons, accents */
--teal-light: #00e699;   /* Hover states */
--mint-light: #e6fff5;   /* Background start */
--mint: #f8fff9;         /* Background end */

/* Pastel Schedule Cards */
--blue-pastel: #e6f7ff;   /* Work tasks */
--pink-pastel: #fef5ff;   /* Wellness activities */
--purple-pastel: #f5f3ff; /* Breaks */
--green-pastel: #ecfdf5;  /* Completed items */
```

---

## 🧪 Features in Detail

### AI Schedule Generation Logic

The AI considers:
- **Task Priority**: High priority tasks scheduled first
- **Mood State**: Adjusts task ordering and break frequency
- **Energy Level**: Modifies time estimates (low energy = more time)
- **Break Scheduling**: Automatic 15-min breaks between tasks
- **Wellness Interventions**: 30-min wellness breaks after 90 min work
- **Time Constraints**: Respects user's availability window

### Smart Break Insertion

```typescript
IF consecutive_work_time >= 90 minutes
  THEN insert 30-minute wellness break
ELSE IF task_complete
  THEN insert 15-minute short break
```

### Mood-Adaptive Scheduling

| Mood | Scheduling Strategy |
|------|---------------------|
| **Energized** | Challenging tasks first, shorter breaks |
| **Balanced** | Standard approach, regular breaks |
| **Tired** | Easier tasks first, more frequent breaks |
| **Stressed** | Shorter focus sessions, extra wellness breaks |

---

## 🐛 Troubleshooting

### Build Errors
```bash
# Clean install
rm -rf node_modules .next
npm install
npm run build
```

### Port Already in Use
```bash
# Use different port
PORT=3001 npm run dev
```

### LocalStorage Not Persisting
- Check browser privacy settings
- Ensure cookies are enabled
- Try incognito mode to test

---

## 📝 Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npm run typecheck # Check TypeScript types
```

---

## 🤝 Contributing

This project was built as a complete demonstration of modern Next.js capabilities. Feel free to:
- Fork the repository
- Create feature branches
- Submit pull requests
- Report issues
- Suggest enhancements

---

## 📄 License

MIT License - feel free to use this project however you'd like!

---

## 👥 Credits

**Built by**: Efua, Alicia, Vanessa, Jonathan  
**Framework**: Next.js 15  
**Styling**: Tailwind CSS  
**AI**: OpenAI GPT-4 (optional)  

---

## 🌟 Key Highlights

✅ **Fully Functional** — No placeholders, everything works  
✅ **Beautiful UI** — Matches design specs exactly  
✅ **Smart AI** — Intelligent scheduling with or without OpenAI  
✅ **Persistent Data** — LocalStorage keeps your schedule safe  
✅ **Responsive Design** — Works on mobile, tablet, desktop  
✅ **Type-Safe** — Full TypeScript coverage  
✅ **Production Ready** — Builds successfully, no errors  

---

## 📸 Screenshots

### Input Screen
- Clean task input with priority and time settings
- Availability time picker with live hour calculation
- 4 mood buttons with energy slider
- Gradient "Generate My Perfect Day" button

### Loading Screen
- Animated spinner with gradient colors
- "AI is generating your perfect day..." message
- 4 progress indicators showing AI steps

### Dashboard
- Left: Time-blocked schedule with pastel cards
- Right: Balance score circular gauge + sub-scores
- Stats panel with completion tracking
- Action buttons on each schedule item

### Notification Modal
- Appears 10 minutes before task end
- Shows current task details
- Two options: Done or Reschedule

---

**Made with 💚 by the AURA team**  
*Where wellness meets productivity*
