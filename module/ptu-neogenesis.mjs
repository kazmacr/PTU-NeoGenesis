// Importar Clases de Documentos
import { PTUNGActor } from "./documents/actor.mjs";
// Importar Clases de Hojas (Sheets)
import { PTUNGActorSheet } from "./sheets/actor-sheet.mjs";
// Importar Configuración
import { PTUNG } from "./helpers/config.mjs";

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
});

/* -------------------------------------------- */
/* Configuración después de que el juego cargue */
/* -------------------------------------------- */

Hooks.once('ready', async function() {
  // Aquí podemos poner lógica que ocurra al abrir el mundo, como migraciones.
});