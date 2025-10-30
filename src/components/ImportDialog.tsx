import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { parseCSV, readFile } from '@/utils/import';
import { toast } from 'sonner';
import { Record as RecordType } from '@/types/record';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (records: Omit<RecordType, 'id'>[]) => void;
}

export function ImportDialog({ open, onOpenChange, onImport }: ImportDialogProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState<Omit<RecordType, 'id'>[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('⚠️ Formato inválido', {
        description: 'Por favor selecciona un archivo CSV',
      });
      return;
    }

    try {
      const content = await readFile(file);
      const records = parseCSV(content);
      
      if (records.length === 0) {
        toast.error('❌ Archivo vacío', {
          description: 'No se encontraron registros válidos en el archivo',
        });
        return;
      }

      setPreviewData(records);
      toast.success(`✅ ${records.length} registros encontrados`, {
        description: 'Revisa y confirma la importación',
      });
    } catch (error) {
      console.error('Import error:', error);
      toast.error('❌ Error al leer el archivo', {
        description: error instanceof Error ? error.message : 'Formato de archivo incorrecto',
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleConfirmImport = () => {
    if (previewData) {
      onImport(previewData);
      toast.success('🎉 ¡Datos importados con éxito!', {
        description: `${previewData.length} registros añadidos`,
      });
      setPreviewData(null);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setPreviewData(null);
    onOpenChange(false);
  };

  const getRecordTypeName = (type: string) => {
    const names: { [key: string]: string } = {
      'fluid-intake': '💧 Ingesta',
      'urination': '🚽 Micción',
      'leakage': '💦 Pérdida',
      'urgency': '⚡ Urgencia',
      'pad-use': '🩹 Compresa',
    };
    return names[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">📥 Importar Datos</DialogTitle>
        </DialogHeader>

        {!previewData ? (
          <div className="space-y-4">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>Formato CSV</strong>: Debe ser el mismo formato que se exporta desde esta aplicación.
                El archivo debe incluir las columnas: Fecha, Hora, Tipo, Detalles.
              </AlertDescription>
            </Alert>

            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-semibold mb-2">
                Arrastra tu archivo CSV aquí
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                o haz clic para seleccionar
              </p>
              <Button variant="outline" type="button">
                Seleccionar archivo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Se encontraron <strong>{previewData.length} registros</strong> listos para importar.
                Revisa el resumen y confirma la importación.
              </AlertDescription>
            </Alert>

            <div className="border rounded-lg p-4 bg-muted/30 space-y-2">
              <h3 className="font-semibold mb-2">📊 Resumen de registros:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(
                  previewData.reduce((acc, record) => {
                    acc[record.type] = (acc[record.type] || 0) + 1;
                    return acc;
                  }, {} as { [key: string]: number })
                ).map(([type, count]) => (
                  <div key={type} className="flex justify-between">
                    <span>{getRecordTypeName(type)}:</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleConfirmImport}
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                ✅ Confirmar Importación
              </Button>
              <Button onClick={handleCancel} variant="outline" className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
