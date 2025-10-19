# 🚀 AURA - Quick Start Guide

## ✅ Installation Complete!

Your AURA app is fully built and ready to use. Here's everything you need to know:

---

## 🎯 What You Got

### ✨ **9 Custom Components**
1. **TaskInput** - Add and manage tasks with priority/time
2. **AvailabilityPicker** - Set your available time window
3. **FeelingSelector** - Choose mood and energy level
4. **LoadingScreen** - Beautiful AI generation animation
5. **Schedule** - Time-blocked schedule with action buttons
6. **ScoreBoard** - Balance score with circular progress
7. **NotificationModal** - 10-minute task warnings
8. **InputForm** (legacy) - Original form component
9. **BalanceScore** (legacy) - Original score component

### 🎨 **Design Features**
- ✅ Soft mint gradient background (`#e6fff5` → `#f8fff9`)
- ✅ Emerald green headings (`#007b55`)
- ✅ Teal buttons (`#00b377`) with hover effects
- ✅ Glassmorphism effects throughout
- ✅ Smooth animations and transitions
- ✅ Fully responsive (mobile, tablet, desktop)

### 🧠 **Core Functionality**
- ✅ Task management with priority/time
- ✅ Custom availability window
- ✅ 4 mood states + energy slider (1-10)
- ✅ AI schedule generation (local + OpenAI fallback)
- ✅ Complete (+10), Skip (-5), Reschedule (-2) actions
- ✅ Balance Score calculation (Productivity, Wellness, Consistency)
- ✅ Today's Stats tracking
- ✅ 10-minute notification modal
- ✅ LocalStorage persistence
- ✅ Automatic state saving/loading

### 📦 **Technical Stack**
- Next.js 15.5.6 with App Router
- TypeScript 5.9
- Tailwind CSS 3.4
- Lucide React icons
- OpenAI integration (optional)
- 2000+ lines of code

---

## 🏃 Run the App

### Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
npm run start
```

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

---

## 🎮 Using the App

### Step 1: Add Tasks
```
1. Type task name (e.g., "Study for calc exam")
2. Click green + button
3. Set priority (Low/Medium/High)
4. Set time estimate (minutes)
5. Repeat for all tasks
```

### Step 2: Set Availability
```
1. Choose start time (e.g., 09:00 AM)
2. Choose end time (e.g., 05:00 PM)
3. See available hours displayed
```

### Step 3: Select Mood & Energy
```
1. Click mood: ⚡ Energized | 🍃 Balanced | 🌙 Tired | ⚠️ Stressed
2. Adjust energy slider (1-10)
```

### Step 4: Generate Schedule
```
1. Click "✨ Generate My Perfect Day"
2. Wait for AI to process (3-5 seconds)
3. View your personalized schedule
```

### Step 5: Follow & Track
```
1. Work through schedule
2. Click ✅ Complete (+10 points)
3. Or ⏭ Skip (-5 points)
4. Or 🔁 Reschedule (-2 points)
5. Watch Balance Score update
```

---

## 🎨 Color Reference

```css
/* Main Colors */
Emerald:     #007b55  (headings, titles)
Teal:        #00b377  (buttons, accents)
Teal Light:  #00e699  (hover states)
Mint Light:  #e6fff5  (background start)
Mint:        #f8fff9  (background end)

/* Schedule Cards (Pastels) */
Blue:   #e6f7ff  (work tasks)
Pink:   #fef5ff  (wellness)
Purple: #f5f3ff  (breaks)
Green:  #ecfdf5  (completed)
```

---

## 🔧 Configuration

### Optional: OpenAI API
For enhanced AI scheduling, add OpenAI API key:

```bash
# Create .env.local
OPENAI_API_KEY=your_key_here
```

**Note**: App works perfectly without OpenAI using local AI scheduling.

---

## 📊 Scoring System

| Action | Points | Effect |
|--------|--------|--------|
| Complete Task | +10 | Boosts all scores |
| Skip Task | -5 | Reduces productivity |
| Reschedule | -2 | Minor penalty |

### Balance Score Formula
```
Overall = (Productivity + Wellness + Consistency) / 3

