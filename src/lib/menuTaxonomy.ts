export interface MenuTaxonomyCategory {
  value: string;
  label: string;
  subcategories: string[];
}

export const MENU_TAXONOMY: MenuTaxonomyCategory[] = [
  {
    value: "Grilled Sanga's",
    label: "Grilled Sanga's",
    subcategories: ["Cheesy", "Classic", "Breakfast", "Chicken"],
  },
  {
    value: "Premium Sanga's",
    label: "Premium Sanga's",
    subcategories: ["Beef", "Pork", "Tuna", "Vegetarian", "Deli"],
  },
  {
    value: "Refreshments",
    label: "Refreshments",
    subcategories: ["Dirty Sodas", "Spiders", "Smoothies"],
  },
  {
    value: "Salad Cups",
    label: "Salad Cups",
    subcategories: ["Chicken", "Tuna", "Bean Mix"],
  },
];

export const DEFAULT_MENU_CATEGORY = MENU_TAXONOMY[0]?.value ?? "General";

export function getSubcategoryOptions(category: string): string[] {
  return MENU_TAXONOMY.find((entry) => entry.value === category)?.subcategories ?? [];
}
