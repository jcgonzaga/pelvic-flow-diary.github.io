import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FluidIntakeRecord } from '@/types/record';

const QUICK_AMOUNTS = [100, 200, 250, 330, 500];
const DRINK_TYPES = [
  { value: 'water', label: '💧 Agua' },
  { value: 'coffee', label: '☕ Café' },
  { value: 'tea', label: '🍵 Té' },
  { value: 'soda', label: '🥤 Refresco' },
  { value: 'alcohol', label: '🍷 Alcohol' },
  { value: 'other', label: '🧃 Otro' },
];

interface FluidIntakeFormProps {
  onSave: (data: Omit<FluidIntakeRecord, 'id' | 'timestamp' | 'date' | 'time'>) => void;
  onCancel: () => void;
}

export function FluidIntakeForm({ onSave, onCancel }: FluidIntakeFormProps) {
  const [amount, setAmount] = useState(250);
  const [customAmount, setCustomAmount] = useState('');
  const [drinkType, setDrinkType] = useState<FluidIntakeRecord['drinkType']>('water');
  const [useCustom, setUseCustom] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = useCustom ? parseInt(customAmount) || 0 : amount;
    onSave({
      type: 'fluid-intake',
      amount: finalAmount,
      drinkType,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div>
        <Label className="text-lg font-semibold mb-3 block">Cantidad (ml)</Label>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {QUICK_AMOUNTS.map(amt => (
            <Button
              key={amt}
              type="button"
              variant={!useCustom && amount === amt ? "default" : "outline"}
              className="h-14 text-lg"
              onClick={() => {
                setAmount(amt);
                setUseCustom(false);
              }}
            >
              {amt}ml
            </Button>
          ))}
          <Button
            type="button"
            variant={useCustom ? "default" : "outline"}
            className="h-14 text-lg"
            onClick={() => setUseCustom(true)}
          >
            ✏️ Otro
          </Button>
        </div>
        {useCustom && (
          <Input
            type="number"
            placeholder="Cantidad personalizada..."
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="h-14 text-lg"
            autoFocus
          />
        )}
      </div>

      <div>
        <Label className="text-lg font-semibold mb-3 block">Tipo de bebida</Label>
        <RadioGroup value={drinkType} onValueChange={(v) => setDrinkType(v as any)}>
          <div className="grid grid-cols-2 gap-3">
            {DRINK_TYPES.map(drink => (
              <div key={drink.value} className="flex items-center space-x-2 border-2 rounded-lg p-3 hover:bg-muted/50">
                <RadioGroupItem value={drink.value} id={drink.value} />
                <Label htmlFor={drink.value} className="cursor-pointer text-base flex-1">
                  {drink.label}
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
        <Button type="submit" className="flex-1 h-14 text-lg bg-fluid-intake hover:bg-fluid-intake/90">
          💾 Guardar
        </Button>
      </div>
    </form>
  );
}
