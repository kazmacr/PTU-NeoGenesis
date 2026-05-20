/**
 * Clase base para las hojas de personaje de PTU Neo Genesis.
 */
export class PTUNGActorSheet extends ActorSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["ptunga", "sheet", "actor"],
      width: 850,
      height: 750,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "general" }]
    });
  }

  get template() {
    return `systems/ptu-neogenesis/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  async getData() {
    const context = await super.getData();
    const actorData = this.actor.toObject(false);
    context.system = actorData.system;
    context.flags = actorData.flags;
    context.config = CONFIG.PTUNG; 
    context.editable = this.isEditable;
    
    context.enrichedBiography = await TextEditor.enrichHTML(this.actor.system.biography ?? "", { async: true, secrets: this.actor.isOwner, relativeTo: this.actor });
    context.enrichedPhysicalDescription = await TextEditor.enrichHTML(this.actor.system.physicalDescription ?? "", { async: true, secrets: this.actor.isOwner, relativeTo: this.actor });
    context.enrichedPlayerNotes = await TextEditor.enrichHTML(this.actor.system.playerNotes ?? "", { async: true, secrets: this.actor.isOwner, relativeTo: this.actor });

    this._prepareItems(context);

    if (actorData.type === 'trainer') context.pokemonTeam = this._getPokemonTeam();
    return context;
  }

  _prepareItems(context) {
    const moves = [], abilities = [], poketraits = [], features = [], traits = [], gear = [], specialCapabilities = []; 
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      if (i.type === 'move') moves.push(i);
      else if (i.type === 'ability') abilities.push(i);
      else if (i.type === 'poketrait') poketraits.push(i);
      else if (i.type === 'feature') features.push(i);
      else if (i.type === 'trait') traits.push(i);
      else if (i.type === 'gear') gear.push(i);
      else if (i.type === 'specialCapability') specialCapabilities.push(i);
    }
    context.moves = moves; context.abilities = abilities; context.poketraits = poketraits;
    context.features = features; context.traits = traits; context.gear = gear;
    context.specialCapabilities = specialCapabilities; 
  }

  _getPokemonTeam() { return []; }

  activateListeners(html) {
    super.activateListeners(html);
    html.find('.rollable').click(this._onRoll.bind(this));
    html.find('.item-create').click(this._onItemCreate.bind(this));
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });
  }

  _onRoll(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    const label = game.i18n.localize(`PTUNG.Skills.${dataset.label}`);
    if (dataset.roll) {
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor: this.actor }), flavor: `Tirada de ${label}` });
    }
  }

  _onItemCreate(event) {
    event.preventDefault();
    const type = event.currentTarget.dataset.type;
    return this.actor.createEmbeddedDocuments("Item", [{ name: `Nuevo ${type.capitalize()}`, type: type, system: {} }]);
  }

  /** @override */
  async _onDropItem(event, data) {
    const item = await Item.fromDropData(data);
    if (item.type === "species" && this.actor.type === "pokemon") return this._importSpeciesData(item);
    return super._onDropItem(event, data);
  }

  async _importSpeciesData(species) {
    // CAPA 1: Validación total antes de tocar nada
    if (!species || !species.system) {
        console.error("Importación abortada: El ítem no tiene 'system'.", species);
        return;
    }

    const sData = species.system;

    // CONSTRUCCIÓN DEL TEXTO DE GRUPOS HUEVO
    // Filtramos elementos nulos o vacíos para evitar comas sueltas
    const grupos = [sData.eggGroup1, sData.eggGroup2].filter(g => g && g.trim() !== "");
    const eggGroupText = grupos.join(", ");

    // Traductor de rangos (con validación de seguridad)
    const getRank = (name) => {
      const val = sData.skills?.[name];
      const str = val ? String(val).toLowerCase() : "";
      if (str.includes("2d6") || str.includes("1d6")) return "patetico";
      if (str.includes("+2") || str.includes("+1")) return "novato";
      if (str.includes("+4") || str.includes("+3")) return "adepto";
      if (str.includes("+6") || str.includes("+5")) return "experto";
      if (str.includes("+8") || str.includes("+7") || str.includes("+9")) return "maestro";
      return "inexperto";
    };

    // Actualización Base segura
    await this.actor.update({
      "name": species.name, 
      "img": species.img, 
      "prototypeToken.texture.src": species.img,
      "system.species": species.name, 
      "system.type1": sData.type1 || "", 
      "system.type2": sData.type2 || "",
      "system.diet": sData.diet || "Desconocida", 
      // "system.eggGroup": [sData.eggGroup1, sData.eggGroup2].filter(Boolean).join(", "),
      "system.eggGroup1": sData.eggGroup1 || "", 
      "system.eggGroup2": sData.eggGroup2 || "",
      "system.stats.hp.base": sData.stats?.hp?.base || 0, 
      "system.stats.atk.base": sData.stats?.atk?.base || 0,
      "system.stats.def.base": sData.stats?.def?.base || 0, 
      "system.stats.satk.base": sData.stats?.spatk?.base || sData.stats?.satk?.base || 0,
      "system.stats.sdef.base": sData.stats?.spdef?.base || sData.stats?.sdef?.base || 0, 
      "system.stats.spd.base": sData.stats?.spd?.base || 0,
      "system.capabilities.overland.base": sData.capabilities?.overland || 0, 
      "system.capabilities.swim.base": sData.capabilities?.swim || 0,
      "system.capabilities.jump.base": sData.capabilities?.jump || 0, 
      "system.capabilities.sky.base": sData.capabilities?.sky || 0,
      "system.capabilities.burrow.base": sData.capabilities?.burrow || 0, 
      "system.capabilities.power.base": sData.capabilities?.power || 0,
      "system.capabilities.suelo": sData.capabilities?.overland || 0, 
      "system.capabilities.nado": sData.capabilities?.swim || 0,
      "system.capabilities.salto": sData.capabilities?.jump || 0, 
      "system.capabilities.cielo": sData.capabilities?.sky || 0,
      "system.capabilities.cavar": sData.capabilities?.burrow || 0, 
      "system.capabilities.vigor": sData.capabilities?.power || 0,
      "system.skills.acrobacias.rank": getRank("acrobatics"), 
      "system.skills.atletismo.rank": getRank("athletics"),
      "system.skills.combate.rank": getRank("combat"), 
      "system.skills.sigilo.rank": getRank("stealth"),
      "system.skills.percepcion.rank": getRank("perception"), 
      "system.skills.concentracion.rank": getRank("focus")
    });

    // CAPA 2: Lógica de Capacidades Especiales Blindada
    // Usamos ?. para evitar errores si 'lists' o 'specialCapabilities' no existen.
    const rawCaps = sData.lists?.specialCapabilities;
    
    if (rawCaps) {
        let listaFinal = [];
        // Si viene como lista o string, lo procesamos. Si no, lo ignoramos.
        if (Array.isArray(rawCaps)) {
            listaFinal = rawCaps;
        } else if (typeof rawCaps === 'string') {
            listaFinal = rawCaps.split(',').map(s => s.trim());
        }

        if (listaFinal.length > 0) {
            // Borrar antiguas
            const viejas = this.actor.items.filter(i => i.type === "specialCapability").map(i => i.id);
            if (viejas.length > 0) await this.actor.deleteEmbeddedDocuments("Item", viejas);
            
            // Crear nuevas (filtro extra para evitar strings vacíos)
            await this.actor.createEmbeddedDocuments("Item", listaFinal
                .filter(n => n && String(n).trim() !== "")
                .map(n => ({ name: String(n).trim(), type: "specialCapability" })));
        }
    }
    
    ui.notifications.info(`Importación de ${species.name} completa.`);
  }

}