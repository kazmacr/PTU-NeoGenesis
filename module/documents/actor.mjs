/**
 * Extensión de la clase base Actor para manejar la lógica de PTU Neo Genesis.
 */
export class PTUNGActor extends Actor {

  /** @override */
  prepareData() {
    // Llamada a la preparación nativa de Foundry antes de aplicar las reglas del sistema
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Aquí iría la lógica que ocurre antes de procesar los Items.
    // De momento queda en blanco.
  }

  /** @override */
  prepareDerivedData() {
    const actorData = this;
    const system = actorData.system;

    // Se redirigen las funciones específicas dependiendo del tipo de Actor
    if (actorData.type === 'pokemon') {
      this._preparePokemonData(system);
    }
  }

  /**
   * Calcular todas las estadísticas derivadas del Pokémon.
   * @param {Object} system - El objeto de datos del sistema actor.
   */
  _preparePokemonData(system) {
    const level = system.level || 1;
    const bspFactor = Math.floor(level / 10);

    // Tabla de Multiplicadores de Modificadores de Combate (MC)
    const mcMultipliers = {
      6: 2.2, 5: 2.0, 4: 1.8, 3: 1.6, 2: 1.4, 1: 1.2,
      0: 1.0,
      "-1": 0.9, "-2": 0.8, "-3": 0.7, "-4": 0.6, "-5": 0.5, "-6": 0.4
    };

    // 1. CÁLCULO DE ESTADÍSTICAS TOTALES
    for (let [key, stat] of Object.entries(system.stats)) {
      // Se aplica el bono de BSP según la elección del usuario
      let bspBonus = 0;
      if (system.bsp.primary === key) bspBonus = bspFactor * 3;
      else if (system.bsp.secondary === key) bspBonus = bspFactor * 2;
      else if (system.bsp.tertiary === key) bspBonus = bspFactor * 1;

      // Suma base = Base + Añadido + Naturaleza + BSP
      let statSumaBase = (stat.base || 0) + (stat.added || 0) + (stat.natureModifier || 0) + bspBonus;

      // Aplicar Modificadores de Combate (MC)
      if (key !== 'hp') {
        const mcValue = Math.min(Math.max(stat.combatStages || 0, -6), 6);
        const multiplier = mcMultipliers[mcValue] || 1;
        stat.total = Math.floor(statSumaBase * multiplier);
      } else {
        stat.total = statSumaBase;
      }
    }

    // 2. CALCULAR LAS EVASIONES
    system.evasion.physical.value = Math.floor(system.stats.def.total / 5) + (system.evasion.physical.mod || 0);
    system.evasion.special.value = Math.floor(system.stats.spdef.total / 5) + (system.evasion.special.mod || 0);
    system.evasion.speed.value = Math.floor(system.stats.spd.total / 5) + (system.evasion.speed.mod || 0);

    // 3. CALCULAR LOS PUNTOS DE VIDA MÁXIMOS
    system.health.max = (level * 2) + (system.stats.hp.total * 3) + 10;

    // 4. CALCULAR CAPACIDADES DE DESPLAZAMIENTO (Afectadas por la MC de Velocidad)
    // Se saca la MC de Velocidad, rango de -6 y +6
    const speedMC = Math.min(Math.max(system.stats.spd.combatStages || 0, -6), 6);
    // La función Math.trunc elimina los decimales y conserva el signo (ej: 5/2 = 2.5 -> 2; -5/2 = -2.5 -> -2)
    const speedMod = Math.trunc(speedMC / 2);

    for (let [capKey, cap] of Object.entries(system.capabilities)) {
      // Se aplica el bono de velocidad solo a los movimientos de desplazamiento
      if (["overland", "swim", "sky", "burrow", "jump"].includes(capKey)) {
        // La capacidad resultante no puede reducirse por debajo de 2 por el MC
        cap.total = Math.max(2, (cap.base || 0) + speedMod);
      } else {
        // Para Poder (Power), usamos solo la base
        cap.total = cap.base || 0;
      }
    }

    // 5. CÁLCULO DE LÍMITE DE MOVIMIENTOS
    // Base 6 + movimientos extra, con un tope absoluto de 10.
    system.maxMoves = Math.min(7 + (system.extraMoves || 0), 11);
  }
}