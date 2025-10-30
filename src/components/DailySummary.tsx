import { Card } from '@/components/ui/card';
import { Droplet, Zap, AlertCircle } from 'lucide-react';

interface DailySummaryProps {
  fluidIntake: number;
  urinations: number;
  leakages: number;
  urgencies: number;
}

export function DailySummary({ fluidIntake, urinations, leakages, urgencies }: DailySummaryProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-2">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        📊 Resumen de hoy
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-fluid-intake">
            <Droplet className="w-5 h-5" />
            <span className="text-sm font-medium">Líquidos</span>
          </div>
          <p className="text-3xl font-bold">{fluidIntake}ml</p>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-urination">
            <Droplet className="w-5 h-5" />
            <span className="text-sm font-medium">Micciones</span>
          </div>
          <p className="text-3xl font-bold">{urinations}</p>
        </div>
        
        {(leakages > 0 || urgencies > 0) && (
          <>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-leakage">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Pérdidas</span>
              </div>
              <p className="text-3xl font-bold">{leakages}</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-urgency">
                <Zap className="w-5 h-5" />
                <span className="text-sm font-medium">Urgencias</span>
              </div>
              <p className="text-3xl font-bold">{urgencies}</p>
            </div>
          </>
        )}
      </div>
      
      {fluidIntake > 0 && urinations > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            💧 Balance: ~{Math.round(fluidIntake / urinations)}ml por micción
          </p>
        </div>
      )}
    </Card>
  );
}
