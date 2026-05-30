import React from 'react';
import { TaskCard } from './TaskCard';

export function EisenhowerMatrix({ tasks = [], onDelete, onEdit }) {
  // Filter tasks into quadrants based on urgency and importance
  const q1 = tasks.filter(t => t.urgency === 'high' && t.importance === 'high');
  const q2 = tasks.filter(t => t.urgency === 'low' && t.importance === 'high');
  const q3 = tasks.filter(t => t.urgency === 'high' && t.importance === 'low');
  const q4 = tasks.filter(t => t.urgency === 'low' && t.importance === 'low');

  const quadrants = [
    {
      id: 'q1',
      title: 'Do First',
      subtitle: 'Urgent & Important',
      tasks: q1,
      borderColor: 'border-red-500/30',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
    },
    {
      id: 'q2',
      title: 'Schedule',
      subtitle: 'Important, Not Urgent',
      tasks: q2,
      borderColor: 'border-blue-500/30',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      id: 'q3',
      title: 'Delegate',
      subtitle: 'Urgent, Not Important',
      tasks: q3,
      borderColor: 'border-yellow-500/30',
      badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    },
    {
      id: 'q4',
      title: 'Eliminate',
      subtitle: 'Not Urgent & Not Important',
      tasks: q4,
      borderColor: 'border-neutral-500/30',
      badgeColor: 'bg-neutral-500/20 text-neutral-300 border-neutral-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mx-auto p-4">
      {quadrants.map((q) => (
        <div 
          key={q.id}
          className={`glass rounded-2xl p-5 border ${q.borderColor} bg-surface/20 flex flex-col min-h-[250px] transition-all duration-300 hover:bg-surface/30`}
        >
          {/* Quadrant Header */}
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">{q.title}</h3>
              <p className="text-xs text-secondary">{q.subtitle}</p>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${q.badgeColor}`}>
              {q.tasks.length} {q.tasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          {/* Quadrant Tasks */}
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-1 scrollbar-thin">
            {q.tasks.length > 0 ? (
              q.tasks.map((task) => (
                <TaskCard 
                  key={task._id} 
                  task={task} 
                  onDelete={onDelete} 
                  onEdit={onEdit} 
                  compact={true} 
                />
              ))
            ) : (
              <div className="flex items-center justify-center flex-grow py-8">
                <span className="text-sm text-secondary italic">No tasks here</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
