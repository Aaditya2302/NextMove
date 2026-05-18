import { motion } from 'framer-motion';
import { Clock, AlertCircle, Calendar, CheckCircle, Tag } from 'lucide-react';

export function TaskCard({ task }) {
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
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glass rounded-2xl p-6 w-full max-w-md mx-auto relative overflow-hidden"
    >
      {/* Decorative gradient blob behind card content */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-white leading-tight pr-4">
            {task.title}
          </h2>
          <div className="bg-surface px-3 py-1 rounded-full flex items-center gap-2 border border-white/5">
            {getTypeIcon(task.type)}
            <span className="text-sm font-medium text-primary">{task.type}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isHighUrgency ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-surface text-secondary border border-white/5'}`}>
              {isHighUrgency ? 'High Urgency' : 'Low Urgency'}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isHighImportance ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-surface text-secondary border border-white/5'}`}>
              {isHighImportance ? 'High Importance' : 'Low Importance'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-secondary pt-2 border-t border-white/10">
            {task.estimatedTime > 0 && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{task.estimatedTime} min</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>{(task.confidence * 100).toFixed(0)}% Match</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
