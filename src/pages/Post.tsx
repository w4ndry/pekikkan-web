import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MobileLayout } from '../components/Layout/MobileLayout';
import { BottomNavigation } from '../components/Layout/BottomNavigation';
import { MetaTags } from '../components/SEO/MetaTags';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSEO } from '../hooks/useSEO';
import { analytics } from '../utils/analytics';
import toast from 'react-hot-toast';

export const Post: React.FC = () => {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const seoData = useSEO();

  useEffect(() => {
    // Track page view
    analytics.trackPageView(location.pathname, 'Post Quote - Share Inspiration');
  }, [location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;

    if (!content.trim() || !author.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('quotes')
        .insert({
          content: content.trim(),
          author: author.trim(),
          user_id: user.id,
        });

      if (error) throw error;

      // Track successful quote post
      analytics.trackEngagement('post_quote');
      analytics.trackEvent({
        action: 'quote_posted',
        category: 'Content Creation',
        label: author.trim(),
      });

      toast.success('Quote posted successfully!');
      setContent('');
      setAuthor('');
    } catch (error) {
      console.error('Error posting quote:', error);
      toast.error('Failed to post quote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MetaTags {...seoData} />
      <MobileLayout>
        <div className="h-screen pb-20">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-800 font-inter mb-6">Share a Quote</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quote Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter an inspirational quote..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows={6}
                  maxLength={500}
                  required
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {content.length}/500
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Quote author (e.g., Maya Angelou, Unknown)"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  maxLength={100}
                  required
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Posting...' : 'Post Quote'}
              </motion.button>
            </form>
          </div>
        </div>
        <BottomNavigation />
      </MobileLayout>
    </>
  );
};