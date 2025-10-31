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

export function generateShareText(records: Record[], startDate: string, endDate: string, detailed: boolean = false): string {
  if (detailed) {
    return generateDetailedShareText(records, startDate);
  }
  
  return generateSummaryShareText(records, startDate, endDate);
}

function generateSummaryShareText(records: Record[], startDate: string, endDate: string): string {
  // Agrupar por día
  const recordsByDay: { [date: string]: Record[] } = {};
  
  records.forEach(record => {
    if (!recordsByDay[record.date]) {
      recordsByDay[record.date] = [];
    }
    recordsByDay[record.date].push(record);
  });

  let text = `📊 *Resumen de Terapia de Suelo Pélvico*\n\n📅 Período: ${startDate} - ${endDate}\n📝 Total de registros: ${records.length}\n\n`;

  // Estadísticas por día
  Object.keys(recordsByDay).sort().forEach(date => {
    const dayRecords = recordsByDay[date];
    const fluidIntake = dayRecords
      .filter(r => r.type === 'fluid-intake')
      .reduce((sum, r) => sum + (r as any).amount, 0);
    const urinations = dayRecords.filter(r => r.type === 'urination').length;
    const leakages = dayRecords.filter(r => r.type === 'leakage').length;
    const urgencies = dayRecords.filter(r => r.type === 'urgency').length;

    text += `📅 *${date}*\n`;
    text += `   💧 Ingesta: ${fluidIntake}ml\n`;
    text += `   🚽 Micciones: ${urinations}\n`;
    if (leakages > 0) text += `   💦 Pérdidas: ${leakages}\n`;
    if (urgencies > 0) text += `   ⚡ Urgencias: ${urgencies}\n`;
    text += `\n`;
  });

  text += `_Generado con Mi Diario de Hidratación 💧_`;
  return text;
}

function generateDetailedShareText(records: Record[], date: string): string {
  // Ordenar por hora
  const sortedRecords = [...records].sort((a, b) => {
    const [aHour, aMin] = a.time.split(':').map(Number);
    const [bHour, bMin] = b.time.split(':').map(Number);
    return aHour * 60 + aMin - (bHour * 60 + bMin);
  });

  let text = `📊 *Registro Detallado de Terapia*\n\n📅 Fecha: ${date}\n📝 Total: ${records.length} registros\n\n`;

  sortedRecords.forEach(record => {
    text += `⏰ *${record.time}* - `;
    
    switch (record.type) {
      case 'fluid-intake':
        const fluid = record as any;
        text += `💧 Ingesta: ${fluid.amount}ml (${fluid.drinkType})`;
        break;
      case 'urination':
        const urination = record as any;
        text += `🚽 Micción: ${urination.amount}`;
        if (!urination.arrivedOnTime) text += ` ⚠️ No llegó a tiempo`;
        break;
      case 'leakage':
        const leakage = record as any;
        text += `💦 Pérdida: ${leakage.amount} (${leakage.circumstance}) - Intensidad: ${leakage.intensity}/5`;
        break;
      case 'urgency':
        const urgency = record as any;
        text += `⚡ Urgencia: ${urgency.intensity}/10 - ${urgency.reachedBathroom}`;
        break;
      case 'pad-use':
        const pad = record as any;
        text += `🩹 Compresa: ${pad.padType} - ${pad.condition}`;
        break;
    }
    
    text += `\n`;
  });

  text += `\n_Generado con Mi Diario de Hidratación 💧_`;
  return text;
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
