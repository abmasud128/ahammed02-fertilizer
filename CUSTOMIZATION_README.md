# Ahammed Fertilizer: Web Customization Guide

This quick reference guide explains how to customize text, colors, products, and the 3D model in your upgraded Next.js web application.

---

## 1. How to Edit Business Information & Text
All business details are centralized in one file:
- **Location**: `src/config/site.ts`
- **Fields you can change**:
  - `phone`: raw digits for calling (e.g. `'9091017035'`)
  - `phoneFormatted`: formatted display string (e.g. `'+91 90910 17035'`)
  - `whatsapp`: WhatsApp destination number
  - `address`: English postal address (`line1`, `line2`, `pin`, `state`, `country`, `full`)
  - `addressbn`: Bengali translation of the postal address
  - `hours` & `hoursbn`: Shop operating schedule
  - `licences`: Registered government fertilizer & pesticide dealership licenses

### Translations & Multilingual Strings
- English: `src/i18n/en.json`
- Bengali: `src/i18n/bn.json`

---

## 2. How to Edit Brand Colors & Styling
Brand theme colors are defined using CSS variables in Tailwind CSS v4:
- **Location**: `src/app/globals.css`
- **Theme Variables**:
  - `--color-forest`: `#0B3D2E` (Primary deep forest agritech green)
  - `--color-leaf`: `#2E9E4F` (Fresh vegetative accent green)
  - `--color-harvest`: `#F2B705` (Warm gold highlight & trust accents)
  - `--color-cream`: `#FDF8F0` (Natural warm background)
  - `--color-soil`: `#5C4033` (Bengal alluvial earth tone)
  - `--color-dark-bg`: `#0A1A14` (Dark mode background)
  - `--color-dark-surface`: `#122A1F` (Dark mode cards and surfaces)

---

## 3. How to Manage Products
All agricultural inputs (fertilizers, pesticides, seeds, micronutrients) are defined in:
- **Location**: `src/data/products.ts`
- **Key Products Featured**:
  1. `NPK 19:19:19 Water Soluble` (`slug: 'npk-19-19-19'`)
  2. `Zinc Plus (Chelated Zn 12% + Multi-Micronutrients)` (`slug: 'zinc-plus'`)
  3. `Crop Guard Broad-Spectrum Bio-Protector` (`slug: 'crop-guard'`)
- To feature any product on the homepage grid, simply set `featured: true` on that product object.

---

## 4. How to Adjust the 3D Scene & Fallback
The 3D hero scene is located in:
- **Location**: `src/components/three/HeroScene.tsx`
- **Scene Objects**:
  - `FertilizerBag`: Procedural sack with stitched seal and golden quality badge.
  - `PesticideBottle`: Agrochemical flask with child-resistant ribbed cap.
  - `GrowingPlantMound`: Rich Bengal soil mound with wind-oscillating stem & leaves.
  - `Particles`: Instanced floating pollen/granule dewdrops (`count={32}`).
- **Mobile / Low-End Fallback**:
  - Handled by `HeroSceneFallback`. When devices have low concurrency (`hardwareConcurrency < 3`) or slow 2G/3G connections, the app displays the lightweight CSS float illustration without running heavy WebGL contexts, ensuring instant 60fps interaction on budget Android phones.
