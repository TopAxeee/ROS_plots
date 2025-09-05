// utils/rosParser.js

export function parseROSLog(content) {
  const bigList = parseROSFile(content);
  const errors = [];
  
  // Применяем коррекцию времени ко всем наборам данных с сохранением информации о строках
  const correctedROSData = correctTimeSeriesWithLineInfo(
    bigList.dir_X.map((time, index) => ({ 
      time, 
      value: bigList.dir_Y[index],
      line: bigList.dirLines?.[index] || 'N/A'
    })),
    errors,
    'ROS'
  );
  
  const correctedDir3Data = correctTimeSeriesWithLineInfo(
    bigList.dirList.map((value, index) => ({ 
      time: bigList.dir_X[index], 
      value: value !== 0 ? bigList.dir_Y[index] : 0,
      line: bigList.dirLines?.[index] || 'N/A'
    })),
    errors,
    'Dir3'
  );
  
  const correctedFineBData = correctTimeSeriesWithLineInfo(
    bigList.fineBListX.map((time, index) => ({
      time,
      value: bigList.fineBListY[index],
      integral: bigList.fineBListIntegral[index],
      morion: bigList.morionList[index],
      corrValue: bigList.corrValue[index],
      morionDiff: bigList.morionPlotList[index],
      line: bigList.fineBLines?.[index] || 'N/A'
    })),
    errors,
    'FineB'
  );
  
  const correctedFrame2Data = correctTimeSeriesWithLineInfo(
    bigList.frame2_X.map((time, index) => ({ 
      time, 
      value: bigList.frame2_Y[index],
      line: bigList.frame2Lines?.[index] || 'N/A'
    })),
    errors,
    'Frame2'
  );
  
  const correctedUTCData = correctTimeSeriesWithLineInfo(
    bigList.utcTime_X.map((time, index) => ({ 
      time, 
      value: bigList.utcTime_Y[index],
      line: bigList.utcLines?.[index] || 'N/A'
    })),
    errors,
    'UTC'
  );
  
  // Вычисляем время начала и конца
  const allTimes = [
    ...correctedROSData.map(item => item.time),
    ...correctedFrame2Data.map(item => item.time),
    ...correctedUTCData.map(item => item.time)
  ];
  
  const startTime = allTimes.length > 0 ? Math.min(...allTimes) : 0;
  const endTime = allTimes.length > 0 ? Math.max(...allTimes) : 0;
  const duration = endTime - startTime;
  
  return {
    rosData: correctedROSData,
    dir3Data: correctedDir3Data,
    fineBFullData: correctedFineBData,
    frame2Data: correctedFrame2Data,
    utcTimeData: correctedUTCData,
    errors,
    startTime,
    endTime,
    duration
  };
}

// Функция для коррекции временных меток с сохранением информации о строках
function correctTimeSeriesWithLineInfo(data, errors, dataType) {
  if (!data || data.length === 0) return data;
  
  const correctedData = [...data];
  let lastValidTime = correctedData[0].time;
  
  for (let i = 1; i < correctedData.length; i++) {
    if (correctedData[i].time < lastValidTime) {
      // Время уменьшилось - корректируем
      errors.push({
        line: correctedData[i].line,
        message: `Время уменьшилось в данных ${dataType}`,
        details: `Текущее время: ${correctedData[i].time}, предыдущее: ${lastValidTime}. Время скорректировано.`
      });
      
      // Устанавливаем время как предыдущее + 1
      correctedData[i].time = lastValidTime + 1;
    }
    
    lastValidTime = correctedData[i].time;
  }
  
  return correctedData;
}

