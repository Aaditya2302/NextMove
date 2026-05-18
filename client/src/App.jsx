import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2 } from 'lucide-react';

import { useAudioRecorder } from './hooks/useAudioRecorder';
import { BackgroundScene } from './components/BackgroundScene';
import { VoiceSphere } from './components/VoiceSphere';
import { TaskCard } from './components/TaskCard';

function App() {
  const { 
    isRecording, 
    isProcessing, 
    taskResult, 
    error, 
    analyser, 
    startRecording, 
    stopRecording 
  } = useAudioRecorder();

  const handleSphereClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-background overflow-x-hidden overflow-y-auto font-sans text-primary">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <BackgroundScene />
        </Canvas>
      </div>

      {/* Main Content Overlay */}
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center p-6 py-12">
        
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4"
          >
            NextMove
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-secondary text-lg max-w-md mx-auto"
          >
            Speak your mind. We'll tell you what to do next.
          </motion.p>
        </div>

        {/* 3D Interactive Sphere Area */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8 flex items-center justify-center">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }} className="w-full h-full cursor-pointer">
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={1.5} />
            <VoiceSphere 
              analyser={analyser} 
              isRecording={isRecording} 
              onClick={handleSphereClick}
            />
          </Canvas>
          
          {/* Overlay Icon on Sphere (Optional, helps users know it's clickable) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             {isRecording ? (
               <Square className="w-8 h-8 text-white/50 animate-pulse" />
             ) : (
               <Mic className="w-8 h-8 text-white/50" />
             )}
          </div>
        </div>

        {/* Status / Instructions */}
        <div className="h-12 mb-8 flex items-center justify-center">
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

        {/* Task Result Area */}
        <div className="w-full max-w-md min-h-[300px]">
           <AnimatePresence>
             {taskResult && !isRecording && !isProcessing && (
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="flex flex-col gap-4 w-full"
               >
                 {/* Transcript Panel */}
                 <div className="glass rounded-xl p-4 border border-white/5 bg-surface/50">
                   <div className="flex items-center gap-2 text-secondary mb-2 text-sm font-medium">
                     <span className="text-xl">🎙️</span> You said:
                   </div>
                   <p className="text-white/90 italic text-sm leading-relaxed">
                     "{taskResult.originalTranscript}"
                   </p>
                 </div>
                 
                 {/* Extracted Task */}
                 <TaskCard task={taskResult} />
               </motion.div>
             )}
           </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

export default App;
