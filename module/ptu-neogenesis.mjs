// Importar Clases de Documentos
import { PTUNGActor } from "./documents/actor.mjs";
// Importar Clases de Hojas (Sheets)
import { PTUNGActorSheet } from "./sheets/actor-sheet.mjs";
// Importar Configuración
import { PTUNG } from "./helpers/config.mjs";

export class PTUNeogenesisItemSheet extends ItemSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["ptu-neogenesis", "sheet", "item"],
            width: 600,
            height: 550, // Lo hice un poco más alto para que los campos respiren mejor
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "datos" }]
        });
    }

    get template() {
        return `systems/ptu-neogenesis/templates/item/item-${this.item.type}-sheet.hbs`;
    }

    // NUEVO: Esta función prepara y envía los datos al HTML
    async getData(options) {
        // Obtenemos los datos base que Foundry genera para el ítem
        const context = await super.getData(options);
        
        // Inyectamos nuestro diccionario de configuración (Tipos, Categorías, etc.)
        // Asumo que tu diccionario global se llama CONFIG.PTUNG (basado en tu cuaderno de diseño)
        context.config = CONFIG.PTUNG; 
        
        // Creamos un atajo directo a "system" para que el HTML lea variables como {{system.diet}}
        context.system = context.item.system;
        
        return context;
    }
}

/* -------------------------------------------- */
/* Inicialización del Sistema                  */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  console.log(`PTU Neo Genesis | Inicializando Sistema`);

  // Registrar el objeto de configuración global para que sea accesible en todo el sistema
  CONFIG.PTUNG = PTUNG;

  // Definir clases personalizadas para los Documentos
  CONFIG.Actor.documentClass = PTUNGActor;

  // Registrar las hojas de Actor (Sheets)
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("ptu-neogenesis", PTUNGActorSheet, {
    types: ["pokemon"], // De momento solo para el Pokémon
    makeDefault: true,
    label: "PTUNG.SheetLabels.Pokemon"
  });

  // --- Ayudantes lógicos para el HTML (Handlebars Helpers) ---
  Handlebars.registerHelper('eq', function (a, b) { return a === b; });
  Handlebars.registerHelper('ne', function (a, b) { return a !== b; });
  Handlebars.registerHelper('lt', function (a, b) { return a < b; });
  Handlebars.registerHelper('concat', function (...args) {
    // Une los textos ignorando el último argumento interno de Handlebars
    return args.slice(0, -1).join('');
  });
  // --------------------------------------------------------------------------

  // Pre-cargar plantillas de Handlebars (Opcional por ahora, útil para partials)
  // return preloadHandlebarsTemplates();

  // Desregistrar la hoja por defecto de Foundry
    Items.unregisterSheet("core", ItemSheet);
    
    // Registrar tu nueva hoja personalizada
    Items.registerSheet("ptu-neogenesis", PTUNeogenesisItemSheet, { makeDefault: true });
});

/* -------------------------------------------- */
/* Configuración después de que el juego cargue */
/* -------------------------------------------- */

Hooks.once('ready', async function() {
  // Aquí podemos poner lógica que ocurra al abrir el mundo, como migraciones.
});