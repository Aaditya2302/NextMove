import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2, Grid, Layers, ChevronDown } from 'lucide-react';

import { useAudioRecorder } from './hooks/useAudioRecorder';
import { BackgroundScene } from './components/BackgroundScene';
import { VoiceSphere } from './components/VoiceSphere';
import { TaskCard } from './components/TaskCard';
import { EisenhowerMatrix } from './components/EisenhowerMatrix';
import { NextMoveHero } from './components/NextMoveHero';

function App() {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'matrix'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'urgency', 'importance'

  const { 
    isRecording, 
    isProcessing, 
    taskResult, 
    error, 
    analyser, 
    allTasks,
    transcript,
    noTaskDetected,
    isLoadingTasks,
    startRecording, 
    stopRecording,
    deleteTask,
    updateTask
  } = useAudioRecorder();

  const handleSphereClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Determine the single most critical task for the hero banner based on priority rules
  const getHeroTask = () => {
    if (!allTasks || allTasks.length === 0) return null;
    
    // 1. Priority: Urgency High + Importance High
    const highHigh = allTasks.find(t => t.urgency === 'high' && t.importance === 'high');
    if (highHigh) return highHigh;

    // 2. Priority: Urgency Low + Importance High
    const lowHigh = allTasks.find(t => t.urgency === 'low' && t.importance === 'high');
    if (lowHigh) return lowHigh;

    // 3. Priority: Most recently added task
    return allTasks[0];
  };

  const heroTask = getHeroTask();

  // Perform frontend sorting of tasks
  const getSortedTasks = () => {
    const tasksCopy = [...allTasks];
    if (sortBy === 'newest') {
      return tasksCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    if (sortBy === 'oldest') {
      return tasksCopy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    if (sortBy === 'urgency') {
      return tasksCopy.sort((a, b) => {
        if (a.urgency === b.urgency) return 0;
        return a.urgency === 'high' ? -1 : 1;
      });
    }
    if (sortBy === 'importance') {
      return tasksCopy.sort((a, b) => {
        if (a.importance === b.importance) return 0;
        return a.importance === 'high' ? -1 : 1;
      });
    }
    return tasksCopy;
  };

  const sortedTasks = getSortedTasks();

  const handleScrollToBottom = () => {
    const bottomSection = document.getElementById('tasks-section');
    if (bottomSection) {
      bottomSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const SkeletonCard = () => (
    <div className="glass rounded-2xl p-6 w-full max-w-md mx-auto relative overflow-hidden animate-pulse border border-white/5 bg-surface/30">
      <div className="h-6 bg-white/10 rounded w-3/4 mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-5 bg-white/10 rounded-full w-20" />
        <div className="h-5 bg-white/10 rounded-full w-24" />
      </div>
      <div className="h-12 bg-white/10 rounded w-full mb-4" />
      <div className="h-4 bg-white/10 rounded w-1/2" />
    </div>
  );

  return (
    <div className="relative w-full min-h-screen bg-background overflow-x-hidden overflow-y-auto font-sans text-primary scroll-smooth">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <BackgroundScene />
        </Canvas>
      </div>

      {/* TOP HALF: Recorder & Hero Overview */}
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-between p-6 py-12">
        {/* Header Title */}
        <div className="text-center mt-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-3"
          >
            NextMove
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-secondary text-base max-w-md mx-auto"
          >
            Speak your mind. We'll tell you what to do next.
          </motion.p>
        </div>

        {/* 3D Interactive Sphere & Visualizer */}
        <div className="flex flex-col items-center justify-center my-auto py-8">
          <div className="relative w-56 h-56 md:w-72 md:h-72 mb-6 flex items-center justify-center">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }} className="w-full h-full cursor-pointer">
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 10]} intensity={1.5} />
              <VoiceSphere 
                analyser={analyser} 
                isRecording={isRecording} 
                onClick={handleSphereClick}
              />
            </Canvas>
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               {isRecording ? (
                  <Square className="w-8 h-8 text-white/50 animate-pulse" />
               ) : (
                  <Mic className="w-8 h-8 text-white/50" />
               )}
            </div>
          </div>

          {/* Status & Instructions */}
          <div className="h-10 mb-4 flex items-center justify-center text-center">
            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div 
                  key="processing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-accent"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing your voice...</span>
                </motion.div>
              ) : error ? (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-400 font-medium"
                >
                  {error}
                </motion.div>
              ) : isRecording ? (
                <motion.div 
                  key="recording"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-accent font-medium animate-pulse"
                >
                  Listening... Click sphere to stop.
                </motion.div>
              ) : (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-secondary"
                >
                  Click the sphere to start recording
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Transcript Display & Filter Warning (Feature 2) */}
          <div className="w-full max-w-md flex flex-col items-center gap-2">
            <AnimatePresence>
              {transcript && !isRecording && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full glass rounded-xl p-4 border border-white/5 bg-surface/50 text-left"
                >
                  <div className="flex items-center gap-2 text-secondary mb-1.5 text-xs font-medium uppercase tracking-wider">
                    <span>🎙️ You said:</span>
                  </div>
                  <p className="text-white/90 italic text-sm leading-relaxed">
                    "{transcript}"
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {noTaskDetected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass border border-white/5 bg-yellow-500/5 text-secondary text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 max-w-sm text-center"
              >
                <span>🤔 Couldn't find a clear task. Try being more specific!</span>
              </motion.div>
            )}
          </div>

          {/* Newly Generated Task Card */}
          <div className="w-full max-w-md mt-6 min-h-[80px]">
             <AnimatePresence>
               {taskResult && !isRecording && !isProcessing && (
                 <motion.div
                   initial={{ opacity: 0, y: 15 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -15 }}
                   className="w-full"
                 >
                   <TaskCard task={taskResult} onDelete={deleteTask} onEdit={updateTask} />
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>

        {/* Smooth Scroll Arrow Indicator */}
        <motion.button
          onClick={handleScrollToBottom}
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-secondary hover:text-white cursor-pointer"
        >
          <span className="text-xs uppercase tracking-widest font-semibold opacity-70">Scroll Down</span>
          <ChevronDown className="w-5 h-5 text-accent" />
        </motion.button>
      </div>

      {/* BOTTOM HALF: Hero Priority & Complete Tasklist Dashboard */}
      <div 
        id="tasks-section" 
        className="relative min-h-screen w-full flex flex-col items-center pt-24 pb-20 px-6 z-10 bg-background/50 backdrop-blur-sm border-t border-white/10"
      >
        {/* NextMove Hero Display */}
        {heroTask && (
          <div className="w-full mb-12">
            <NextMoveHero task={heroTask} />
          </div>
        )}

        <div className="w-full max-w-6xl flex flex-col items-center">
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 mb-8 px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Your Tasks ({allTasks.length})
            </h2>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface/80 border border-white/10 rounded-xl px-3 py-2 text-sm text-secondary hover:text-white focus:outline-none focus:border-accent cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="urgency">High Urgency First</option>
                <option value="importance">High Importance First</option>
              </select>

              {/* View Mode Toggle Switch */}
              <div className="bg-surface/80 border border-white/10 rounded-xl p-1 flex gap-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    viewMode === 'list' 
                      ? 'bg-accent text-background shadow-md' 
                      : 'text-secondary hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  List View
                </button>
                <button
                  onClick={() => setViewMode('matrix')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    viewMode === 'matrix' 
                      ? 'bg-accent text-background shadow-md' 
                      : 'text-secondary hover:text-white'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Matrix View
                </button>
              </div>
            </div>
          </div>

          {/* Main Taskboard Content */}
          {isLoadingTasks ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : allTasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-16 px-6 glass rounded-2xl border border-white/5 bg-surface/30 w-full max-w-lg text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="w-16 h-16 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center mb-4 text-accent"
              >
                <Mic className="w-8 h-8" />
              </motion.div>
              <h3 className="text-lg font-bold text-white mb-2">Your Taskboard is Empty</h3>
              <p className="text-secondary text-sm max-w-sm">No tasks yet. Speak your first goal using the mic sphere above!</p>
            </motion.div>
          ) : (
            <div className="w-full">
              {viewMode === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4">
                  <AnimatePresence>
                    {sortedTasks.map(task => (
                      <motion.div 
                        key={task._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        layout
                      >
                        <TaskCard 
                          task={task} 
                          onDelete={deleteTask} 
                          onEdit={updateTask} 
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <EisenhowerMatrix 
                  tasks={sortedTasks} 
                  onDelete={deleteTask} 
                  onEdit={updateTask} 
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
