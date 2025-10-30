import { Record } from '@/types/record';

export function generateCSV(records: Record[]): string {
  const headers = ['Fecha', 'Hora', 'Tipo', 'Detalles'];
  
  const rows = records.map(record => {
    let details = '';
    
    switch (record.type) {
      case 'fluid-intake':
        details = `${record.amount}ml - ${record.drinkType}`;
        break;
      case 'urination':
        details = `${record.amount} - A tiempo: ${record.arrivedOnTime ? 'Sí' : 'No'} - Vaciado: ${record.completeEmptying ? 'Sí' : 'No'}`;
        break;
      case 'leakage':
        details = `${record.amount} - ${record.circumstance} - Intensidad: ${record.intensity}/5`;
        break;
      case 'urgency':
        details = `Intensidad: ${record.intensity}/10 - Llegó: ${record.reachedBathroom} - Aviso: ${record.warningTime}`;
        break;
      case 'pad-use':
        details = `${record.padType} - ${record.condition}`;
        break;
    }
    
    return [record.date, record.time, record.type, details];
  });
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
    
  return csvContent;
}

export function downloadCSV(records: Record[], filename: string = 'registros-terapia.csv') {
  const csv = generateCSV(records);
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateShareText(records: Record[], startDate: string, endDate: string): string {
  const fluidIntake = records
    .filter(r => r.type === 'fluid-intake')
    .reduce((sum, r) => sum + (r as any).amount, 0);
  
  const urinations = records.filter(r => r.type === 'urination').length;
  const leakages = records.filter(r => r.type === 'leakage').length;
  const urgencies = records.filter(r => r.type === 'urgency').length;
  const padChanges = records.filter(r => r.type === 'pad-use').length;
  
  return `📊 *Resumen de Terapia de Suelo Pélvico*

📅 Período: ${startDate} - ${endDate}
📝 Total de registros: ${records.length}

💧 *Ingesta total:* ${fluidIntake}ml
🚽 *Micciones:* ${urinations}
💦 *Pérdidas:* ${leakages}
⚡ *Urgencias:* ${urgencies}
🩹 *Cambios de compresa:* ${padChanges}

${fluidIntake > 0 && urinations > 0 ? `💡 Promedio por micción: ~${Math.round(fluidIntake / urinations)}ml` : ''}

_Generado con Mi Diario de Hidratación 💧_`;
}

export async function shareViaWebShare(text: string) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Resumen de Terapia',
        text: text,
      });
      return true;
    } catch (error) {
      console.error('Error sharing:', error);
      return false;
    }
  }
  return false;
}

export function shareViaWhatsApp(text: string) {
  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
}

export function shareViaTelegram(text: string) {
  const encoded = encodeURIComponent(text);
  window.open(`https://t.me/share/url?text=${encoded}`, '_blank');
}

export function shareViaEmail(text: string) {
  const subject = encodeURIComponent('Resumen de Terapia de Suelo Pélvico');
  const body = encodeURIComponent(text);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}
