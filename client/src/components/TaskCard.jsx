import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, Calendar, CheckCircle, Tag, Trash2, Edit } from 'lucide-react';

export function TaskCard({ task, onDelete, onEdit, compact = false }) {
  if (!task) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedType, setEditedType] = useState(task.type);
  const [editedUrgency, setEditedUrgency] = useState(task.urgency);
  const [editedImportance, setEditedImportance] = useState(task.importance);
  const [editedEstimatedTime, setEditedEstimatedTime] = useState(task.estimatedTime || 0);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Action': return <CheckCircle className="w-5 h-5 text-accent" />;
      case 'Event': return <Calendar className="w-5 h-5 text-accent" />;
      case 'Note': return <Tag className="w-5 h-5 text-accent" />;
      default: return <CheckCircle className="w-5 h-5 text-accent" />;
    }
  };

  const getStressBadge = (stress) => {
    if (stress === undefined || stress === null) return null;
    if (stress >= 1 && stress <= 3) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
          🟢 Calm
        </span>
      );
    }
    if (stress >= 4 && stress <= 6) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
          🟡 Moderate
        </span>
      );
    }
    if (stress >= 7 && stress <= 10) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
          🔴 High Stress
        </span>
      );
    }
    return null;
  };

  const handleStartEdit = () => {
    setEditedTitle(task.title);
    setEditedType(task.type);
    setEditedUrgency(task.urgency);
    setEditedImportance(task.importance);
    setEditedEstimatedTime(task.estimatedTime || 0);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onEdit) {
      onEdit(task._id, {
        title: editedTitle,
        type: editedType,
        urgency: editedUrgency,
        importance: editedImportance,
        estimatedTime: Number(editedEstimatedTime)
      });
    }
    setIsEditing(false);
  };

  if (compact) {
    return (
      <div className="glass rounded-xl p-3 border border-white/5 bg-surface/30 flex flex-col gap-2 relative text-left">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2">
            {task.title}
          </h4>
          <div className="bg-surface px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/5 shrink-0">
            {getTypeIcon(task.type)}
            <span className="text-[10px] font-medium text-primary">{task.type}</span>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="glass rounded-2xl p-6 w-full max-w-md mx-auto relative overflow-hidden text-left border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4">Edit Task</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-secondary block mb-1">Title</label>
            <input 
              type="text" 
              value={editedTitle} 
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full bg-surface/50 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-accent"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-secondary block mb-1">Type</label>
              <select 
                value={editedType} 
                onChange={(e) => setEditedType(e.target.value)}
                className="w-full bg-surface/50 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-accent"
              >
                <option value="Action">Action</option>
                <option value="Event">Event</option>
                <option value="Note">Note</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-secondary block mb-1">Duration (min)</label>
              <input 
                type="number" 
                value={editedEstimatedTime} 
                onChange={(e) => setEditedEstimatedTime(e.target.value)}
                className="w-full bg-surface/50 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-secondary block mb-1">Urgency</label>
              <select 
                value={editedUrgency} 
                onChange={(e) => setEditedUrgency(e.target.value)}
                className="w-full bg-surface/50 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-accent"
              >
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-secondary block mb-1">Importance</label>
              <select 
                value={editedImportance} 
                onChange={(e) => setEditedImportance(e.target.value)}
                className="w-full bg-surface/50 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-accent"
              >
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-4 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-sm text-secondary transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-accent text-background font-semibold hover:opacity-90 text-sm transition-opacity"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isHighUrgency = task.urgency === 'high';
  const isHighImportance = task.importance === 'high';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glass rounded-2xl p-6 w-full max-w-md mx-auto relative overflow-hidden text-left"
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
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isHighUrgency ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-surface text-secondary border border-white/5'}`}>
              {isHighUrgency ? 'High Urgency' : 'Low Urgency'}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isHighImportance ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-surface text-secondary border border-white/5'}`}>
              {isHighImportance ? 'High Importance' : 'Low Importance'}
            </span>
            {getStressBadge(task.stressLevel)}
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

          {/* Edit/Delete Buttons */}
          {(onDelete || onEdit) && (
            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              {onEdit && (
                <button 
                  onClick={handleStartEdit}
                  className="p-1.5 rounded-lg border border-white/10 text-secondary hover:text-white hover:bg-white/5 transition-colors"
                  title="Edit Task"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={() => onDelete(task._id)}
                  className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
