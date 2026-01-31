import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Activity,
  Target,
  Zap,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw, // New Import for Sync Button
} from "lucide-react";
import FocusHeatmap from "./FocusHeatmap";
import AICoach from './AICoach';

const TIME_RANGES = [
  { label: "Last 7 Days", value: "7" },
  { label: "Last 30 Days", value: "30" },
  { label: "All Time", value: "all" },
  { label: "Custom", value: "custom" },
];

export default function Dashboard() {
  const [rawEntries, setRawEntries] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [timeRange, setTimeRange] = useState("7");

  // Custom Date State
  const today = new Date().toISOString().split("T")[0];
  const [customStart, setCustomStart] = useState(today);
  const [customEnd, setCustomEnd] = useState(today);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // State for manual refresh button
  
  // Dynamically find all categories present in your data
  const [availableCategories, setAvailableCategories] = useState(["All"]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/focus`);
      setRawEntries(res.data);

      // Extract all unique categories ever used
      const uniqueCats = new Set(["All"]);
      res.data.forEach((entry) => {
        if (entry.sessions) {
          entry.sessions.forEach((s) => uniqueCats.add(s.category));
        }
      });
      setAvailableCategories(Array.from(uniqueCats));

      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch history:", err);
      setLoading(false);
    }
  };

  // --- HANDLE MANUAL REFRESH ---
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 500); // Visual feedback delay
  };

  const { timelineData, categoryData, stats } = useMemo(() => {
    if (rawEntries.length === 0)
      return { timelineData: [], categoryData: [], stats: {} };

    // 1. FILTER ENTRIES BY TIME (ROBUST LOGIC)
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to midnight for accurate comparison

    const timeFilteredEntries = rawEntries.filter((entry) => {
      // Custom Range
      if (timeRange === "custom") {
        return entry.date >= customStart && entry.date <= customEnd;
      }
      // All Time
      if (timeRange === "all") return true;

      // Relative Range (Last X Days)
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0); // Reset to midnight (Fixes Timezone/Today bugs)
      
      const diffTime = Math.abs(now - entryDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Allow a small buffer for timezone shifts
      return diffDays <= (parseInt(timeRange) + 1);
    });

    // 2. AGGREGATE DATA
    let totalFocused = 0;
    let totalAssigned = 0;

    // We use a Map to store totals per category
    const catStats = {};

    // 3. PROCESS TIMELINE & CATEGORIES
    // Sort chronologically first for the line chart
    const sortedEntries = [...timeFilteredEntries].sort((a, b) => new Date(a.date) - new Date(b.date));

    const timeline = sortedEntries.map((entry) => {
      let dailyFocused = 0;
      let dailyAssigned = 0;

      if (entry.sessions) {
        entry.sessions.forEach((session) => {
          // Check Category Filter
          if (
            selectedCategory !== "All" &&
            session.category !== selectedCategory
          )
            return;

          const f = session.focused || 0;
          const a = session.assigned || 0;

          // Add to Daily Totals (for Line Graph)
          dailyFocused += f;
          dailyAssigned += a;

          // Add to Global Totals (for Stats Cards)
          totalFocused += f;
          totalAssigned += a;

          // Add to Category Distribution (for Bar Graph)
          if (!catStats[session.category]) {
            catStats[session.category] = { focused: 0, assigned: 0 };
          }
          catStats[session.category].focused += f;
          catStats[session.category].assigned += a;
        });
      }

      return {
        date: entry.date.substring(5), // "10-27"
        fullDate: entry.date,
        focused: dailyFocused,
        assigned: dailyAssigned,
      };
    });

    // 4. PREPARE BAR CHART DATA
    const catChart = Object.keys(catStats).map((catName) => ({
      name: catName,
      focused: catStats[catName].focused,
      assigned: catStats[catName].assigned,
    }));

    // 5. CALCULATE EFFICIENCY
    const eff =
      totalAssigned > 0 ? ((totalFocused / totalAssigned) * 100).toFixed(1) : 0;

    return {
      timelineData: timeline,
      categoryData: catChart,
      stats: {
        totalFocused: totalFocused.toFixed(1),
        efficiency: eff,
        totalDays: timeFilteredEntries.length,
      },
    };
  }, [rawEntries, selectedCategory, timeRange, customStart, customEnd]);

  if (loading)
    return (
      <div className="text-zinc-500 animate-pulse p-10">
        Loading Intelligence...
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. AI Coach Section */}
      <AICoach />
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-6 pb-6 border-b border-white/10">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Analytics Command
            </h2>
            <p className="text-zinc-400 mt-1">
              Deep dive into your cognitive performance metrics.
            </p>
          </div>

          {/* SYNC BUTTON */}
          <button 
            onClick={handleRefresh}
            className={`
              p-3 rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all
              ${isRefreshing ? 'animate-spin text-primary border-primary shadow-[0_0_15px_rgba(34,197,94,0.3)]' : ''}
            `}
            title="Sync Data"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          {/* CATEGORY FILTER */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 text-zinc-500 mr-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <Layers size={14} />{" "}
              <span className="text-xs font-bold uppercase tracking-wider">
                Focus Area
              </span>
            </div>
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border
                  ${
                    selectedCategory === cat
                      ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                      : "bg-black border-white/10 text-zinc-500 hover:text-white hover:border-white/30"
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* TIME FILTER */}
          <div className="flex flex-wrap items-center gap-2 bg-black border border-white/10 p-1 rounded-xl">
            {TIME_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`
                  px-4 py-2 rounded-lg text-xs font-medium transition-all
                  ${
                    timeRange === range.value
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }
                `}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* CUSTOM DATE INPUTS */}
        {timeRange === "custom" && (
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 inline-flex self-start">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Range:
            </div>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-black border border-white/10 text-white rounded px-3 py-1.5 text-sm focus:border-primary outline-none"
            />
            <ArrowRight size={14} className="text-zinc-600" />
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-black border border-white/10 text-white rounded px-3 py-1.5 text-sm focus:border-primary outline-none"
            />
          </div>
        )}
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Activity size={24} />}
          label="High-Focus Hours"
          value={stats.totalFocused}
          subtext={`In ${selectedCategory} • ${
            timeRange === "all" ? "All Time" : `${timeRange} Days`
          }`}
          color="text-primary"
          bg="bg-primary/10"
          border="border-primary/20"
        />
        <StatCard
          icon={<Zap size={24} />}
          label="Execution Efficiency"
          value={`${stats.efficiency}%`}
          subtext="Target vs Reality ratio"
          color="text-yellow-400"
          bg="bg-yellow-400/10"
          border="border-yellow-400/20"
        />
        <StatCard
          icon={<Calendar size={24} />}
          label="Active Sessions"
          value={stats.totalDays}
          subtext="Days logged in this period"
          color="text-blue-400"
          bg="bg-blue-400/10"
          border="border-blue-400/20"
        />
      </div>

      {/* HEATMAP */}
      <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-2xl shadow-xl backdrop-blur-sm mb-8">
        <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider flex items-center gap-2">
          <Calendar size={16} /> Consistency Matrix
        </h3>
        <FocusHeatmap data={rawEntries} />
      </div>

      {/* GRAPHS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Graph 1: Timeline */}
        <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
          <h3 className="text-sm font-bold text-zinc-400 mb-6 uppercase tracking-wider flex items-center gap-2">
            <Activity size={16} /> Performance Velocity
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <defs>
                  <linearGradient id="colorFocused" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#333"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#52525b"
                  tick={{ fill: "#71717a", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#52525b"
                  tick={{ fill: "#71717a", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="assigned"
                  stroke="#52525b"
                  strokeDasharray="5 5"
                  dot={false}
                  strokeWidth={2}
                  name="Target"
                />
                <Line
                  type="monotone"
                  dataKey="focused"
                  stroke={selectedCategory === "All" ? "#22c55e" : "#8b5cf6"}
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#09090b", strokeWidth: 2 }}
                  activeDot={{ r: 8, fill: "#22c55e" }}
                  name="Reality"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Distribution */}
        <div
          className={`bg-zinc-900/30 border border-white/5 p-6 rounded-2xl shadow-xl backdrop-blur-sm transition-opacity duration-500 ${
            selectedCategory !== "All" ? "opacity-50" : "opacity-100"
          }`}
        >
          <h3 className="text-sm font-bold text-zinc-400 mb-6 uppercase tracking-wider flex items-center gap-2">
            <Target size={16} /> Cognitive Distribution
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" barGap={2}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#333"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke="#52525b"
                  tick={{ fill: "#71717a", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#52525b"
                  width={80}
                  tick={{ fill: "#e4e4e7", fontSize: 11, fontWeight: "bold" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#ffffff05" }}
                  contentStyle={{
                    backgroundColor: "#09090b",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="assigned"
                  fill="#27272a"
                  barSize={20}
                  radius={[0, 4, 4, 0]}
                  name="Target"
                />
                <Bar
                  dataKey="focused"
                  fill="#8b5cf6"
                  barSize={20}
                  radius={[0, 4, 4, 0]}
                  name="Reality"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats Card Component with enhanced UI
function StatCard({ icon, label, value, subtext, color, bg, border }) {
  return (
    <div
      className={`relative overflow-hidden p-6 rounded-2xl border ${border} bg-zinc-900/50 backdrop-blur-sm transition-all hover:scale-[1.02]`}
    >
      <div
        className={`absolute top-0 right-0 p-24 ${bg} rounded-full blur-3xl -mr-12 -mt-12 opacity-50`}
      />

      <div className="relative z-10">
        <div className={`flex items-center gap-3 mb-4 ${color}`}>
          <div className={`p-2 rounded-lg ${bg}`}>{icon}</div>
          <span className="font-bold tracking-tight text-white">{label}</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-mono font-bold text-white tracking-tighter">
            {value}
          </span>
        </div>

        <div className="mt-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">
          {subtext}
        </div>
      </div>
    </div>
  );
}