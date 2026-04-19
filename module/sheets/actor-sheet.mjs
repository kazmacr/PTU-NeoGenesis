/**
 * Clase base para las hojas de personaje de PTU Neo Genesis.
 */
export class PTUNGActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["ptunga", "sheet", "actor"],
      width: 800,
      height: 700,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "general" }]
    });
  }

  /** @override */
  get template() {
    // Esto permite que el sistema elija automáticamente el archivo .hbs según el tipo de actor
    return `systems/ptu-neogenesis/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /** @override */
  getData() {
    const context = super.getData();
    const actorData = this.actor.toObject(false);

    context.system = actorData.system;
    context.flags = actorData.flags;
    context.config = CONFIG.PTUNG; // Acceso a los diccionarios de config.mjs

    // Preparamos las listas de ítems según el tipo de actor
    if (actorData.type === 'pokemon') {
      this._prepareItems(context);
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

    // Recorremos todos los ítems del actor y los clasificamos
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      if (i.type === 'move') moves.push(i);
      else if (i.type === 'ability') abilities.push(i);
      else if (i.type === 'poketrait') poketraits.push(i);
    }

    // Inyectamos las listas filtradas en el contexto de la ficha
    context.moves = moves;
    context.abilities = abilities;
    context.poketraits = poketraits;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Si el actor es un Pokémon, activamos los controles específicos
    if (this.actor.type === 'pokemon') {
      
      // CREAR ÍTEM (Movimientos, Habilidades, etc)
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
  }

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
}