import { useState, useEffect } from 'react';
import { CategoryInfo, Language } from '../types';
import { fetchCategories } from '../api/client';
import CategoryGrid from '../components/CategoryGrid';

interface HomeProps {
  language: Language;
  onSelectCategory: (id: string) => void;
}

export default function Home({ language, onSelectCategory }: HomeProps) {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-sm text-[#8B7355]">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6 text-center space-y-2">
        <img src="/logo.avif" alt="Little Dalat" className="w-20 h-20 mx-auto rounded-full object-cover border-2 border-[#C5B5A5]/30" />
        <h1 className="font-serif text-xl font-black italic text-[#5A2C11]">Little Dalat Coffee & Tea</h1>
        <p className="text-xs text-[#8B7355]">02 Thi Sách, Phước Hòa, Nha Trang</p>
        <p className="text-[10px] text-[#8B7355]">🕐 07:00–22:00 (GMT+7) | 📞 0912 066 973</p>
      </div>
      <CategoryGrid categories={categories} language={language} onSelect={onSelectCategory} />
    </div>
  );
}
