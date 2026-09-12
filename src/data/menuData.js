export const menuData = {
  takeaway: {
    label: 'Take Away',
    items: [
      { name: 'Café con leche', description: 'En vaso o taza grande, leche cremosa.', price: '1400' },
      { name: 'Cortado', description: 'Espresso con un toque de leche.', price: '1200' },
      { name: 'Cappuccino', description: 'Espresso, leche vaporizada y espuma.', price: '1600' },
      { name: 'Té / Infusiones', description: 'Selección de bolsitas importadas.', price: '1200' },
      { name: 'Medialunas x2', description: 'De manteca, recién horneadas.', price: '900' },
      { name: 'Tostado simple', description: 'Jamón y queso en pan de miga.', price: '1800' },
      { name: 'Tostado completo', description: 'Jamón, queso, tomate y lechuga.', price: '2200' },
      { name: 'Empanada frita', description: 'De carne cortada a cuchillo. Por unidad.', price: '800' },
    ],
  },
  pasteleria: {
    label: 'Pastelería',
    items: [
      { name: 'Croissant de manteca', description: 'Elaborado en casa, hojaldrado.', price: '1400' },
      { name: 'Pain au chocolat', description: 'Masa hojaldrada con corazón de chocolate belga.', price: '1600' },
      { name: 'Chocotorta Lacan', description: 'La versión de la casa: más oscura, más densa.', price: '2400' },
      { name: 'Budín de limón', description: 'Húmedo, glaseado con limón.', price: '1800' },
      { name: 'Tarta de frutos rojos', description: 'Masa sablé, crema pastelera y frambuesas.', price: '2600' },
      { name: 'Alfajor artesanal', description: 'Dulce de leche, coco y chocolate.', price: '1200' },
    ],
  },
  desayunos: {
    label: 'Desayunos y Meriendas',
    items: [
      { name: 'Desayuno Lacan', description: 'Café con leche, 2 medialunas, jugo de naranja natural.', price: '2800' },
      { name: 'Desayuno Francés', description: 'Café, croissant, manteca, mermelada casera.', price: '3200' },
      { name: 'Merienda completa', description: 'Té o café, tostadas con 2 dips, fruta.', price: '2600' },
      { name: 'Licuado + tostadas', description: 'Licuado de fruta de estación, 2 tostadas con dips.', price: '3500' },
      { name: 'Jugo + tostado', description: 'Jugo natural, tostado jamón y queso.', price: '3250' },
      { name: 'Yogur con granola', description: 'Yogur natural, granola artesanal, miel.', price: '2200' },
    ],
  },
  promos: {
    label: 'Promos',
    items: [
      { name: 'Café Doble + 2 Medialunas', description: 'El clásico porteño de las mañanas.', price: '1850' },
      { name: 'Jugo + Tostado', description: 'Jugo natural de naranja y tostado de jamón y queso.', price: '3250' },
      { name: 'Licuado + Tostadas con dos dips', description: 'Licuado de fruta, tostadas y dips de la casa.', price: '3500' },
      { name: '3 Empanadas + Copa de vino', description: 'Empanadas fritas y copa de Malbec Mendoza.', price: '3600' },
      { name: 'Happy Hour (18–20hs)', description: 'Dos cervezas tiradas al precio de una.', price: '2800' },
      { name: 'Menú del mediodía', description: 'Plato del día + bebida + postre.', price: '4500' },
    ],
  },
  especial: {
    label: 'Especial Lacan',
    items: [
      {
        name: 'Picada Lacan',
        description: 'Queso dambo, muzzarelitas, surimis, jamón crudo y aceitunas. Para dos que pican tres.',
        price: '7800',
        badge: 'Estrella',
      },
      {
        name: 'Soupe à l\'Oignon',
        description: 'La clásica sopa de cebolla francesa, gratinada con queso gruyère. El toque Lacan.',
        price: '3600',
        badge: 'Signature',
      },
      {
        name: 'Milanesa Lacan para compartir',
        description: 'Dos milanesas a caballo con papas fritas. El plato de la casa.',
        price: '7800',
        badge: 'Para 2',
      },
      {
        name: 'Tabla de quesos y fiambres',
        description: 'Selección de quesos maduros, salames, pickles y pan casero.',
        price: '6500',
      },
      {
        name: 'Bruschette del barrio',
        description: 'Pan de campo tostado, tomate cherry, albahaca y aceite de oliva virgen.',
        price: '3200',
      },
      {
        name: 'Tarta del día',
        description: 'Tarta caliente de la temporada, según lo que llegó del mercado.',
        price: '2800',
      },
    ],
  },
  bar: {
    label: 'Bar',
    items: [
      { name: 'Malbec copa', description: 'Mendoza, uva Malbec. Robusto y frutal.', price: '1800' },
      { name: 'Torrontés copa', description: 'Salta, aromático y fresco.', price: '1800' },
      { name: 'Cerveza artesanal tirada', description: 'Rubia o roja, de producción local.', price: '2200' },
      { name: 'Cerveza importada', description: 'Stella Artois, Heineken o Guinness.', price: '2600' },
      { name: 'Fernet con Coca', description: 'El ritual porteño. Largo o corto.', price: '2400' },
      { name: 'Aperol Spritz', description: 'Aperol, Prosecco, soda y naranja.', price: '3200' },
      { name: 'Campari Soda', description: 'Campari, soda y rodaja de naranja.', price: '2800' },
      { name: 'Botella Malbec', description: 'Selección de la casa, Mendoza.', price: '8500' },
      { name: 'Botella Torrontés', description: 'Selección de la casa, Salta.', price: '8500' },
      { name: 'Agua mineral', description: 'Con o sin gas, 500ml.', price: '900' },
      { name: 'Gaseosas', description: 'Coca-Cola, Sprite, Manaos.', price: '1000' },
    ],
  },
  almacen: {
    label: 'Almacén Natural',
    items: [
      { name: 'Mermelada artesanal', description: 'De damasco, frambuesa o higos. Frasco 250g.', price: '2800' },
      { name: 'Dulce de leche repostero', description: 'De producción artesanal. Frasco 350g.', price: '3200' },
      { name: 'Aceite de oliva extra virgen', description: 'Cosecha propia, Mendoza. 250ml.', price: '4500' },
      { name: 'Té orgánico seleccionado', description: 'Caja x10 saquitos, varias hierbas.', price: '2200' },
      { name: 'Café en grano', description: 'Blend de la casa, 250g. Molido a pedido.', price: '3800' },
      { name: 'Granola artesanal', description: 'Avena, miel, frutos secos. Bolsa 300g.', price: '2600' },
    ],
  },
};

export const categories = Object.entries(menuData).map(([key, val]) => ({
  key,
  label: val.label,
}));