Productivity: Task completion rate & efficiency
Wellness: Break adherence & mood management
Consistency: Schedule following & minimal reschedules
```

---

## 📁 File Structure

```
src/
├── app/
│   ├── page.tsx              ← Main app logic
│   ├── layout.tsx            ← Root layout
│   ├── globals.css           ← Global styles
│   └── api/
│       ├── schedule/route.ts ← AI scheduling endpoint
│       └── wellness/route.ts ← Wellness recommendations
├── components/
│   ├── TaskInput.tsx         ← Task management
│   ├── AvailabilityPicker.tsx ← Time picker
│   ├── FeelingSelector.tsx   ← Mood & energy
│   ├── LoadingScreen.tsx     ← Loading animation
│   ├── Schedule.tsx          ← Schedule display
│   ├── ScoreBoard.tsx        ← Scores & stats
│   └── NotificationModal.tsx ← 10-min warnings
├── lib/
│   ├── aiScheduler.ts        ← Local AI logic
│   ├── balanceScore.ts       ← Score calculations
│   └── openaiScheduler.ts    ← OpenAI integration
└── types/
    └── index.ts              ← TypeScript types
```

---

## 🐛 Common Issues

### Port Already in Use
```bash
PORT=3001 npm run dev
```

### Clean Install
```bash
rm -rf node_modules .next
npm install
npm run build
```

### LocalStorage Not Working
- Check browser privacy settings
- Enable cookies
- Try incognito mode

---

## 🎯 Key Features

✅ **Fully Functional** - Everything works, no placeholders  
✅ **Beautiful UI** - Matches design specs exactly  
✅ **Smart AI** - Intelligent scheduling with mood/energy awareness  
✅ **Persistent** - LocalStorage saves your progress  
✅ **Responsive** - Works on all devices  
✅ **Type-Safe** - Full TypeScript coverage  
✅ **Production Ready** - Builds successfully with no errors  

---

## 📝 Available Scripts

```bash
npm run dev        # Development server (port 3000)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint check
npm run typecheck  # TypeScript validation
```

---

## 🎨 Design Highlights

1. **Soft Mint Gradient Background** - Calming, professional
2. **Glassmorphism** - Modern transparent effects
3. **Emerald Green Branding** - Bold, trustworthy
4. **Pastel Schedule Cards** - Easy to distinguish, not overwhelming
5. **Smooth Animations** - Fade-in, slide-up, hover effects
6. **Custom Range Slider** - Beautiful gradient thumb
7. **Circular Progress** - Visual balance score display

---

## 🌟 What Makes This Special

1. **Complete Implementation** - Every feature from requirements
2. **Smart AI Logic** - Mood-adaptive scheduling
3. **Point System** - Gamification for engagement
4. **Real-time Updates** - Instant feedback
5. **Data Persistence** - Never lose your schedule
6. **Notification System** - 10-minute warnings
7. **Beautiful Design** - Professional, calming aesthetics

---

## 💡 Tips for Best Experience

1. **Be Honest** - Select your real mood and energy level
2. **Set Realistic Times** - Don't overestimate task durations
3. **Take Breaks** - Follow the scheduled breaks
4. **Track Progress** - Watch your Balance Score improve
5. **Save Often** - Data auto-saves, but refresh to see persistence

---

## 🎓 Learning Points

This app demonstrates:
- Next.js 15 App Router
- TypeScript best practices
- Tailwind CSS customization
- LocalStorage state management
- AI integration (OpenAI + fallback)
- Component composition
- Real-time calculations
- Modal implementations
- Responsive design
- Animation techniques

---

## 🚀 Next Steps

1. **Test the app** - Add tasks and generate a schedule
2. **Customize colors** - Edit `tailwind.config.js`
3. **Add features** - Extend with your ideas
4. **Deploy** - Use Vercel, Netlify, or your preferred platform

---

## 📞 Support

- Check `README.md` for detailed documentation
- Review component files for implementation details
- Inspect `src/lib/aiScheduler.ts` for scheduling logic
- See `src/lib/balanceScore.ts` for score calculations

---

**🎉 Enjoy using AURA - Your AI Balance Agent!**

*Where wellness meets productivity* 💚
