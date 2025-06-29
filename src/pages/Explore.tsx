import React from 'react';
import { MobileLayout } from '../components/Layout/MobileLayout';
import { BottomNavigation } from '../components/Layout/BottomNavigation';
import { Search, TrendingUp, Users, BookOpen } from 'lucide-react';

export const Explore: React.FC = () => {
  return (
    <MobileLayout>
      <div className="h-screen pb-20">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800 font-inter mb-6">Explore</h1>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search quotes, authors..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
              <TrendingUp className="text-primary" size={24} />
              <div>
                <h3 className="font-semibold text-gray-800">Trending</h3>
                <p className="text-sm text-gray-600">Most liked quotes today</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-lg">
              <Users className="text-green-600" size={24} />
              <div>
                <h3 className="font-semibold text-gray-800">Popular Authors</h3>
                <p className="text-sm text-gray-600">Most followed creators</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500/10 to-orange-500/5 rounded-lg">
              <BookOpen className="text-orange-600" size={24} />
              <div>
                <h3 className="font-semibold text-gray-800">Categories</h3>
                <p className="text-sm text-gray-600">Browse by topics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </MobileLayout>
  );
};