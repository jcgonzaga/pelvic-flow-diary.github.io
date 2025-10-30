import { Record } from '@/types/record';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Droplet, Zap, AlertCircle, Bandage } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecordsListProps {
  records: Record[];
  onDelete: (id: string) => void;
}

const RECORD_CONFIG = {
  'fluid-intake': {
    emoji: '💧',
    icon: Droplet,
    colorClass: 'border-l-4 border-l-fluid-intake bg-fluid-intake/5',
    title: 'Ingesta de líquido',
  },
  'urination': {
    emoji: '🚽',
    icon: Droplet,
    colorClass: 'border-l-4 border-l-urination bg-urination/5',
    title: 'Micción',
  },
  'leakage': {
    emoji: '💦',
    icon: AlertCircle,
    colorClass: 'border-l-4 border-l-leakage bg-leakage/5',
    title: 'Pérdida',
  },
  'urgency': {
    emoji: '⚡',
    icon: Zap,
    colorClass: 'border-l-4 border-l-urgency bg-urgency/5',
    title: 'Urgencia',
  },
  'pad-use': {
    emoji: '🩹',
    icon: Bandage,
    colorClass: 'border-l-4 border-l-pad-use bg-pad-use/5',
    title: 'Cambio de compresa',
  },
};

const TRANSLATIONS = {
  amount: { small: 'Pequeña', medium: 'Mediana', large: 'Grande', drops: 'Gotas', moderate: 'Moderada' },
  drinkType: { water: 'Agua', coffee: 'Café', tea: 'Té', soda: 'Refresco', alcohol: 'Alcohol', other: 'Otro' },
  circumstance: { cough: 'Tos', sneeze: 'Estornudo', laugh: 'Risa', exercise: 'Ejercicio', urgency: 'Urgencia', none: 'Sin motivo' },
  reachedBathroom: { yes: 'Sí, a tiempo', no: 'No llegué', leakage: 'Hubo pérdida' },
  warningTime: { '<10': '<10 seg', '10-30': '10-30 seg', '30-60': '30-60 seg', '>60': '>60 seg' },
  padType: { pantyliner: 'Salvaslip', small: 'Pequeña', medium: 'Mediana', large: 'Grande' },
  condition: { dry: 'Seca', damp: 'Húmeda', wet: 'Mojada', 'very-wet': 'Muy mojada' },
};

function RecordDetails({ record }: { record: Record }) {
  switch (record.type) {
    case 'fluid-intake':
      return (
        <div className="text-sm space-y-1">
          <p><strong>Cantidad:</strong> {record.amount}ml</p>
          <p><strong>Tipo:</strong> {TRANSLATIONS.drinkType[record.drinkType]}</p>
        </div>
      );
    case 'urination':
      return (
        <div className="text-sm space-y-1">
          <p><strong>Cantidad:</strong> {TRANSLATIONS.amount[record.amount]}</p>
          <p><strong>Llegó a tiempo:</strong> {record.arrivedOnTime ? '✅' : '❌'}</p>
          <p><strong>Vaciado completo:</strong> {record.completeEmptying ? '✅' : '❌'}</p>
        </div>
      );
    case 'leakage':
      return (
        <div className="text-sm space-y-1">
          <p><strong>Cantidad:</strong> {TRANSLATIONS.amount[record.amount]}</p>
          <p><strong>Circunstancia:</strong> {TRANSLATIONS.circumstance[record.circumstance]}</p>
          <p><strong>Intensidad:</strong> {record.intensity}/5</p>
        </div>
      );
    case 'urgency':
      return (
        <div className="text-sm space-y-1">
          <p><strong>Intensidad:</strong> {record.intensity}/10</p>
          <p><strong>Llegó al baño:</strong> {TRANSLATIONS.reachedBathroom[record.reachedBathroom]}</p>
          <p><strong>Tiempo de aviso:</strong> {TRANSLATIONS.warningTime[record.warningTime]}</p>
        </div>
      );
    case 'pad-use':
      return (
        <div className="text-sm space-y-1">
          <p><strong>Tipo:</strong> {TRANSLATIONS.padType[record.padType]}</p>
          <p><strong>Estado:</strong> {TRANSLATIONS.condition[record.condition]}</p>
        </div>
      );
  }
}

export function RecordsList({ records, onDelete }: RecordsListProps) {
  if (records.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground text-lg">
          📝 Aún no hay registros. ¡Empieza a registrar tus eventos!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record) => {
        const config = RECORD_CONFIG[record.type];
        const Icon = config.icon;

        return (
          <Card
            key={record.id}
            className={cn(
              'p-4 transition-all duration-200 hover:shadow-md animate-fade-in',
              config.colorClass
            )}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl flex-shrink-0">{config.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4" />
                  <h3 className="font-semibold text-base">{config.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  🕐 {record.time} • 📅 {record.date}
                </p>
                <RecordDetails record={record} />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(record.id)}
                className="flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
