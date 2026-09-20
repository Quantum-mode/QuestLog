'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import confetti from 'canvas-confetti';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function getISTDayNumber(timestamp: number = Date.now()): number {
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  return Math.floor((timestamp + istOffsetMs) / (24 * 60 * 60 * 1000));
}

function getOrdinalNum(n: number) {
  return n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
}

function getDateString(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateLabel(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const day = d.getDate();
  
  const month = d.toLocaleString('en-US', { month: 'long' });
  const dateStr = `${getOrdinalNum(day)} ${month}`;

  if (offset === 0) return `Today - ${dateStr}`;
  if (offset === -1) return `Yesterday - ${dateStr}`;
  if (offset === 1) return `Tomorrow - ${dateStr}`;
  
  const weekday = d.toLocaleString('en-US', { weekday: 'long' });
  return `${weekday} - ${dateStr}`;
}

const MARKET_AVATARS = [
  { id: '👤', name: 'Novice', cost: 0 }, 
  { id: '🐺', name: 'Lone Wolf', cost: 100 },
  { id: '⚔️', name: 'Squire', cost: 200 }, 
  { id: '🧙‍♂️', name: 'Mage', cost: 350 },
  { id: '🛡️', name: 'Knight', cost: 500 }, 
  { id: '🧛', name: 'Vampire', cost: 700 },
  { id: '🥷', name: 'Shinobi', cost: 900 }, 
  { id: '🤖', name: 'Cyborg', cost: 1200 },
  { id: '🐉', name: 'Dragonborn', cost: 1500 }, 
  { id: '👑', name: 'Emperor', cost: 2000 }
];

const MARKET_BORDERS = [
  { id: 'stone-circle', name: 'Stone Circle', cost: 0, customColor: false },
  { id: 'squire-square', name: 'Squire Square', cost: 100, customColor: true },
  { id: 'mystic-ring', name: 'Mystic Ring', cost: 200, customColor: true },
  { id: 'knight-shield', name: 'Knight Shield', cost: 400, customColor: true },
  { id: 'celestial-ring', name: 'Celestial Ring', cost: 600, customColor: true },
  { id: 'flow', name: 'Flow', cost: 1000, customColor: true }, 
  { id: 'arc-flow', name: 'Arc Flow', cost: 1200, customColor: false },
  { id: 'shooting-stars', name: 'Shooting Stars', cost: 1400, customColor: false },
  { id: 'majestic', name: 'Abyss', cost: 1800, customColor: false },
  { id: 'disc', name: 'Disc', cost: 2100, customColor: false },
  { id: 'nebula', name: 'Atom', cost: 2500, customColor: false },
  { id: 'black-hole', name: 'Black Hole', cost: 3000, customColor: false }
];

const UserAvatar = ({ user, size = 'w-12 h-12', text = 'text-2xl', isDark = true, spacing = '' }: { user: any, size?: string, text?: string, isDark?: boolean, spacing?: string }) => {
  const borderData = user?.border || 'stone-circle';
  const [borderId, customColor] = borderData.split('_');
  const bColor = customColor || '#facc15';
  
  const innerBg = isDark ? '#0f172a' : '#f8fafc';
  const starColor = isDark ? '#ffffff' : '#000000';
  const isStandardBorder = ['stone-circle', 'squire-square', 'mystic-ring', 'knight-shield', 'celestial-ring'].includes(borderId);

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${size} ${spacing} ${!isDark ? 'light-mode-vfx' : ''}`} style={{ '--bColor': bColor, '--innerBg': innerBg, '--starColor': starColor } as any}>
      
      {borderId === 'flow' && (
        <div className="fx-layer fx-flow">
          <div className="flow-line l1"></div><div className="flow-line l2"></div><div className="flow-line l3"></div>
          <div className="flow-line l4"></div><div className="flow-line l5"></div><div className="flow-line l6"></div>
          <div className="flow-line l7"></div><div className="flow-line l8"></div><div className="flow-line l9"></div>
          <div className="flow-line l10"></div>
        </div>
      )}
      {borderId === 'arc-flow' && (
        <div className="fx-layer fx-arc-flow">
          <div className="arc a1"></div><div className="arc a2"></div><div className="arc a3"></div><div className="arc a4"></div>
          <div className="arc a5"></div><div className="arc a6"></div><div className="arc a7"></div><div className="arc a8"></div>
        </div>
      )}
      {borderId === 'shooting-stars' && (
        <div className="fx-layer fx-shooting-stars">
          <div className="meteor m1"></div><div className="meteor m2"></div><div className="meteor m3"></div><div className="meteor m4"></div>
          <div className="meteor m5"></div><div className="meteor m6"></div><div className="meteor m7"></div><div className="meteor m8"></div>
          <div className="meteor m9"></div><div className="meteor m10"></div><div className="meteor m11"></div><div className="meteor m12"></div>
        </div>
      )}
      {borderId === 'black-hole' && (
        <div className="fx-layer fx-black-hole-back">
          <div className="bh-photon-ring"></div>
          <div className="bh-shadow"></div>
        </div>
      )}
      {borderId === 'disc' && (
        <div className="fx-layer fx-disc">
          <div className="disc-dust"></div>
          <div className="disc-arm disc-arm-1"></div><div className="disc-arm disc-arm-2"></div>
          <div className="disc-arm disc-arm-3"></div>
          <div className="disc-core"></div>
        </div>
      )}
      {borderId === 'nebula' && (
        <div className="fx-layer fx-nebula">
          <div className="neb-cloud"></div>
          <div className="neb-orbit neb-o1"><div className="neb-spinner neb-s1"><div className="neb-electron"></div></div></div>
          <div className="neb-orbit neb-o2"><div className="neb-spinner neb-s2"><div className="neb-electron"></div></div></div>
          <div className="neb-orbit neb-o3"><div className="neb-spinner neb-s3"><div className="neb-electron"></div></div></div>
          <div className="neb-orbit neb-o4"><div className="neb-spinner neb-s4"><div className="neb-electron"></div></div></div>
          <div className="neb-orbit neb-o5"><div className="neb-spinner neb-s5"><div className="neb-electron"></div></div></div>
          <div className="neb-black-core"></div>
        </div>
      )}
      {borderId === 'majestic' && (
        <div className="fx-layer fx-majestic">
          <div className="wh-wave wh-w1"></div>
          <div className="wh-wave wh-w2"></div>
          <div className="wh-wave wh-w3"></div>
          <div className="wh-wave wh-w4"></div>
          <div className="wh-wave wh-w5"></div>
          <div className="wh-hole"></div>
        </div>
      )}

      {['flow', 'arc-flow', 'shooting-stars'].includes(borderId) && (
        <div className="absolute w-full h-full bg-black rounded-full z-[5] shadow-[0_0_10px_rgba(0,0,0,0.8)]"></div>
      )}

      <div className={`avatar-core flex items-center justify-center ${text} ${isStandardBorder ? `border-${borderId}` : 'vfx-core-clip'} ${!isDark && isStandardBorder ? 'shadow-lg' : ''}`}>
        <div className={borderData.includes('rotate-12') ? 'rotate-12' : ''}>{user?.avatar || '👤'}</div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'quests' | 'market' | 'profile'>('quests');
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [leaders, setLeaders] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [lastGoldReward, setLastGoldReward] = useState(0);
  
  const [showEmailSentModal, setShowEmailSentModal] = useState(false);
  
  // PASSWORD VISIBILITY STATES
  const [showUpdatePassword, setShowUpdatePassword] = useState(false); 
  const [showDeletePassword, setShowDeletePassword] = useState(false); 
  
  const [showDeletedConfirmation, setShowDeletedConfirmation] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [notification, setNotification] = useState<{type: 'error'|'success', msg: string} | null>(null);
  const [marketColors, setMarketColors] = useState<Record<string, string>>({});
  
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLeaderboardCollapsed, setIsLeaderboardCollapsed] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [dateOffset, setDateOffset] = useState(0);

  const currentTargetDate = getDateString(dateOffset);
  
  const displayedTasks = tasks.filter(t => {
    const rawDate = t.task_date || t.created_at || getDateString(0);
    const cleanDate = rawDate.split('T')[0];
    return cleanDate === currentTargetDate;
  });
  
  const uncompletedCount = displayedTasks.filter(t => !t.completed).length;

  const handleReorderTasks = (newOrder: any[]) => {
    const otherTasks = tasks.filter(t => !displayedTasks.find(dt => dt.id === t.id));
    setTasks([...otherTasks, ...newOrder]);
  };

  const handleDeleteAllForDay = async () => {
    const idsToDelete = displayedTasks.map(t => t.id);
    if(idsToDelete.length === 0) return;
    
    const { error } = await supabase.from('tasks').delete().in('id', idsToDelete);
    if (error) {
       notify('error', 'Failed to delete quests.');
    } else {
       setTasks(tasks.filter(t => !idsToDelete.includes(t.id)));
       notify('success', 'Timeline cleared.');
    }
  };

  const notify = (type: 'error' | 'success', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem('rpg-theme') as 'dark' | 'light';
    if (storedTheme) setTheme(storedTheme);

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace('/');

      const { data: { user }, error } = await supabase.auth.getUser();
      const currentUser = user || session.user;

      if (currentUser && !currentUser.email_confirmed_at) {
        await supabase.auth.signOut();
        alert("⚠️ Verification required! Please click the link sent to your email before entering the realm.");
        router.replace('/');
        return;
      }

      setEmail(currentUser.email || '');
      fetchProfile(currentUser);
      fetchTasks(currentUser.id);
      fetchLeaderboard();
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.replace('/');
      } else if (event === 'USER_UPDATED' || event === 'SIGNED_IN') {
        setEmail(session.user.email || '');
      }
    });
    
    return () => subscription.unsubscribe();
  }, [router]);

  const changeTheme = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('rpg-theme', newTheme);
  };

  async function fetchProfile(user: any) {
    const userId = user.id;
    let fallbackProfile = {
      id: userId,
      username: user.user_metadata?.username || `Hero_${Math.floor(Math.random() * 9999)}`,
      level: 1, current_xp: 0, gold: 50, 
      streak_count: 0, 
      avatar: '👤', border: 'stone-circle',
      unlocked_avatars: ['👤'], unlocked_borders: ['stone-circle'],
      last_active_date: null 
    };

    try {
      let { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (!data) {
        const { data: newProfile, error: insertError } = await supabase.from('profiles').upsert([fallbackProfile]).select().single();
        if (!insertError && newProfile) data = newProfile;
      }

      if (data) {
        let currentStreak = data.streak_count || 0;
        
        if (data.current_xp === 0) {
          currentStreak = 0;
          if (data.streak_count !== 0) {
            await supabase.from('profiles').update({ streak_count: 0 }).eq('id', userId);
          }
        } 
        else if (data.last_active_date) {
          const todayIST = getISTDayNumber(Date.now());
          const lastActiveIST = getISTDayNumber(new Date(data.last_active_date).getTime());
          
          if (todayIST - lastActiveIST > 1 && currentStreak > 0) {
            currentStreak = 0;
            await supabase.from('profiles').update({ streak_count: 0 }).eq('id', userId);
          }
        }

        let dbBorder = data.border || 'stone-circle';
        if (dbBorder.includes('rounded-full')) dbBorder = 'stone-circle';

        setProfile({ 
          ...data, streak_count: currentStreak, gold: data.gold || 0,
          avatar: data.avatar || '👤', border: dbBorder,
          unlocked_avatars: data.unlocked_avatars || ['👤'], unlocked_borders: data.unlocked_borders || ['stone-circle']
        });
        setNewUsername(data.username || '');
        return; 
      }
    } catch (err) {
      console.error("Critical Profile Error:", err);
    }
    setProfile(fallbackProfile);
    setNewUsername(fallbackProfile.username);
  }

  async function fetchTasks(userId: string) {
    try {
      const { data } = await supabase.from('tasks').select('*').eq('user_id', userId).order('id', { ascending: false });
      if (data) setTasks(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchLeaderboard() {
    try {
      const { data } = await supabase.from('profiles').select('username, level, current_xp, streak_count, avatar, border')
        .order('level', { ascending: false }).order('current_xp', { ascending: false }).limit(10);
      if (data) setLeaders(data);
    } catch (e) {
      console.error(e);
    }
  }

  const evaluateTask = (title: string) => {
    const lower = title.toLowerCase();
    const isHard = /\b(project|assignment|exam|test|build|develop|deploy|presentation|interview|hackathon|marathon|heavy|intense|essay|thesis)\b/.test(lower) || lower.includes('2 hour') || lower.includes('3 hour') || title.length > 80;
    const isMedium = /\b(read|book|study|learn|gym|run|jog|workout|exercise|cook|sabzi|roti|meal|dinner|lunch|laundry|clean|meeting|revise|homework|practice|code|debug|write|research)\b/.test(lower) || lower.includes('1 hour') || title.length > 40;
    if (isHard) return { difficulty: 'Hard', xp: 50 };
    if (isMedium) return { difficulty: 'Medium', xp: 25 };
    return { difficulty: 'Easy', xp: 10 };
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dateOffset < 0) return notify('error', 'You cannot alter the past!');
    if (!newTaskInput.trim() || !profile) return;
    const { difficulty, xp } = evaluateTask(newTaskInput);
    
    const targetDate = getDateString(dateOffset);
    
    let { data, error } = await supabase
      .from('tasks')
      .insert([{ user_id: profile.id, title: newTaskInput, difficulty, xp, completed: false, task_date: targetDate }])
      .select()
      .maybeSingle();

    if (error && error.message.includes('task_date')) {
      const fallbackResponse = await supabase
        .from('tasks')
        .insert([{ user_id: profile.id, title: newTaskInput, difficulty, xp, completed: false }])
        .select()
        .single();
        
      data = fallbackResponse.data;
      error = fallbackResponse.error;
    }

    if (error) {
      notify('error', `Failed to save quest: ${error.message}`);
      return;
    }
    
    if (data) {
      const newTask = { ...data, task_date: data.task_date || targetDate };
      setTasks([newTask, ...tasks]);
      setNewTaskInput('');
    }
  };

  const deleteTask = async (taskId: number) => {
    await supabase.from('tasks').delete().eq('id', taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const completeTask = async (taskId: number, xpReward: number, isCompleted: boolean) => {
    if (isCompleted || !profile) return;
    await supabase.from('tasks').update({ completed: true }).eq('id', taskId);
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: true } : t));

    let newXp = (profile.current_xp || 0) + xpReward;
    let newLevel = profile.level || 1;
    let newGold = profile.gold || 0;
    const requiredXp = Math.floor(93 * Math.pow(newLevel, 1.5));

    if (newXp >= requiredXp) {
      newLevel += 1;
      newXp -= requiredXp;
      let goldReward = 0;
      if (newLevel === 2) goldReward = 100;
      else if (newLevel >= 3 && newLevel <= 5) goldReward = 225;
      else if (newLevel >= 6 && newLevel <= 7) goldReward = 350;
      else if (newLevel === 8) goldReward = 400;
      else if (newLevel >= 9 && newLevel <= 10) goldReward = 500;
      else if (newLevel >= 11) goldReward = 650;
      
      newGold += goldReward;
      setLastGoldReward(goldReward);
      
      const duration = 2500;
      const end = Date.now() + duration;
      const colors = ['#fde047', '#fbbf24', '#f59e0b', '#ffffff']; 
      
      (function frame() {
        confetti({ 
          particleCount: 5, 
          angle: 60, 
          spread: 80, 
          startVelocity: 60,
          origin: { x: 0, y: 0.6 }, 
          colors, 
          zIndex: 99999 
        });
        confetti({ 
          particleCount: 5, 
          angle: 120, 
          spread: 80, 
          startVelocity: 60,
          origin: { x: 1, y: 0.6 }, 
          colors, 
          zIndex: 99999 
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      }());

      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3500);
    }

    const todayIST = getISTDayNumber(Date.now());
    let newStreak = profile.streak_count || 0;
    
    if (profile.current_xp === 0) {
      newStreak = 1; 
    } 
    else if (profile.last_active_date) {
      const lastActiveIST = getISTDayNumber(new Date(profile.last_active_date).getTime());
      const dayDiff = todayIST - lastActiveIST;
      
      if (dayDiff === 1) {
        newStreak += 1;
      } else if (dayDiff > 1) {
        newStreak = 1;
      } else if (dayDiff === 0 && newStreak === 0) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const nowIso = new Date().toISOString();
    
    await supabase.from('profiles').update({ 
      current_xp: newXp, 
      level: newLevel, 
      streak_count: newStreak, 
      last_active_date: nowIso, 
      gold: newGold 
    }).eq('id', profile.id);
    
    setProfile({ 
      ...profile, current_xp: newXp, level: newLevel, streak_count: newStreak, 
      last_active_date: nowIso, gold: newGold 
    });
    
    fetchLeaderboard();
  };

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newUsername.trim();
    if (!cleanName) return notify('error', 'Player name cannot be empty.');
    if (cleanName === profile.username) return notify('error', 'That is already your current name!');
    
    const { error } = await supabase.from('profiles').update({ username: cleanName }).eq('id', profile.id);
    
    if (error) {
      if (error.code === '23505' || error.message.toLowerCase().includes('duplicate') || error.message.toLowerCase().includes('already exists')) {
        return notify('error', 'This username is already taken by another legend!');
      }
      return notify('error', error.message);
    }
    
    setProfile({ ...profile, username: cleanName });
    notify('success', 'Legendary name updated successfully!');
    fetchLeaderboard();
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return notify('error', 'Password must be at least 6 characters.');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      notify('error', error.message);
    } else { 
      notify('success', 'Password changed successfully!'); 
      setNewPassword(''); 
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail) return notify('error', 'Email cannot be empty.');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) return notify('error', 'Please enter a valid email format.');

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email === cleanEmail) {
      return notify('error', 'This is already your current email address!');
    }

    const { error } = await supabase.auth.updateUser({ email: cleanEmail });
    if (error) {
      if (error.status === 429 || error.message.toLowerCase().includes('rate limit')) {
        notify('error', 'Cooldown active: Please wait a few minutes before requesting another email change.');
      } else {
        notify('error', error.message);
      }
    } else {
      setShowEmailSentModal(true);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError(''); 
    
    if (!deletePassword) {
      return setDeleteError('Password is required.');
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: email, 
      password: deletePassword
    });

    if (verifyError) {
      return setDeleteError('Incorrect password. Please try again.');
    }

    const { error } = await supabase.rpc('delete_user');
    
    if (error) {
      setDeleteError(`Deletion failed: ${error.message}`);
    } else {
      setShowDeleteModal(false);
      setShowDeletedConfirmation(true);
    }
  };

  const buyAvatar = async (item: any) => {
    if (profile.unlocked_avatars.includes(item.id)) {
      await supabase.from('profiles').update({ avatar: item.id }).eq('id', profile.id);
      setProfile({ ...profile, avatar: item.id });
      fetchLeaderboard();
      return notify('success', 'Avatar equipped!');
    }
    if (profile.gold < item.cost) return notify('error', 'Not enough gold!');
    const newGold = profile.gold - item.cost;
    const newUnlocked = [...profile.unlocked_avatars, item.id];
    await supabase.from('profiles').update({ gold: newGold, unlocked_avatars: newUnlocked, avatar: item.id }).eq('id', profile.id);
    setProfile({ ...profile, gold: newGold, unlocked_avatars: newUnlocked, avatar: item.id });
    fetchLeaderboard();
    notify('success', 'Avatar purchased and equipped!');
  };

  const buyBorder = async (item: any, specificColor?: string) => {
    const chosenColor = specificColor || marketColors[item.id] || '#facc15';
    const finalBorderString = item.customColor ? `${item.id}_${chosenColor}` : item.id;
    if (profile.unlocked_borders.includes(item.id)) {
      await supabase.from('profiles').update({ border: finalBorderString }).eq('id', profile.id);
      setProfile({ ...profile, border: finalBorderString });
      fetchLeaderboard();
      return notify('success', 'Border updated & equipped!');
    }
    if (profile.gold < item.cost) return notify('error', 'Not enough gold!');
    const newGold = profile.gold - item.cost;
    const newUnlocked = [...profile.unlocked_borders, item.id];
    await supabase.from('profiles').update({ gold: newGold, unlocked_borders: newUnlocked, border: finalBorderString }).eq('id', profile.id);
    setProfile({ ...profile, gold: newGold, unlocked_borders: newUnlocked, border: finalBorderString });
    fetchLeaderboard();
    notify('success', 'Border purchased and equipped!');
  };

  if (!profile) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading Realm...</div>;

  const currentLevel = profile.level || 1;
  const currentXp = profile.current_xp || 0;
  const requiredXp = Math.floor(93 * Math.pow(currentLevel, 1.5));
  const progressPercent = Math.min((currentXp / requiredXp) * 100, 100);

  const isDark = theme === 'dark';
  const mainBg = isDark ? "bg-[#0a0f1c]" : "bg-slate-50";

  const darkBox = "bg-[#0b1121]/96";   
  const darkInner = "bg-[#1e293b]/100"; 
  const darkInput = "bg-[#1e293b]/98"; 
  
  const sidebarBg = isDark ? `${darkBox} backdrop-blur-md border-white/10 shadow-2xl` : "bg-white border-slate-300 shadow-xl";
  const cardBg = isDark ? `${darkBox} backdrop-blur-md border-white/10 text-white shadow-2xl` : "bg-white border-slate-300 text-slate-900 shadow-xl";
  const innerCardBg = isDark ? `${darkInner} border-white/5 shadow-inner` : "bg-slate-50 border-slate-200 shadow-sm";
  const inputBg = isDark ? `${darkInput} border-white/20 text-white font-bold focus:border-indigo-500` : "bg-white border-slate-400 text-slate-900 font-bold";
  
  const textMuted = isDark ? "text-slate-400" : "text-slate-600 font-semibold";
  const textTitle = isDark ? "text-white" : "text-slate-900 font-black";

  const activeTabClass = isDark ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-slate-900 text-white';
  const inactiveTabClass = isDark ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-200';

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans relative overflow-x-hidden bg-cover bg-center bg-fixed transition-all duration-700 ${isDark ? "bg-[#0a0f1c] bg-[url('/bg-dark.jpg')]" : "bg-slate-50 bg-[url('/bg-light.jpg')]"}`}>
      
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-4 rounded-2xl border shadow-2xl flex items-center gap-3 backdrop-blur-md ${
              notification.type === 'error'
                ? 'bg-red-950/90 border-red-500/50 text-red-200'
                : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            }`}
          >
            <span className="text-2xl">
              {notification.type === 'error' ? '⚠️' : '✨'}
            </span>
            <span className="font-bold text-sm md:text-base tracking-wide">
              {notification.msg}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`fixed top-4 right-4 z-[100] flex items-center p-1 rounded-full shadow-2xl border transition-all ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-300'}`}>
        <button onClick={() => changeTheme('light')} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${!isDark ? 'bg-amber-100 shadow-md text-amber-500 scale-110' : 'text-slate-400 hover:text-slate-200'}`}>☀️</button>
        <button onClick={() => changeTheme('dark')} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDark ? 'bg-slate-900 shadow-md text-blue-300 scale-110' : 'text-slate-500 hover:text-slate-800'}`}>🌙</button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scroll::-webkit-scrollbar { width: 10px; background: transparent; }
        .hide-scroll::-webkit-scrollbar-thumb { background-color: rgba(150, 150, 150, 0.6); border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
        .hide-scroll:hover::-webkit-scrollbar-thumb { background-color: rgba(150, 150, 150, 0.8); }
        
        .avatar-core { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; z-index: 10; box-sizing: border-box; border-radius: inherit; }
        .vfx-core-clip { border-radius: 50%; background: transparent; position: relative; z-index: 10; display: flex; align-items: center; justify-content: center; }
        .fx-layer { position: absolute; z-index: 1; pointer-events: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        
        @keyframes spinRight { 100% { transform: rotate(360deg); } }
        @keyframes spinLeft { 100% { transform: rotate(-360deg); } }
        @keyframes pulseGlow { 0% { box-shadow: 0 0 10px var(--bColor); } 100% { box-shadow: 0 0 30px var(--bColor), inset 0 0 15px var(--bColor); } }
        
        .border-stone-circle { border: 3px solid #475569; border-radius: 50%; background: var(--innerBg); }
        .border-squire-square { border: 3px solid var(--bColor); border-radius: 20%; background: var(--innerBg); }
        .border-mystic-ring { border: 3px solid var(--bColor); border-radius: 50%; box-shadow: 0 0 15px var(--bColor), inset 0 0 10px var(--bColor); background: var(--innerBg); }
        .border-knight-shield { border: 3px solid var(--bColor); border-radius: 10% 10% 50% 50% / 10% 10% 40% 40%; box-shadow: 0 5px 15px var(--bColor); background: var(--innerBg); }
        .border-celestial-ring { border: 3px solid var(--bColor); border-radius: 50%; box-shadow: 0 0 20px var(--bColor); animation: pulseGlow 1.5s infinite alternate ease-in-out; background: var(--innerBg); }
        
        .fx-flow { width: 180%; height: 180%; overflow: hidden; }
        .flow-line { position: absolute; height: 3px; background: linear-gradient(90deg, transparent, var(--bColor), transparent); border-radius: 50%; animation: flyRight 2.5s linear infinite; opacity: 0.9; left: -100%; }
        .l1 { top: 15%; width: 50%; animation-duration: 2.2s; animation-delay: 0.1s; }
        .l2 { top: 25%; width: 70%; animation-duration: 2.5s; animation-delay: 0.5s; }
        .l3 { top: 35%; width: 40%; animation-duration: 2.0s; animation-delay: 0.2s; }
        .l4 { top: 45%; width: 80%; animation-duration: 2.7s; animation-delay: 0.8s; }
        .l5 { top: 55%; width: 60%; animation-duration: 2.3s; animation-delay: 0.4s; }
        .l6 { top: 65%; width: 90%; animation-duration: 2.6s; animation-delay: 0.7s; }
        .l7 { top: 75%; width: 45%; animation-duration: 2.1s; animation-delay: 0.3s; }
        .l8 { top: 85%; width: 75%; animation-duration: 2.4s; animation-delay: 0.6s; }
        .l9 { top: 10%; width: 55%; animation-duration: 2.3s; animation-delay: 0.9s; }
        .l10 { top: 90%; width: 65%; animation-duration: 2.5s; animation-delay: 0.2s; }
        @keyframes flyRight { 0% { left: -80%; } 100% { left: 180%; } }

        .fx-arc-flow { width: 150%; height: 150%; z-index: 12; overflow: visible; }
        .arc { position: absolute; border-radius: 50%; border: solid transparent; }
        .a1 { width: 100%; height: 100%; border-width: 2px; border-top-color: #3b82f6; animation: spinRight 3.5s linear infinite; }
        .a2 { width: 90%; height: 90%; border-width: 3px; border-bottom-color: #10b981; animation: spinLeft 3.2s linear infinite; }
        .a3 { width: 110%; height: 110%; border-width: 2px; border-left-color: #ec4899; border-right-color: #ec4899; animation: spinRight 4.0s linear infinite; }
        .a4 { width: 120%; height: 120%; border-width: 1px; border-top-color: #f59e0b; border-bottom-color: #f59e0b; animation: spinLeft 3.8s linear infinite; }
        .a5 { width: 80%; height: 80%; border-width: 4px; border-right-color: #8b5cf6; animation: spinRight 2.8s linear infinite; }
        .a6 { width: 130%; height: 130%; border-width: 2px; border-left-color: #06b6d4; animation: spinLeft 4.2s linear infinite; }
        .a7 { width: 70%; height: 70%; border-width: 3px; border-bottom-color: #ef4444; animation: spinRight 3.1s linear infinite; }
        .a8 { width: 140%; height: 140%; border-width: 1px; border-top-color: #6366f1; border-right-color: #6366f1; animation: spinLeft 4.5s linear infinite; }

        .fx-shooting-stars { width: 200%; height: 200%; overflow: hidden; }
        .meteor { position: absolute; width: 40px; height: 4px; background: linear-gradient(to right, transparent, var(--starColor)); transform: rotate(135deg); animation: meteorFall 2s infinite linear; opacity: 0; }
        .m1 { top: 0%; left: 80%; animation-delay: 0s; animation-duration: 2.2s; }
        .m2 { top: 20%; left: 90%; animation-delay: 0.3s; animation-duration: 2.5s; }
        .m3 { top: -10%; left: 60%; animation-delay: 0.6s; animation-duration: 2.0s; }
        .m4 { top: 40%; left: 100%; animation-delay: 0.1s; animation-duration: 2.4s; }
        .m5 { top: -20%; left: 40%; animation-delay: 0.8s; animation-duration: 2.6s; }
        .m6 { top: 60%; left: 110%; animation-delay: 0.4s; animation-duration: 1.8s; }
        .m7 { top: 10%; left: 70%; animation-delay: 0.2s; animation-duration: 2.7s; }
        .m8 { top: 30%; left: 85%; animation-delay: 0.7s; animation-duration: 2.3s; }
        .m9 { top: -5%; left: 50%; animation-delay: 0.5s; animation-duration: 2.4s; }
        .m10 { top: 50%; left: 95%; animation-delay: 0.9s; animation-duration: 2.1s; }
        .m11 { top: 70%; left: 120%; animation-delay: 0.2s; animation-duration: 2.5s; }
        .m12 { top: -30%; left: 80%; animation-delay: 1s; animation-duration: 2.3s; }
        @keyframes meteorFall { 0% { transform: translate(150px, -150px) rotate(135deg); opacity: 1; } 100% { transform: translate(-200px, 200px) rotate(135deg); opacity: 0; } }

        .fx-black-hole-back { position: absolute; z-index: 1; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .bh-photon-ring { position: absolute; width: 220%; height: 220%; border-radius: 50%; border: 12px solid rgba(255, 237, 213, 0.95); box-shadow: -15px 15px 35px #ea580c, 15px -15px 35px #ea580c, inset 0 0 20px #ea580c; z-index: 2; animation: revolveBH 3s linear infinite; }
        .bh-shadow { position: absolute; width: 105%; height: 105%; border-radius: 50%; background: #000; box-shadow: 0 0 25px 8px #ea580c; z-index: 3; }
        @keyframes revolveBH { 0% { transform: rotateX(72deg) rotateY(15deg) rotateZ(0deg); } 100% { transform: rotateX(72deg) rotateY(15deg) rotateZ(360deg); } }

        .fx-disc { position: absolute; z-index: 1; width: 120%; height: 120%; display: flex; align-items: center; justify-content: center; }
        .disc-core { position: absolute; width: 80%; height: 80%; border-radius: 50%; background: #000; box-shadow: 0 0 15px 3px rgba(168, 85, 247, 0.6); z-index: 3; }
        .disc-dust { position: absolute; width: 140%; height: 140%; border-radius: 50%; background: radial-gradient(circle, rgba(79, 70, 229, 0.4) 10%, rgba(30, 58, 138, 0.6) 40%, transparent 70%); z-index: 1; animation: pulseGlow 5s infinite alternate; }
        .disc-arm { position: absolute; border-radius: 50%; z-index: 2; filter: blur(4px); }
        .disc-arm-1 { width: 130%; height: 130%; background: conic-gradient(from 0deg, transparent 0%, rgba(168, 85, 247, 0.9) 15%, transparent 35%, transparent 50%, rgba(56, 189, 248, 0.9) 65%, transparent 85%); animation: spinRight 10s linear infinite; }
        .disc-arm-2 { width: 110%; height: 110%; background: conic-gradient(from 90deg, transparent 0%, rgba(236, 72, 153, 0.7) 15%, transparent 35%, transparent 50%, rgba(59, 130, 246, 0.7) 65%, transparent 85%); animation: spinRight 14s linear infinite; }
        .disc-arm-3 { width: 105%; height: 105%; border: 2px dotted rgba(255, 255, 255, 0.5); filter: blur(1px); animation: spinLeft 25s linear infinite; opacity: 0.6; z-index: 2; }

        .fx-nebula { position: absolute; z-index: 1; width: 230%; height: 230%; display: flex; align-items: center; justify-content: center; }
        .neb-black-core { position: absolute; width: 45.45%; height: 45.45%; background: #000; border-radius: 50%; z-index: 5; box-shadow: 0 0 25px 8px rgba(20, 184, 166, 0.4), inset 0 0 10px rgba(20, 184, 166, 0.8); } 
        .neb-cloud { position: absolute; width: 145%; height: 145%; border-radius: 40% 60% 55% 45%; background: radial-gradient(ellipse at center, rgba(20, 184, 166, 0.45) 35%, transparent 60%); z-index: 1; animation: spinRight 6s linear infinite; filter: blur(6px); }
        .neb-orbit { position: absolute; width: 90%; height: 90%; border-radius: 50%; border: 2px solid hsla(173, 80%, 40%, 0.96); box-shadow: inset 0 0 10px rgba(20, 184, 166, 0.3), 0 0 10px rgba(20, 184, 166, 0.3); transform-style: preserve-3d; z-index: 2; }
        
        .neb-o1 { transform: rotateX(75deg) rotateY(0deg); }
        .neb-o2 { transform: rotateX(75deg) rotateY(36deg); }
        .neb-o3 { transform: rotateX(75deg) rotateY(72deg); }
        .neb-o4 { transform: rotateX(75deg) rotateY(108deg); }
        .neb-o5 { transform: rotateX(75deg) rotateY(144deg); }

        .neb-spinner { position: absolute; width: 100%; height: 100%; border-radius: 50%; transform-style: preserve-3d; }
        .neb-s1 { animation: spin-electron 3.2s linear infinite; animation-delay: 0s; }
        .neb-s2 { animation: spin-electron 4.1s linear infinite reverse; animation-delay: -1.5s; }
        .neb-s3 { animation: spin-electron 3.6s linear infinite; animation-delay: -3.2s; }
        .neb-s4 { animation: spin-electron 4.5s linear infinite reverse; animation-delay: -0.8s; }
        .neb-s5 { animation: spin-electron 3.9s linear infinite; animation-delay: -2.4s; }

        .neb-electron { position: absolute; top: -7px; left: calc(50% - 7px); width: 12px; height: 12px; background: #dff136f8; border-radius: 50%; box-shadow: 0 0 8px 2px rgba(253, 224, 71, 1), 0 0 15px 6px rgba(253, 224, 71, 0.5); }
        @keyframes spin-electron { 0% { transform: rotateZ(0deg); } 100% { transform: rotateZ(360deg); } }

        .fx-majestic { position: absolute; z-index: 1; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .wh-hole { position: absolute; width: 100%; height: 100%; background: #000; border-radius: 50%; z-index: 3; box-shadow: 0 0 20px 4px rgba(6, 182, 212, 0.8); }
        .wh-wave { position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 15px 5px #06b6d4, inset 0 0 10px #06b6d4; opacity: 0; z-index: 2; animation: wh-radiate 3s infinite linear; }
        .wh-w1 { animation-delay: 0s; } 
        .wh-w2 { animation-delay: 0.6s; } 
        .wh-w3 { animation-delay: 1.2s; } 
        .wh-w4 { animation-delay: 1.8s; } 
        .wh-w5 { animation-delay: 2.4s; }
        @keyframes wh-radiate { 
          0% { transform: scale(0.45); opacity: 1; border-width: 4px; } 
          100% { transform: scale(2.3); opacity: 0; border-width: 1px; } 
        }

        @keyframes spinSlow { 100% { transform: rotate(360deg); } }
        .level-up-rays { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 200%; height: 200%; background: repeating-conic-gradient(from 0deg, transparent 0deg, rgba(250, 204, 21, 0.4) 15deg, transparent 30deg); animation: spinSlow 15s linear infinite; pointer-events: none; }
        .mask-radial-fade { -webkit-mask-image: radial-gradient(circle, black 20%, transparent 70%); mask-image: radial-gradient(circle, black 20%, transparent 70%); }

      `}} />

      <AnimatePresence>
        {showLevelUp && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.3 }} 
            className="fixed inset-0 pointer-events-none z-[500] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 100, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.8, y: -50, opacity: 0 }} 
              transition={{ type: "spring", damping: 14, stiffness: 200 }} 
              className="relative z-10 flex flex-col items-center"
            >
              <motion.div 
                animate={{ y: [-8, 8, -8] }} 
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="w-24 h-24 mb-[-30px] z-20 flex items-center justify-center rounded-full bg-gradient-to-b from-yellow-300 to-yellow-500 shadow-xl border-4 border-white text-5xl pb-1"
              >
                ⭐
              </motion.div>

              <div className={`relative px-12 md:px-20 pt-14 pb-10 rounded-[2.5rem] border-2 overflow-hidden text-center shadow-2xl ${isDark ? 'bg-slate-900 border-yellow-500' : 'bg-white border-yellow-400'}`}>
                
                <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-yellow-600 drop-shadow-sm tracking-tight mb-3">
                  LEVEL UP!
                </h1>
                
                <div className="flex flex-col items-center gap-2 mt-2">
                  <span className={`text-xl md:text-2xl font-bold uppercase tracking-widest ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Level <span className="text-yellow-500 font-black">{profile.level}</span> Unlocked
                  </span>
                  
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    transition={{ delay: 0.4, type: "spring", bounce: 0.5 }}
                    className="inline-flex items-center gap-2 px-6 py-3 mt-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-xl font-black text-yellow-500"
                  >
                    Reward: +{lastGoldReward} 🪙
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`border-b md:border-b-0 md:border-r p-6 flex flex-col z-40 shrink-0 transition-all duration-500 relative ${sidebarBg} ${isSidebarCollapsed ? 'w-full md:w-28 items-center' : 'w-full md:w-72'}`}>
        
        <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className={`hidden md:flex absolute -right-4 top-8 w-8 h-8 rounded-full border shadow-md items-center justify-center font-bold z-50 transition-colors ${isDark ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'}`}>
          {isSidebarCollapsed ? '❯' : '❮'}
        </button>

        <div className={`mb-8 hidden md:flex flex-col items-center transition-all w-full ${isSidebarCollapsed ? 'mt-12' : 'mt-16'}`}>
          
          <div className={`${isSidebarCollapsed ? 'mb-8' : 'mb-12 md:mb-16'}`}>
            <UserAvatar 
              user={profile} 
              size={isSidebarCollapsed ? "w-12 h-12" : "w-16 h-16 md:w-24 md:h-24"} 
              text={isSidebarCollapsed ? "text-xl" : "text-3xl md:text-5xl"} 
              isDark={isDark} 
            />
          </div>

          {!isSidebarCollapsed && (
            <div className="flex flex-col items-center text-center overflow-hidden w-full">
              <h2 className={`font-black text-2xl truncate w-full mb-3 ${textTitle}`}>{profile.username}</h2>
              <div className="flex flex-col items-center gap-2 w-full px-2">
                <div className={`w-full flex justify-between items-center bg-indigo-500/10 px-3 py-2 rounded-lg border border-indigo-500/20 text-sm font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  <span>Level {profile.level}</span>
                  <span>{currentXp} / {requiredXp} XP</span>
                </div>
                <div className={`w-full flex justify-center items-center bg-yellow-500/10 px-3 py-2 rounded-lg border border-yellow-500/20 text-sm font-bold ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`}>
                  <span>{profile.gold} 🪙</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <nav className={`flex md:flex-col gap-3 overflow-x-auto md:overflow-visible w-full ${isSidebarCollapsed ? 'items-center' : ''}`}>
          <button onClick={() => setActiveTab('quests')} title="Quests & Board" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'quests' ? activeTabClass : inactiveTabClass} ${isSidebarCollapsed ? 'justify-center w-14 h-14 px-0' : 'w-full'}`}>
            <span className="text-xl shrink-0">⚔️</span>{!isSidebarCollapsed && <span>Quests & Board</span>}
          </button>
          <button onClick={() => setActiveTab('market')} title="Marketplace" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'market' ? activeTabClass : inactiveTabClass} ${isSidebarCollapsed ? 'justify-center w-14 h-14 px-0' : 'w-full'}`}>
            <span className="text-xl shrink-0">🛍️</span>{!isSidebarCollapsed && <span>Marketplace</span>}
          </button>
          <button onClick={() => setActiveTab('profile')} title="Profile Settings" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'profile' ? activeTabClass : inactiveTabClass} ${isSidebarCollapsed ? 'justify-center w-14 h-14 px-0' : 'w-full'}`}>
            <span className="text-xl shrink-0">⚙️</span>{!isSidebarCollapsed && <span>Profile Settings</span>}
          </button>
        </nav>

        <div className="mt-auto hidden md:flex flex-col w-full pt-10">
          <button onClick={async () => await supabase.auth.signOut()} title="Sign out" className={`w-full flex items-center justify-center gap-2 text-sm bg-red-500/10 text-red-500 border border-red-500/20 py-3 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold ${isSidebarCollapsed ? 'px-0 w-14 h-14 mx-auto' : 'px-4'}`}>
            {!isSidebarCollapsed && <span>Sign out</span>}
            {isSidebarCollapsed && <span className="text-lg">🚪</span>}
          </button>
        </div>
      </div>

      <div id="main-bg-scroll" ref={scrollRef} className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden hide-scroll h-screen relative pointer-events-auto">
        <div className="max-w-[95rem] mx-auto space-y-6 relative z-10 pointer-events-none">

          {activeTab === 'quests' && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
                
              <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row gap-6 mb-6">
                <div className={`pointer-events-auto border p-6 md:px-8 rounded-2xl flex flex-col justify-center transition-colors duration-500 shrink-0 w-full md:w-[380px] ${cardBg}`}>
                  
                  <p className={`w-full text-left text-m font-bold tracking-widest mb-2 ${textMuted}`}>
                    Greetings,
                  </p>
                  
                  <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 truncate w-full text-center drop-shadow-sm pb-1">
                    {profile.username}
                  </h2>
                  
                  <div className="mt-3 flex justify-center w-full">
                    <div className="flex items-center gap-2 bg-orange-500/10 text-orange-500 px-4 py-2 rounded-full shadow-sm">
                      <span className="text-l font-bold opacity-90">
                        Streak Count:
                      </span>
                      <span className="text-xl sm:text-2xl font-black drop-shadow-sm">
                        {profile.streak_count}🔥
                      </span>
                    </div>
                  </div>
                  
                </div>

                <div className={`pointer-events-auto border p-6 md:p-8 rounded-2xl flex flex-col justify-center transition-colors duration-500 flex-grow ${cardBg}`}>
                  <div className="flex justify-between items-end mb-4">
                    <div className="flex items-center gap-4">
                      <span className="bg-indigo-600 text-white font-black text-2xl h-12 w-12 flex items-center justify-center rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                        {profile.level}
                      </span>
                      <span className={`font-bold tracking-wide uppercase text-sm ${textMuted}`}>Level Progress</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-3xl ${textTitle}`}>{currentXp}</span>
                      <span className={`font-bold ${textMuted}`}> / {requiredXp} XP</span>
                    </div>
                  </div>
                  <div className={`w-full rounded-full h-5 border overflow-hidden relative shadow-inner ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-200 border-slate-300'}`}>
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${progressPercent}%` }} 
                      transition={{ duration: 1.2, ease: "easeOut" }} 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.6)] rounded-full" 
                    />
                  </div>
                </div>

              </div>

              <div 
                style={{ maxWidth: isLeaderboardCollapsed ? '1200px' : '1624px' }} 
                className="mx-auto flex flex-col lg:flex-row gap-6 w-full items-stretch transition-all duration-700 ease-out"
              >
                
                <div className={`pointer-events-auto border p-5 md:p-8 rounded-2xl flex flex-col h-[600px] md:h-[690px] overflow-hidden ${cardBg} ${isLeaderboardCollapsed ? 'w-full' : 'w-full lg:w-auto lg:flex-grow'} transition-all duration-750 ease-out`}>
                  
                  <div className="flex justify-between items-center mb-6 shrink-0">
                    <h3 className={`text-xl md:text-2xl flex items-center gap-2 ${textTitle}`}>⚔️ Quests Board</h3>
                    {isLeaderboardCollapsed && (
                      <button onClick={() => setIsLeaderboardCollapsed(false)} className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-lg font-bold transition-colors shrink-0 text-sm md:text-base ${isDark ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'}`}>
                        🏆 <span className="hidden sm:inline">Show Hall of Fame</span>
                      </button>
                    )}
                  </div>
                  
                  <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-3 mb-5 shrink-0">
                    <input 
                      type="text" 
                      value={newTaskInput} 
                      onChange={(e) => setNewTaskInput(e.target.value)} 
                      disabled={dateOffset < 0}
                      placeholder={dateOffset < 0 ? "You can't add quest in past" : "Enter a new quest..."} 
                      className={`flex-grow border p-3 md:p-4 rounded-xl focus:outline-none transition-all w-full sm:w-auto ${inputBg} ${dateOffset < 0 ? 'opacity-50 cursor-not-allowed border-transparent' : ''}`} 
                    />
                    <button 
                      type="submit" 
                      disabled={dateOffset < 0}
                      className={`font-bold px-6 py-3 md:py-4 rounded-xl shadow-lg shrink-0 transition-all w-full sm:w-auto ${dateOffset < 0 ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'}`}
                    >
                      Add
                    </button>
                  </form>

                  <div className={`flex justify-between items-center px-4 py-3 mb-5 rounded-xl border shrink-0 ${isDark ? 'bg-black/40 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                    <button onClick={() => setDateOffset(prev => prev - 1)} className={`p-2 rounded-lg transition-colors font-black ${isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-200 text-slate-700'}`}>
                      &lt;
                    </button>
                    
                    <div className="flex items-center gap-3">
                      <span className={`font-black text-sm md:text-lg ${textTitle}`}>
                        {formatDateLabel(dateOffset)}
                      </span>
                      {dateOffset < 0 && uncompletedCount > 0 && (
                        <span className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-red-500 text-white text-[10px] md:text-xs font-black shadow-sm">
                          {uncompletedCount}
                        </span>
                      )}
                    </div>
                    
                    <button onClick={() => setDateOffset(prev => prev + 1)} className={`p-2 rounded-lg transition-colors font-black ${isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-200 text-slate-700'}`}>
                      &gt;
                    </button>
                  </div>

                  <Reorder.Group axis="y" values={displayedTasks} onReorder={handleReorderTasks} className="flex-grow overflow-y-auto pr-2 space-y-3 hide-scroll internal-scroll pointer-events-auto">
                    <AnimatePresence>
                      {displayedTasks.length === 0 ? (
                        <p className={`text-center mt-6 italic text-sm md:text-base ${textMuted}`}>No quests recorded for this day.</p>
                      ) : displayedTasks.map((task) => (
                        <Reorder.Item key={task.id} value={task} id={String(task.id)} className={`relative flex items-center justify-between p-3 md:p-4 rounded-xl border cursor-grab active:cursor-grabbing transition-colors ${task.completed ? (isDark ? `${darkBox} border-white/5 opacity-50` : 'bg-slate-200 border-slate-300 opacity-60') : (isDark ? `${darkInner} border-white/10 hover:border-indigo-500` : 'bg-slate-50 border-slate-200 shadow-sm hover:border-indigo-500')}`}>
                          <div className="flex items-center gap-3 md:gap-4 flex-grow mr-2 md:mr-3 min-w-0">
                            <button onClick={() => completeTask(task.id, task.xp, task.completed)} className={`w-5 h-5 md:w-6 md:h-6 rounded-md border flex-shrink-0 flex items-center justify-center ${task.completed ? 'bg-indigo-500 border-indigo-500' : 'border-slate-400'}`}>
                              {task.completed && <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </button>
                            <div className="min-w-0">
                              <p className={`font-bold text-sm md:text-base break-words select-none truncate whitespace-normal ${task.completed ? `line-through ${textMuted}` : textTitle}`}>{task.title}</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <span className={`text-[9px] md:text-[10px] uppercase font-black px-2 py-0.5 rounded select-none ${task.difficulty === 'Hard' ? 'bg-red-500/20 text-red-500' : task.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-600' : 'bg-green-500/20 text-green-600'}`}>{task.difficulty}</span>
                                <span className="text-[9px] md:text-[10px] uppercase font-black px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-500 select-none">+{task.xp} XP</span>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => deleteTask(task.id)} className={`hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg flex-shrink-0 transition-all ${textMuted}`}>✕</button>
                        </Reorder.Item>
                      ))}
                    </AnimatePresence>
                  </Reorder.Group>
                  
                  {displayedTasks.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 shrink-0">
                      <button 
                        onClick={handleDeleteAllForDay} 
                        className="w-full py-3 rounded-xl border border-red-500/20 text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white font-bold transition-all text-xs md:text-sm"
                      >
                        Delete all tasks for {formatDateLabel(dateOffset).split(' - ')[0].toLowerCase()}
                      </button>
                    </div>
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {!isLeaderboardCollapsed && (
                    <motion.div 
                      initial={{ opacity: 0, maxWidth: 0, marginLeft: 0, x: 30 }} 
                      animate={{ opacity: 1, maxWidth: 550, width: "100%", marginLeft: 0, x: 0 }} 
                      exit={{ opacity: 0, maxWidth: 0, marginLeft: -24, x: 30 }} 
                      transition={{ type: "spring", bounce: 0, duration: 1 }} 
                      className={`pointer-events-auto border rounded-2xl flex flex-col h-[600px] md:h-[690px] overflow-hidden shrink-0 ${cardBg}`}
                    >
                      <div className="w-full lg:w-[550px] p-5 md:p-8 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6 shrink-0">
                          <h3 className="text-xl md:text-2xl font-bold text-yellow-500 flex items-center gap-2">🏆 Hall of Fame</h3>
                          <button onClick={() => setIsLeaderboardCollapsed(true)} title="Hide Hall of Fame" className={`p-2 rounded-lg transition-colors shrink-0 ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}>✕</button>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2 space-y-3 hide-scroll internal-scroll pointer-events-auto">
                          {leaders.map((leader, index) => {
                    
                    let rankColorClass = textMuted; 
                    if (index === 0) rankColorClass = 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]';
                    else if (index === 1) rankColorClass = 'text-slate-199 drop-shadow-[0_0_8px_rgba(148,163,184,0.5)]'; 
                    else if (index === 2) rankColorClass = 'text-amber-600 drop-shadow-[0_0_8px_rgba(180,83,9,0.5)]'; 

                    return (
                      <div key={index} className={`relative overflow-hidden flex items-center justify-between px-3 md:px-5 py-4 md:py-6 rounded-xl border transition-colors mb-3 ${isDark ? `${darkInner} border-white/10` : 'bg-slate-50 border-slate-200'}`}>
                        
                        <div className="flex items-center z-10 min-w-0 flex-grow">
                          
                          <span className={`text-lg md:text-xl font-black w-10 md:w-20 shrink-0 ${rankColorClass}`}>
                            #{index + 1}
                          </span>
                          
                          <UserAvatar 
                            user={leader} 
                            size="w-10 h-10 md:w-14 md:h-14" 
                            text="text-xl md:text-2xl" 
                            spacing="mr-3 md:mr-13 shrink-0" 
                            isDark={isDark} 
                          />
                          
                          <div className="flex flex-col justify-center min-w-0 mr-2 md:mr-4">
                            <p className={`font-bold text-sm md:text-base truncate ${textTitle}`}>{leader.username}</p>
                            
                            <div className="flex items-center gap-1 md:gap-2 mt-1">
                              <span className={`text-[9px] md:text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
                                Lvl {leader.level}
                              </span>
                              <span className={`text-[10px] md:text-xs font-bold ${textMuted} whitespace-nowrap`}>
                                {leader.current_xp} XP
                              </span>
                            </div>
                          </div>
                          
                        </div>

                        <div className="flex flex-col items-end justify-center z-10 shrink-0">
                          <span className="text-xs md:text-base font-black bg-orange-500/10 text-orange-500 px-2 py-1 md:px-3 md:py-1.5 rounded-lg border border-orange-500/20 whitespace-nowrap shadow-sm">
                            {leader.streak_count} 🔥
                          </span>
                        </div>

                      </div>
                    );
                  })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
              </div>
              

            </motion.div>
          )}

          {activeTab === 'profile' && (
            <div className="flex flex-col justify-start pt-6 md:pt-12 min-h-[85vh] w-full pb-12">
              
              <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row items-stretch gap-6 md:gap-8 w-full">
                
                <div className={`pointer-events-auto border p-6 md:p-10 rounded-3xl flex flex-col items-center shrink-0 w-full lg:w-[480px] min-h-[500px] md:min-h-[750px] shadow-lg transition-colors duration-500 ${cardBg}`}>
                  
                  <h3 className={`w-full text-left text-sm md:text-l font-bold uppercase tracking-widest mb-10 md:mb-16 ${textMuted}`}>
                    Current Profile
                  </h3>

                  <div className="mb-12 md:mb-20 mt-4 md:mt-8 scale-75 md:scale-100">
                    <UserAvatar user={profile} size="w-40 h-40" text="text-7xl" isDark={isDark} />
                  </div>
                  
                  <h2 className={`text-2xl md:text-3xl font-black truncate w-full text-center mt-2 ${textTitle}`}>
                    {profile.username}
                  </h2>
                  <p className={`text-sm md:text-base font-bold mb-8 md:mb-10 uppercase tracking-wide mt-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    Level {profile.level} Hero
                  </p>

                  <div className="w-full flex flex-col gap-3 md:gap-4 mt-auto">
                      <div className={`flex justify-between items-center px-4 md:px-5 py-3 md:py-4 rounded-xl border ${isDark ? `${darkInner} border-white/10` : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`font-bold text-xs md:text-sm ${textMuted}`}>Total XP</span>
                      <span className={`font-black text-base md:text-lg ${textTitle}`}>{profile.current_xp}</span>
                    </div>
                      <div className={`flex justify-between items-center px-4 md:px-5 py-3 md:py-4 rounded-xl border ${isDark ? `${darkInner} border-white/10` : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`font-bold text-xs md:text-sm ${textMuted}`}>Gold Balance</span>
                      <span className="font-black text-base md:text-lg text-yellow-500">{profile.gold} 🪙</span>
                   </div>
                      <div className={`flex justify-between items-center px-4 md:px-5 py-3 md:py-4 rounded-xl border ${isDark ? `${darkInner} border-white/10` : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`font-bold text-xs md:text-sm ${textMuted}`}>Active Streak</span>
                      <span className="font-black text-base md:text-lg text-orange-500">{profile.streak_count} 🔥</span>
                    </div>
                  </div>

                </div>

                <div className={`pointer-events-auto border p-6 md:p-10 rounded-3xl flex flex-col flex-grow shadow-lg w-full min-h-[500px] md:min-h-[750px] transition-colors duration-500 ${cardBg}`}>
                  
                  <h3 className={`w-full text-left text-sm md:text-l font-bold uppercase tracking-widest mb-10 md:mb-16 ${textMuted}`}>
                    Account Settings
                  </h3>

                  <form onSubmit={handleUpdateUsername} className="mb-8 md:mb-10">
                    <label className={`block text-sm md:text-m font-bold mb-2 md:mb-3 ${textTitle}`}>Change Username</label>
                    <div className="flex flex-col xl:flex-row gap-3 md:gap-4">
                      <input 
                        type="text" 
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Enter new username"
                        className={`flex-grow px-4 py-3 md:px-5 md:py-4 rounded-xl border font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm md:text-base ${isDark ? `${darkInput} border-white/20 text-white placeholder-slate-500` : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`}
                      />
                      <button type="submit" className="px-8 py-3 md:py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-sm whitespace-nowrap text-sm md:text-base">
                        Update
                      </button>
                    </div>
                  </form>

                  <form onSubmit={handleUpdatePassword} className="mb-8 md:mb-10">
                    <label className={`block text-sm md:text-m font-bold mb-2 md:mb-3 ${textTitle}`}>Change Password</label>
                    <div className="flex flex-col xl:flex-row gap-3 md:gap-4">
                      <div className="relative flex-grow">
                        <input 
                          type={showUpdatePassword ? "text" : "password"} 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className={`w-full px-4 py-3 md:px-5 md:py-4 pr-12 rounded-xl border font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm md:text-base ${isDark ? `${darkInput} border-white/20 text-white placeholder-slate-500` : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowUpdatePassword(!showUpdatePassword)}
                          className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-md transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                          {showUpdatePassword ? (
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <button type="submit" className="px-8 py-3 md:py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-sm whitespace-nowrap text-sm md:text-base">
                        Update
                      </button>
                    </div>
                  </form>

                  <form onSubmit={handleUpdateEmail} className="mb-10">
                    <label className={`block text-sm md:text-m font-bold mb-2 md:mb-3 ${textTitle}`}>Change Email</label>
                    <div className="flex flex-col xl:flex-row gap-3 md:gap-4">
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter new email address"
                        className={`flex-grow px-4 py-3 md:px-5 md:py-4 rounded-xl border font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm md:text-base ${isDark ? `${darkInput} border-white/20 text-white placeholder-slate-500` : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`}
                      />
                      <button type="submit" className="px-8 py-3 md:py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-sm whitespace-nowrap text-sm md:text-base">
                        Update
                      </button>
                    </div>
                    <p className={`text-xs md:text-sm font-bold mt-3 ${textMuted}`}>
                      * A verification link will be sent to your new email address to confirm the change.
                    </p>
                  </form>
                  
                  <div className="mt-auto pt-8 border-t border-slate-200 dark:border-slate-700">
                     <label className="block text-sm md:text-base font-bold mb-3 md:mb-4 uppercase tracking-widest text-red-500">
                       Danger Zone
                     </label>
                     <button 
                       onClick={() => setShowDeleteModal(true)} 
                       className="px-6 py-3 md:py-4 w-full xl:w-auto bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-3 text-sm md:text-base"
                     >
                        <span className="text-xl"></span>Delete Character Forever
                     </button>
                  </div>
                  
                </div>

              </div>
            </div>
          )}

          {activeTab === 'market' && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-10">
              <div className={`pointer-events-auto max-w-7xl mx-auto flex justify-between items-end border p-6 rounded-2xl shadow-xl ${isDark ? 'bg-slate-900 border-yellow-500' : 'bg-yellow-50 border-yellow-500'}`}>
                <div><h2 className="text-3xl font-black text-yellow-500 ">Upgrade your Character</h2><p className="text-yellow-600 font-bold">Use your hard earned gold to customize your legend.</p></div>
                <div className="text-right"><p className="text-slate-500 text-sm font-bold uppercase mb-1">Your Stash</p><p className="text-4xl font-black text-yellow-500">{profile.gold} 🪙</p></div>
              </div>

              <div className="pointer-events-auto">
                <div className="w-full flex justify-center md:justify-start mb-6">
                  <div className={`px-8 py-3 rounded-xl border shadow-sm flex items-center justify-center backdrop-blur-sm ${isDark ? 'bg-indigo-500/45 border-indigo-500/40' : 'bg-indigo-200 border-indigo-400'}`}>
                    <h3 className={`text-xl md:text-2xl font-black uppercase tracking-widest ${isDark ? 'text-indigo-300' : 'text-indigo-900'}`}>
                      Avatars
                    </h3>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {MARKET_AVATARS.map((av) => {
                    const isUnlocked = profile.unlocked_avatars?.includes(av.id);
                    const isEquipped = profile.avatar === av.id;
                    return (
                      <div key={av.name} className={`border ${isEquipped ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : (isDark ? 'border-slate-700' : 'border-slate-300')} p-4 rounded-xl flex flex-col items-center text-center transition-all hover:-translate-y-1 ${innerCardBg}`}>
                        <div className="text-6xl mb-4 mt-2">{av.id}</div>
                        <h4 className={`mb-3 ${textTitle}`}>{av.name}</h4>
                        <button 
                          onClick={() => buyAvatar(av)} 
                          disabled={isEquipped} 
                          className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${isEquipped ? 'bg-indigo-600 text-white cursor-default' : isUnlocked ? 'bg-slate-600 text-white hover:bg-slate-500' : profile.gold >= av.cost ? 'bg-yellow-500 text-white hover:bg-yellow-400 shadow-md' : 'bg-slate-200 dark:bg-slate-950 text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-inner'}`}
                        >
                          {isEquipped ? 'Equipped' : isUnlocked ? 'Equip' : `${av.cost} 🪙`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pointer-events-auto">
                <div className="w-full flex justify-center md:justify-start mt-12 mb-6">
                  <div className={`px-8 py-3 rounded-xl border shadow-sm flex items-center justify-center backdrop-blur-sm ${isDark ? 'bg-indigo-500/45 border-indigo-500/40' : 'bg-indigo-200 border-indigo-400'}`}>
                    <h3 className={`text-xl md:text-2xl font-black uppercase tracking-widest ${isDark ? 'text-indigo-300' : 'text-indigo-900'}`}>
                      Borders
                    </h3>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {MARKET_BORDERS.map((border) => {
                    const isUnlocked = profile.unlocked_borders?.includes(border.id);
                    const isEquipped = profile.border?.startsWith(border.id);
                    return (
                      <div key={border.name} className={`border ${isEquipped ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : (isDark ? 'border-slate-700' : 'border-slate-300')} p-6 rounded-xl flex flex-col items-center text-center transition-all ${innerCardBg}`}>
                        <div className="mb-6 mt-2">
                           <UserAvatar user={{ border: `${border.id}_${marketColors[border.id] || '#facc15'}`, avatar: profile.avatar }} size="w-20 h-20" spacing="my-8" text="text-4xl" isDark={isDark} />
                        </div>
                        <h4 className={`mb-2 ${textTitle}`}>{border.name}</h4>
                        {border.customColor && (
                          <div className="flex gap-2 mb-4">
                            {['#ef4444', '#3b82f6', '#10b981', '#a855f7', '#facc15'].map(hex => (
                              <button key={hex} onClick={() => { setMarketColors({...marketColors, [border.id]: hex}); if (profile.unlocked_borders?.includes(border.id)) { buyBorder(border, hex); } }} className={`w-5 h-5 rounded-full border-2 transition-all ${marketColors[border.id] === hex || (!marketColors[border.id] && hex === '#facc15') ? `scale-125 ${isDark ? 'border-white' : 'border-slate-900'}` : 'border-transparent hover:scale-110'}`} style={{ backgroundColor: hex }} />
                            ))}
                          </div>
                        )}
                        <button 
                          onClick={() => buyBorder(border)} 
                          disabled={isEquipped} 
                          className={`w-full py-2 rounded-lg font-bold text-sm mt-auto transition-all ${isEquipped ? 'bg-indigo-600 text-white cursor-default' : isUnlocked ? 'bg-slate-600 text-white hover:bg-slate-500' : profile.gold >= border.cost ? 'bg-yellow-500 text-white hover:bg-yellow-400 shadow-md' : 'bg-slate-200 dark:bg-slate-950 text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-inner'}`}
                        >
                          {isEquipped ? 'Equipped' : isUnlocked ? 'Equip' : `${border.cost} 🪙`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {showDeletedConfirmation && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md pointer-events-auto">
          <div className={`w-full max-w-md p-6 md:p-8 rounded-3xl shadow-2xl border flex flex-col items-center text-center ${isDark ? 'bg-slate-900 border-red-900/50' : 'bg-white border-red-200'}`}>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <span className="text-3xl">☠️</span>
            </div>
            <h2 className={`text-2xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Legend Deleted
            </h2>
            <p className={`text-sm font-bold mb-8 ${textMuted}`}>
              Your character, XP, Gold, and all history have been permanently wiped from the realm.
            </p>
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                router.replace('/');
              }}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-sm"
            >
              Return to Login
            </button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm pointer-events-auto">
          
          <div className={`w-full max-w-md p-6 md:p-8 rounded-3xl shadow-2xl border flex flex-col ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Delete Character Forever?
              </h2>
            </div>
            
            <p className={`text-sm font-bold mb-6 ${textMuted}`}>
              Are you absolutely sure you want to do this? This action <span className="text-red-500">cannot be undone</span>. All of your profile data will be permanently wiped from the database.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold text-center">
                {deleteError}
              </div>
            )}

            <label className={`block text-sm font-bold mb-2 ${textTitle}`}>
              Type your password to confirm:
            </label>
            
            <div className="relative mb-8 w-full">
              <input 
                type={showDeletePassword ? "text" : "password"} 
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
                className={`w-full px-4 py-3 rounded-xl border font-bold focus:outline-none focus:ring-2 focus:ring-red-500 transition-all pr-12 ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'}`}
              />
              <button
                type="button"
                onClick={() => setShowDeletePassword(!showDeletePassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-md transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {showDeletePassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 w-full">
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                  setShowDeletePassword(false);
                }}
                className={`w-full px-6 py-3 font-bold rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                Cancel
              </button>
              
              <button 
                onClick={handleDeleteAccount}
                disabled={deletePassword.length === 0}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-sm"
              >
                Delete Forever
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 📧 EMAIL SENT MODAL */}
      {showEmailSentModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm pointer-events-auto">
          <div className={`w-full max-w-md p-6 md:p-8 rounded-3xl shadow-2xl border flex flex-col items-center text-center ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4">
              <span className="text-3xl">✉️</span>
            </div>
            <h2 className={`text-2xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Check Your Inboxes
            </h2>
            <p className={`text-sm font-bold mb-8 ${textMuted}`}>
              Please click on <span className="text-indigo-500">BOTH</span> the verification links sent to your old and new emails to ensure the email update.
            </p>
            <button 
              onClick={() => setShowEmailSentModal(false)}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-sm"
            >
              Understood
            </button>
          </div>
        </div>
      )}

    </div>
  );
}