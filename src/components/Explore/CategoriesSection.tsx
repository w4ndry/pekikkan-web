import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { Category } from '../../hooks/useExplore';

interface CategoriesSectionProps {
  categories: Category[];
  onCategoryClick: (category: Category) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  categories,
  onCategoryClick,
}) => {
  const categoryColors = [
    'from-blue-500 to-blue-600',
    'from-pink-500 to-rose-600',
    'from-purple-500 to-indigo-600',
    'from-yellow-500 to-orange-600',
    'from-green-500 to-emerald-600',
    'from-red-500 to-pink-600',
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="text-orange-600" size={24} />
        <h2 className="text-xl font-semibold text-gray-800">Categories</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category, index) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onCategoryClick(category)}
            className={`bg-gradient-to-r ${categoryColors[index % categoryColors.length]} rounded-lg p-4 text-white cursor-pointer hover:scale-105 transition-transform`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">{category.icon}</div>
              <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
              <p className="text-xs opacity-90 line-clamp-2">
                {category.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};