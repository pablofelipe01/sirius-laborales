#!/usr/bin/env node

// Script para generar datos de prueba de una semana completa
// Ejecutar con: node scripts/generate-test-data.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno no configuradas');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.log('SUPABASE_SERVICE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Función para formatear timestamp
function formatTimestamp(date, time) {
  const [hours, minutes] = time.split(':');
  const timestamp = new Date(date);
  timestamp.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return timestamp.toISOString();
}

// Función para obtener fecha de la semana pasada
function getLastWeekDates() {
  const today = new Date();
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - today.getDay() - 6); // Lunes de la semana pasada
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(lastMonday);
    date.setDate(lastMonday.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

async function generateTestData() {
  console.log('🌱 Generando datos de prueba SIRIUS...\n');

  try {
    // 1. Obtener empleados (excluyendo a Luisa)
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id, nombre, cedula, salario_hora')
      .neq('cedula', '12345678')
      .limit(8);

    if (empError) throw empError;
    
    console.log(`👥 Encontrados ${employees.length} empleados para generar datos`);

    // 2. Obtener fechas de la semana pasada
    const weekDates = getLastWeekDates();
    console.log(`📅 Generando datos para: ${weekDates[0]} a ${weekDates[6]}\n`);

    // 3. Limpiar datos existentes de la semana pasada
    console.log('🧹 Limpiando datos existentes...');
    
    await supabase
      .from('hours_summary')
      .delete()
      .gte('fecha', weekDates[0])
      .lte('fecha', weekDates[6]);

    await supabase
      .from('active_breaks')
      .delete()
      .gte('fecha_inicio', weekDates[0])
      .lte('fecha_inicio', weekDates[6] + 'T23:59:59');

    await supabase
      .from('time_records')
      .delete()
      .gte('timestamp', weekDates[0])
      .lte('timestamp', weekDates[6] + 'T23:59:59');

    console.log('✅ Datos anteriores limpiados\n');

    // 4. Generar datos día por día
    const timeRecords = [];
    const activeBreaks = [];

    // LUNES - Día normal para la mayoría
    console.log(`📊 Generando LUNES (${weekDates[0]})...`);
    
    // Juan Carlos - Día normal
    timeRecords.push(
      { employee_id: employees[0].id, tipo: 'entrada', timestamp: formatTimestamp(weekDates[0], '08:15'), mensaje_motivacional: '¡Buenos días Juan! Que tu jornada esté llena de energía ☀️' },
      { employee_id: employees[0].id, tipo: 'inicio_almuerzo', timestamp: formatTimestamp(weekDates[0], '12:30'), mensaje_motivacional: 'Hora de nutrir el cuerpo Juan 🍽️' },
      { employee_id: employees[0].id, tipo: 'fin_almuerzo', timestamp: formatTimestamp(weekDates[0], '13:30'), mensaje_motivacional: 'Recargado y listo para la tarde ⚡' },
      { employee_id: employees[0].id, tipo: 'salida', timestamp: formatTimestamp(weekDates[0], '16:45'), mensaje_motivacional: 'Excelente día Juan! Descansa bien 🌙' }
    );

    // María Elena - Con horas extras
    timeRecords.push(
      { employee_id: employees[1].id, tipo: 'entrada', timestamp: formatTimestamp(weekDates[0], '07:45'), mensaje_motivacional: '¡Hola María! Temprano y con energía 🌅' },
      { employee_id: employees[1].id, tipo: 'inicio_almuerzo', timestamp: formatTimestamp(weekDates[0], '12:00'), mensaje_motivacional: 'Te mereces este descanso María 🌿' },
      { employee_id: employees[1].id, tipo: 'fin_almuerzo', timestamp: formatTimestamp(weekDates[0], '13:00'), mensaje_motivacional: 'Lista para la tarde productiva' },
      { employee_id: employees[1].id, tipo: 'salida', timestamp: formatTimestamp(weekDates[0], '18:30'), mensaje_motivacional: 'Jornada extendida completada! Eres increíble 🌟' }
    );

    // Carlos - Turno nocturno
    timeRecords.push(
      { employee_id: employees[2].id, tipo: 'entrada', timestamp: formatTimestamp(weekDates[0], '14:00'), mensaje_motivacional: 'Buenas tardes Carlos! Turno de tarde 🌆' },
      { employee_id: employees[2].id, tipo: 'inicio_almuerzo', timestamp: formatTimestamp(weekDates[0], '18:00'), mensaje_motivacional: 'Hora de la cena Carlos 🍽️' },
      { employee_id: employees[2].id, tipo: 'fin_almuerzo', timestamp: formatTimestamp(weekDates[0], '19:00'), mensaje_motivacional: 'Energías renovadas para la noche' },
      { employee_id: employees[2].id, tipo: 'salida', timestamp: formatTimestamp(weekDates[0], '23:15'), mensaje_motivacional: 'Noche productiva completada Carlos! 🌙' }
    );

    // Pausas del lunes
    activeBreaks.push(
      { employee_id: employees[0].id, fecha_inicio: formatTimestamp(weekDates[0], '10:30'), fecha_fin: formatTimestamp(weekDates[0], '10:33'), duracion_segundos: 180, tipo: 'respiracion', completada: true, estado_animo_antes: 'bien', estado_animo_despues: 'feliz' },
      { employee_id: employees[0].id, fecha_inicio: formatTimestamp(weekDates[0], '15:00'), fecha_fin: formatTimestamp(weekDates[0], '15:05'), duracion_segundos: 300, tipo: 'estiramiento', completada: true, estado_animo_antes: 'cansado', estado_animo_despues: 'bien' },
      { employee_id: employees[1].id, fecha_inicio: formatTimestamp(weekDates[0], '10:00'), fecha_fin: formatTimestamp(weekDates[0], '10:03'), duracion_segundos: 180, tipo: 'gratitud', completada: true, estado_animo_antes: 'estresado', estado_animo_despues: 'feliz' }
    );

    // MARTES
    console.log(`📊 Generando MARTES (${weekDates[1]})...`);
    
    // Ana Sofía - Día con muchas pausas
    timeRecords.push(
      { employee_id: employees[3].id, tipo: 'entrada', timestamp: formatTimestamp(weekDates[1], '08:00'), mensaje_motivacional: '¡Puntual como siempre Ana! 🌟' },
      { employee_id: employees[3].id, tipo: 'inicio_almuerzo', timestamp: formatTimestamp(weekDates[1], '12:15'), mensaje_motivacional: 'Disfruta tu almuerzo Ana 🌸' },
      { employee_id: employees[3].id, tipo: 'fin_almuerzo', timestamp: formatTimestamp(weekDates[1], '13:15'), mensaje_motivacional: 'Renovada para la tarde' },
      { employee_id: employees[3].id, tipo: 'salida', timestamp: formatTimestamp(weekDates[1], '17:00'), mensaje_motivacional: 'Día completo de bienestar Ana! 🌺' }
    );

    // David - Llegada tarde
    timeRecords.push(
      { employee_id: employees[4].id, tipo: 'entrada', timestamp: formatTimestamp(weekDates[1], '09:30'), mensaje_motivacional: 'Buenos días David! Nunca es tarde para empezar bien 😊' },
      { employee_id: employees[4].id, tipo: 'inicio_almuerzo', timestamp: formatTimestamp(weekDates[1], '13:30'), mensaje_motivacional: 'Momento de recargar David 🍃' },
      { employee_id: employees[4].id, tipo: 'fin_almuerzo', timestamp: formatTimestamp(weekDates[1], '14:30'), mensaje_motivacional: 'Listo para la tarde David' },
      { employee_id: employees[4].id, tipo: 'salida', timestamp: formatTimestamp(weekDates[1], '18:30'), mensaje_motivacional: 'Jornada compensada completada! 💪' }
    );

    // Pausas del martes
    activeBreaks.push(
      { employee_id: employees[3].id, fecha_inicio: formatTimestamp(weekDates[1], '10:00'), fecha_fin: formatTimestamp(weekDates[1], '10:03'), duracion_segundos: 180, tipo: 'respiracion', completada: true, estado_animo_antes: 'bien', estado_animo_despues: 'feliz' },
      { employee_id: employees[3].id, fecha_inicio: formatTimestamp(weekDates[1], '14:30'), fecha_fin: formatTimestamp(weekDates[1], '14:35'), duracion_segundos: 300, tipo: 'estiramiento', completada: true, estado_animo_antes: 'bien', estado_animo_despues: 'feliz' },
      { employee_id: employees[3].id, fecha_inicio: formatTimestamp(weekDates[1], '16:00'), fecha_fin: formatTimestamp(weekDates[1], '16:03'), duracion_segundos: 180, tipo: 'gratitud', completada: true, estado_animo_antes: 'feliz', estado_animo_despues: 'feliz' }
    );

    // MIÉRCOLES
    console.log(`📊 Generando MIÉRCOLES (${weekDates[2]})...`);
    
    // Laura - Día normal
    if (employees[5]) {
      timeRecords.push(
        { employee_id: employees[5].id, tipo: 'entrada', timestamp: formatTimestamp(weekDates[2], '08:10'), mensaje_motivacional: 'Buenos días Laura! Tu sonrisa ilumina el día 🌺' },
        { employee_id: employees[5].id, tipo: 'inicio_almuerzo', timestamp: formatTimestamp(weekDates[2], '12:45'), mensaje_motivacional: 'Nutrite bien Laura 💚' },
        { employee_id: employees[5].id, tipo: 'fin_almuerzo', timestamp: formatTimestamp(weekDates[2], '13:45'), mensaje_motivacional: 'Energía renovada Laura' },
        { employee_id: employees[5].id, tipo: 'salida', timestamp: formatTimestamp(weekDates[2], '17:10'), mensaje_motivacional: 'Otro día exitoso Laura! 🌟' }
      );
    }

    // Miguel - Con extras
    if (employees[6]) {
      timeRecords.push(
        { employee_id: employees[6].id, tipo: 'entrada', timestamp: formatTimestamp(weekDates[2], '08:30'), mensaje_motivacional: 'Buenos días Miguel! Día productivo por delante 🌵' },
        { employee_id: employees[6].id, tipo: 'inicio_almuerzo', timestamp: formatTimestamp(weekDates[2], '13:00'), mensaje_motivacional: 'Pausa merecida Miguel 🍽️' },
        { employee_id: employees[6].id, tipo: 'fin_almuerzo', timestamp: formatTimestamp(weekDates[2], '14:00'), mensaje_motivacional: 'Recargado Miguel!' },
        { employee_id: employees[6].id, tipo: 'salida', timestamp: formatTimestamp(weekDates[2], '19:45'), mensaje_motivacional: 'Jornada extendida exitosa Miguel! 🚀' }
      );
    }

    // JUEVES
    console.log(`📊 Generando JUEVES (${weekDates[3]})...`);
    
    // Valentina - Día perfecto
    if (employees[7]) {
      timeRecords.push(
        { employee_id: employees[7].id, tipo: 'entrada', timestamp: formatTimestamp(weekDates[3], '07:55'), mensaje_motivacional: 'Buenos días Vale! Siempre radiante 🌼' },
        { employee_id: employees[7].id, tipo: 'inicio_almuerzo', timestamp: formatTimestamp(weekDates[3], '12:20'), mensaje_motivacional: 'Disfruta tu almuerzo Vale ☀️' },
        { employee_id: employees[7].id, tipo: 'fin_almuerzo', timestamp: formatTimestamp(weekDates[3], '13:20'), mensaje_motivacional: 'Lista para brillar en la tarde' },
        { employee_id: employees[7].id, tipo: 'salida', timestamp: formatTimestamp(weekDates[3], '16:55'), mensaje_motivacional: 'Día perfecto completado Vale! ✨' }
      );

      // Pausas modelo del jueves
      activeBreaks.push(
        { employee_id: employees[7].id, fecha_inicio: formatTimestamp(weekDates[3], '10:15'), fecha_fin: formatTimestamp(weekDates[3], '10:18'), duracion_segundos: 180, tipo: 'respiracion', completada: true, estado_animo_antes: 'bien', estado_animo_despues: 'feliz' },
        { employee_id: employees[7].id, fecha_inicio: formatTimestamp(weekDates[3], '14:30'), fecha_fin: formatTimestamp(weekDates[3], '14:35'), duracion_segundos: 300, tipo: 'estiramiento', completada: true, estado_animo_antes: 'bien', estado_animo_despues: 'feliz' },
        { employee_id: employees[7].id, fecha_inicio: formatTimestamp(weekDates[3], '16:00'), fecha_fin: formatTimestamp(weekDates[3], '16:03'), duracion_segundos: 180, tipo: 'gratitud', completada: true, estado_animo_antes: 'feliz', estado_animo_despues: 'feliz' }
      );
    }

    // VIERNES
    console.log(`📊 Generando VIERNES (${weekDates[4]})...`);
    
    // Viernes varios empleados
    timeRecords.push(
      { employee_id: employees[0].id, tipo: 'entrada', timestamp: formatTimestamp(weekDates[4], '08:20'), mensaje_motivacional: '¡TGIF Juan! Viernes de energía 🎉' },
      { employee_id: employees[0].id, tipo: 'inicio_almuerzo', timestamp: formatTimestamp(weekDates[4], '12:30'), mensaje_motivacional: 'Almuerzo de viernes especial 🍽️' },
      { employee_id: employees[0].id, tipo: 'fin_almuerzo', timestamp: formatTimestamp(weekDates[4], '13:30'), mensaje_motivacional: 'Tarde de viernes productiva' },
      { employee_id: employees[0].id, tipo: 'salida', timestamp: formatTimestamp(weekDates[4], '17:00'), mensaje_motivacional: '¡Fin de semana merecido Juan! 🎊' }
    );

    // SÁBADO - Trabajo de fin de semana
    console.log(`📊 Generando SÁBADO (${weekDates[5]})...`);
    
    // Carlos - Turno sábado (horas dominicales)
    timeRecords.push(
      { employee_id: employees[2].id, tipo: 'entrada', timestamp: formatTimestamp(weekDates[5], '09:00'), mensaje_motivacional: 'Sábado especial Carlos! Día de extras 💪' },
      { employee_id: employees[2].id, tipo: 'inicio_almuerzo', timestamp: formatTimestamp(weekDates[5], '13:00'), mensaje_motivacional: 'Almuerzo de sábado merecido' },
      { employee_id: employees[2].id, tipo: 'fin_almuerzo', timestamp: formatTimestamp(weekDates[5], '14:00'), mensaje_motivacional: 'Tarde de sábado productiva' },
      { employee_id: employees[2].id, tipo: 'salida', timestamp: formatTimestamp(weekDates[5], '17:00'), mensaje_motivacional: 'Sábado productivo completado Carlos! 🌟' }
    );

    // DOMINGO - Trabajo dominical
    console.log(`📊 Generando DOMINGO (${weekDates[6]})...`);
    
    // David - Turno domingo corto
    timeRecords.push(
      { employee_id: employees[4].id, tipo: 'entrada', timestamp: formatTimestamp(weekDates[6], '10:00'), mensaje_motivacional: 'Domingo especial David! Gracias por tu dedicación 🙏' },
      { employee_id: employees[4].id, tipo: 'salida', timestamp: formatTimestamp(weekDates[6], '14:00'), mensaje_motivacional: 'Domingo completado David! Descansa el resto del día 🌞' }
    );

    // 5. Insertar registros de tiempo
    console.log(`\n⏰ Insertando ${timeRecords.length} registros de tiempo...`);
    
    const { error: timeError } = await supabase
      .from('time_records')
      .insert(timeRecords);
    
    if (timeError) throw timeError;
    
    console.log('✅ Registros de tiempo insertados');

    // 6. Insertar pausas activas
    console.log(`🧘 Insertando ${activeBreaks.length} pausas activas...`);
    
    const { error: breaksError } = await supabase
      .from('active_breaks')
      .insert(activeBreaks);
    
    if (breaksError) throw breaksError;
    
    console.log('✅ Pausas activas insertadas');

    // 7. Generar hours_summary calculado
    console.log('\n💰 Generando resúmenes de horas y nómina...');
    
    const hoursSummaryData = [];
    
    for (const emp of employees) {
      for (const date of weekDates) {
        // Obtener registros del empleado para este día
        const { data: dayRecords } = await supabase
          .from('time_records')
          .select('*')
          .eq('employee_id', emp.id)
          .gte('timestamp', date)
          .lt('timestamp', new Date(new Date(date).getTime() + 24*60*60*1000).toISOString().split('T')[0])
          .order('timestamp');

        if (!dayRecords || dayRecords.length === 0) continue;

        const entrada = dayRecords.find(r => r.tipo === 'entrada');
        const salida = dayRecords.find(r => r.tipo === 'salida');
        const inicioAlmuerzo = dayRecords.find(r => r.tipo === 'inicio_almuerzo');
        const finAlmuerzo = dayRecords.find(r => r.tipo === 'fin_almuerzo');

        if (!entrada || !salida) continue;

        // Calcular horas trabajadas
        const entradaTime = new Date(entrada.timestamp);
        const salidaTime = new Date(salida.timestamp);
        let horasTotales = (salidaTime - entradaTime) / (1000 * 60 * 60);

        // Restar almuerzo
        if (inicioAlmuerzo && finAlmuerzo) {
          const almuerzoHoras = (new Date(finAlmuerzo.timestamp) - new Date(inicioAlmuerzo.timestamp)) / (1000 * 60 * 60);
          horasTotales -= almuerzoHoras;
        } else {
          horasTotales -= 1; // Asumir 1 hora de almuerzo
        }

        // Determinar tipo de día
        const fechaObj = new Date(date);
        const esDomingo = fechaObj.getDay() === 0;
        const esSabado = fechaObj.getDay() === 6;
        const horasSalida = salidaTime.getHours();
        const esNocturno = horasSalida >= 21;

        // Calcular distribución de horas
        let horasOrdinarias = 0;
        let horasExtraDiurnas = 0;
        let horasExtraNocturnas = 0;
        let horasNocturnas = 0;
        let horasDominicales = 0;

        if (esDomingo) {
          horasDominicales = horasTotales;
        } else {
          horasOrdinarias = Math.min(8, horasTotales);
          if (horasTotales > 8) {
            const horasExtra = horasTotales - 8;
            if (esNocturno) {
              horasExtraNocturnas = horasExtra;
            } else {
              horasExtraDiurnas = horasExtra;
            }
          }
          if (esNocturno && horasTotales <= 8) {
            horasNocturnas = Math.min(3, horasSalida - 21);
          }
        }

        // Calcular pagos
        const salarioHora = emp.salario_hora || 15000; // Fallback
        const salarioBase = salarioHora * horasOrdinarias;
        const recargoNocturno = salarioHora * 0.35 * horasNocturnas;
        const recargoDominical = salarioHora * 1.0 * horasDominicales;
        const extraDiurna = salarioHora * 0.25 * horasExtraDiurnas;
        const extraNocturna = salarioHora * 0.75 * horasExtraNocturnas;
        const extraDominical = salarioHora * 1.0 * horasDominicales;

        const totalPago = salarioBase + recargoNocturno + recargoDominical + extraDiurna + extraNocturna;

        // Contar pausas activas
        const { data: pausas } = await supabase
          .from('active_breaks')
          .select('id')
          .eq('employee_id', emp.id)
          .gte('fecha_inicio', date)
          .lt('fecha_inicio', new Date(new Date(date).getTime() + 24*60*60*1000).toISOString())
          .eq('completada', true);

        hoursSummaryData.push({
          employee_id: emp.id,
          fecha: date,
          horas_ordinarias: Number(horasOrdinarias.toFixed(2)),
          horas_extra_diurnas: Number(horasExtraDiurnas.toFixed(2)),
          horas_extra_nocturnas: Number(horasExtraNocturnas.toFixed(2)),
          horas_nocturnas: Number(horasNocturnas.toFixed(2)),
          horas_dominicales_diurnas: Number(horasDominicales.toFixed(2)),
          total_horas: Number(horasTotales.toFixed(2)),
          salario_base: Number(salarioBase.toFixed(2)),
          recargo_nocturno: Number(recargoNocturno.toFixed(2)),
          recargo_dominical: Number(recargoDominical.toFixed(2)),
          extra_diurna: Number(extraDiurna.toFixed(2)),
          extra_nocturna: Number(extraNocturna.toFixed(2)),
          extra_dominical_diurna: Number(extraDominical.toFixed(2)),
          total_pago: Number(totalPago.toFixed(2)),
          pausas_activas_realizadas: pausas?.length || 0
        });
      }
    }

    // Insertar resúmenes de horas
    const { error: summaryError } = await supabase
      .from('hours_summary')
      .insert(hoursSummaryData);
    
    if (summaryError) throw summaryError;
    
    console.log(`✅ ${hoursSummaryData.length} resúmenes de horas insertados`);

    // 8. Actualizar rachas de pausas
    console.log('\n🏆 Actualizando rachas de bienestar...');
    
    for (const emp of employees) {
      const { data: pausasDias } = await supabase
        .from('active_breaks')
        .select('fecha_inicio')
        .eq('employee_id', emp.id)
        .eq('completada', true)
        .gte('fecha_inicio', weekDates[0])
        .lte('fecha_inicio', weekDates[6] + 'T23:59:59');

      const diasConPausas = new Set(pausasDias?.map(p => p.fecha_inicio.split('T')[0]) || []).size;
      
      let nuevaRacha = 2; // Base
      if (diasConPausas >= 5) nuevaRacha = 7;
      else if (diasConPausas >= 3) nuevaRacha = 5;

      await supabase
        .from('employees')
        .update({ racha_pausas: nuevaRacha })
        .eq('id', emp.id);
    }

    console.log('✅ Rachas actualizadas');

    // 9. Mostrar resumen final
    console.log('\n📊 RESUMEN DE DATOS GENERADOS:');
    console.log('================================');
    
    const { data: resumen } = await supabase
      .from('hours_summary')
      .select(`
        employee_id,
        employees!inner(nombre, cedula),
        total_horas,
        total_pago,
        pausas_activas_realizadas
      `)
      .gte('fecha', weekDates[0])
      .lte('fecha', weekDates[6]);

    const stats = {};
    resumen?.forEach(r => {
      const nombre = r.employees.nombre;
      if (!stats[nombre]) {
        stats[nombre] = {
          totalHoras: 0,
          totalPago: 0,
          totalPausas: 0,
          dias: 0
        };
      }
      stats[nombre].totalHoras += r.total_horas;
      stats[nombre].totalPago += r.total_pago;
      stats[nombre].totalPausas += r.pausas_activas_realizadas;
      stats[nombre].dias += 1;
    });

    console.log('\n👤 POR EMPLEADO:');
    Object.entries(stats).forEach(([nombre, data]) => {
      console.log(`${nombre}:`);
      console.log(`  📅 Días trabajados: ${data.dias}`);
      console.log(`  ⏰ Total horas: ${data.totalHoras.toFixed(1)}h`);
      console.log(`  💰 Total pago semana: $${data.totalPago.toLocaleString()}`);
      console.log(`  🧘 Pausas activas: ${data.totalPausas}`);
      console.log('');
    });

    console.log('🎉 ¡Datos de prueba generados exitosamente!');
    console.log('\n🏠 Ahora puedes entrar al dashboard de Luisa (cedula: 12345678) para ver todos los datos');
    console.log('🔗 URL: http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ Error generando datos:', error);
    process.exit(1);
  }
}

// Ejecutar script
generateTestData(); 