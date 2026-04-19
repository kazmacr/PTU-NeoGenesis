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

  // Pre-cargar plantillas de Handlebars (Opcional por ahora, útil para partials)
  // return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/* Configuración después de que el juego cargue */
/* -------------------------------------------- */

Hooks.once('ready', async function() {
  // Aquí podemos poner lógica que ocurra al abrir el mundo, como migraciones.
});