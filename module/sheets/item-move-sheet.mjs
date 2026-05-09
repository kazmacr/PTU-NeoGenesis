export class PTUNeogenesisItemSheet extends ItemSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["ptu-neogenesis", "sheet", "item"],
            width: 650,
            height: 650,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "datos" }]
        });
    }

    get template() {
        return `systems/ptu-neogenesis/templates/item/item-${this.item.type}-sheet.hbs`;
    }

    async getData(options) {
        const context = await super.getData(options);
        const item = this.item;
        context.system = item.system;
        context.config = CONFIG.PTUNG || {};

        // --- LÓGICA DE BOTONES DINÁMICOS PARA LA AUTOMATIZACIÓN ---
        const buttons = [];
        if (item.system.automation?.enabled) {
            const name = item.name.trim();
            // Aquí programas individualmente cada ítem
            if (name.includes("Entrenamiento Intensivo (Celeridad)")) {
                buttons.push({ label: "Orden: Celeridad", action: "apply-celerity" });
            } else if (name.includes("Entrenamiento Intensivo (Movilidad")) {
                buttons.push({ label: "Orden: Movilidad", action: "apply-mobility" });
            } else if (name.includes("Entrenamiento Intensivo (Tonificación)")) {
                buttons.push({ label: "Orden: Tonificación", action: "apply-toning" });
            } else if (name.includes("Entrenamiento Intensivo (Inspiración)")) {
                buttons.push({ label: "Orden: Inspiración", action: "apply-inspiration" });
            } else if (name === "Agilidad") {
                buttons.push({ label: "Effecto: Agilidad", action: "apply-agile" });
            } else if (name === "Danza Dragón") {
                buttons.push({ label: "Efecto: MC +1 Atk/Spd", action: "apply-ddance" });
            }
        }
        context.automationButtons = buttons;

        const descripcionBase = item.system.description || "";
        context.enrichedDescription = await TextEditor.enrichHTML(descripcionBase, {
            async: true,
            relativeTo: this.item
        });
        return context;
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Listener para el Checkbox de automatización
        html.find('.btn-execute-automation').click(ev => {
            const action = ev.currentTarget.dataset.action;
            this._executeAutomation(action);
        });

        html.find('select').change(ev => {
            const select = ev.currentTarget;
            this.item.update({ [select.name]: select.value });
        });
    }

    async _executeAutomation(action) {
        // 1. Verificar que haya un objetivo (Target)
        const targetToken = Array.from(game.user.targets)[0]?.actor;
        const targetActor = targetToken.actor;

        if(!targetActor) return ui.notifications.warn("Selecciona un token como objetivo");
        
        // BONOS TEMPORALES
        const temporaryChanges = [
            { key: "system.modifiers.accuracy", mode: 2, value: "1" },
            { key: "system.modifiers.critRange", mode: 2, value: "1" },
            { key: "system.modifiers.effectRange", mode: 2, value: "1" }
        ];

        // BONOS PERMANENTES
        const permanentChanges = [];
        let label = "";
        let icon = "";

        // 2. Lógica de actualización por acción
        switch (action) {
            // CASO: Entrenamiento de Celeridad
            case "apply-celerity":
                permanentChanges.push({ key: "system.modifiers.initiative", mode: 2, value: "5" });
                label = "Celeridad";
                icon = "icons/magic/movement/abstract-ribbons-red-orange.webp";
                break;
            
            // CASO: Entrenamiento de Movilidad
            case "apply-mobility":
                permanentChanges.push({ key: "system.modifiers.capabilities", mode: 2, value: "2" });
                label = "Movilidad";
                icon = "icons/skills/movement/arrows-up-trio-red.webp";
                break;

            // CASO: Entrenamiento de Tonificación
            case "apply-toning":
                permanentChanges.push({ key: "system.modifiers.skillChecks", mode: 2, value: "1" });
                label = "Tonificación";
                icon = "icons/skills/melee/unarmed-punch-fist-red.webp";
                break;

            // CASO: Entrenamiento de Inspiración
            case "apply-inspiration":
                permanentChanges.push({ key: "system.modifiers.saveChecks", mode: 2, value: "3" });
                label = "Inspiración";
                icon = "icons/magic/control/hand-grasping-orb-blue.webp";
                break;

            // CASO: Movimiento Agilidad
            case "apply-agile":
                permanentChanges.push({ key: "system.stats.spd.value", mode: 2, value: "2" });
                label = "Agilidad";
                icon = "icons/skills/movement/feet-winged-boots-glowing-yellow.webp";
                break;

            // CASO: Movimiento Danza Dragón
            case "apply-ddance":
                await targetActor.update({
                    "system.stats.atk.combatStages": Math.min(targetActor.system.stats.atk.combatStages + 1, 6),
                    "system.stats.spd.combatStages": Math.min(targetActor.system.stats.spd.combatStages + 1, 6)
                });
                break;

            // CASO: Movimiento que sube MCs (Ej: Danza Espada o Danza Dragón)
            case "apply-ddance": // Danza Dragón: +1 Atk, +1 Spd
                await this._updateCombatStages(targetActor, {
                    "atk": 1,
                    "spd": 1
                });
                break;

            case "apply-sdance": // Danza Espada: +2 Atk
                await this._updateCombatStages(targetActor, {
                    "atk": 2
                });
                break;

            // CASO: Movimiento que baja MCs (Ej: Gruñido)
            case "apply-growl": // Gruñido: -1 Atk
                await this._updateCombatStages(targetActor, {
                    "atk": -1
                });
                break;

            // Se pueden seguir añadiendo casos aquí para automatizar efectos ...
        }
        await this._applyDualEffect(targetActor, label, permanentChanges, temporaryChanges, icon);
    }

    /**
     * Función que gestiona la aplicación dual: Permanente y Temporal
     */
    async _applyDualEffect(target, type, permChanges, tempChanges, icon) {
        // A. LIMPIEZA DE ENTRENAMIENTOS PREVIOS (Tanto permanentes como temporales)
        const oldEffects = target.effects.filter(e => e.name.includes("Entrenamiento:")) || e.name.includes("Orden de Combate:");
        for (let e of oldEffects) await e.delete();

        // B. APLICACIÓN DE EFECTO PERMANENTE (Stats: Iniciativa, Movilidad, Atributos, Salvaciones, etc...)
        await target.createEmbeddedDocuments("ActiveEffect", [{
            name: `Orden de Combate: ${type}`, icon: icon, changes: permChanges, duration: {}, origin: this.item.uuid, "flags.ptung.isPermanent": true
        }]);

        // C. APLICAR EL EFECTO TEMPORAL (+1 precisión, rango critico, efecto, entre otros)
        await target.createEmbeddedDocuments("ActiveEffect", [{
            name: `Orden de Combate: ${type}`, icon: "icons/svg/aura.svg", changes: tempChanges, duration: { turns: 1 }, origin: this.item.uuid, "flags.ptung.isTemporary": true
        }]);

        ui.notifications.info(`Entrenamiento de ${type} establecido y Orden aplicada.`)
    }

    // Funciones auxiliares
    async _applyOrder(target, type, changes) {
        const old = target.effects.find(e => e.name.includes("Orden:"));
        if (old) await old.delete();
        await this._applyEffect(target, `Orden: ${type}`, changes);
    }

    async _applyEffect(target, name, changes) {
        await target.createEmbeddedDocuments("ActiveEffect", [{
            name: name, icon: this.item.img, changes: changes, duration: { turns: 1 }
        }]);
        ui.notifications.info(`¡${name} aplicado a ${target.name}!`);
    }

    /**
   * Función auxiliar para actualizar MCs de forma segura (Min -6, Max 6)
   * @param {Actor} actor - El actor a modificar
   * @param {Object} modifications - Objeto con el stat y la cantidad (ej: {atk: 1})
   */
  async _updateCombatStages(actor, modifications) {
    const updateData = {};
    const currentStats = actor.system.stats;

    for (let [stat, value] of Object.entries(modifications)) {
        let currentMC = currentStats[stat].combatStages || 0;
        // Calculamos el nuevo valor limitándolo entre -6 y 6
        let newMC = Math.clamped(currentMC + value, -6, 6);
        
        updateData[`system.stats.${stat}.combatStages`] = newMC;
    }

    // Aplicamos todos los cambios en una sola operación
    await actor.update(updateData);
    
    // Feedback visual para el usuario
    ui.notifications.info(`Estadísticas de ${actor.name} actualizadas.`);
  }
}