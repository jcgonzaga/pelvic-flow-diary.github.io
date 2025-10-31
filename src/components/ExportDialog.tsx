import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Download, Share2, Mail, MessageCircle, Send, CalendarIcon, AlertCircle } from 'lucide-react';
import { Record } from '@/types/record';
import { downloadCSV, generateShareText, shareViaWebShare, shareViaWhatsApp, shareViaTelegram, shareViaEmail } from '@/utils/export';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  records: Record[];
}

type DateRange = 'week' | 'month' | 'all' | 'day';
type ShareFormat = 'summary' | 'detailed';

export function ExportDialog({ open, onOpenChange, records }: ExportDialogProps) {
  const [dateRange, setDateRange] = useState<DateRange>('week');
  const [shareFormat, setShareFormat] = useState<ShareFormat>('summary');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getFilteredRecords = () => {
    if (dateRange === 'day') {
      const selectedDateStr = selectedDate.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      return records.filter(record => record.date === selectedDateStr);
    }

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
        default:
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

    const isDetailed = shareFormat === 'detailed';
    const shareText = generateShareText(
      filtered, 
      filtered[filtered.length - 1].date, 
      filtered[0].date,
      isDetailed
    );

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
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl">📤 Exportar y Compartir</DialogTitle>
          <DialogDescription>
            Selecciona el rango de fechas y el método para compartir tus datos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 pr-2 -mr-2">
          <div>
            <Label className="text-lg font-semibold mb-3 block">Formato de resumen</Label>
            <RadioGroup value={shareFormat} onValueChange={(v) => {
              const newFormat = v as ShareFormat;
              setShareFormat(newFormat);
              if (newFormat === 'detailed') {
                setDateRange('day');
              }
            }}>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 border-2 rounded-lg p-3 hover:bg-muted/50">
                  <RadioGroupItem value="summary" id="summary" />
                  <Label htmlFor="summary" className="cursor-pointer flex-1">
                    📊 Resumido (agrupado por día)
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border-2 rounded-lg p-3 hover:bg-muted/50">
                  <RadioGroupItem value="detailed" id="detailed" />
                  <Label htmlFor="detailed" className="cursor-pointer flex-1">
                    📋 Detallado (solo un día)
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {shareFormat === 'detailed' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                El formato detallado solo permite compartir los registros de un día específico con todas las horas.
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Label className="text-lg font-semibold mb-3 block">Rango de fechas</Label>
            <RadioGroup 
              value={dateRange} 
              onValueChange={(v) => setDateRange(v as DateRange)}
              disabled={shareFormat === 'detailed'}
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2 border-2 rounded-lg p-3 hover:bg-muted/50">
                  <RadioGroupItem value="week" id="week" disabled={shareFormat === 'detailed'} />
                  <Label htmlFor="week" className="cursor-pointer flex-1">📅 Última semana</Label>
                </div>
                <div className="flex items-center space-x-2 border-2 rounded-lg p-3 hover:bg-muted/50">
                  <RadioGroupItem value="month" id="month" disabled={shareFormat === 'detailed'} />
                  <Label htmlFor="month" className="cursor-pointer flex-1">📆 Último mes</Label>
                </div>
                <div className="flex items-center space-x-2 border-2 rounded-lg p-3 hover:bg-muted/50">
                  <RadioGroupItem value="all" id="all" disabled={shareFormat === 'detailed'} />
                  <Label htmlFor="all" className="cursor-pointer flex-1">📋 Todos los registros</Label>
                </div>
                <div className="flex items-center space-x-2 border-2 rounded-lg p-3 hover:bg-muted/50">
                  <RadioGroupItem value="day" id="day" />
                  <Label htmlFor="day" className="cursor-pointer flex-1">📅 Un día específico</Label>
                </div>
              </div>
            </RadioGroup>

            {dateRange === 'day' && (
              <div className="mt-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                      className="pointer-events-auto"
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

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
