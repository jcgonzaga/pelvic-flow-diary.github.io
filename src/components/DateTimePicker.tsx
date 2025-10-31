import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  value: { date: Date; time: string };
  onChange: (value: { date: Date; time: string }) => void;
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base font-medium mb-2 block">📅 Fecha</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-12 justify-start text-left font-normal",
                !value.date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value.date ? format(value.date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value.date}
              onSelect={(date) => date && onChange({ ...value, date })}
              initialFocus
              className="pointer-events-auto"
              disabled={(date) => date > new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label className="text-base font-medium mb-2 block">🕐 Hora</Label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="time"
            value={value.time}
            onChange={(e) => onChange({ ...value, time: e.target.value })}
            className="h-12 pl-10 text-base"
          />
        </div>
      </div>
    </div>
  );
}
