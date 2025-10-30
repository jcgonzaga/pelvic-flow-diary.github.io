import { Record as RecordType } from '@/types/record';

export function parseCSV(csvContent: string): Omit<RecordType, 'id'>[] {
  const lines = csvContent.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('El archivo CSV está vacío o no tiene datos');
  }

  // Skip header
  const dataLines = lines.slice(1);
  const records: Omit<RecordType, 'id'>[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    try {
      const line = dataLines[i];
      // Parse CSV respecting quoted fields
      const fields = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
      const cleanFields = fields.map(f => f.replace(/^"|"$/g, '').trim());

      if (cleanFields.length < 4) continue;

      const [date, time, type, details] = cleanFields;
      const timestamp = parseSpanishDateTime(date, time);

      let record: Omit<RecordType, 'id'> | null = null;

      switch (type) {
        case 'fluid-intake': {
          const amountMatch = details.match(/(\d+)ml/);
          const drinkMatch = details.match(/ml - (.+)/);
          if (amountMatch && drinkMatch) {
            record = {
              type: 'fluid-intake',
              timestamp,
              date,
              time,
              amount: parseInt(amountMatch[1]),
              drinkType: mapDrinkType(drinkMatch[1]),
            } as Omit<RecordType, 'id'>;
          }
          break;
        }
        case 'urination': {
          const amountMatch = details.match(/^(\w+) -/);
          const onTimeMatch = details.match(/A tiempo: (\w+)/);
          const emptyingMatch = details.match(/Vaciado: (\w+)/);
          if (amountMatch && onTimeMatch && emptyingMatch) {
            record = {
              type: 'urination',
              timestamp,
              date,
              time,
              amount: mapAmount(amountMatch[1]),
              arrivedOnTime: onTimeMatch[1] === 'Sí',
              completeEmptying: emptyingMatch[1] === 'Sí',
            } as Omit<RecordType, 'id'>;
          }
          break;
        }
        case 'leakage': {
          const amountMatch = details.match(/^(\w+) -/);
          const circumstanceMatch = details.match(/- ([\w\s]+) - Intensidad:/);
          const intensityMatch = details.match(/Intensidad: (\d+)/);
          if (amountMatch && circumstanceMatch && intensityMatch) {
            record = {
              type: 'leakage',
              timestamp,
              date,
              time,
              amount: mapAmount(amountMatch[1]),
              circumstance: mapCircumstance(circumstanceMatch[1].trim()),
              intensity: parseInt(intensityMatch[1]) as 1 | 2 | 3 | 4 | 5,
            } as Omit<RecordType, 'id'>;
          }
          break;
        }
        case 'urgency': {
          const intensityMatch = details.match(/Intensidad: (\d+)/);
          const reachedMatch = details.match(/Llegó: (.+?) - Aviso:/);
          const warningMatch = details.match(/Aviso: (.+)$/);
          if (intensityMatch && reachedMatch && warningMatch) {
            record = {
              type: 'urgency',
              timestamp,
              date,
              time,
              intensity: parseInt(intensityMatch[1]) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
              reachedBathroom: mapReachedBathroom(reachedMatch[1].trim()),
              warningTime: mapWarningTime(warningMatch[1].trim()),
            } as Omit<RecordType, 'id'>;
          }
          break;
        }
        case 'pad-use': {
          const padMatch = details.match(/^(.+?) - (.+)$/);
          if (padMatch) {
            record = {
              type: 'pad-use',
              timestamp,
              date,
              time,
              padType: mapPadType(padMatch[1].trim()),
              condition: mapCondition(padMatch[2].trim()),
            } as Omit<RecordType, 'id'>;
          }
          break;
        }
      }

      if (record) {
        records.push(record);
      }
    } catch (error) {
      console.warn(`Error parsing line ${i + 2}:`, error);
    }
  }

  return records;
}

function parseSpanishDateTime(date: string, time: string): string {
  const [day, month, year] = date.split('/');
  const [hours, minutes] = time.split(':');
  return new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hours),
    parseInt(minutes)
  ).toISOString();
}

function mapDrinkType(spanish: string): 'water' | 'coffee' | 'tea' | 'soda' | 'alcohol' | 'other' {
  const map: { [key: string]: 'water' | 'coffee' | 'tea' | 'soda' | 'alcohol' | 'other' } = {
    'Agua': 'water',
    'Café': 'coffee',
    'Té': 'tea',
    'Refresco': 'soda',
    'Alcohol': 'alcohol',
    'Otro': 'other',
  };
  return map[spanish] || 'other';
}

function mapAmount(spanish: string): 'small' | 'medium' | 'large' | 'drops' | 'moderate' {
  const map: { [key: string]: 'small' | 'medium' | 'large' | 'drops' | 'moderate' } = {
    'Pequeña': 'small',
    'Mediana': 'medium',
    'Grande': 'large',
    'Gotas': 'drops',
    'Moderada': 'moderate',
  };
  return map[spanish] || 'small';
}

function mapCircumstance(spanish: string): 'cough' | 'sneeze' | 'laugh' | 'exercise' | 'urgency' | 'none' {
  const map: { [key: string]: 'cough' | 'sneeze' | 'laugh' | 'exercise' | 'urgency' | 'none' } = {
    'Tos': 'cough',
    'Estornudo': 'sneeze',
    'Risa': 'laugh',
    'Ejercicio': 'exercise',
    'Urgencia': 'urgency',
    'Sin motivo': 'none',
  };
  return map[spanish] || 'none';
}

function mapReachedBathroom(spanish: string): 'yes' | 'no' | 'leakage' {
  const map: { [key: string]: 'yes' | 'no' | 'leakage' } = {
    'Sí, a tiempo': 'yes',
    'No llegué': 'no',
    'Hubo pérdida': 'leakage',
  };
  return map[spanish] || 'no';
}

function mapWarningTime(spanish: string): '<10' | '10-30' | '30-60' | '>60' {
  const map: { [key: string]: '<10' | '10-30' | '30-60' | '>60' } = {
    '<10 seg': '<10',
    '10-30 seg': '10-30',
    '30-60 seg': '30-60',
    '>60 seg': '>60',
  };
  return map[spanish] || '<10';
}

function mapPadType(spanish: string): 'pantyliner' | 'small' | 'medium' | 'large' {
  const map: { [key: string]: 'pantyliner' | 'small' | 'medium' | 'large' } = {
    'Salvaslip': 'pantyliner',
    'Pequeña': 'small',
    'Mediana': 'medium',
    'Grande': 'large',
  };
  return map[spanish] || 'pantyliner';
}

function mapCondition(spanish: string): 'dry' | 'damp' | 'wet' | 'very-wet' {
  const map: { [key: string]: 'dry' | 'damp' | 'wet' | 'very-wet' } = {
    'Seca': 'dry',
    'Húmeda': 'damp',
    'Mojada': 'wet',
    'Muy mojada': 'very-wet',
  };
  return map[spanish] || 'dry';
}

export async function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file, 'UTF-8');
  });
}
