import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { FluidIntakeRecord, ContainerType } from '@/types/record';
import { DateTimePicker } from '@/components/DateTimePicker';

const CONTAINERS = [
  { value: 'espresso' as ContainerType, label: '☕ Café expreso', amount: 60 },
  { value: 'coffee-cup' as ContainerType, label: '☕ Taza café', amount: 200 },
  { value: 'glass' as ContainerType, label: '🥛 Vaso', amount: 250 },
  { value: 'small-bottle' as ContainerType, label: '🧃 Botellita', amount: 330 },
  { value: 'bottle' as ContainerType, label: '🍾 Botella', amount: 500 },
  { value: 'large-bottle' as ContainerType, label: '🍾 Botella grande', amount: 1000 },
];

const DRINK_TYPES = [
  { value: 'water', label: '💧 Agua' },
  { value: 'coffee', label: '☕ Café' },
  { value: 'tea', label: '🍵 Té' },
  { value: 'soda', label: '🥤 Refresco' },
  { value: 'alcohol', label: '🍷 Alcohol' },
  { value: 'other', label: '🧃 Otro' },
];

interface FluidIntakeFormProps {
  onSave: (data: Omit<FluidIntakeRecord, 'id' | 'timestamp' | 'date' | 'time'>, customDateTime?: { date: Date; time: string }) => void;
  onCancel: () => void;
}

export function FluidIntakeForm({ onSave, onCancel }: FluidIntakeFormProps) {
  const [container, setContainer] = useState<ContainerType>('glass');
  const [customAmount, setCustomAmount] = useState('');
  const [drinkType, setDrinkType] = useState<FluidIntakeRecord['drinkType']>('water');
  const [useCustom, setUseCustom] = useState(false);
  const [manualDateTime, setManualDateTime] = useState(false);
  const [dateTime, setDateTime] = useState({
    date: new Date(),
    time: new Date().toTimeString().slice(0, 5),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = useCustom 
      ? parseInt(customAmount) || 0 
      : CONTAINERS.find(c => c.value === container)?.amount || 0;
    
    onSave(
      {
        type: 'fluid-intake',
        amount: finalAmount,
        container: useCustom ? 'custom' : container,
        drinkType,
      },
      manualDateTime ? dateTime : undefined
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <Label htmlFor="manual-datetime" className="text-base font-medium cursor-pointer">
          🕐 Registrar con fecha/hora manual
        </Label>
        <Switch
          id="manual-datetime"
          checked={manualDateTime}
          onCheckedChange={setManualDateTime}
        />
      </div>

      {manualDateTime && (
        <DateTimePicker value={dateTime} onChange={setDateTime} />
      )}

      <div>
        <Label className="text-lg font-semibold mb-3 block">Contenedor</Label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {CONTAINERS.map(cont => (
            <Button
              key={cont.value}
              type="button"
              variant={!useCustom && container === cont.value ? "default" : "outline"}
              className="h-16 text-sm flex flex-col items-center justify-center gap-1"
              onClick={() => {
                setContainer(cont.value);
                setUseCustom(false);
              }}
            >
              <span className="text-lg">{cont.label}</span>
              <span className="text-xs opacity-70">{cont.amount}ml</span>
            </Button>
          ))}
        </div>
        <Button
          type="button"
          variant={useCustom ? "default" : "outline"}
          className="w-full h-14 text-lg"
          onClick={() => setUseCustom(true)}
        >
          ✏️ Cantidad personalizada
        </Button>
        {useCustom && (
          <Input
            type="number"
            placeholder="Cantidad en ml..."
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="h-14 text-lg mt-3"
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
