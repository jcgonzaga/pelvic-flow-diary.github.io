import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface RecordTypeCardProps {
  icon: LucideIcon;
  emoji: string;
  title: string;
  description: string;
  colorClass: string;
  onClick: () => void;
}

export function RecordTypeCard({ 
  icon: Icon, 
  emoji, 
  title, 
  description, 
  colorClass,
  onClick 
}: RecordTypeCardProps) {
  return (
    <Card 
      className={cn(
        "p-6 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl border-2",
        "active:scale-95",
        colorClass
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="text-5xl">{emoji}</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {title}
          </h3>
          <p className="text-sm opacity-90">{description}</p>
        </div>
      </div>
    </Card>
  );
}
