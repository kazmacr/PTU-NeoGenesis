// 1. IMPORTACIONES
import { PTUNGActor } from "./documents/actor.mjs";
import { PTUNGActorSheet } from "./sheets/actor-sheet.mjs";
import { PTUNG } from "./helpers/config.mjs";
// IMPORTANTE: Importamos la clase de los movimientos
import { PTUNeogenesisItemSheet } from "./sheets/item-move-sheet.mjs";

Hooks.once('init', async function () {
  console.log(`PTU Neo Genesis | Inicializando Sistema`);

  // 1. CONFIGURACIÓN GLOBAL
  CONFIG.PTUNG = PTUNG;
  CONFIG.Actor.documentClass = PTUNGActor;

  // 2. CONFIGURACIÓN DE ICONOS POR DEFECTO
  // Esto asigna la imagen en la interfaz visual de Foundry
  const itemIcons = {
    "move": "icons/svg/d20-grey.svg",
    "species": "systems/ptu-neogenesis/assets/images/species/images/0000.jpg",
    "ability": "icons/svg/book.svg",
    "feature": "icons/svg/aura.svg"
  };

  Object.entries(itemIcons).forEach(([type, path]) => {
    CONFIG.Item.typeIcons[type] = path;
  });

  CONFIG.Item.documentClass.DEFAULT_ICON = "icons/svg/item-bag.svg";

  // 3. REGISTRAR HOJA DE ACTOR
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("ptu-neogenesis", PTUNGActorSheet, {
    types: ["pokemon"],
    makeDefault: true
  });

  // 4. REGISTRAR HOJA DE ITEMS
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("ptu-neogenesis", PTUNeogenesisItemSheet, { 
    makeDefault: true 
  });
});

/* -------------------------------------------- */
/* INTERCEPTOR DE CREACIÓN (FUERZA BRUTA)      */
/* -------------------------------------------- */
// Este Hook se dispara justo antes de que un item se guarde en la base de datos.
// Obliga a Foundry a usar nuestros iconos ignorando la caché.
Hooks.on("preCreateItem", (item, data, options, userId) => {
  // Si el item no tiene imagen o tiene la bolsa por defecto, aplicamos la nuestra
  if (!data.img || data.img === "icons/svg/item-bag.svg") {
    const defaultIcons = {
      "move": "icons/svg/d20-grey.svg",
      "species": "systems/ptu-neogenesis/assets/images/species/images/0000.jpg",
      "ability": "icons/svg/book.svg",
      "feature": "icons/svg/aura.svg",
      "gear": "icons/svg/item-bag.svg",
      "poketrait": "icons/svg/dna.svg"
    };

    if (defaultIcons[item.type]) {
      item.updateSource({ img: defaultIcons[item.type] });
    }
  }
});
