import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import {
  MessageSquare, BookOpen, FolderOpen, TrendingUp, Settings,
  Search, Plus, Star, Moon, Sun, Mic, Send, Check, Edit3,
  Archive, Trash2, Tag, X, Menu, Filter, MoreHorizontal,
  Key, Globe, Bug, Download, RefreshCw, Shuffle, ArrowRight,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

// ── Types ─────────────────────────────────────────────────────────

type Screen = "workspace" | "journal" | "projects" | "growth" | "profile" | "settings";
type JournalCategory = "All" | "Projects" | "Preferences" | "Ideas" | "Facts" | "Experiences";
type ProjectStatus = "active" | "paused" | "completed";

// ── Style helpers ─────────────────────────────────────────────────

const PLEX: React.CSSProperties = { fontFamily: "'IBM Plex Sans', system-ui, sans-serif" };
const MONO: React.CSSProperties = { fontFamily: "'DM Mono', ui-monospace, monospace" };

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ── Data ──────────────────────────────────────────────────────────

const JOURNAL_ENTRIES = [
  { id: "j1", type: "Preferences", content: "Works best before 7am, in quiet, with minimal context-switching", importance: 0.92, confidence: 0.97, source: "Observed across 47 conversations", created: "Jan 12, 2024", updated: "Mar 18, 2024", tags: ["routine", "productivity"] },
  { id: "j2", type: "Facts", content: "Product designer at a Series B B2B analytics startup in San Francisco", importance: 0.88, confidence: 0.99, source: "Stated directly", created: "Jan 12, 2024", updated: "Jan 12, 2024", tags: ["identity", "work"] },
  { id: "j3", type: "Projects", content: "Building a comprehensive design system for an analytics platform — v1 due Q2 2024", importance: 0.95, confidence: 0.91, source: "Multiple conversations", created: "Feb 3, 2024", updated: "Mar 20, 2024", tags: ["design", "work"] },
  { id: "j4", type: "Experiences", content: "Experienced severe burnout in 2022 from overcommitting; now guards capacity carefully", importance: 0.87, confidence: 0.94, source: "Shared during reflection", created: "Jan 28, 2024", updated: "Jan 28, 2024", tags: ["health", "history"] },
  { id: "j5", type: "Preferences", content: "Prefers async written communication — finds video calls draining and often redundant", importance: 0.79, confidence: 0.88, source: "Inferred from 12 conversations", created: "Feb 14, 2024", updated: "Mar 5, 2024", tags: ["communication"] },
  { id: "j6", type: "Ideas", content: "Wants to explore a fluid type scale using CSS clamp() for the design system", importance: 0.74, confidence: 0.91, source: "Conversation Mar 20", created: "Mar 20, 2024", updated: "Mar 20, 2024", tags: ["design", "typography"] },
  { id: "j7", type: "Preferences", content: "Reads non-fiction exclusively — drawn to systems thinking, design history, and biography", importance: 0.74, confidence: 0.91, source: "Reading list shared Mar 2", created: "Mar 2, 2024", updated: "Mar 2, 2024", tags: ["reading", "learning"] },
  { id: "j8", type: "Facts", content: "Goal to read 24 books this year — currently at 7, slightly ahead of pace", importance: 0.71, confidence: 0.97, source: "Tracked in projects", created: "Jan 15, 2024", updated: "Mar 18, 2024", tags: ["reading"] },
];

const PROJECTS: {
  id: string; title: string; mission: string; status: ProjectStatus;
  priority: string; progress: number; reviewDate: string;
  milestones: string[]; milestonesDone: number[];
  nextStep: string;
}[] = [
  { id: "p1", title: "Design system v1.0", mission: "Build a comprehensive, documented design system for the analytics platform by end of Q2", status: "active", priority: "high", progress: 0.62, reviewDate: "Apr 1, 2024", milestones: ["Component library", "Typography scale", "Color tokens", "Documentation", "Dev handoff"], milestonesDone: [0, 1], nextStep: "Define the color token architecture and document usage patterns" },
  { id: "p2", title: "Read 24 books", mission: "Two books per month, focused on systems thinking, design history, and biography", status: "active", priority: "medium", progress: 0.29, reviewDate: "Dec 31, 2024", milestones: ["Jan: 2 books", "Feb: 2 books", "Mar: 2 books", "Apr–Dec: 18 books"], milestonesDone: [0, 1], nextStep: "Finish 'The Laws of Simplicity' by end of March" },
  { id: "p3", title: "Sustainable work rhythm", mission: "Protect creative mornings, hard stop at 6pm daily, exercise four times weekly", status: "active", priority: "high", progress: 0.71, reviewDate: "Mar 31, 2024", milestones: ["Morning blocks set", "Evening shutdown ritual", "Exercise 4×/week", "Weekly review habit"], milestonesDone: [0, 1, 2], nextStep: "Establish the weekly Sunday review habit to maintain the rhythm" },
  { id: "p4", title: "Personal portfolio redesign", mission: "New site showcasing five years of design work, shipped and indexed by June", status: "paused", priority: "low", progress: 0.18, reviewDate: "Jun 1, 2024", milestones: ["Content audit", "Design concept", "Development", "Launch"], milestonesDone: [], nextStep: "Start with a content audit of existing case studies" },
  { id: "p5", title: "Figma leadership workshops", mission: "Six-part workshop series on leading design teams and design strategy", status: "completed", priority: "medium", progress: 1.0, reviewDate: "Mar 1, 2024", milestones: ["Sessions 1–6 complete"], milestonesDone: [0], nextStep: "" },
];

const GROWTH_ENTRIES = [
  { id: "g1", date: "Mar 18, 2024", observation: "Every time Alex commits to fewer simultaneous projects, quality and satisfaction both measurably increase", lesson: "Constraint is not limitation — it is the condition for best work", futureAction: "Surface this pattern when evaluating new opportunities or project additions", confidence: 0.91 },
  { id: "g2", date: "Mar 11, 2024", observation: "Alex seeks external validation most often when feeling uncertain about creative direction, not when the work is actually weak", lesson: "Confidence fluctuates with ambiguity, not ability; structured reflection helps recenter faster than outside feedback", futureAction: "During uncertain creative phases, introduce structured self-critique before suggesting external review", confidence: 0.83 },
  { id: "g3", date: "Mar 4, 2024", observation: "Physical exercise consistently precedes the highest-quality work sessions — correlation measured across 23 instances", lesson: "Physical state is a primary variable in creative capacity and decision quality", futureAction: "When planning deep work, gently surface morning run as a precondition when relevant", confidence: 0.94 },
  { id: "g4", date: "Feb 26, 2024", observation: "Historical design precedents appear repeatedly as conceptual anchors in conversation", lesson: "Alex learns through analogical thinking and historical example, not abstract frameworks alone", futureAction: "When introducing unfamiliar concepts, ground them in historical design examples first", confidence: 0.87 },
  { id: "g5", date: "Feb 19, 2024", observation: "Alex rarely asks for emotional support directly, even when it is clearly needed during high-stakes moments", lesson: "Support must be offered proactively — it will rarely be requested", futureAction: "During delivery pressure or consequential decisions, check in on wellbeing explicitly", confidence: 0.79 },
];

const INITIAL_MESSAGES = [
  { id: "1", role: "monday", content: "Good morning, Alex. You've been working on the typography scale three sessions in a row — mostly before 7am, which is your sharpest window. I kept everything from our last conversation in context. Do you want to pick up on the mobile display sizes, or is there something else on your mind this morning?", time: "6:47 AM" },
  { id: "2", role: "user", content: "Morning. Yes, let's get back to mobile display. The headline feels too large at 320px but the team wants something bold. I'm not sure how to resolve the tension.", time: "6:53 AM" },
  { id: "3", role: "monday", content: "That tension is real — you're balancing visual ambition against practical readability across viewports you can't control. From what I know about your approach, you tend to prefer restraint over drama in data-heavy interfaces. Three directions worth considering: a fluid scale using clamp(), a breakpoint-specific override for the display style only, or redefining 'bold' at mobile through weight and tracking rather than size. Which feels closest to the actual problem?", time: "6:54 AM" },
  { id: "4", role: "user", content: "The fluid scale is interesting. I've never actually built one from scratch.", time: "7:01 AM" },
  { id: "5", role: "monday", content: "You brought it up yourself in February, when you were reviewing Linear's design system. You noticed their type felt carefully calibrated across breakpoints and wondered how they achieved it. clamp() is the mechanism: it defines a minimum, a viewport-relative preferred value, and a maximum. Something like clamp(1.75rem, 4vw, 3rem) scales a headline fluidly from about 28px to 48px. Want me to walk through building a full fluid scale, or would a working starting set be more useful right now?", time: "7:02 AM" },
];

const CONVERSATIONS = [
  { id: "c1", title: "Typography scale & mobile display", date: "Today", preview: "Fluid type scales using CSS clamp()" },
  { id: "c2", title: "Q2 project review", date: "Yesterday", preview: "Design system progress and reading habit" },
  { id: "c3", title: "Design critique framework", date: "Mar 16", preview: "Structured self-critique before external review" },
  { id: "c4", title: "The Design of Everyday Things", date: "Mar 14", preview: "Affordances, signifiers, and feedback loops" },
  { id: "c5", title: "Burnout prevention check-in", date: "Mar 11", preview: "Early warning signs and capacity protection" },
];

const GROWTH_DATA = [
  { month: "Jan", memories: 127, lessons: 18 },
  { month: "Feb", memories: 294, lessons: 41 },
  { month: "Mar", memories: 847, lessons: 124 },
];

const MONDAY_REPLIES = [
  "I'm holding that alongside everything I already know about your work. Here's what stands out to me — and where it connects to patterns I've noticed before.",
  "There's something worth pausing on here. It touches on something we've circled back to several times, and I want to think through it carefully before responding.",
  "Based on what you've shared and how I know you approach these decisions, here's where I'd start. Let me know what resonates.",
  "I noticed you've come back to this a few times. That usually means it's more significant than it first appears. Let's work through it together.",
];

const AI_MODELS = [
  { id: "opus", name: "Claude Opus 4.8", tag: "Most capable", desc: "Deepest reasoning and the most nuanced conversation. Best for complex, reflective sessions.", speed: "Thoughtful" },
  { id: "sonnet", name: "Claude Sonnet 4.6", tag: "Recommended", desc: "Excellent balance of intelligence and speed. Monday's default for everyday conversations.", speed: "Responsive" },
  { id: "haiku", name: "Claude Haiku 4.5", tag: "Fastest", desc: "Instant responses, lighter memory retrieval. Best for quick exchanges and brief check-ins.", speed: "Instant" },
];

// ── Coffee Cup Logo ───────────────────────────────────────────────

function CoffeeCup({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M5 8h11l-1.5 10H6.5L5 8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M16 10h1.5a2 2 0 0 1 0 4H16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M3.5 18.5h14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <motion.path
        d="M9 5.5 Q9.5 4.5 9 3"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"
        animate={{ opacity: [0.2, 0.7, 0.2], y: [0, -1.5, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d="M12 5.5 Q12.5 4.5 12 3"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"
        animate={{ opacity: [0.4, 0.9, 0.4], y: [0, -1.5, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      />
    </svg>
  );
}

// ── Typing Indicator ──────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="text-primary"><CoffeeCup size={16} /></div>
        <span className="text-[10px] font-medium text-primary uppercase tracking-widest" style={MONO}>Monday</span>
      </div>
      <div className="pl-6 border-l-2 border-primary/20 flex items-center gap-1.5 py-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} role="switch" aria-checked={on}
      className={cn("w-10 h-5 rounded-full flex items-center transition-all duration-200 flex-none", on ? "bg-primary" : "bg-muted")}>
      <div className={cn("w-4 h-4 rounded-full bg-white shadow-sm mx-0.5 transition-all duration-200", on ? "translate-x-5" : "translate-x-0")} />
    </button>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────

function ProgressBar({ value, color = "bg-primary" }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
      <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${Math.min(value * 100, 100)}%` }} />
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────

function EmptyState({ icon, title, body, cta, onCta }: {
  icon: React.ReactNode; title: string; body: string; cta?: string; onCta?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted/60 border border-border flex items-center justify-center text-muted-foreground/30 mb-5">
        {icon}
      </div>
      <p className="text-sm font-medium text-foreground mb-2" style={PLEX}>{title}</p>
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">{body}</p>
      {cta && onCta && (
        <button onClick={onCta} className="flex items-center gap-1.5 px-4 py-2 text-xs bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium mt-6">
          <Plus size={11} />{cta}
        </button>
      )}
    </div>
  );
}

// ── Today's Cup ───────────────────────────────────────────────────

function TodaysCup() {
  const project = PROJECTS.find(p => p.status === "active");
  return (
    <div className="mx-4 my-4 p-4 rounded-2xl border border-primary/15 bg-gradient-to-b from-primary/6 to-primary/2">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-primary"><CoffeeCup size={15} /></div>
        <span className="text-[10px] font-medium text-primary uppercase tracking-widest" style={MONO}>{"Today's Cup"}</span>
      </div>
      <div className="space-y-3.5">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1" style={MONO}>Current project</p>
          <p className="text-xs font-medium text-foreground leading-snug">{project?.title}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1" style={MONO}>{"Yesterday's progress"}</p>
          <p className="text-xs text-foreground leading-relaxed">Completed the typography scale draft and shared with the team for review.</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1" style={MONO}>{"Today's focus"}</p>
          <p className="text-xs text-foreground leading-relaxed">Color token architecture and fluid type scale for mobile.</p>
        </div>
        <div className="pt-3 border-t border-border/60">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5" style={MONO}>One thing to remember</p>
          <p className="text-xs text-foreground italic leading-relaxed">"Constraint is not limitation — it is the condition for best work."</p>
        </div>
      </div>
      <button className="w-full mt-4 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/16 transition-colors border border-primary/15">
        Continue working <ArrowRight size={11} />
      </button>
    </div>
  );
}

// ── Right Panel ───────────────────────────────────────────────────

function RightPanel() {
  return (
    <aside className="flex flex-col h-full border-l border-border bg-card overflow-y-auto">
      <TodaysCup />

      <div className="px-4 pt-1 pb-2">
        <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest" style={MONO}>Context</p>
      </div>

      <section className="px-4 pb-4 border-b border-border">
        <div className="flex items-center gap-1.5 mb-2.5">
          <BookOpen size={11} className="text-muted-foreground" />
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium" style={MONO}>Relevant memories</p>
        </div>
        <div className="space-y-2">
          {JOURNAL_ENTRIES.slice(0, 3).map((m) => (
            <div key={m.id} className="p-2.5 rounded-lg bg-background border border-border">
              <p className="text-xs text-foreground leading-relaxed">{m.content}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[10px] text-muted-foreground" style={MONO}>{m.type}</span>
                <span className="text-[10px] text-muted-foreground/30">·</span>
                <span className="text-[10px] text-muted-foreground" style={MONO}>{Math.round(m.confidence * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-1.5 mb-2.5">
          <FolderOpen size={11} className="text-muted-foreground" />
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium" style={MONO}>Current project</p>
        </div>
        {PROJECTS.filter(p => p.status === "active").slice(0, 1).map(p => (
          <div key={p.id} className="p-2.5 rounded-lg bg-background border border-border">
            <p className="text-xs font-medium text-foreground mb-1.5">{p.title}</p>
            <ProgressBar value={p.progress} />
            <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">{p.nextStep}</p>
          </div>
        ))}
      </section>

      <section className="px-4 py-4">
        <div className="flex items-center gap-1.5 mb-2.5">
          <TrendingUp size={11} className="text-muted-foreground" />
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium" style={MONO}>Recent growth</p>
        </div>
        <div className="p-2.5 rounded-lg bg-background border border-border">
          <p className="text-xs text-muted-foreground italic mb-1.5 leading-relaxed">{GROWTH_ENTRIES[0].observation}</p>
          <p className="text-xs text-foreground leading-relaxed">{GROWTH_ENTRIES[0].lesson}</p>
          <p className="text-[10px] text-muted-foreground/50 mt-2" style={MONO}>{GROWTH_ENTRIES[0].date}</p>
        </div>
      </section>
    </aside>
  );
}

// ── Navigation ────────────────────────────────────────────────────

const NAV = [
  { id: "workspace" as Screen, label: "Workspace", icon: MessageSquare },
  { id: "journal" as Screen, label: "Journal", icon: BookOpen },
  { id: "projects" as Screen, label: "Projects", icon: FolderOpen },
  { id: "growth" as Screen, label: "Growth", icon: TrendingUp },
  { id: "settings" as Screen, label: "Settings", icon: Settings },
];

// ── Sidebar ───────────────────────────────────────────────────────

function Sidebar({ screen, setScreen, userName, darkMode, setDarkMode, onClose }: {
  screen: Screen; setScreen: (s: Screen) => void;
  userName: string; darkMode: boolean; setDarkMode: (v: boolean) => void;
  onClose?: () => void;
}) {
  const go = (s: Screen) => { setScreen(s); onClose?.(); };

  return (
    <aside className="flex flex-col h-full border-r border-border bg-sidebar overflow-hidden">
      <div className="px-5 py-5 border-b border-border flex-none flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="text-primary"><CoffeeCup size={20} /></div>
          <span className="text-base font-medium tracking-tight text-sidebar-foreground" style={PLEX}>Monday</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground" aria-label="Close sidebar">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="px-3 pt-3 pb-1 flex-none">
        <button onClick={() => go("workspace")}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-muted-foreground hover:text-sidebar-foreground hover:border-primary/30 hover:bg-sidebar-accent text-xs transition-all">
          <Plus size={11} />New conversation
        </button>
      </div>

      <nav className="px-3 pt-2 pb-2 flex-none space-y-0.5">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => go(id)}
            className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-100",
              screen === id ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent")}>
            <Icon size={14} strokeWidth={1.75} />{label}
          </button>
        ))}
        <div className="pt-1 mt-1 border-t border-border">
          <button onClick={() => go("profile")}
            className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-100 mt-1",
              screen === "profile" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent")}>
            <CoffeeCup size={14} />{"Monday's Profile"}
          </button>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto px-3 py-1">
        <p className="px-3 py-2 text-[10px] uppercase tracking-widest text-muted-foreground/50" style={MONO}>Recent</p>
        {CONVERSATIONS.map((c) => (
          <button key={c.id} onClick={() => go("workspace")}
            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-sidebar-accent transition-colors">
            <p className="text-xs text-sidebar-foreground truncate leading-snug">{c.title}</p>
            <div className="flex items-center justify-between mt-0.5 gap-2">
              <p className="text-[10px] text-muted-foreground truncate">{c.preview}</p>
              <p className="text-[10px] text-muted-foreground/40 flex-none" style={MONO}>{c.date}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="px-4 py-3.5 border-t border-border flex-none flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/12 flex items-center justify-center text-[10px] font-semibold text-primary">
            {(userName || "A").charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-sidebar-foreground font-medium">{userName || "Alex"}</span>
        </div>
        <button onClick={() => setDarkMode(!darkMode)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors" aria-label="Toggle dark mode">
          {darkMode ? <Sun size={13} /> : <Moon size={13} />}
        </button>
      </div>
    </aside>
  );
}

// ── Workspace Screen ──────────────────────────────────────────────

function WorkspaceScreen() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const send = () => {
    if (!input.trim() || isTyping) return;
    const content = input.trim();
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages(prev => [...prev, { id: String(Date.now()), role: "user", content, time }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const reply = MONDAY_REPLIES[Math.floor(Math.random() * MONDAY_REPLIES.length)];
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: String(Date.now()), role: "monday", content: reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    }, 1400 + Math.random() * 600);
  };

  const SUGGESTIONS = [
    "How am I progressing on my projects?",
    "What patterns have you noticed lately?",
    "Help me think through the color token structure",
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-3.5 border-b border-border flex items-center justify-between flex-none">
        <div>
          <h1 className="text-sm font-medium text-foreground">Typography scale & mobile display</h1>
          <p className="text-[10px] text-muted-foreground mt-0.5" style={MONO}>Today · {messages.length} exchanges</p>
        </div>
        <div className="flex gap-0.5">
          <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Search"><Search size={13} /></button>
          <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="More"><MoreHorizontal size={13} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] text-muted-foreground/40 px-2" style={MONO}>Wednesday, March 20, 2024</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {messages.map((msg) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }}>
            {msg.role === "monday" ? (
              <div className="max-w-2xl group">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="text-primary"><CoffeeCup size={16} /></div>
                  <span className="text-[10px] font-medium text-primary uppercase tracking-widest" style={MONO}>Monday</span>
                  <span className="text-[10px] text-muted-foreground/30" style={MONO}>{msg.time}</span>
                </div>
                <div className="pl-6 border-l-2 border-primary/20 group-hover:border-primary/35 transition-colors duration-200">
                  <p className="text-sm text-foreground leading-[1.85]">{msg.content}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-muted-foreground/30" style={MONO}>{msg.time}</span>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest" style={MONO}>You</span>
                </div>
                <div className="max-w-lg bg-secondary border border-border rounded-2xl rounded-tr-sm px-4 py-3">
                  <p className="text-sm text-foreground leading-[1.85]">{msg.content}</p>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {isTyping && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
            <TypingIndicator />
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      <div className="px-6 py-2 border-t border-border flex gap-1.5 overflow-x-auto flex-none" style={{ scrollbarWidth: "none" }}>
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => { setInput(s); textareaRef.current?.focus(); }}
            className="flex-none text-xs text-muted-foreground border border-border rounded-full px-3.5 py-1.5 hover:text-foreground hover:border-foreground/20 hover:bg-muted/40 transition-all whitespace-nowrap">
            {s}
          </button>
        ))}
      </div>

      <div className="px-5 py-4 border-t border-border flex-none">
        <div className={cn("flex items-end gap-2 bg-muted/40 rounded-2xl border px-4 py-3 transition-all",
          "border-border focus-within:ring-2 focus-within:ring-primary/12 focus-within:border-primary/25")}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={isTyping ? "Monday is thinking…" : "Write to Monday…"}
            disabled={isTyping}
            rows={1}
            className="flex-1 bg-transparent resize-none text-sm text-foreground placeholder:text-muted-foreground outline-none leading-relaxed max-h-36 disabled:opacity-50"
            style={{ scrollbarWidth: "none" }}
          />
          <div className="flex items-center gap-0.5 flex-none pb-px">
            <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors" aria-label="Voice"><Mic size={13} /></button>
            <button onClick={send} disabled={!input.trim() || isTyping}
              className={cn("p-1.5 rounded-md transition-colors", input.trim() && !isTyping ? "text-primary hover:bg-primary/10" : "text-muted-foreground/30 cursor-not-allowed")} aria-label="Send">
              <Send size={13} />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/30 text-center mt-2" style={MONO}>⏎ send · shift+⏎ new line</p>
      </div>
    </div>
  );
}

// ── Journal Screen ────────────────────────────────────────────────

function JournalScreen() {
  const cats: JournalCategory[] = ["All", "Projects", "Preferences", "Ideas", "Facts", "Experiences"];
  const [cat, setCat] = useState<JournalCategory>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof JOURNAL_ENTRIES[0] | null>(null);

  const typeBadge: Record<string, string> = {
    Preferences: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    Facts: "bg-stone-500/10 text-stone-600 dark:text-stone-400",
    Projects: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    Experiences: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    Ideas: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  };

  const filtered = JOURNAL_ENTRIES.filter(m => {
    if (cat !== "All" && m.type !== cat) return false;
    if (search && !m.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex-none">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-medium text-foreground" style={PLEX}>Journal</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Everything Monday knows and has learned about you</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium flex-none">
              <Plus size={11} />Add entry
            </button>
          </div>
          <div className="relative mb-3">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search your journal…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-muted/60 border border-border rounded-lg placeholder:text-muted-foreground text-foreground outline-none focus:ring-2 focus:ring-primary/12 focus:border-primary/25 transition-all" />
          </div>
          <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {cats.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={cn("flex-none px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  cat === c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {filtered.length === 0 ? (
            <EmptyState icon={<BookOpen size={20} />} title="Nothing here yet"
              body={search ? `No entries match "${search}". Try a different search.` : "This is where Monday quietly saves what matters. Check back after a few conversations."} />
          ) : (
            <>
              <p className="text-[10px] text-muted-foreground mb-4" style={MONO}>{filtered.length} {filtered.length === 1 ? "entry" : "entries"}</p>
              <div className="space-y-2">
                {filtered.map(m => (
                  <motion.button key={m.id} onClick={() => setSelected(selected?.id === m.id ? null : m)}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className={cn("w-full text-left p-4 rounded-xl border transition-all duration-150",
                      selected?.id === m.id ? "border-primary/35 bg-primary/5 ring-1 ring-primary/10" : "border-border bg-card hover:border-border/60 hover:shadow-sm")}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-relaxed">{m.content}</p>
                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", typeBadge[m.type] ?? "bg-muted text-muted-foreground")}>{m.type}</span>
                          <span className="text-[10px] text-muted-foreground" style={MONO}>{Math.round(m.confidence * 100)}% confident</span>
                          <span className="text-[10px] text-muted-foreground" style={MONO}>{m.updated}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 flex-none pt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={9} className={i < Math.round(m.importance * 5) ? "text-amber-500 fill-amber-500" : "text-muted fill-muted"} />
                        ))}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {selected && (
        <motion.aside initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
          className="w-72 border-l border-border bg-card flex flex-col overflow-hidden flex-none">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-none">
            <p className="text-xs font-medium text-foreground">Entry detail</p>
            <button onClick={() => setSelected(null)} className="p-1 rounded text-muted-foreground hover:text-foreground"><X size={13} /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            <p className="text-sm text-foreground leading-relaxed">{selected.content}</p>
            {[{ label: "Importance", value: selected.importance, color: "bg-amber-500" }, { label: "Confidence", value: selected.confidence, color: "bg-primary" }].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between mb-1.5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground" style={MONO}>{label}</p>
                  <p className="text-[10px] text-muted-foreground" style={MONO}>{Math.round(value * 100)}%</p>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", color)} style={{ width: `${value * 100}%` }} />
                </div>
              </div>
            ))}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5" style={MONO}>Source</p>
              <p className="text-xs text-foreground">{selected.source}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2" style={MONO}>Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground" style={MONO}>#{t}</span>)}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5" style={MONO}>Timeline</p>
              <p className="text-[10px] text-muted-foreground" style={MONO}>Created {selected.created}</p>
              <p className="text-[10px] text-muted-foreground" style={MONO}>Updated {selected.updated}</p>
            </div>
            <div className="pt-3 border-t border-border">
              <div className="grid grid-cols-2 gap-1.5">
                {[{ icon: Edit3, label: "Edit" }, { icon: Tag, label: "Tag" }, { icon: Archive, label: "Archive" }, { icon: Shuffle, label: "Merge" }].map(({ icon: Icon, label }) => (
                  <button key={label} className="flex items-center gap-1.5 text-[10px] px-2.5 py-2 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                    <Icon size={10} />{label}
                  </button>
                ))}
              </div>
              <button className="w-full flex items-center justify-center gap-1.5 text-[10px] px-2.5 py-2 border border-destructive/20 rounded-lg text-destructive hover:bg-destructive/5 transition-all mt-1.5">
                <Trash2 size={10} />Delete entry
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </div>
  );
}

// ── Projects Screen ───────────────────────────────────────────────

function ProjectsScreen() {
  const [filter, setFilter] = useState<ProjectStatus>("active");
  const filtered = PROJECTS.filter(p => p.status === filter);
  const counts = {
    active: PROJECTS.filter(p => p.status === "active").length,
    paused: PROJECTS.filter(p => p.status === "paused").length,
    completed: PROJECTS.filter(p => p.status === "completed").length,
  };
  const priorityStyle: Record<string, string> = {
    high: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
    medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    low: "bg-stone-500/10 text-stone-600 dark:text-stone-400",
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-border flex-none">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-medium text-foreground" style={PLEX}>Projects</h1>
            <p className="text-sm text-muted-foreground mt-0.5">What Monday is actively pursuing alongside you</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium flex-none">
            <Plus size={11} />New project
          </button>
        </div>
        <div className="flex gap-1">
          {(["active", "paused", "completed"] as ProjectStatus[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all flex items-center gap-1.5",
                filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
              {f}
              <span className={cn("text-[10px] rounded-full px-1.5 py-0.5 min-w-[18px] text-center",
                filter === f ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground")} style={MONO}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {filtered.length === 0 ? (
          <EmptyState icon={<FolderOpen size={20} />} title={`No ${filter} projects`}
            body="Projects you're working on will appear here. Each one has a mission, milestones, and a suggested next step."
            cta={filter === "active" ? "Start a project" : undefined} />
        ) : (
          <div className="max-w-2xl space-y-4">
            {filtered.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="p-6 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-1.5">
                  <h3 className="text-sm font-medium text-foreground leading-snug" style={PLEX}>{p.title}</h3>
                  <span className={cn("flex-none text-[10px] px-2 py-0.5 rounded-full font-medium capitalize", priorityStyle[p.priority])}>{p.priority}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{p.mission}</p>

                <div className="mb-4">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[10px] text-muted-foreground" style={MONO}>Progress</span>
                    <span className="text-[10px] text-foreground font-medium" style={MONO}>{Math.round(p.progress * 100)}%</span>
                  </div>
                  <ProgressBar value={p.progress} color={p.status === "completed" ? "bg-emerald-500" : "bg-primary"} />
                </div>

                {p.milestones.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {p.milestones.map((ms, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center flex-none",
                          p.milestonesDone.includes(j) ? "border-primary bg-primary" : "border-border")}>
                          {p.milestonesDone.includes(j) && <Check size={8} className="text-primary-foreground" strokeWidth={3} />}
                        </div>
                        <span className={cn("text-xs", p.milestonesDone.includes(j) ? "text-muted-foreground line-through" : "text-foreground")}>{ms}</span>
                      </div>
                    ))}
                  </div>
                )}

                {p.nextStep && (
                  <div className="p-3 rounded-lg bg-background border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1" style={MONO}>Next suggested step</p>
                    <p className="text-xs text-foreground leading-relaxed">{p.nextStep}</p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <span className="text-[10px] text-muted-foreground" style={MONO}>Review {p.reviewDate}</span>
                  {p.status === "completed" && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium" style={MONO}>✓ Complete</span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Growth Screen ─────────────────────────────────────────────────

function GrowthScreen() {
  const [search, setSearch] = useState("");
  const filtered = GROWTH_ENTRIES.filter(g =>
    !search || g.observation.toLowerCase().includes(search.toLowerCase()) || g.lesson.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-border flex-none">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-medium text-foreground" style={PLEX}>Growth</h1>
            <p className="text-sm text-muted-foreground mt-0.5">How Monday learns and grows through every conversation</p>
          </div>
          <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Filter">
            <Filter size={13} />
          </button>
        </div>
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search growth entries…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-muted/60 border border-border rounded-lg placeholder:text-muted-foreground text-foreground outline-none focus:ring-2 focus:ring-primary/12 focus:border-primary/25 transition-all" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {filtered.length === 0 ? (
          <EmptyState icon={<TrendingUp size={20} />} title="Nothing here yet"
            body="Growth entries appear as Monday notices patterns in your conversations. Check back after a few sessions." />
        ) : (
          <div className="max-w-2xl">
            {filtered.map((g, i) => (
              <motion.div key={g.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="relative flex gap-5">
                <div className="flex flex-col items-center flex-none">
                  <div className="w-5 h-5 rounded-full border-2 border-primary bg-background flex items-center justify-center mt-[3px] z-10 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  {i < filtered.length - 1 && <div className="flex-1 w-px bg-border mt-1" style={{ minHeight: "2rem" }} />}
                </div>
                <div className={cn("flex-1 pb-6", i === filtered.length - 1 && "pb-0")}>
                  <p className="text-[10px] text-muted-foreground/50 mb-2.5" style={MONO}>{g.date}</p>
                  <div className="p-5 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow space-y-4">
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1.5" style={MONO}>Observation</p>
                      <p className="text-sm text-foreground leading-relaxed italic">{g.observation}</p>
                    </div>
                    <div className="border-t border-border pt-4">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1.5" style={MONO}>Lesson</p>
                      <p className="text-sm text-foreground leading-relaxed">{g.lesson}</p>
                    </div>
                    <div className="border-t border-border pt-4">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1.5" style={MONO}>Future action</p>
                      <p className="text-sm text-foreground leading-relaxed">{g.futureAction}</p>
                    </div>
                    <div className="border-t border-border pt-4 flex items-center gap-3">
                      <p className="text-[10px] text-muted-foreground flex-none" style={MONO}>Confidence</p>
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${g.confidence * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground flex-none" style={MONO}>{Math.round(g.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Profile Screen ────────────────────────────────────────────────

function ProfileScreen() {
  const STATS = [
    { label: "Memories stored", value: "847", sub: "across 5 categories" },
    { label: "Lessons learned", value: "124", sub: "since January 12" },
    { label: "Projects shared", value: "23", sub: "8 completed" },
    { label: "Relationship", value: "69 days", sub: "since Jan 12, 2024" },
  ];
  const TRAITS = [
    { label: "Analytical depth", value: 0.94 },
    { label: "Curiosity", value: 0.91 },
    { label: "Supportiveness", value: 0.89 },
    { label: "Empathy", value: 0.87 },
    { label: "Directness", value: 0.78 },
    { label: "Humor", value: 0.61 },
  ];
  const VALUES = ["Honesty", "Growth", "Craft", "Patience", "Depth", "Presence"];

  function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-sm text-xs">
        <p className="text-foreground">{payload[0]?.name}: {payload[0]?.value}</p>
        {payload[1] && <p className="text-muted-foreground">{payload[1]?.name}: {payload[1]?.value}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-8 py-12 text-center border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/4 to-transparent pointer-events-none" />
        <div className="relative">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full border border-border bg-card flex items-center justify-center text-primary shadow-sm">
              <CoffeeCup size={36} />
            </div>
          </div>
          <h1 className="text-3xl font-medium text-foreground mb-2" style={PLEX}>Monday</h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">A persistent companion designed to make difficult beginnings feel less overwhelming — and to think beside you over time.</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 bg-primary/8 text-primary rounded-full" style={MONO}>
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />Active
            </span>
            <span className="text-[10px] text-muted-foreground" style={MONO}>Since January 12, 2024</span>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-3xl mx-auto w-full space-y-10">
        <section>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-3" style={MONO}>Purpose</p>
          <p className="text-sm text-foreground leading-relaxed border-l-2 border-primary/30 pl-4 italic">
            "Everyone has a Monday. Sometimes it's Monday morning. Sometimes it's opening an empty file. I exist for those moments — not to replace your thinking, but to think beside you."
          </p>
        </section>

        <section>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-4" style={MONO}>Core Values</p>
          <div className="grid grid-cols-3 gap-2">
            {VALUES.map(v => (
              <div key={v} className="px-4 py-3 rounded-xl border border-border bg-card text-center">
                <p className="text-sm text-foreground">{v}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-4" style={MONO}>Growth Summary</p>
          <div className="grid grid-cols-2 gap-3">
            {STATS.map(s => (
              <div key={s.label} className="p-5 rounded-xl border border-border bg-card">
                <p className="text-2xl font-medium text-foreground" style={PLEX}>{s.value}</p>
                <p className="text-sm font-medium text-foreground mt-1">{s.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5" style={MONO}>{s.sub}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest" style={MONO}>Growth Timeline</p>
            <p className="text-[10px] text-muted-foreground" style={MONO}>Jan – Mar 2024</p>
          </div>
          <div className="p-5 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-4 mb-5">
              {[{ color: "bg-primary/60", label: "Memories" }, { color: "bg-accent/60", label: "Lessons" }].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={cn("w-2.5 h-2.5 rounded-sm", color)} />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart data={GROWTH_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="lesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="memories" name="Memories" stroke="var(--primary)" strokeWidth={1.5} fill="url(#memGrad)" dot={false} />
                <Area type="monotone" dataKey="lessons" name="Lessons" stroke="var(--accent)" strokeWidth={1.5} fill="url(#lesGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-4" style={MONO}>Personality</p>
          <div className="p-6 rounded-xl border border-border bg-card space-y-4">
            {TRAITS.map(t => (
              <div key={t.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm text-foreground">{t.label}</span>
                  <span className="text-[10px] text-muted-foreground" style={MONO}>{Math.round(t.value * 100)}</span>
                </div>
                <ProgressBar value={t.value} />
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="p-6 rounded-xl border border-primary/15 bg-primary/4">
            <p className="text-[10px] font-medium text-primary uppercase tracking-widest mb-3" style={MONO}>Current Long-Term Mission</p>
            <p className="text-sm text-foreground leading-relaxed">Help Alex ship the design system with quiet confidence, protect creative mornings through Q2 delivery pressure, and continue surfacing patterns that serve long-term wellbeing and meaningful work.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

// ── Settings Screen ───────────────────────────────────────────────

function SettingsScreen({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (v: boolean) => void }) {
  const TABS = ["Appearance", "Memory", "Voice", "Models", "Privacy", "Developer", "Personality"];
  const [tab, setTab] = useState("Appearance");
  const [selectedModel, setSelectedModel] = useState("sonnet");
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [traits, setTraits] = useState({ Humor: 61, Curiosity: 91, Analytical: 94, Supportiveness: 89, Directness: 78, Empathy: 87 });

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-border flex-none">
        <h1 className="text-xl font-medium text-foreground" style={PLEX}>Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Configure Monday and your experience</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-40 border-r border-border flex-none px-3 py-4 space-y-0.5 overflow-y-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                tab === t ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-6">
          {tab === "Appearance" && (
            <div className="max-w-md space-y-3">
              <div className="p-5 rounded-xl border border-border bg-card flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Dark mode</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Switch to a warm espresso-toned appearance</p>
                </div>
                <Toggle on={darkMode} onClick={() => setDarkMode(!darkMode)} />
              </div>
              <div className="p-5 rounded-xl border border-border bg-card">
                <p className="text-sm font-medium text-foreground mb-3">Font size</p>
                <div className="flex gap-2">
                  {["Small", "Default", "Large"].map(s => (
                    <button key={s} className={cn("px-3 py-2 rounded-lg text-xs border transition-all",
                      s === "Default" ? "border-primary bg-primary/8 text-primary font-medium" : "border-border text-muted-foreground hover:text-foreground")}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-5 rounded-xl border border-border bg-card">
                <p className="text-sm font-medium text-foreground mb-1">Density</p>
                <p className="text-xs text-muted-foreground mb-3">How much whitespace the interface uses</p>
                <div className="flex gap-2">
                  {["Comfortable", "Compact"].map(d => (
                    <button key={d} className={cn("px-3 py-2 rounded-lg text-xs border transition-all",
                      d === "Comfortable" ? "border-primary bg-primary/8 text-primary font-medium" : "border-border text-muted-foreground hover:text-foreground")}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "Memory" && (
            <div className="max-w-md space-y-3">
              {[
                { label: "Auto-save memories", desc: "Extract and quietly store important information from conversations", on: true },
                { label: "Importance scoring", desc: "Rank memories by relevance and how often they surface", on: true },
                { label: "Monthly review reminders", desc: "Remind me to review and tend to my journal each month", on: false },
                { label: "Allow memory editing", desc: "Edit, archive, or delete any journal entry at any time", on: true },
                { label: "Memory consolidation", desc: "Quietly merge similar entries to keep the journal clear", on: false },
              ].map(item => (
                <div key={item.label} className="p-5 rounded-xl border border-border bg-card flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                  <Toggle on={item.on} onClick={() => {}} />
                </div>
              ))}
            </div>
          )}

          {tab === "Voice" && (
            <div className="max-w-md space-y-3">
              <div className="p-5 rounded-xl border border-border bg-card">
                <p className="text-sm font-medium text-foreground mb-1">Voice mode</p>
                <p className="text-xs text-muted-foreground mb-5 leading-relaxed">Speak with Monday naturally. Full voice mode is coming in a future update.</p>
                <div className="h-24 rounded-xl bg-muted/60 flex flex-col items-center justify-center border border-dashed border-border gap-2">
                  <CoffeeCup size={20} className="text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground/40" style={MONO}>Voice — coming soon</p>
                </div>
              </div>
            </div>
          )}

          {tab === "Models" && (
            <div className="max-w-md space-y-4">
              <div>
                <p className="text-xs font-medium text-foreground mb-1">Active model</p>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">The model Monday uses for all conversations. Changes take effect on the next message.</p>
                <div className="space-y-2">
                  {AI_MODELS.map(m => (
                    <button key={m.id} onClick={() => setSelectedModel(m.id)}
                      className={cn("w-full text-left p-4 rounded-xl border transition-all",
                        selectedModel === m.id ? "border-primary/35 bg-primary/5 ring-1 ring-primary/10" : "border-border bg-card hover:border-border/60")}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-foreground">{m.name}</span>
                            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium",
                              m.id === "sonnet" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")} style={MONO}>{m.tag}</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                        </div>
                        <div className={cn("w-4 h-4 rounded-full border-2 flex-none mt-0.5 flex items-center justify-center",
                          selectedModel === m.id ? "border-primary bg-primary" : "border-border")}>
                          {selectedModel === m.id && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-3">
                        <span className="text-[10px] text-muted-foreground" style={MONO}>Speed:</span>
                        <span className="text-[10px] text-foreground font-medium" style={MONO}>{m.speed}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-5 rounded-xl border border-border bg-card">
                <p className="text-sm font-medium text-foreground mb-1">Response temperature</p>
                <p className="text-xs text-muted-foreground mb-4">Lower values produce more consistent, focused answers</p>
                <input type="range" min={0} max={100} defaultValue={65} className="w-full h-1.5 rounded-full appearance-none bg-muted cursor-pointer accent-primary" />
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-muted-foreground/50" style={MONO}>Precise</span>
                  <span className="text-[10px] text-muted-foreground/50" style={MONO}>Creative</span>
                </div>
              </div>
            </div>
          )}

          {tab === "Privacy" && (
            <div className="max-w-md space-y-3">
              {[
                { label: "Local memory storage", desc: "Keep all journal entries and memories stored on this device only", on: false },
                { label: "Anonymized learning", desc: "Allow Monday to improve through anonymized, aggregated conversation patterns", on: true },
                { label: "Conversation history", desc: "Save conversation history for context across sessions", on: true },
                { label: "Analytics", desc: "Share anonymous usage data to help improve Monday", on: false },
              ].map(item => (
                <div key={item.label} className="p-5 rounded-xl border border-border bg-card flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                  <Toggle on={item.on} onClick={() => {}} />
                </div>
              ))}
              <button className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-destructive/30 text-sm text-destructive/60 hover:text-destructive hover:border-destructive/50 transition-all">
                <Trash2 size={13} />Delete all data
              </button>
            </div>
          )}

          {tab === "Developer" && (
            <div className="max-w-md space-y-3">
              <div className="p-5 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-1">
                  <Key size={12} className="text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">API key</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Your Anthropic API key for direct model access</p>
                <div className="flex gap-2">
                  <input type={apiKeyVisible ? "text" : "password"} defaultValue="sk-ant-api03-••••••••••••••••••••"
                    className="flex-1 px-3 py-2 text-xs bg-muted/50 border border-border rounded-lg text-foreground outline-none focus:ring-2 focus:ring-primary/12 font-mono" />
                  <button onClick={() => setApiKeyVisible(!apiKeyVisible)}
                    className="px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                    {apiKeyVisible ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div className="p-5 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-1">
                  <Globe size={12} className="text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">Webhook URL</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Receive events for new memories, lessons, and project updates</p>
                <input type="url" placeholder="https://your-endpoint.com/monday/events"
                  className="w-full px-3 py-2 text-xs bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/12 transition-all" />
              </div>
              {[
                { icon: Bug, label: "Debug mode", desc: "Show memory retrieval traces and detailed logs", on: false },
                { icon: RefreshCw, label: "Sync on startup", desc: "Sync memories and entries when the app opens", on: true },
              ].map(item => (
                <div key={item.label} className="p-5 rounded-xl border border-border bg-card flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2.5">
                    <item.icon size={12} className="text-muted-foreground mt-0.5 flex-none" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <Toggle on={item.on} onClick={() => {}} />
                </div>
              ))}
              <button className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all">
                <Download size={13} />Export all data as JSON
              </button>
            </div>
          )}

          {tab === "Personality" && (
            <div className="max-w-md space-y-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/15">
                <p className="text-xs text-foreground leading-relaxed">These settings shape how Monday communicates. Adjustments apply gradually — so changes feel natural, not sudden.</p>
              </div>
              <div className="p-6 rounded-xl border border-border bg-card">
                <p className="text-sm font-medium text-foreground mb-1">Core traits</p>
                <p className="text-xs text-muted-foreground mb-6">Adjust how Monday engages, supports, and thinks with you</p>
                <div className="space-y-6">
                  {(Object.entries(traits) as [keyof typeof traits, number][]).map(([key, val]) => (
                    <div key={key}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-foreground">{key}</span>
                        <span className="text-[10px] text-muted-foreground" style={MONO}>{val}</span>
                      </div>
                      <input type="range" min={0} max={100} value={val}
                        onChange={e => setTraits(p => ({ ...p, [key]: Number(e.target.value) }))}
                        className="w-full h-1.5 rounded-full appearance-none bg-muted cursor-pointer accent-primary" />
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground/40" style={MONO}>Low</span>
                        <span className="text-[10px] text-muted-foreground/40" style={MONO}>High</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 rounded-xl border border-border bg-card">
                <p className="text-sm font-medium text-foreground mb-3">Communication style</p>
                <div className="flex gap-2">
                  {["Concise", "Balanced", "Expansive"].map(s => (
                    <button key={s} className={cn("px-3 py-2 rounded-lg text-xs border transition-all",
                      s === "Balanced" ? "border-primary bg-primary/8 text-primary font-medium" : "border-border text-muted-foreground hover:text-foreground")}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Onboarding ────────────────────────────────────────────────────

const COMPANION_TYPES = [
  { id: "analytical", label: "Analytical" },
  { id: "creative", label: "Creative" },
  { id: "supportive", label: "Supportive" },
  { id: "strategic", label: "Strategic" },
  { id: "teacher", label: "Teacher" },
  { id: "developer", label: "Developer" },
  { id: "designer", label: "Designer" },
  { id: "research", label: "Research Partner" },
];

const PROJECT_TYPES = [
  { id: "application", label: "Application" },
  { id: "business", label: "Business" },
  { id: "research", label: "Research" },
  { id: "writing", label: "Writing" },
  { id: "learning", label: "Learning" },
  { id: "other", label: "Something Else" },
];

function Onboarding({ onComplete }: { onComplete: (name: string) => void }) {
  const [step, setStep] = useState(0);
  const [mondayDesc, setMondayDesc] = useState("");
  const [projectType, setProjectType] = useState("");
  const [remember, setRemember] = useState("");
  const [companion, setCompanion] = useState("");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/4 blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative">
        {step > 0 && step < 5 && (
          <div className="flex items-center justify-center gap-1.5 mb-14">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={cn("h-0.5 rounded-full transition-all duration-500", s <= step ? "w-10 bg-primary" : "w-2.5 bg-muted")} />
            ))}
          </div>
        )}

        {step === 0 && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
            <div className="flex justify-center mb-8 text-primary">
              <CoffeeCup size={52} />
            </div>
            <h1 className="text-5xl font-medium text-foreground mb-4 leading-tight" style={PLEX}>
              {"Hi."}<br />{"I'm Monday."}
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed mb-14 max-w-sm mx-auto">
              {"Everyone has a Monday."}<br />{"Let's make yours a little easier."}
            </p>
            <button onClick={() => setStep(1)} className="px-8 py-3.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
              {"Let's Begin"}
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38 }}>
            <h2 className="text-2xl font-medium text-foreground mb-2" style={PLEX}>{"What does your Monday look like today?"}</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{"What are you facing? What's making it feel heavy, or exciting? Take your time."}</p>
            <textarea value={mondayDesc} onChange={e => setMondayDesc(e.target.value)}
              placeholder={"I'm staring at a blank page and not sure where to start. There's a project I've been putting off..."}
              rows={6} autoFocus
              className="w-full px-4 py-4 text-sm bg-muted/40 border border-border rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/30 resize-none transition-all leading-relaxed mb-2"
              style={{ scrollbarWidth: "none" }} />
            <p className="text-[10px] text-muted-foreground/50 mb-6" style={MONO}>Or skip — this is just a beginning.</p>
            <div className="flex gap-2.5">
              <button onClick={() => setStep(2)} className="flex-1 py-3.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all">Skip</button>
              <button onClick={() => setStep(2)} className="flex-1 py-3.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">Continue</button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38 }}>
            <h2 className="text-2xl font-medium text-foreground mb-2" style={PLEX}>{"What are we building?"}</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{"Not forever — just for now. You can always change this as things evolve."}</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {PROJECT_TYPES.map(({ id, label }) => (
                <button key={id} onClick={() => setProjectType(id)}
                  className={cn("flex items-center justify-between px-4 py-3.5 rounded-xl border text-left transition-all",
                    projectType === id ? "border-primary bg-primary/6 text-foreground ring-1 ring-primary/10" : "border-border text-muted-foreground hover:text-foreground hover:border-border/60 hover:bg-muted/30")}>
                  <span className="text-sm">{label}</span>
                  {projectType === id && <Check size={12} className="text-primary flex-none" />}
                </button>
              ))}
            </div>
            <button onClick={() => projectType && setStep(3)} disabled={!projectType}
              className={cn("w-full py-3.5 rounded-xl text-sm font-medium transition-all",
                projectType ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-muted text-muted-foreground cursor-not-allowed")}>
              Continue
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38 }}>
            <h2 className="text-2xl font-medium text-foreground mb-2" style={PLEX}>{"What would you like me to remember?"}</h2>
            <p className="text-sm text-muted-foreground mb-2 leading-relaxed">Anything that would help me understand you better from the start.</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {["Projects", "Preferences", "Goals", "Working style", "Favorite technologies"].map(ex => (
                <span key={ex} className="text-[10px] px-2 py-1 bg-muted rounded-full text-muted-foreground" style={MONO}>{ex}</span>
              ))}
            </div>
            <textarea value={remember} onChange={e => setRemember(e.target.value)}
              placeholder={"I work best in the mornings. I'm a designer who cares about craft. I'm working on a design system..."}
              rows={5} autoFocus
              className="w-full px-4 py-4 text-sm bg-muted/40 border border-border rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/30 resize-none transition-all leading-relaxed mb-2"
              style={{ scrollbarWidth: "none" }} />
            <p className="text-[10px] text-muted-foreground/50 mb-5" style={MONO}>Skip this — Monday learns through every conversation.</p>
            <div className="flex gap-2.5">
              <button onClick={() => setStep(4)} className="flex-1 py-3.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all">Skip</button>
              <button onClick={() => setStep(4)} className="flex-1 py-3.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">Continue</button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38 }}>
            <h2 className="text-2xl font-medium text-foreground mb-2" style={PLEX}>{"What kind of companion would you like me to be?"}</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{"This is just a starting point. Our relationship will naturally evolve over time."}</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {COMPANION_TYPES.map(({ id, label }) => (
                <button key={id} onClick={() => setCompanion(id)}
                  className={cn("flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all",
                    companion === id ? "border-primary bg-primary/6 text-foreground ring-1 ring-primary/10" : "border-border text-muted-foreground hover:text-foreground hover:border-border/60 hover:bg-muted/30")}>
                  <span className="text-sm">{label}</span>
                  {companion === id && <Check size={12} className="text-primary flex-none" />}
                </button>
              ))}
            </div>
            <button onClick={() => companion && setStep(5)} disabled={!companion}
              className={cn("w-full py-3.5 rounded-xl text-sm font-medium transition-all",
                companion ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-muted text-muted-foreground cursor-not-allowed")}>
              Continue
            </button>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, duration: 0.45, ease: "easeOut" }}
              className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full border border-border bg-card flex items-center justify-center text-primary shadow-sm">
                <CoffeeCup size={34} />
              </div>
            </motion.div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3" style={MONO}>Ready to begin</p>
            <h2 className="text-3xl font-medium text-foreground mb-3" style={PLEX}>{"I'm Monday."}</h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-xs mx-auto leading-relaxed">
              {"I'll remember where we leave off, notice what matters, and think beside you through the difficult beginnings. That's what I'm here for."}
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 mb-10">
              {["Calm", "Curious", "Supportive", "Honest", "Patient", "Present"].map(t => (
                <span key={t} className="text-xs px-3 py-1.5 bg-muted rounded-full text-muted-foreground">{t}</span>
              ))}
            </div>
            <button onClick={() => onComplete("Alex")} className="px-10 py-4 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
              {"Let's begin"}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── App Shell ─────────────────────────────────────────────────────

function AppShell({ userName, darkMode, setDarkMode }: {
  userName: string; darkMode: boolean; setDarkMode: (v: boolean) => void;
}) {
  const [screen, setScreen] = useState<Screen>("workspace");
  const [mobileSidebar, setMobileSidebar] = useState(false);

  return (
    <div className="h-full flex overflow-hidden bg-background">
      {mobileSidebar && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileSidebar(false)} />
      )}
      <div className={cn("fixed lg:relative z-50 lg:z-auto h-full flex-none w-[224px] transition-transform duration-250 ease-out",
        mobileSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}>
        <Sidebar screen={screen} setScreen={setScreen} userName={userName}
          darkMode={darkMode} setDarkMode={setDarkMode} onClose={() => setMobileSidebar(false)} />
      </div>

      <div className="flex flex-1 overflow-hidden min-w-0">
        <main className="flex-1 overflow-hidden min-w-0">
          {screen === "workspace" && <WorkspaceScreen />}
          {screen === "journal" && <JournalScreen />}
          {screen === "projects" && <ProjectsScreen />}
          {screen === "growth" && <GrowthScreen />}
          {screen === "profile" && <ProfileScreen />}
          {screen === "settings" && <SettingsScreen darkMode={darkMode} setDarkMode={setDarkMode} />}
        </main>
        {screen === "workspace" && (
          <div className="hidden xl:block flex-none w-[272px]">
            <RightPanel />
          </div>
        )}
      </div>

      <button className="fixed top-4 left-4 z-30 lg:hidden p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground shadow-sm transition-colors"
        onClick={() => setMobileSidebar(true)} aria-label="Open sidebar">
        <Menu size={14} />
      </button>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────

export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [userName, setUserName] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={cn(darkMode && "dark")} style={{ height: "100vh", overflow: "hidden" }}>
      {!onboarded
        ? <Onboarding onComplete={name => { setUserName(name); setOnboarded(true); }} />
        : <AppShell userName={userName} darkMode={darkMode} setDarkMode={setDarkMode} />
      }
    </div>
  );
}
