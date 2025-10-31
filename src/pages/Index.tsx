import { useState } from 'react';
import { Droplet, AlertCircle, Zap, Bandage, Share2, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RecordTypeCard } from '@/components/RecordTypeCard';
import { FluidIntakeForm } from '@/components/forms/FluidIntakeForm';
import { UrinationForm } from '@/components/forms/UrinationForm';
import { LeakageForm } from '@/components/forms/LeakageForm';
import { UrgencyForm } from '@/components/forms/UrgencyForm';
import { PadUseForm } from '@/components/forms/PadUseForm';
import { RecordsList } from '@/components/RecordsList';
import { DailySummary } from '@/components/DailySummary';
import { ExportDialog } from '@/components/ExportDialog';
import { ImportDialog } from '@/components/ImportDialog';
import { useRecords } from '@/hooks/useRecords';
import { RecordType } from '@/types/record';
import { toast } from 'sonner';

type DialogType = RecordType | null;

const Index = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const { records, addRecord, importRecords, deleteRecord, getDailySummary } = useRecords();

  const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const summary = getDailySummary(today);

  const openDialog = (type: RecordType) => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setTimeout(() => setDialogType(null), 200);
  };

  const handleSave = (data: any, customDateTime?: { date: Date; time: string }) => {
    addRecord(data, customDateTime);
    closeDialog();
    toast.success('✅ ¡Registro guardado con éxito!', {
      description: '¡Bien hecho! 💪',
    });
  };

  const handleDelete = (id: string) => {
    deleteRecord(id);
    toast.success('🗑️ Registro eliminado');
  };

  const getDialogContent = () => {
    switch (dialogType) {
      case 'fluid-intake':
        return {
          title: '💧 Ingesta de Líquido',
          form: <FluidIntakeForm onSave={handleSave} onCancel={closeDialog} />,
        };
      case 'urination':
        return {
          title: '🚽 Micción',
          form: <UrinationForm onSave={handleSave} onCancel={closeDialog} />,
        };
      case 'leakage':
        return {
          title: '💦 Pérdida',
          form: <LeakageForm onSave={handleSave} onCancel={closeDialog} />,
        };
      case 'urgency':
        return {
          title: '⚡ Urgencia',
          form: <UrgencyForm onSave={handleSave} onCancel={closeDialog} />,
        };
      case 'pad-use':
        return {
          title: '🩹 Cambio de Compresa',
          form: <PadUseForm onSave={handleSave} onCancel={closeDialog} />,
        };
      default:
        return null;
    }
  };

  const dialogContent = getDialogContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="container max-w-4xl mx-auto p-4 pb-24 space-y-6">
        {/* Header */}
        <header className="text-center pt-8 pb-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Mi Diario de Hidratación 💧
          </h1>
          <p className="text-muted-foreground text-lg">
            Seguimiento de tu terapia de suelo pélvico
          </p>
        </header>

        {/* Action Cards */}
        <section className="space-y-3 animate-fade-in">
          <RecordTypeCard
            icon={Droplet}
            emoji="💧"
            title="Bebí líquido"
            description="Registra tu ingesta de agua u otros líquidos"
            colorClass="bg-fluid-intake/10 hover:bg-fluid-intake/20 border-fluid-intake/30"
            onClick={() => openDialog('fluid-intake')}
          />
          
          <RecordTypeCard
            icon={Droplet}
            emoji="🚽"
            title="Fui al baño"
            description="Registra una micción"
            colorClass="bg-urination/10 hover:bg-urination/20 border-urination/30"
            onClick={() => openDialog('urination')}
          />
          
          <RecordTypeCard
            icon={AlertCircle}
            emoji="💦"
            title="Tuve una pérdida"
            description="Registra un episodio de incontinencia"
            colorClass="bg-leakage/10 hover:bg-leakage/20 border-leakage/30"
            onClick={() => openDialog('leakage')}
          />
          
          <RecordTypeCard
            icon={Zap}
            emoji="⚡"
            title="Sentí urgencia"
            description="Registra una urgencia miccional"
            colorClass="bg-urgency/10 hover:bg-urgency/20 border-urgency/30"
            onClick={() => openDialog('urgency')}
          />
          
          <RecordTypeCard
            icon={Bandage}
            emoji="🩹"
            title="Cambié la compresa"
            description="Registra el uso de protección"
            colorClass="bg-pad-use/10 hover:bg-pad-use/20 border-pad-use/30"
            onClick={() => openDialog('pad-use')}
          />
        </section>

        {/* Daily Summary */}
        {records.length > 0 && (
          <section className="animate-fade-in">
            <DailySummary {...summary} />
          </section>
        )}

        {/* Export and Import Buttons */}
        {records.length > 0 && (
          <section className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={() => setExportOpen(true)}
              className="h-16 text-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
              size="lg"
            >
              <Share2 className="w-6 h-6 mr-2" />
              Exportar y Compartir
            </Button>
            <Button
              onClick={() => setImportOpen(true)}
              variant="outline"
              className="h-16 text-lg border-2"
              size="lg"
            >
              <Upload className="w-6 h-6 mr-2" />
              Importar Datos
            </Button>
          </section>
        )}

        {/* Import Only Button (when no records) */}
        {records.length === 0 && (
          <section className="animate-fade-in">
            <Button
              onClick={() => setImportOpen(true)}
              variant="outline"
              className="w-full h-16 text-lg border-2"
              size="lg"
            >
              <Upload className="w-6 h-6 mr-2" />
              Importar Datos desde CSV
            </Button>
          </section>
        )}

        {/* Records List */}
        <section className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">📋 Mis Registros</h2>
            {records.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {records.length} {records.length === 1 ? 'registro' : 'registros'}
              </span>
            )}
          </div>
          <RecordsList records={records} onDelete={handleDelete} />
        </section>
      </div>

      {/* Dialog for Forms */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {dialogContent && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{dialogContent.title}</DialogTitle>
            </DialogHeader>
            {dialogContent.form}
          </DialogContent>
        )}
      </Dialog>

      {/* Export Dialog */}
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} records={records} />

      {/* Import Dialog */}
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} onImport={importRecords} />

      {/* Floating Action Button (Mobile) */}
      <Button
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl bg-primary hover:bg-primary/90 md:hidden animate-scale-in"
        size="icon"
        onClick={() => toast.info('👆 Selecciona una acción arriba')}
      >
        <Plus className="w-8 h-8" />
      </Button>
    </div>
  );
};

export default Index;
