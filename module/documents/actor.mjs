export class PTUNGActor extends Actor {

  /** @override */
  prepareData() {
    // SALVAVIDAS ABSOLUTO: Si el sistema falla al crearse, detenemos el código 
    // para evitar que Foundry colapse intentando leer la nada (null).
    if (!this.system) return;

    // Prepara los datos base de Foundry
    super.prepareData();
  }

  /** @override */
  prepareDerivedData() {
    const actorData = this;
    const system = actorData.system;

    // Solo hacemos cálculos matemáticos si el actor es un Pokémon
    if (actorData.type === 'pokemon') {
      this._preparePokemonData(system);
    }
  }

  /**
   * Lógica matemática específica del Pokémon
   */
  _preparePokemonData(system) {
    // Asegurar que BSP y Salud existen
    system.bsp = system.bsp || { primary: "", secondary: "", tertiary: "" };
    system.health = system.health || { value: 10, max: 10, injuries: 0 };

    // 1. Cálculos de Umbrales de Salud (Limpios y seguros)
    system.health.tick = Math.floor(system.health.max / 10);
    system.health.half = Math.floor(system.health.max / 2);
    system.health.third = Math.floor(system.health.max / 3);
    system.health.quarter = Math.floor(system.health.max / 4);
    system.health.eighth = Math.floor(system.health.max / 8);
    system.health.sixteenth = Math.floor(system.health.max / 16);

    // 2. Cálculos de Bonos BSP (Nivel / 10)
    let bspBonus = Math.floor((system.level || 1) / 10);
    system.bsp.mod1 = bspBonus * 3;
    system.bsp.mod2 = bspBonus * 2;
    system.bsp.mod3 = bspBonus * 1;
    
    // 3. Asegurar que BSP existe antes de calcular nada
    system.bsp = system.bsp || { primary: "", secondary: "", tertiary: "" };

    // 4. Asegurar que los Stats existen
    system.stats = system.stats || {};
    const statKeys = ["hp", "atk", "def", "satk", "sdef", "spd"];
    
    for (let k of statKeys) {
      // Inyectamos la estructura si por alguna razón no viene del template.json
      system.stats[k] = system.stats[k] || { base: 0, added: 0, combatStages: 0, natureModifier: 0, total: 0 };
      
      // Ejemplo de cálculo matemático ultra-seguro (con 'fallbacks' a 0):
      system.stats[k].total = (system.stats[k].base || 0) + (system.stats[k].added || 0);
    }
  }
}