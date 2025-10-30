import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Download, Share2, Mail, MessageCircle, Send } from 'lucide-react';
import { Record } from '@/types/record';
import { downloadCSV, generateShareText, shareViaWebShare, shareViaWhatsApp, shareViaTelegram, shareViaEmail } from '@/utils/export';
import { toast } from 'sonner';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  records: Record[];
}

type DateRange = 'week' | 'month' | 'all';

export function ExportDialog({ open, onOpenChange, records }: ExportDialogProps) {
  const [dateRange, setDateRange] = useState<DateRange>('week');

  const getFilteredRecords = () => {
    const now = new Date();
    const filtered = records.filter(record => {
      const recordDate = new Date(record.timestamp);
      const diffDays = Math.floor((now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateRange) {
        case 'week':
          return diffDays <= 7;
        case 'month':
          return diffDays <= 30;
        case 'all':
          return true;
      }
    });
    return filtered;
  };

  const getDateRangeText = () => {
    const filtered = getFilteredRecords();
    if (filtered.length === 0) return 'Sin registros';
    
    const dates = filtered.map(r => new Date(r.timestamp)).sort((a, b) => a.getTime() - b.getTime());
    const start = dates[0].toLocaleDateString('es-ES');
    const end = dates[dates.length - 1].toLocaleDateString('es-ES');
    
    return `${start} - ${end}`;
  };

  const handleDownloadCSV = () => {
    const filtered = getFilteredRecords();
    if (filtered.length === 0) {
      toast.error('No hay registros en el rango seleccionado');
      return;
    }
    
    downloadCSV(filtered);
    toast.success('✅ CSV descargado correctamente');
    onOpenChange(false);
  };

  const handleShare = async (method: 'native' | 'whatsapp' | 'telegram' | 'email') => {
    const filtered = getFilteredRecords();
    if (filtered.length === 0) {
      toast.error('No hay registros en el rango seleccionado');
      return;
    }

    const shareText = generateShareText(filtered, filtered[filtered.length - 1].date, filtered[0].date);

    switch (method) {
      case 'native':
        const shared = await shareViaWebShare(shareText);
        if (!shared) {
          toast.error('Tu dispositivo no soporta compartir directamente');
        }
        break;
      case 'whatsapp':
        shareViaWhatsApp(shareText);
        break;
      case 'telegram':
        shareViaTelegram(shareText);
        break;
      case 'email':
        shareViaEmail(shareText);
        break;
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">📤 Exportar y Compartir</DialogTitle>
          <DialogDescription>
            Selecciona el rango de fechas y el método para compartir tus datos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-lg font-semibold mb-3 block">Rango de fechas</Label>
            <RadioGroup value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 border-2 rounded-lg p-3 hover:bg-muted/50">
                  <RadioGroupItem value="week" id="week" />
                  <Label htmlFor="week" className="cursor-pointer flex-1">📅 Última semana</Label>
                </div>
                <div className="flex items-center space-x-2 border-2 rounded-lg p-3 hover:bg-muted/50">
                  <RadioGroupItem value="month" id="month" />
                  <Label htmlFor="month" className="cursor-pointer flex-1">📆 Último mes</Label>
                </div>
                <div className="flex items-center space-x-2 border-2 rounded-lg p-3 hover:bg-muted/50">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="cursor-pointer flex-1">📋 Todos los registros</Label>
                </div>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground mt-2">
              {getFilteredRecords().length} registros • {getDateRangeText()}
            </p>
          </div>

          <div>
            <Label className="text-lg font-semibold mb-3 block">Descargar</Label>
            <Button onClick={handleDownloadCSV} className="w-full h-14 text-lg" variant="outline">
              <Download className="w-5 h-5 mr-2" />
              Descargar CSV
            </Button>
          </div>

          <div>
            <Label className="text-lg font-semibold mb-3 block">Compartir</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => handleShare('whatsapp')} variant="outline" className="h-14">
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp
              </Button>
              <Button onClick={() => handleShare('telegram')} variant="outline" className="h-14">
                <Send className="w-5 h-5 mr-2" />
                Telegram
              </Button>
              <Button onClick={() => handleShare('email')} variant="outline" className="h-14">
                <Mail className="w-5 h-5 mr-2" />
                Email
              </Button>
              <Button onClick={() => handleShare('native')} variant="outline" className="h-14">
                <Share2 className="w-5 h-5 mr-2" />
                Más...
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
