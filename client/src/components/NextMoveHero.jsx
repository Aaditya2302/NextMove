import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, Calendar, CheckCircle, Tag } from 'lucide-react';

export function NextMoveHero({ task }) {
  if (!task) return null;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Action': return <CheckCircle className="w-5 h-5 text-accent" />;
      case 'Event': return <Calendar className="w-5 h-5 text-accent" />;
      case 'Note': return <Tag className="w-5 h-5 text-accent" />;
      default: return <CheckCircle className="w-5 h-5 text-accent" />;
    }
  };

  const isHighUrgency = task.urgency === 'high';
  const isHighImportance = task.importance === 'high';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full max-w-2xl mx-auto glass rounded-3xl p-8 border border-accent/40 bg-surface/40 shadow-[0_0_25px_rgba(45,212,191,0.15)] overflow-hidden text-left"
    >
      {/* Dynamic ambient background glow */}
      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute -left-20 -top-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-accent text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
            ⚡ Your Next Move
          </span>
          <div className="bg-surface/80 px-3 py-1 rounded-full flex items-center gap-2 border border-white/5">
            {getTypeIcon(task.type)}
            <span className="text-sm font-medium text-primary">{task.type}</span>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
          {task.title}
        </h2>

        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isHighUrgency ? 'bg-red-500/15 text-red-400 border border-red-500/25' : 'bg-surface text-secondary border border-white/5'}`}>
            {isHighUrgency ? 'High Urgency' : 'Low Urgency'}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isHighImportance ? 'bg-orange-500/15 text-orange-400 border border-orange-500/25' : 'bg-surface text-secondary border border-white/5'}`}>
            {isHighImportance ? 'High Importance' : 'Low Importance'}
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm text-secondary pt-4 border-t border-white/5">
          {task.estimatedTime > 0 && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4.5 h-4.5 text-accent" />
              <span>{task.estimatedTime} min estimation</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4.5 h-4.5" />
            <span>{(task.confidence * 100).toFixed(0)}% AI confidence</span>
          </div>
        </div>

        <div className="pt-2 border-t border-white/5">
          <div className="text-accent font-bold text-lg tracking-wide uppercase">
            Start this now.
          </div>
          {task.encouragement && (
            <p className="text-secondary/70 italic text-sm mt-1.5 leading-relaxed">
              "{task.encouragement}"
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