// Парсер из кода коллеги с добавлением сохранения информации о строках
export function parseROSFile(content) {
  const lines = content.split('\n');
  const bigList = {
    dir_X: [],
    dir_Y: [],
    dirList: [],
    dirLines: [], // сохраняем номера строк для Dir
    fineBListX: [],
    fineBListY: [],
    fineBListValue: [],
    fineBListIntegral: [],
    fineBLines: [], // сохраняем номера строк для FineB
    fineBList1: [],
    fineBList2: [],
    morionList: [],
    morionPlotList: [],
    corrValue: [],
    frame2_X: [],
    frame2_Y: [],
    frame2Lines: [], // сохраняем номера строк для Frame2
    frame2_Humidity: [],
    frame2_Pressure: [],
    frame2_Temperature: [],
    frame2_ID: [],
    utcTime_X: [],
    utcTime_Y: [],
    utcLines: [] // сохраняем номера строк для UTC
  };
  
  let previousDir = 1;
  let wasDir = false;
  let fineBZero = false;
  let fineBNotZero = false;
  let y = 0;
  let frame2_YStart = 0;
  let morionStart = Number.MIN_SAFE_INTEGER;
  let utcTimeStart = 0;
  
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    
    // Обработка строк с "Dir"
    if (line.includes("Dir")) {
      try {
        const stringArray = line.split(';');
        const x = getX(stringArray);
        
        if (!isNaN(x)) {
          y += getY(stringArray, previousDir);
          
          // Сохраняем текущее значение Dir
          try {
            previousDir = parseFloat(stringArray[1].split('=')[1].trim());
          } catch (error) {
            console.error("Неверный формат входной строки (Dir)");
          }
          
          bigList.dir_X.push(x);
          bigList.dir_Y.push(y);
          bigList.dirLines.push(index + 1); // сохраняем номер строки
          
          // Записываем в лист "гистограммы", если Dir = 3 или Dir = 6
          if (line.includes("Dir = 003") || line.includes("Dir = 006")) {
            bigList.dirList.push(y);
          } else {
            bigList.dirList.push(0);
          }
          
          wasDir = true;
        }
      } catch (error) {
        console.error("Ошибка обработки строки с Dir", error);
      }
    }
    
    // Обработка строк с FineB (и только после нахождения Dir)
    if (line.includes("FineB") && wasDir) {
      try {
        const value = line.split(';')[0].split('=');
        const integral = line.split(';')[1].split('=');
        const morionString = line.split(';')[2].split('=');
        const morionValue = parseInt(morionString[1].trim());
        
        bigList.morionList.push(morionValue);
        
        if (morionStart === Number.MIN_SAFE_INTEGER) {
          morionStart = morionValue;
        }
        
        bigList.morionPlotList.push(morionValue - morionStart);
        
        try {
          const corrValueString = line.split(';')[3].split('=');
          bigList.corrValue.push(parseInt(corrValueString[1].trim()));
        } catch (error) {
          bigList.corrValue.push(0);
        }
        
        const fineBValue = parseInt(value[1].trim());
        bigList.fineBListValue.push(fineBValue);
        bigList.fineBListIntegral.push(parseInt(integral[1].trim()));
        
        // Сохраняем координаты в массив
        bigList.fineBListX.push(bigList.dir_X[bigList.dir_X.length - 1] || 0);
        bigList.fineBListY.push(fineBValue);
        bigList.fineBLines.push(index + 1); // сохраняем номер строки
        
        // Обработка "особенных" случаев
        if (line.includes("FineB = 00") && !fineBZero) {
          bigList.fineBList1.push(y);
          bigList.fineBList1.push(bigList.dir_X[bigList.dir_X.length - 1] || 0);
          fineBZero = true;
        } else if (!line.includes("FineB = 00") && !fineBNotZero && fineBZero) {
          bigList.fineBList2.push(y);
          bigList.fineBList2.push(bigList.dir_X[bigList.dir_X.length - 1] || 0);
          fineBNotZero = true;
        }
      } catch (error) {
        console.error("Ошибка обработки строки с FineB", error);
      }
    }
    
    // Обработка строк с Frame2
    if (line.includes("Frame2") && line.includes("  ")) {
      try {
        const temp = line.split(':');
        const id = parseInt(temp[1].trim());
        const tempFrame2 = parseFloat(temp[2].split(',')[1].trim());
        const humidity = parseFloat(temp[3].replace('.', ',').trim());
        const pressure = parseFloat(temp[4].replace('.', ',').trim());
        const temperature = parseFloat(temp[5].replace('.', ',').trim());
        
        let processedFrame2 = tempFrame2 / 10000000000;
        processedFrame2 *= 3;
        
        if (frame2_YStart === 0) {
          frame2_YStart = processedFrame2;
        }
        
        const res = processedFrame2 - frame2_YStart;
        bigList.frame2_Y.push(res);
        
        // Используем временную метку из следующей части строки
        const timeStr = line.split(':')[2]?.trim();
        const timeValue = timeStr ? parseFloat(timeStr) : 0;
        bigList.frame2_X.push(timeValue);
        bigList.frame2Lines.push(index + 1); // сохраняем номер строки
        
        bigList.frame2_ID.push(id);
        
        // Фильтрация некорректных значений
        bigList.frame2_Humidity.push(humidity < 101 ? humidity : NaN);
        bigList.frame2_Pressure.push(pressure < 150001 ? pressure : NaN);
        bigList.frame2_Temperature.push(temperature < 101 ? temperature : NaN);
      } catch (error) {
        console.error("Ошибка обработки строки с Frame2", error);
      }
    }
    
    // Обработка строк с UTC временем
    if (line.includes("Выдача времени прихода сообщения по UTC")) {
      try {
        // Читаем следующую строку для получения времени
        const nextLine = lines[index + 1];
        if (nextLine) {
          const temp = nextLine.split(':')[1].split(' ')[1].split(',')[1];
          let tempUTC = parseFloat(temp) % 1000000000000000;
          tempUTC /= 10000000000;
          tempUTC *= 3;
          
          if (utcTimeStart === 0) {
            utcTimeStart = tempUTC;
          }
          
          const res = tempUTC - utcTimeStart;
          if (Math.abs(res) <= 1000000) {
            bigList.utcTime_Y.push(res);
            
            // Извлекаем временную метку
            const timeStr = nextLine.split(':')[1].split(' ')[1];
            bigList.utcTime_X.push(parseFloat(timeStr));
            bigList.utcLines.push(index + 1); // сохраняем номер строки
          }
        }
      } catch (error) {
        console.error("Ошибка обработки строки с UTC временем", error);
      }
    }
  }
  
  return bigList;
}

// Вспомогательные функции парсинга (без изменений)
function getX(strings) {
  try {
    return parseFloat(strings[0].split('=')[1].trim());
  } catch (error) {
    return NaN;
  }
}

function getY(strings, previousDir) {
  try {
    const dir = parseFloat(strings[1].split('=')[1].trim());
    const balance = parseFloat(strings[3].split('=')[1].trim());
    let result = 0;
    
    switch (dir) {
      case 1:
      case 2:
        result = 1 * balance;
        break;
      case 3:
        switch (previousDir) {
          case 1:
          case 4:
            result = 2;
            break;
          case 2:
          case 5:
            result = -2;
            break;
          default:
            result = 0;
        }
        break;
      case 4:
        result = 1;
        break;
      case 5:
        result = -1;
        break;
      case 6:
        result = 0;
        break;
      default:
        result = 0;
    }
    
    return result;
  } catch (error) {
    return NaN;
  }
}