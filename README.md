FocusOS – Personal Cognitive Analytics System
(Tagline: Track. Measure. Compound your mind.)
1. Problem Statement
High-performance learning (Maths, Dev, ML, DSA, Core subjects) suffers from:

No objective tracking
No historical analytics
No category-wise breakdown
No compounding visibility
No feedback loop
People think they worked 6 hours.
They have no data to prove it.
This project solves that.
2. Core Goal
Build a personal analytics platform that:

Captures daily cognitive effort
Stores it permanently
Visualizes it across:
Time
Categories
Targets vs reality
Enables long-term performance review:
Daily
Weekly
Monthly
All-time
3. System Type
Single-user productivity analytics web app
(Localhost first → SaaS-ready later)
4. Tech Stack (Final)
Frontend
Vite + React
Tailwind CSS (dark mode)
Recharts (or Chart.js)
Backend
Node.js
Express.js
MongoDB (Mongoose)
Architecture
React UI
   ↓ REST API
Express Server
   ↓
MongoDB
5. Core Data Model (Heart of System)
MongoDB Document (One per day)
FocusEntry {
  _id: ObjectId,
  date: ISODate,
  data: {
    maths: { focused: Number, assigned: Number },
    dev:   { focused: Number, assigned: Number },
    core:  { focused: Number, assigned: Number },
    ml:    { focused: Number, assigned: Number },
    dsa:   { focused: Number, assigned: Number }
  },
  createdAt,
  updatedAt
}
This is the single source of truth.
Everything in the system is derived from this.
6. Input System (Daily Form)
UI Screen: “Today’s Focus Entry”
Fields:
For each category:

Maths
Dev
Core
ML
DSA
You input:
FieldTypeFocused HoursNumber (float)Assigned HoursNumber (float)
Total inputs:

10 numeric inputs per day
Plus:

Auto timestamp
(Optional later: notes)
7. Graph System (The Soul)
You will have 3 levels of graphs:
A. Overall Performance Graph (Main Dashboard)
Graph 1: Overall Line Graph
Type: Line chart
X-axis:

Time (daily / weekly / monthly)
Y-axis:

Hours
Lines:

Total Focused Hours
Total Assigned Hours
Formula:

totalFocused = sum(all 5 categories focused)
totalAssigned = sum(all 5 categories assigned)
This answers:

“Am I actually living up to my plan?”
B. Category Distribution Graph
Graph 2: Category Bar Graph
Type: Bar chart
X-axis:

Categories (Maths, Dev, Core, ML, DSA)
Y-axis:

Hours
Bars:

Focused
Assigned
This answers:

“Where is my time really going?”
C. Category-Specific View
When you select a category (e.g. DSA):

Graph 3: Category Line Graph
Focused vs Assigned over time.

Graph 4: Category Bar Graph
Total focused vs assigned for that category.
This answers:

“How disciplined am I in this one area?”
8. Time Filters (Critical Feature)
All graphs can be viewed in:
ModeDailyWeeklyMonthlyAll-time
Implementation:
Pure data aggregation.
Same DB.
Different grouping logic.
9. Derived Metrics (Auto Calculated)
System will compute:

1. Efficiency %
efficiency = totalFocused / totalAssigned * 100
2. Category Efficiency
For each category.

3. Streaks (future)
Days where:

focused >= assigned
10. UI Pages
1. Landing / Home
“Welcome to FocusOS”
Button:
→ Enter Today’s Data
2. Daily Entry Page
Form with:

10 inputs
Submit button
3. Dashboard
Contains:

Overall line graph
Category bar graph
Efficiency stats
Filters
4. Category Page
Select:

Maths / Dev / ML / DSA / Core
Shows:

That category’s graphs only
11. Design Language
Theme
Dark mode first.
Colors:

Background: Zinc / Slate / Black
Graphs: Neon / cyan / purple style
Feel:
Minimal.
Terminal-meets-SaaS.
Not flashy.
Professional.
12. Why MongoDB is Perfect Here
Because your data is:

Schema-flexible
Daily documents
No joins
Append-only
Time-series friendly
Later you can add:

sleepHours
mood
energy
Without breaking anything.
13. This Is Not a Toy Project
This system is:

Data engineering
Backend API
Frontend analytics
UX design
Product thinking
It touches:

CRUD
Aggregation
Visualization
Real-life usage
This is exactly the kind of project that:

Top internships like
Founders build
Engineers actually use
14. What This Becomes Long-Term
If you keep this for 1 year, you will have:

A complete cognitive time-series dataset of your life.
You can:

Predict burnout
Correlate performance
Train ML models on yourself
Optimize your learning schedule
This literally turns your life into a dataset.
Final One-Liner (What You’re Building)
FocusOS is a personal cognitive analytics platform that captures daily learning effort across key domains and transforms it into long-term performance intelligence through time-series visualization and efficiency metrics.
This is not just a tracker.
This is:
a second brain for your discipline.