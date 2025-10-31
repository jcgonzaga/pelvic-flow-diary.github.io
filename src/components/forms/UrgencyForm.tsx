import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { UrgencyRecord } from '@/types/record';
import { DateTimePicker } from '@/components/DateTimePicker';

const REACHED_OPTIONS = [
  { value: 'yes', label: '✅ Sí, a tiempo' },
  { value: 'no', label: '❌ No llegué' },
  { value: 'leakage', label: '💦 Hubo pérdida' },
];

const WARNING_TIME_OPTIONS = [
  { value: '<10', label: '⚡ Menos de 10 seg' },
  { value: '10-30', label: '⏱️ 10-30 seg' },
  { value: '30-60', label: '⏰ 30-60 seg' },
  { value: '>60', label: '🕐 Más de 60 seg' },
];

interface UrgencyFormProps {
  onSave: (data: Omit<UrgencyRecord, 'id' | 'timestamp' | 'date' | 'time'>, customDateTime?: { date: Date; time: string }) => void;
  onCancel: () => void;
}

export function UrgencyForm({ onSave, onCancel }: UrgencyFormProps) {
  const [intensity, setIntensity] = useState([5]);
  const [reachedBathroom, setReachedBathroom] = useState<UrgencyRecord['reachedBathroom']>('yes');
  const [warningTime, setWarningTime] = useState<UrgencyRecord['warningTime']>('30-60');
  const [manualDateTime, setManualDateTime] = useState(false);
  const [dateTime, setDateTime] = useState({
    date: new Date(),
    time: new Date().toTimeString().slice(0, 5),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        type: 'urgency',
        intensity: intensity[0],
        reachedBathroom,
        warningTime,
      },
      manualDateTime ? dateTime : undefined
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <Label htmlFor="manual-datetime-urgency" className="text-base font-medium cursor-pointer">
          🕐 Registrar con fecha/hora manual
        </Label>
        <Switch
          id="manual-datetime-urgency"
          checked={manualDateTime}
          onCheckedChange={setManualDateTime}
        />
      </div>

      {manualDateTime && (
        <DateTimePicker value={dateTime} onChange={setDateTime} />
      )}

      <div>
        <Label className="text-lg font-semibold mb-3 block">
          Intensidad de la urgencia: {intensity[0]} / 10
        </Label>
        <Slider
          value={intensity}
          onValueChange={setIntensity}
          min={1}
          max={10}
          step={1}
          className="py-4"
        />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>😌 Leve</span>
          <span>😰 Moderada</span>
          <span>😱 Muy fuerte</span>
        </div>
      </div>

      <div>
        <Label className="text-lg font-semibold mb-3 block">¿Conseguiste llegar al baño?</Label>
        <RadioGroup value={reachedBathroom} onValueChange={(v) => setReachedBathroom(v as any)}>
          <div className="grid gap-3">
            {REACHED_OPTIONS.map(option => (
              <div key={option.value} className="flex items-center space-x-3 border-2 rounded-lg p-4 hover:bg-muted/50">
                <RadioGroupItem value={option.value} id={`reached-${option.value}`} />
                <Label htmlFor={`reached-${option.value}`} className="cursor-pointer text-lg flex-1">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-lg font-semibold mb-3 block">Tiempo de aviso</Label>
        <RadioGroup value={warningTime} onValueChange={(v) => setWarningTime(v as any)}>
          <div className="grid grid-cols-2 gap-3">
            {WARNING_TIME_OPTIONS.map(option => (
              <div key={option.value} className="flex items-center space-x-2 border-2 rounded-lg p-3 hover:bg-muted/50">
                <RadioGroupItem value={option.value} id={`time-${option.value}`} />
                <Label htmlFor={`time-${option.value}`} className="cursor-pointer text-base flex-1">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-14 text-lg">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1 h-14 text-lg bg-urgency hover:bg-urgency/90 text-urgency-foreground">
          💾 Guardar
        </Button>
      </div>
    </form>
  );
}
