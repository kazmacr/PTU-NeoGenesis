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

  /** @override */
  _onDropItem(event, data) {
    // Aquí implementaremos la lógica para heredar stats de la especie pronto
    return super._onDropItem(event, data);
  }
}