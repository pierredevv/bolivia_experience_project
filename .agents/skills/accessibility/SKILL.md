---
name: "accessibility_rules"
description: "Aplica las reglas de accesibilidad UI/UX, contrastes y usabilidad pensadas para turistas internacionales y locales."
---

# Directrices de Accesibilidad UI/UX

## 1. Contraste y Legibilidad en Exteriores
- **Problema:** Los turistas usan la app bajo la intensa luz del sol (especialmente en el Salar de Uyuni o a gran altitud en La Paz).
- **Regla:** El contraste de texto principal contra fondos debe superar el ratio WCAG AA (4.5:1). Prohibido usar textos grises claros (`text-gray-400`) sobre fondos blancos para información vital (precios, horarios).

## 2. Internacionalización y Cognición
- **Iconografía:** Usar iconos universales. Un turista que no habla español debe poder identificar restaurantes, baños y terminales de transporte de un vistazo.
- **Touch Targets:** En pantallas móviles (Flutter) y web mobile (React), los botones de acción principal (`Call to Action`) deben tener al menos `48x48 dp/px` para evitar clics erróneos mientras el turista camina o está en movimiento.

## 3. Soporte Bilingüe
- Siempre diseñar las interfaces considerando que las palabras en inglés y español tienen longitudes diferentes. Evitar contenedores con alturas fijas que rompan el texto.
