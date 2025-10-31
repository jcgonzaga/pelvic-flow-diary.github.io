import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { UrinationRecord } from '@/types/record';
import { DateTimePicker } from '@/components/DateTimePicker';

const AMOUNT_OPTIONS = [
  { value: 'small', label: '🔹 Pequeña', icon: '💧' },
  { value: 'medium', label: '🔸 Mediana', icon: '💦' },
  { value: 'large', label: '🔶 Grande', icon: '🌊' },
];

interface UrinationFormProps {
  onSave: (data: Omit<UrinationRecord, 'id' | 'timestamp' | 'date' | 'time'>, customDateTime?: { date: Date; time: string }) => void;
  onCancel: () => void;
}

export function UrinationForm({ onSave, onCancel }: UrinationFormProps) {
  const [amount, setAmount] = useState<UrinationRecord['amount']>('medium');
  const [arrivedOnTime, setArrivedOnTime] = useState(true);
  const [completeEmptying, setCompleteEmptying] = useState(true);
  const [manualDateTime, setManualDateTime] = useState(false);
  const [dateTime, setDateTime] = useState({
    date: new Date(),
    time: new Date().toTimeString().slice(0, 5),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        type: 'urination',
        amount,
        arrivedOnTime,
        completeEmptying,
      },
      manualDateTime ? dateTime : undefined
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <Label htmlFor="manual-datetime-urination" className="text-base font-medium cursor-pointer">
          🕐 Registrar con fecha/hora manual
        </Label>
        <Switch
          id="manual-datetime-urination"
          checked={manualDateTime}
          onCheckedChange={setManualDateTime}
        />
      </div>

      {manualDateTime && (
        <DateTimePicker value={dateTime} onChange={setDateTime} />
      )}

      <div>
        <Label className="text-lg font-semibold mb-3 block">Cantidad aproximada</Label>
        <RadioGroup value={amount} onValueChange={(v) => setAmount(v as any)}>
          <div className="grid gap-3">
            {AMOUNT_OPTIONS.map(option => (
              <div key={option.value} className="flex items-center space-x-3 border-2 rounded-lg p-4 hover:bg-muted/50">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="cursor-pointer text-lg flex-1 flex items-center gap-2">
                  <span className="text-2xl">{option.icon}</span>
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-lg font-semibold mb-3 block">¿Llegaste a tiempo?</Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={arrivedOnTime ? "default" : "outline"}
            className="h-16 text-lg bg-success hover:bg-success/90"
            onClick={() => setArrivedOnTime(true)}
          >
            ✅ Sí
          </Button>
          <Button
            type="button"
            variant={!arrivedOnTime ? "default" : "outline"}
            className="h-16 text-lg bg-destructive hover:bg-destructive/90"
            onClick={() => setArrivedOnTime(false)}
          >
            ❌ No
          </Button>
        </div>
      </div>

      <div>
        <Label className="text-lg font-semibold mb-3 block">¿Sensación de vaciado completo?</Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={completeEmptying ? "default" : "outline"}
            className="h-16 text-lg bg-success hover:bg-success/90"
            onClick={() => setCompleteEmptying(true)}
          >
            ✅ Sí
          </Button>
          <Button
            type="button"
            variant={!completeEmptying ? "default" : "outline"}
            className="h-16 text-lg bg-destructive hover:bg-destructive/90"
            onClick={() => setCompleteEmptying(false)}
          >
            ❌ No
          </Button>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-14 text-lg">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1 h-14 text-lg bg-urination hover:bg-urination/90">
          💾 Guardar
        </Button>
      </div>
    </form>
  );
}
