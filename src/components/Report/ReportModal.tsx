import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flag, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId: string;
  quoteContent: string;
  quoteAuthor: string;
}

interface FormErrors {
  description?: string;
  general?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  quoteId,
  quoteContent,
  quoteAuthor,
}) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setDescription('');
      setErrors({});
      setShowSuccess(false);
    }
  }, [isOpen]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate description
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters long';
    } else if (description.trim().length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    if (!user) {
      setErrors({ general: 'You must be signed in to submit a report' });
      return;
    }

    try {
      setLoading(true);

      // Check if user has already reported this quote
      const { data: existingReport } = await supabase
        .from('interactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('quote_id', quoteId)
        .eq('type', 'report')
        .single();

      if (existingReport) {
        setErrors({ general: 'You have already reported this quote' });
        setLoading(false);
        return;
      }

      // Submit the report
      const { error: reportError } = await supabase
        .from('interactions')
        .insert({
          user_id: user.id,
          quote_id: quoteId,
          type: 'report'
        });

      if (reportError) throw reportError;

      setShowSuccess(true);
      
      // Auto-close after showing success message
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting report:', error);
      setErrors({ general: 'Failed to submit report. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);
    
    // Clear description error when user starts typing
    if (errors.description && value.trim().length >= 20) {
      setErrors(prev => ({ ...prev, description: undefined }));
    }
  };

  const remainingChars = 500 - description.length;
  const isDescriptionValid = description.trim().length >= 20 && description.trim().length <= 500;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={!loading ? handleClose : undefined}
          />
          
          {/* Modal Container - Constrained to app width */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[350px] bg-white rounded-2xl shadow-xl max-h-[85vh] overflow-hidden mx-4"
          >
            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-full">
              <div className="p-5">
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="absolute top-3 right-3 z-10 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>

                {/* Header */}
                <div className="text-center mb-5 pr-6">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Flag className="text-red-600" size={20} />
                  </div>
                  
                  <h2 className="text-lg font-bold text-gray-800 font-inter mb-1">
                    Report Quote
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Help us maintain a safe community
                  </p>
                </div>

                {/* Success Message */}
                <AnimatePresence>
                  {showSuccess && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      className="mb-5 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
                    >
                      <CheckCircle className="text-green-500 flex-shrink-0" size={18} />
                      <div>
                        <p className="text-green-700 font-medium text-sm">Report Submitted!</p>
                        <p className="text-green-600 text-xs mt-1">
                          Thank you for helping us maintain our community.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* General Error */}
                <AnimatePresence>
                  {errors.general && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
                    >
                      <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={14} />
                      <p className="text-red-700 text-sm">{errors.general}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                {!showSuccess && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Description Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for reporting
                      </label>
                      <div className="relative">
                        <textarea
                          value={description}
                          onChange={handleDescriptionChange}
                          placeholder="Please explain why you're reporting this quote (inappropriate content, spam, harassment, etc.)"
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm ${
                            errors.description 
                              ? 'border-red-300 bg-red-50' 
                              : isDescriptionValid 
                                ? 'border-green-300 bg-green-50' 
                                : 'border-gray-300'
                          }`}
                          rows={4}
                          maxLength={500}
                          disabled={loading}
                        />
                        
                        {/* Character Counter */}
                        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                          <span className={description.length > 480 ? 'text-red-500' : ''}>
                            {description.length}/500
                          </span>
                        </div>
                      </div>
                      
                      {/* Description Help Text */}
                      <div className="mt-1 text-xs text-gray-500">
                        Minimum 20 characters. Remaining: {remainingChars}
                      </div>
                      
                      {/* Description Error */}
                      <AnimatePresence>
                        {errors.description && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="mt-1 flex items-center gap-1 text-red-600 text-sm"
                          >
                            <AlertCircle size={12} />
                            <span>{errors.description}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <motion.button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </motion.button>
                      
                      <motion.button
                        type="submit"
                        disabled={loading || !isDescriptionValid}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
                        whileTap={{ scale: 0.98 }}
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Sending...
                          </>
                        ) : (
                          'Send Report'
                        )}
                      </motion.button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};