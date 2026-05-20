export class PTUNGActor extends Actor {

  /** @override */
  prepareData() {
    if (!this.system) return;
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    super.prepareBaseData();

    // 1. Inicializamos los modificadores en 0 ANTES de que actúen los Efectos Activos
    this.system.modifiers = {
      accuracy: 0,
      critRange: 0,
      effectRange: 0,
      initiative: 0,
      saveChecks: 0,
      capabilities: 0,
      skillChecks: 0
    };

    // 2. Si es un Pokémon, aseguramos que tenga su contenedor de capacidades listo
    if (this.type === 'pokemon') {
      this.system.capabilities = this.system.capabilities || {
        suelo: 0, nado: 0, salto: 0, alcance: 0, vigor: 0, cielo: 0, cavar: 0
      };
    }
  }

  /**
   * Cálculos automatizados exclusivos para Pokémon
   */
  _preparePokemonDerivedData(system) {
    // --------------------------------------------------------
    // 1. CÁLCULO DE EVASIONES
    // --------------------------------------------------------
    const defTotal = system.stats.def.total || 0;
    const sdefTotal = system.stats.sdef.total || 0;
    const velTotal = system.stats.spd.total || 0;

    system.evasion.physical.value = Math.floor(defTotal / 5) + (system.evasion.physical.mod || 0);
    system.evasion.special.value  = Math.floor(sdefTotal / 5) + (system.evasion.special.mod || 0);
    system.evasion.speed.value    = Math.floor(velTotal / 5) + (system.evasion.speed.mod || 0);

    // --------------------------------------------------------
    // 2. CÁLCULO DE PUNTOS DE SALUD (MAX HP)
    // --------------------------------------------------------
    const psPuro = (system.stats.hp.base || 0) + (system.stats.hp.added || 0) + (system.stats.hp.natureModifier || 0);
    const defPura = (system.stats.def.base || 0) + (system.stats.def.added || 0) + (system.stats.def.natureModifier || 0);
    const sdefPura = (system.stats.sdef.base || 0) + (system.stats.sdef.added || 0) + (system.stats.sdef.natureModifier || 0);

    const statsDefensivos = defPura + sdefPura; // DEF + SDEF (Sin MC)
    
    // A) Vida máxima SIN heridas
    const maxHpSinHeridas = (psPuro * 3) + statsDefensivos + 10;
    system.health.maxSinHeridas = maxHpSinHeridas; 
    
    // B) Vida máxima CON heridas
    const heridas = system.health.injuries || 0;
    
    // Se resta el 10% (0.1) por cada herida
    const penalizacionHeridas = Math.floor(maxHpSinHeridas * (heridas * 0.1));
    const maxHpFinal = maxHpSinHeridas - penalizacionHeridas;

    // Asignamos el valor final para que actualice el token
    system.health.max = maxHpFinal;
  }


  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    const actorData = this;
    const system = actorData.system;

    // Solo hacemos cálculos matemáticos si el actor es un Pokémon
    if (actorData.type === 'pokemon') {
      this._preparePokemonData(system);
    }

    // Si el actor es un Entrenador, aplicamos la lógica específica de entrenador
    if (actorData.type === 'trainer') {
      this._prepareTrainerData(actorData);
    }

    // Lógica para atributos de Pokémon y Entrenador
    // Ahora le pasamos actorData completo porque necesitamos leer modifiers
    if (system.skills) {
      this._prepareSkills(actorData);
    }
  }

  /**
   * Lógica matemática específica del Entrenador
   */
  _prepareTrainerData(actorData) {
    const system = actorData.system;
    const level = system.level || 1;
    const modifiers = system.modifiers || {};

    // ==========================================
    // 1. CÁLCULO DE STATS TOTALES Y VIDA MÁXIMA
    // ==========================================
    system.stats = system.stats || {};
    for (let [key, stat] of Object.entries(system.stats)) {
      stat.total = (stat.base || 5) + (stat.added || 0);
    }

    if (system.stats.hp) {
      system.health = system.health || {};
      system.health.max = (system.stats.hp.total * 3) + (level * 4) + 10;
    }

    // ==========================================
    // 2. CONVERSIÓN DE RANGOS A NÚMEROS
    // ==========================================
    const getRankLevel = (rankStr) => {
      const map = { "patetico": 1, "inexperto": 2, "novato": 3, "adepto": 4, "experto": 5, "maestro": 6 };
      return map[rankStr] || 2; 
    };

    const skills = system.skills || {};
    const acro = getRankLevel(skills.acrobacias?.rank);
    const atle = getRankLevel(skills.atletismo?.rank);
    const comb = getRankLevel(skills.combate?.rank);

    // ==========================================
    // 3. CAPACIDADES DE DESPLAZAMIENTO (BASE)
    // ==========================================
    system.capabilities = system.capabilities || {};
    system.capabilities.suelo = 3 + Math.floor((acro + atle) / 2);
    system.capabilities.nado = Math.floor(system.capabilities.suelo / 2);
    system.capabilities.salto = Math.floor(acro / 2);
    system.capabilities.alcance = 4 + atle;

    let vigorBonus = 0;
    if (atle >= 3) vigorBonus += 1;
    if (comb >= 4) vigorBonus += 1;
    system.capabilities.vigor = 4 + vigorBonus;

    system.capabilities.cielo = 0;
    system.capabilities.cavar = 0;

    // ==========================================
    // 4. LECTURA DINÁMICA DE ETIQUETAS (TAGS)
    // ==========================================
    const features = this.items.filter(i => i.type === "feature" || i.type === "trait");
    let globalCapsBonus = 0;

    for (let item of features) {
      const tags = item.system.tags || "";

      const checkCap = (capName) => {
        const regex = new RegExp(`\\[\\+${capName} (\\d+)\\]`, "i");
        const match = tags.match(regex);
        return match ? parseInt(match[1]) : 0;
      };

      system.capabilities.suelo += checkCap("Suelo");
      system.capabilities.nado += checkCap("Nado");
      system.capabilities.salto += checkCap("Salto");
      system.capabilities.alcance += checkCap("Alcance");
      system.capabilities.vigor += checkCap("Vigor");
      system.capabilities.cielo += checkCap("Cielo");
      system.capabilities.cavar += checkCap("Cavar");

      const globalMatch = tags.match(/\[\+Capacidades (\d+)\]/i);
      if (globalMatch) globalCapsBonus += parseInt(globalMatch[1]);
    }

    if (globalCapsBonus > 0) {
      system.capabilities.suelo += globalCapsBonus;
      system.capabilities.nado += globalCapsBonus;
      system.capabilities.salto += globalCapsBonus;
      if (system.capabilities.cielo > 0) system.capabilities.cielo += globalCapsBonus;
      if (system.capabilities.cavar > 0) system.capabilities.cavar += globalCapsBonus;
    }

    // ==========================================
    // 5. PUNTOS DE ACCIÓN Y LÍMITES DE TALENTOS
    // ==========================================
    system.actionPoints = system.actionPoints || {};
    system.actionPoints.total = 5 + Math.floor(level / 3);

    const trainerData = system.trainer || {};
    let talentLimit = 5 + Math.max(0, level - 1);
    if (level >= 2) talentLimit += 1;
    if (level >= 15) talentLimit += 1;

    system.talentLimits = {
      base: talentLimit,
      extra: trainerData.extraTalents || 0,
      current: features.filter(i => i.type === "feature").length
    };

    // ==========================================
    // 6. APLICAR MODIFICADORES TEMPORALES (ENTRENADOR)
    // ==========================================
    const capMod = Number(modifiers.capabilities) || 0;
    if (capMod !== 0) {
      system.capabilities.suelo += capMod;
      system.capabilities.nado += capMod;
      system.capabilities.salto += capMod;
      if (system.capabilities.cielo > 0) system.capabilities.cielo += capMod;
      if (system.capabilities.cavar > 0) system.capabilities.cavar += capMod;
    }

    system.initiative = system.initiative || {};
    system.initiative.value = (system.stats.spd?.total || 5) + (Number(modifiers.initiative) || 0);
  }

  /**
   * Lógica matemática específica del Pokémon
   */
  _preparePokemonData(system) {
    const modifiers = system.modifiers || {};

    // 1. Asegurar estructuras base
    system.bsp = system.bsp || { primary: "", secondary: "", tertiary: "" };
    system.health = system.health || { value: 10, max: 10, injuries: 0 };

    // 2. Umbrales de Salud
    system.health.tick = Math.floor(system.health.max / 10);
    system.health.half = Math.floor(system.health.max / 2);
    system.health.third = Math.floor(system.health.max / 3);
    system.health.quarter = Math.floor(system.health.max / 4);
    system.health.eighth = Math.floor(system.health.max / 8);
    system.health.sixteenth = Math.floor(system.health.max / 16);

    // 3. Bonos BSP
    let bspBonus = Math.floor((system.level || 1) / 10);
    system.bsp.mod1 = bspBonus * 3;
    system.bsp.mod2 = bspBonus * 2;
    system.bsp.mod3 = bspBonus * 1;

    // 4. CICLO DE STATS (ESTE ES EL QUE DEBES REEMPLAZAR)
    system.stats = system.stats || {};
    const statKeys = ["hp", "atk", "def", "satk", "sdef", "spd"];

    // Tabla de multiplicadores para Etapas de Combate (MC)
    const mcMultipliers = {
      "-6": 0.4, "-5": 0.5, "-4": 0.6, "-3": 0.7, "-2": 0.8, "-1": 0.9,
      "0": 1, "1": 1.2, "2": 1.4, "3": 1.6, "4": 1.8, "5": 2.0, "6": 2.2
    };

    for (let k of statKeys) {
      // Aseguramos que el stat tenga todos sus campos
      system.stats[k] = system.stats[k] || { base: 0, added: 0, combatStages: 0, natureModifier: 0, total: 0 };
      const stat = system.stats[k];

      // Cálculo base: Base + Añadido + Mod. Naturaleza
      let totalBase = (stat.base || 0) + (stat.added || 0) + (stat.natureModifier || 0);
      
      // Aplicar el multiplicador de Etapa de Combate (MC)
      const mult = mcMultipliers[stat.combatStages] || 1;
      
      // El total final es la base por el multiplicador (redondeado hacia abajo)
      stat.total = Math.floor(totalBase * mult);
    }

    // 5. Capacidades y Modificadores Temporales
    system.capabilities = system.capabilities || {};
    const capNames = ["suelo", "nado", "salto", "alcance", "vigor", "cielo", "cavar"];
    for (let cap of capNames) {
        system.capabilities[cap] = Number(system.capabilities[cap]) || 0;
    }

    const capMod = Number(modifiers.capabilities) || 0;
    if (capMod !== 0) {
      system.capabilities.suelo += capMod;
      system.capabilities.nado += capMod;
      system.capabilities.salto += capMod;
      system.capabilities.alcance += capMod;
      system.capabilities.vigor += capMod;
      if (system.capabilities.cielo > 0) system.capabilities.cielo += capMod;
      if (system.capabilities.cavar > 0) system.capabilities.cavar += capMod;
    }

    system.initiative = system.initiative || {};
    system.initiative.value = (system.stats.spd?.total || 5) + (Number(modifiers.initiative) || 0);
    system.saveChecks = (Number(system.saveChecks) || 0) + (Number(modifiers.saveChecks) || 0);
  }

  _prepareSkills(actorData) {
    const system = actorData.system;
    const modifiers = system.modifiers || {};

    const rankMap = {
      "patetico": { level: 1, dice: 2, bonus: 0 },
      "inexperto": { level: 2, dice: 3, bonus: 0 },
      "novato": { level: 3, dice: 3, bonus: 2 },
      "adepto": { level: 4, dice: 3, bonus: 4 },
      "experto": { level: 5, dice: 3, bonus: 6 },
      "maestro": { level: 6, dice: 3, bonus: 8 }
    };

    const skillMod = Number(modifiers.skillChecks) || 0;

    for (let [key, skill] of Object.entries(system.skills)) {
      const config = rankMap[skill.rank] || rankMap["inexperto"];

      skill.rankLevel = config.level;
      skill.value = config.dice;

      skill.totalMod = (skill.mod || 0) + config.bonus + skillMod;
      skill.rollFormula = `${skill.value}d6${skill.totalMod >= 0 ? '+' + skill.totalMod : skill.totalMod}`;
    }
  }
}