/**
 * Clase base para las hojas de personaje de PTU Neo Genesis.
 */
export class PTUNGActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["ptunga", "sheet", "actor"],
      width: 850,
      height: 750,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "general" }]
    });
  }

  /** @override */
  get template() {
    return `systems/ptu-neogenesis/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }


/** @override */
  async getData() {
    const context = await super.getData();
    const actorData = this.actor.toObject(false);

    context.system = actorData.system;
    context.flags = actorData.flags;
    context.config = CONFIG.PTUNG; 
    context.editable = this.isEditable;

    // --- ENRIQUECIMIENTO DE TEXTO PARA ENTRENADORES ---
    // Procesamos la Biografía
    context.enrichedBiography = await TextEditor.enrichHTML(this.actor.system.biography ?? "", {
      async: true, secrets: this.actor.isOwner, relativeTo: this.actor
    });

    // Procesamos la Descripción Física
    context.enrichedPhysicalDescription = await TextEditor.enrichHTML(this.actor.system.physicalDescription ?? "", {
      async: true, secrets: this.actor.isOwner, relativeTo: this.actor
    });

    // Procesamos las Notas del Jugador
    context.enrichedPlayerNotes = await TextEditor.enrichHTML(this.actor.system.playerNotes ?? "", {
      async: true, secrets: this.actor.isOwner, relativeTo: this.actor
    });

    this._prepareItems(context);

    if (actorData.type === 'trainer') {
      context.pokemonTeam = this._getPokemonTeam();
    }

    return context;
  }

  /**
   * Organiza los ítems del actor en categorías para las pestañas.
   */
  _prepareItems(context) {
    const moves = [];
    const abilities = [];
    const poketraits = [];
    const features = [];
    const traits = [];
    const gear = [];

    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;

      // Clasificación universal según el template.json
      if (i.type === 'move') moves.push(i);
      else if (i.type === 'ability') abilities.push(i);
      else if (i.type === 'poketrait') poketraits.push(i);
      else if (i.type === 'feature') features.push(i);
      else if (i.type === 'trait') traits.push(i);
      else if (i.type === 'gear') gear.push(i);
    }

    context.moves = moves;
    context.abilities = abilities;
    context.poketraits = poketraits;
    context.features = features;
    context.traits = traits;
    context.gear = gear;
  }

  /**
   * Placeholder para obtener los Pokémon del equipo.
   */
  _getPokemonTeam() {
    return [];
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // --- ESCUCHADORES UNIVERSALES (Pokémon y Entrenador) ---

    // TIRADAS DE DADOS (Atributos, Iniciativa, etc.)
    html.find('.rollable').click(this._onRoll.bind(this));

    // CREAR ÍTEM
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // EDITAR ÍTEM
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // BORRAR ÍTEM
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });
  }

  /**
   * Maneja las tiradas de dados desde la ficha.
   * @param {Event} event   El evento de clic originador
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // 1. Obtenemos la etiqueta técnica (ej: "edOculta")
    const skillKey = dataset.label;

    // 2. LA MAGIA: Traducimos la etiqueta técnica usando el es.json
    // Esto convertirá "edOculta" en "Ed. Oculta" o "Educación Oculta"
    const label = game.i18n.localize(`PTUNG.Skills.${skillKey}`);

    // 3. Ejecutamos la tirada
    if (dataset.roll) {
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      label ? roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `Tirada de ${label}` // <--- Aquí es donde aparece el texto en el chat
      }) : roll.toMessage();
    }
  }
  
  /**
   * Maneja las tiradas de dados desde la ficha leyendo el atributo data-roll.
   */
 /*_onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const formula = element.dataset.roll;
    const label = element.dataset.label ? `Tirada de ${element.dataset.label.capitalize()}` : "";

    if (formula) {
      let roll = new Roll(formula, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }*/

  /**
   * Maneja la creación de nuevos ítems desde los botones "+"
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const itemData = {
      name: `Nuevo ${type.capitalize()}`,
      type: type,
      system: {}
    };
    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

/**
 * Evento para que al arrastrar a una especie a la ficha del pokémon se importen los datos del 
 * mismo a la ficha para que pueda ser construida la ficha.
 */
/** @override */
  async _onDropItem(event, data) {
    // 1. Obtenemos el ítem que se está soltando desde el Compendio o la barra lateral
    const item = await Item.fromDropData(data);
    
    // 2. Verificamos si es un ítem de tipo "species" y si el actor es un "pokemon"
    if (item.type === "species" && this.actor.type === "pokemon") {
      return this._importSpeciesData(item);
    }

    // Si no es una especie, dejamos que Foundry maneje el drop normalmente (añadir el ítem al inventario)
    return super._onDropItem(event, data);
  }

  /**
   * Lógica para mapear los datos de la Especie al Pokémon
   */
  async _importSpeciesData(species) {
    const sData = species.system;
    
    // Función auxiliar para extraer el rango de habilidad (ej: de "3d6+4" extrae el 3)
    const parseSkill = (skillString) => {
      if (!skillString) return 2;
      const match = skillString.match(/^(\d)d6/);
      return match ? parseInt(match[1]) : 2;
    };

    // 1. Preparar el objeto de actualización con mapeo de Inglés -> Español
    const updateData = {
      "name": species.name,
      "img": species.img, // Usa la ruta directa: systems/ptu-neogenesis/assets/images/species/images/XXXX.png
      "prototypeToken.texture.src": species.img,
      
      "system.species": species.name,
      "system.type1": sData.type1 || "",
      "system.type2": sData.type2 || "",
      
      // STATS 
      "system.stats.hp.base": sData.stats?.hp?.base || 0,
      "system.stats.atk.base": sData.stats?.atk?.base || 0,
      "system.stats.def.base": sData.stats?.def?.base || 0,
      "system.stats.satk.base": sData.stats?.spatk?.base || 0,
      "system.stats.sdef.base": sData.stats?.spdef?.base || 0,
      "system.stats.spd.base": sData.stats?.spd?.base || 0,

      // CAPACIDADES
      "system.capabilities.suelo": sData.capabilities?.overland || 0,
      "system.capabilities.nado": sData.capabilities?.swim || 0,
      "system.capabilities.salto": sData.capabilities?.jump || 0,
      "system.capabilities.cielo": sData.capabilities?.sky || 0,
      "system.capabilities.cavar": sData.capabilities?.burrow || 0,
      "system.capabilities.vigor": sData.capabilities?.power || 0,

      // ATRIBUTOS 
      "system.skills.acrobacia.base": parseSkill(sData.skills?.acrobatics),
      "system.skills.atletismo.base": parseSkill(sData.skills?.athletics),
      "system.skills.combate.base": parseSkill(sData.skills?.combat),
      "system.skills.sigilo.base": parseSkill(sData.skills?.stealth),
      "system.skills.percepcion.base": parseSkill(sData.skills?.perception),
      "system.skills.enfoque.base": parseSkill(sData.skills?.focus)
    };

    // 2. Aplicar los cambios al actor
    await this.actor.update(updateData);
    
    // 3. Notificación detallada
    ui.notifications.info(`Especie ${species.name} importada correctamente con imagen y capacidades.`);
  }

}