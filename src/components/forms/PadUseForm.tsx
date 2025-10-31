import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { PadUseRecord } from '@/types/record';
import { DateTimePicker } from '@/components/DateTimePicker';

const PAD_TYPE_OPTIONS = [
  { value: 'pantyliner', label: '🩱 Salvaslip' },
  { value: 'small', label: '🩹 Compresa pequeña' },
  { value: 'medium', label: '🩹 Compresa mediana' },
  { value: 'large', label: '🩹 Compresa grande' },
];

const CONDITION_OPTIONS = [
  { value: 'dry', label: '☀️ Seca' },
  { value: 'damp', label: '💧 Húmeda' },
  { value: 'wet', label: '💦 Mojada' },
  { value: 'very-wet', label: '🌊 Muy mojada' },
];

interface PadUseFormProps {
  onSave: (data: Omit<PadUseRecord, 'id' | 'timestamp' | 'date' | 'time'>, customDateTime?: { date: Date; time: string }) => void;
  onCancel: () => void;
}

export function PadUseForm({ onSave, onCancel }: PadUseFormProps) {
  const [padType, setPadType] = useState<PadUseRecord['padType']>('small');
  const [condition, setCondition] = useState<PadUseRecord['condition']>('dry');
  const [manualDateTime, setManualDateTime] = useState(false);
  const [dateTime, setDateTime] = useState({
    date: new Date(),
    time: new Date().toTimeString().slice(0, 5),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        type: 'pad-use',
        padType,
        condition,
      },
      manualDateTime ? dateTime : undefined
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <Label htmlFor="manual-datetime-pad" className="text-base font-medium cursor-pointer">
          🕐 Registrar con fecha/hora manual
        </Label>
        <Switch
          id="manual-datetime-pad"
          checked={manualDateTime}
          onCheckedChange={setManualDateTime}
        />
      </div>

      {manualDateTime && (
        <DateTimePicker value={dateTime} onChange={setDateTime} />
      )}

      <div>
        <Label className="text-lg font-semibold mb-3 block">Tipo de compresa</Label>
        <RadioGroup value={padType} onValueChange={(v) => setPadType(v as any)}>
          <div className="grid gap-3">
            {PAD_TYPE_OPTIONS.map(option => (
              <div key={option.value} className="flex items-center space-x-3 border-2 rounded-lg p-4 hover:bg-muted/50">
                <RadioGroupItem value={option.value} id={`pad-${option.value}`} />
                <Label htmlFor={`pad-${option.value}`} className="cursor-pointer text-lg flex-1">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-lg font-semibold mb-3 block">Estado al cambiar</Label>
        <RadioGroup value={condition} onValueChange={(v) => setCondition(v as any)}>
          <div className="grid grid-cols-2 gap-3">
            {CONDITION_OPTIONS.map(option => (
              <div key={option.value} className="flex items-center space-x-2 border-2 rounded-lg p-3 hover:bg-muted/50">
                <RadioGroupItem value={option.value} id={`cond-${option.value}`} />
                <Label htmlFor={`cond-${option.value}`} className="cursor-pointer text-base flex-1">
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
        <Button type="submit" className="flex-1 h-14 text-lg bg-pad-use hover:bg-pad-use/90 text-pad-use-foreground">
          💾 Guardar
        </Button>
      </div>
    </form>
  );
}
