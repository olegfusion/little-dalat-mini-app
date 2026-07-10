import { useState, useEffect } from 'react';
import { MenuItem, CategoryInfo, Language } from '../types';
import { fetchMenuByCategory, fetchCategories } from '../api/client';
import { useCart } from '../context/CartContext';
import { t } from '../i18n';
import MenuList from '../components/MenuList';

interface CategoryProps {
  categoryId: string;
  language: Language;
  onBack: () => void;
}

export default function Category({ categoryId, language, onBack }: CategoryProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [category, setCategory] = useState<CategoryInfo | null>(null);
  const [selectedVariantItem, setSelectedVariantItem] = useState<string | null>(null);
  const { state, dispatch } = useCart();

  useEffect(() => {
    fetchMenuByCategory(categoryId).then(setItems).catch(console.error);
    fetchCategories().then(cats => {
      const cat = cats.find(c => c.id === categoryId);
      if (cat) setCategory(cat);
    }).catch(console.error);
  }, [categoryId]);

  const cartQuantities: Record<string, number> = {};
  state.items.forEach(ci => {
    const key = `${ci.menuItemId}_${ci.variantIndex ?? ''}`;
    cartQuantities[key] = (cartQuantities[key] || 0) + ci.quantity;
  });

  const handleAdd = (item: MenuItem, variantIndex?: number) => {
    dispatch({ type: 'ADD_ITEM', payload: { menuItemId: item.id, quantity: 1, variantIndex } });
  };

  const handleRemove = (item: MenuItem, variantIndex?: number) => {
    const key = `${item.id}_${variantIndex ?? ''}`;
    const currentQty = cartQuantities[key] || 0;
    if (currentQty <= 1) {
      dispatch({ type: 'REMOVE_ITEM', payload: { menuItemId: item.id, variantIndex } });
    } else {
      dispatch({ type: 'UPDATE_QTY', payload: { menuItemId: item.id, variantIndex, quantity: currentQty - 1 } });
    }
  };

  const handleSelectVariant = (item: MenuItem) => setSelectedVariantItem(item.id);
  const handleVariantPick = (item: MenuItem, index: number) => {
    handleAdd(item, index);
  };

  if (!category) return null;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#8B7355] mb-4">← {t('back', language)}</button>
      <MenuList
        items={items}
        category={category}
        language={language}
        cartQuantities={cartQuantities}
        onAdd={handleAdd}
        onRemove={handleRemove}
        onSelectVariant={handleSelectVariant}
        selectedVariantItem={selectedVariantItem}
        onVariantPick={handleVariantPick}
        onBackFromVariants={() => setSelectedVariantItem(null)}
      />
    </div>
  );
}
