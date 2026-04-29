export const PTUNG = {};

/**
 * Lista de caracteristicas
 */
PTUNG.stats = {
  "hp": "PS",
  "atk": "ATK",
  "def": "DEF",
  "satk": "SATK",
  "sdef": "DEF",
  "spd": "VEL"
};

/**
 * Tipos de Pokémon
 */
PTUNG.tipos = {
  "acero":"Acero",
  "agua":"Agua",
  "bicho":"Bicho",
  "dragon":"Dragón",
  "electrico":"Eléctrico",
  "fantasma":"Fantasma",
  "fuego":"Fuego",
  "hada":"Hada",
  "hielo":"Hielo",
  "lucha":"Lucha",
  "normal":"Normal",
  "planta":"Planta",
  "psiquico":"Psíquico",
  "roca":"Roca",
  "siniestro":"Siniestro",
  "tierra":"Tierra",
  "veneno":"Veneno",
  "volador":"Volador"
};

/**
 * Categorías de Movimientos
 */
PTUNG.categorias = {
  "fisico":"Físico",
  "especial":"Especial",
  "estatus":"Estatus"
};

/**
 * Frecuencias de uso
 */
PTUNG.frecuencias = {
  "voluntad":"A Voluntad",
  "recarga":"Recarga",
  "xpa":"X PA",
  "escenax":"Escena X",
  "diariox":"Diario X",
  "xusos":"X Usos"
};

/**
 * Tabla de Daño Base (DB)
 */
PTUNG.damageBase = {
  "1":"1d6+1",
  "2":"1d6+3",
  "3":"1d6+5",
  "4":"1d8+6",
  "5":"1d6+8",
  "6":"2d6+8",
  "7":"2d6+10",
  "8":"2d8+10",
  "9":"2d10+10",
  "10":"3d8+10",
  "11":"3d10+10",
  "12":"3d12+10",
  "13":"4d10+10",
  "14":"4d10+15",
  "15":"4d10+20",
  "16":"5d10+20",
  "17":"5d12+25",
  "18":"6d12+25",
  "19":"6d12+30",
  "20":"6d12+35",
  "21":"6d12+40",
  "22":"6d12+45",
  "23":"6d12+50",
  "24":"6d12+55",
  "25":"6d12+60",
  "26":"7d12+65",
  "27":"7d12+70",
  "28":"8d12+80",
  "29":"8d12+85",
  "30":"9d12+90",
};

/**
 * Tipos de Dietas de los Pokémon
 */
PTUNG.dietas = {
  "herbivoro": "Herbívoro",
  "carnivoro": "Carnívoro",
  "omnivoro": "Omnívoro",
  "fototrofo": "Fotótrofo",
  "terrivoro": "Terrívoro",
  "ergovoro": "Ergóvoro",
  "filtrador": "Filtrador",
  "nulo": "Nulívoro"
};

/**
 * Sabores de Comida (Para Adora / Odia)
 */
PTUNG.sabores = {
  "picante": "Picante",
  "seco": "Seco",
  "dulce": "Dulce",
  "amargo": "Amargo",
  "acido": "Ácido",
  "ninguno": "Ninguno",
  "cualquiera": "Cualquiera"
};

/**
 * Vitaminas Consumibles
 */

PTUNG.vitaminas = {
  "menta": "Menta",
  "mas_ps": "Más PS",
  "proteina": "Proteína",
  "hierro": "Hierro",
  "calcio": "Calcio",
  "zinc": "Zinc",
  "carburante": "Carburante",
  "mas_pp": "Más PP"
};

/**
 * Consumibles para concursos 
 */
PTUNG.pokochos = {
  "alarde": "Alarde",
  "belleza": "Belleza", 
  "dulzura": "Dulzura",  
  "dureza": "Dureza", 
  "ingenio": "Ingenio"
};

/**
 * Genero del Pokémon 
 */
PTUNG.genero = {
  "macho": "Macho",
  "hembra": "Hembra", 
  "ninguno": "Ninguno"
};

/*
 * Efectos de Concurso (Descripciones completas)
 */
PTUNG.descripcionesConcurso = {
  "apelacion_reflejada": "Xd6 – X es igual al Furor del usuario.",
  "atencion_constante": "5d6 – El usuario gana 1 de Furor.",
  "atencion_dividida": "5d6 – Los participantes adyacentes ganan 1 de Furor.",
  "atencion_doble": "Xd6 – El usuario pierde 2 de Furor. X es igual al Furor de los participantes adyacentes menos el Furor del usuario.",
  "aun_no_habeis_visto_nada": "Xd6 – El usuario pierde todo su Furor. X es igual al Furor perdido de esta manera.",
  "confiable": "3d6 – Este Movimiento se puede usar varias veces seguidas. Si el usuario lo utilizó el turno anterior, en su lugar tira 1d6 y gana 1 de Furor.",
  "doble_o_nada": "5d6 – El usuario pierde 1 Punto de Apelación adicional al sacar 1 y gana 1 Punto de Apelación adicional al sacar 6. Se acumula con ser el Centro de Atención.",
  "emocionante": "3d6 – El usuario gana 2 de Furor.",
  "fastidiar": "3d6 – Los participantes adyacentes pierden tantos Puntos de Apelación como habría ganado el usuario. El usuario no gana Puntos de Apelación por esta tirada.",
  "gran_espectaculo": "1d6 – El usuario gana 3 de Furor.",
  "inquietante": "5d6 – El usuario pierde 2 de Furor y los participantes adyacentes pierden 1 de Furor."
};

