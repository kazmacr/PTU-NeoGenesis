/**
 * Clase especialista para las fichas de Items (Movimientos y Especies)
 */
export class PTUNeogenesisItemSheet extends ItemSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["ptu-neogenesis", "sheet", "item"],
            width: 650,
            height: 650,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "datos" }]
        });
    }

    /** @override */
    get template() {
        return `systems/ptu-neogenesis/templates/item/item-${this.item.type}-sheet.hbs`;
    }

    /** @override */
    async getData(options) {
        const context = await super.getData(options);
        context.system = this.item.system;
        context.config = CONFIG.PTUNG || {}; 
        
        // Procesamiento de descripción enriquecida
        const descripcionBase = this.item.system.description || "";
        context.enrichedDescription = await TextEditor.enrichHTML(descripcionBase, {
            async: true,
            relativeTo: this.item
        });

        return context;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Listener para actualizar selectores al primer cambio
        html.find('select').change(ev => {
            const select = ev.currentTarget;
            const name = select.name;
            const value = select.value;
            
            // Actualizamos directamente el ítem para que el cambio sea instantáneo
            this.item.update({ [name]: value });
        });
    }
}