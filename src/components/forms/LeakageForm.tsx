import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { LeakageRecord } from '@/types/record';
import { DateTimePicker } from '@/components/DateTimePicker';

const AMOUNT_OPTIONS = [
  { value: 'drops', label: '💧 Gotas' },
  { value: 'small', label: '💦 Pequeña' },
  { value: 'moderate', label: '🌊 Moderada' },
  { value: 'large', label: '🌀 Grande' },
];

const CIRCUMSTANCE_OPTIONS = [
  { value: 'cough', label: '🤧 Tos' },
  { value: 'sneeze', label: '🤧 Estornudo' },
  { value: 'laugh', label: '😂 Risa' },
  { value: 'exercise', label: '🏃 Ejercicio' },
  { value: 'urgency', label: '⚡ Urgencia' },
  { value: 'none', label: '❓ Sin motivo' },
];

interface LeakageFormProps {
  onSave: (data: Omit<LeakageRecord, 'id' | 'timestamp' | 'date' | 'time'>, customDateTime?: { date: Date; time: string }) => void;
  onCancel: () => void;
}

export function LeakageForm({ onSave, onCancel }: LeakageFormProps) {
  const [amount, setAmount] = useState<LeakageRecord['amount']>('small');
  const [circumstance, setCircumstance] = useState<LeakageRecord['circumstance']>('none');
  const [intensity, setIntensity] = useState([3]);
  const [manualDateTime, setManualDateTime] = useState(false);
  const [dateTime, setDateTime] = useState({
    date: new Date(),
    time: new Date().toTimeString().slice(0, 5),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        type: 'leakage',
        amount,
        circumstance,
        intensity: intensity[0],
      },
      manualDateTime ? dateTime : undefined
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <Label htmlFor="manual-datetime-leakage" className="text-base font-medium cursor-pointer">
          🕐 Registrar con fecha/hora manual
        </Label>
        <Switch
          id="manual-datetime-leakage"
          checked={manualDateTime}
          onCheckedChange={setManualDateTime}
        />
      </div>

      {manualDateTime && (
        <DateTimePicker value={dateTime} onChange={setDateTime} />
      )}

      <div>
        <Label className="text-lg font-semibold mb-3 block">Cantidad</Label>
        <RadioGroup value={amount} onValueChange={(v) => setAmount(v as any)}>
          <div className="grid grid-cols-2 gap-3">
            {AMOUNT_OPTIONS.map(option => (
              <div key={option.value} className="flex items-center space-x-2 border-2 rounded-lg p-3 hover:bg-muted/50">
                <RadioGroupItem value={option.value} id={`amount-${option.value}`} />
                <Label htmlFor={`amount-${option.value}`} className="cursor-pointer text-base flex-1">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-lg font-semibold mb-3 block">Circunstancia</Label>
        <RadioGroup value={circumstance} onValueChange={(v) => setCircumstance(v as any)}>
          <div className="grid grid-cols-2 gap-3">
            {CIRCUMSTANCE_OPTIONS.map(option => (
              <div key={option.value} className="flex items-center space-x-2 border-2 rounded-lg p-3 hover:bg-muted/50">
                <RadioGroupItem value={option.value} id={`circ-${option.value}`} />
                <Label htmlFor={`circ-${option.value}`} className="cursor-pointer text-base flex-1">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-lg font-semibold mb-3 block">
          Intensidad: {intensity[0]} / 5
        </Label>
        <Slider
          value={intensity}
          onValueChange={setIntensity}
          min={1}
          max={5}
          step={1}
          className="py-4"
        />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>Leve</span>
          <span>Moderada</span>
          <span>Intensa</span>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-14 text-lg">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1 h-14 text-lg bg-leakage hover:bg-leakage/90 text-leakage-foreground">
          💾 Guardar
        </Button>
      </div>
    </form>
  );
}