/**
 * Naturalezas de los Pokémons
 */
PTUNG.nature = {
  "mimosa": "Mimosa [+PS -ATK]",
  "distraida": "Distraída [+PS -DEF]",
  "orgullosa": "Orgullosa [+PS -SATK]",
  "decidida": "Decidida [+PS -SDEF]",
  "paciente": "Paciente [+PS -VEL]",
  "desesperada": "Desesperada [+ATK -PS]",
  "huraña": "Huraña [+ATK -DEF]",
  "firme": "Firme [+ATK -SATK]",
  "picara": "Pícara [+ATK -SDEF]",
  "audaz": "Audaz [+ATK -VEL]",
  "rigida": "Rígida [+DEF -PS]",
  "osada": "Osada [+DEF -ATK]",
  "agitada": "Agitada [+DEF -SATK]",
  "floja": "Floja [+DEF -SDEF]",
  "placida": "Plácida [+DEF -VEL]",
  "curiosa": "Curiosa [+SATK -PS]",
  "modesta": "Modesta [+SATK -ATK]",
  "afable": "Afable [+SATK -DEF]",
  "alocada": "Alocada [+SATK -SDEF]",
  "mansa": "Mansa [+SATK -VEL]",
  "soñadora": "Soñadora [+SDEF -PS]",
  "serena": "Serena [+SDEF -ATK]",
  "amable": "Amable [+SDEF -DEF]",
  "cauta": "Cauta [+SDEF -SATK]",
  "grosera": "Grosera [+SDEF -VEL]",
  "asustadiza": "Asustadiza [+VEL -PS]",
  "miedosa": "Miedosa [+VEL -ATK]",
  "activa": "Activa [+VEL -DEF]",
  "alegre": "Alegre [+VEL -SATK]",
  "ingenua": "Ingenua [+VEL -SDEF]",
  "fuerte": "Fuerte [+ATK -ATK]",
  "docil": "Dócil [+DEF -DEF]",
  "timida": "Tímida [+SATK -SATK]",
  "rara": "Rara [+SDEF -SDEF]",
  "seria": "Seria [+VEL -VEL]",
  "calmada": "Calmada [+PS -PS]"
};

/**
 *  Modificadores de Combate (MC)
 */
PTUNG.combatStages = {
  "-6": "-6",
  "-5": "-5",
  "-4": "-4",
  "-3": "-3",
  "-2": "-2",
  "-1": "-1",
  "0": "0",
  "1": "+1",
  "2": "+2",
  "3": "+3",
  "4": "+4",
  "5": "+5",
  "6": "+6"
};

/**
  * Lista de palabras claves de movimientos
  */
PTUNG.keywords = {
  "potencia_bruta": "Potencia Bruta",
  "garra_dura": "Garra Dura",
  "experto": "Experto",
  "audaz": "Audaz",
  "puno_ferreo": "Puño Férreo",
  "megadisparador": "Megadisparador",
  "solista": "Solista",
  "mandibula_fuerte": "Mandíbula Fuerte",
  "cortante": "Cortante",
  "bola": "Bola",
  "patada": "Patada"
};

/**
 * Lista de propiedades de referencias para los movimientos
 */
PTUNG.properties = {
  "amistoso": "Amistoso",
  "atravesar": "Atravesar",
  "bola": "Bola",
  "colmillo": "Colmillo", 
  "condicion": "Condición", 
  "cortante": "Cortante",
  "curacion": "Curación",
  "danza": "Danza",
  "devastador": "Devastador",
  "embestir": "Embestir",
  "extenuante": "Extenuante",
  "golpes_duales": "Golpes Duales",
  "ilusorio": "Ilusorio",
  "inestable": "Inestable",
  "lluvia_golpes": "Lluvia de Golpes",
  "patada": "Patada",
  "polvo": "Polvo",
  "preparacion": "Preparación",
  "prioridad": "Prioridad",
  "puño": "Puño",
  "rafaga": "Ráfaga",
  "retroceso": "Retroceso",
  "social": "Social",
  "sonico": "Sónico",
  "temerario": "Temerario",
  "terrestre": "Terrestre",
};