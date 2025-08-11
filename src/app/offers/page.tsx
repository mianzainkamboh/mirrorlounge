'use client';

import { useState, useEffect } from 'react';
import { 
  Offer,
  addOffer,
  updateOffer,
  deleteOffer,
  subscribeToOffersChanges,
  convertFileToBase64,
  compressImage
} from '@/lib/firebaseServicesNoStorage';

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    validFrom: '',
    validTo: '',
    isActive: true,
    usageLimit: undefined as number | undefined,
    image: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToOffersChanges(
      (updatedOffers) => {
        setOffers(updatedOffers);
        setLoading(false);
      },
      (error) => {
        console.error('Firebase connection error:', error);
        setLoading(false);
        alert('Firebase connection error. Please check the setup guide.');
      }
    );

    return () => unsubscribe();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, image: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setUploading(true);
    try {
      let imageBase64 = editingOffer?.imageBase64;
      
      // Convert image to base64 if new image selected
      if (imageFile) {
        try {
          // Compress image to reduce size (max 800px width, 80% quality)
          imageBase64 = await compressImage(imageFile, 800, 0.8);
        } catch {
          // Fallback to regular base64 conversion if compression fails
          imageBase64 = await convertFileToBase64(imageFile);
        }
      }

      if (editingOffer) {
        // Update existing offer
        await updateOffer(editingOffer.id!, {
          title: formData.title,
          description: formData.description,
          discountType: formData.discountType,
          discountValue: formData.discountValue,
          validFrom: formData.validFrom,
          validTo: formData.validTo,
          isActive: formData.isActive,
          usageLimit: formData.usageLimit,
          imageBase64: imageBase64,
          usedCount: editingOffer.usedCount // Keep existing usage count
        });
      } else {
        // Add new offer
        await addOffer({
          title: formData.title,
          description: formData.description,
          discountType: formData.discountType,
          discountValue: formData.discountValue,
          validFrom: formData.validFrom,
          validTo: formData.validTo,
          isActive: formData.isActive,
          usageLimit: formData.usageLimit,
          usedCount: 0,
          imageBase64: imageBase64
        });
      }

      resetForm();
    } catch (error) {
      console.error('Error saving offer:', error);
      alert('Error saving offer. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      validFrom: '',
      validTo: '',
      isActive: true,
      usageLimit: undefined,
      image: ''
    });
    setImageFile(null);
    setShowModal(false);
    setEditingOffer(null);
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      validFrom: offer.validFrom,
      validTo: offer.validTo,
      isActive: offer.isActive,
      usageLimit: offer.usageLimit,
      image: offer.imageBase64 || ''
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = async (offer: Offer) => {
    if (confirm('Delete this offer?')) {
      try {
        await deleteOffer(offer.id!);
      } catch (error) {
        console.error('Error deleting offer:', error);
        alert('Error deleting offer. Please try again.');
      }
    }
  };

  const toggleStatus = async (offer: Offer) => {
    try {
      await updateOffer(offer.id!, { isActive: !offer.isActive });
    } catch (error) {
      console.error('Error updating offer status:', error);
      alert('Error updating offer status. Please try again.');
    }
  };

  const formatDiscount = (offer: Offer) => {
    return offer.discountType === 'percentage' 
      ? `${offer.discountValue}%` 
      : `AED ${offer.discountValue}`;
  };

  const isExpired = (validTo: string) => {
    return new Date(validTo) < new Date();
  };

  const getOfferGradient = (index: number) => {
    const gradients = [
      'from-pink-400 to-rose-400',
      'from-rose-400 to-pink-400', 
      'from-yellow-400 to-amber-400',
      'from-amber-400 to-yellow-400',
      'from-pink-300 to-yellow-300',
      'from-rose-300 to-amber-300'
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <div className="p-3">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            <span className="ml-3 text-pink-600">Loading offers...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="max-w-5xl mx-auto">
        {/* Compact Header */}
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-medium text-pink-600 mb-1">Special Offers</h1>
              <p className="text-xs text-pink-500">Create and manage promotional banners</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border border-pink-200/50 hover:border-pink-300/50"
            >
              Create Offer
            </button>
          </div>
        </div>

        {/* Compact Banner-Style Offers */}
        <div className="space-y-3">
          {offers.map((offer, index) => (
            <div key={offer.id} className="bg-white/90 backdrop-blur-xl border border-pink-200/30 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(233,30,99,0.15)] transition-all duration-300 hover:shadow-[0_12px_40px_rgb(233,30,99,0.25)] hover:scale-[1.01] group">
              {/* Compact Banner Header */}
              <div className="relative h-20 overflow-hidden">
                {offer.imageBase64 ? (
                  <div className="relative h-full">
                    <img 
                      src={offer.imageBase64} 
                      alt={offer.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
                  </div>
                ) : (
                  <div className={`h-full bg-gradient-to-r ${getOfferGradient(index)} relative`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                  </div>
                )}
                
                {/* Compact Discount Badge */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
                    <div className="text-lg font-bold text-pink-600">{formatDiscount(offer)}</div>
                    <div className="text-xs text-pink-500 uppercase tracking-wide font-medium">OFF</div>
                  </div>
                </div>

                {/* Compact Offer Content */}
                <div className="absolute left-24 top-1/2 transform -translate-y-1/2 text-white">
                  <h2 className="text-sm font-bold mb-1 drop-shadow-lg">{offer.title}</h2>
                  <p className="text-xs opacity-90 drop-shadow-md max-w-sm truncate">{offer.description}</p>
                </div>

                {/* Compact Action Buttons */}
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <button
                    onClick={() => handleEdit(offer)}
                    className="w-6 h-6 bg-white/95 backdrop-blur-sm rounded-md flex items-center justify-center text-pink-600 hover:bg-white hover:scale-110 text-xs transition-all shadow-md"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(offer)}
                    className="w-6 h-6 bg-white/95 backdrop-blur-sm rounded-md flex items-center justify-center text-pink-600 hover:bg-red-50 hover:text-red-600 hover:scale-110 text-xs transition-all shadow-md"
                  >
                    ×
                  </button>
                </div>

                {/* Compact Status Badge */}
                <div className="absolute top-2 left-2">
                  <button
                    onClick={() => toggleStatus(offer)}
                    className={`px-1.5 py-0.5 rounded-full font-medium transition-all duration-300 shadow-sm backdrop-blur-sm border ${
                      offer.isActive && !isExpired(offer.validTo)
                        ? 'bg-emerald-500/90 text-white hover:bg-emerald-600/90 border-emerald-400/30'
                        : isExpired(offer.validTo)
                        ? 'bg-gray-500/90 text-white border-gray-400/30'
                        : 'bg-rose-500/90 text-white hover:bg-rose-600/90 border-rose-400/30'
                    }`}
                    style={{ fontSize: '9px' }}
                  >
                    {isExpired(offer.validTo) ? 'Expired' : offer.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>

              {/* Compact Footer Info */}
              <div className="p-2 bg-gradient-to-r from-pink-50/50 to-transparent">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="text-pink-600">
                      <strong>Valid:</strong> {new Date(offer.validFrom).toLocaleDateString()} - {new Date(offer.validTo).toLocaleDateString()}
                    </span>
                    {offer.usageLimit && (
                      <span className="text-pink-600">
                        <strong>Usage:</strong> {offer.usedCount}/{offer.usageLimit}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {offer.usageLimit && (
                      <div className="w-16 bg-pink-200 rounded-full h-1">
                        <div 
                          className="h-1 rounded-full bg-pink-500"
                          style={{ width: `${Math.min((offer.usedCount / offer.usageLimit) * 100, 100)}%` }}
                        ></div>
                      </div>
                    )}
                    <span className="text-pink-500 font-medium text-xs">{offer.usedCount} uses</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Compact Empty State */}
        {offers.length === 0 && !loading && (
          <div className="text-center py-6">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-200 to-pink-300 rounded-xl flex items-center justify-center mx-auto mb-2">
              <div className="text-sm text-pink-600">🏷️</div>
            </div>
            <h3 className="text-xs font-semibold text-pink-700 mb-1">No offers yet</h3>
            <p className="text-xs text-pink-500 mb-3">Create your first promotional offer</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 px-3 py-1.5 rounded-lg text-xs font-medium border border-pink-200/50"
            >
              Create Offer
            </button>
          </div>
        )}

        {/* Small Compact Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/90 backdrop-blur-xl border border-pink-200/30 rounded-2xl shadow-[0_20px_50px_rgb(233,30,99,0.35)] w-full max-w-sm">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-pink-700 mb-4">
                  {editingOffer ? 'Edit Offer' : 'Create Offer'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Compact Image Upload */}
                  <div>
                    <label className="block text-xs font-medium text-pink-600 mb-1">Image</label>
                    <div className="relative">
                      {formData.image ? (
                        <div className="relative w-full h-16 rounded-lg overflow-hidden border border-pink-200/50">
                          <img 
                            src={formData.image} 
                            alt="Banner preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, image: '' });
                              setImageFile(null);
                            }}
                            className="absolute top-1 right-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center text-pink-600 hover:bg-white text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-pink-200/50 border-dashed rounded-lg cursor-pointer bg-pink-50/30 hover:bg-pink-50/50 transition-all">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-6 h-6 bg-pink-100 rounded-md flex items-center justify-center mb-1">
                              <span className="text-pink-500 text-xs">🏷️</span>
                            </div>
                            <p className="text-xs text-pink-600 font-medium">Upload</p>
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-pink-600 mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-pink-200/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-400 focus:border-pink-400 transition-all text-xs"
                      placeholder="Offer title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-pink-600 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-pink-200/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-400 focus:border-pink-400 transition-all resize-none text-xs"
                      rows={2}
                      placeholder="Description"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-pink-600 mb-1">Type</label>
                      <div className="relative">
                        <select
                          value={formData.discountType}
                          onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                          className="w-full px-3 py-2 border border-pink-200/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-400 focus:border-pink-400 transition-all text-xs appearance-none bg-white cursor-pointer"
                        >
                          <option value="percentage">%</option>
                          <option value="fixed">AED</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <svg className="w-3 h-3 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-pink-600 mb-1">Value</label>
                      <input
                        type="number"
                        value={formData.discountValue || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || parseFloat(value) >= 0) {
                            setFormData({ ...formData, discountValue: value === '' ? 0 : parseFloat(value) });
                          }
                        }}
                        className="w-full px-3 py-2 border border-pink-200/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-400 focus:border-pink-400 transition-all text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        min="0"
                        step={formData.discountType === 'percentage' ? '1' : '0.01'}
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-pink-600 mb-1">From</label>
                      <input
                        type="date"
                        value={formData.validFrom}
                        onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                        className="w-full px-3 py-2 border border-pink-200/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-400 focus:border-pink-400 transition-all text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-pink-600 mb-1">To</label>
                      <input
                        type="date"
                        value={formData.validTo}
                        onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                        className="w-full px-3 py-2 border border-pink-200/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-400 focus:border-pink-400 transition-all text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-pink-600 mb-1">Usage Limit</label>
                    <input
                      type="number"
                      value={formData.usageLimit || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || parseInt(value) >= 0) {
                          setFormData({ ...formData, usageLimit: value === '' ? undefined : parseInt(value) });
                        }
                      }}
                      className="w-full px-3 py-2 border border-pink-200/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-400 focus:border-pink-400 transition-all text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min="1"
                      placeholder="Unlimited"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-3 h-3 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 focus:ring-1"
                      />
                      <span className="text-xs font-medium text-pink-600">Active</span>
                    </label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-3 border-t border-pink-100">
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={uploading}
                      className="px-3 py-1.5 text-pink-600 bg-pink-50/60 rounded-lg text-xs font-medium hover:bg-pink-100/60 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="px-3 py-1.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 rounded-lg text-xs font-medium border border-pink-200/50 hover:border-pink-300/50 transition-all disabled:opacity-50 flex items-center space-x-1"
                    >
                      {uploading && (
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-pink-600"></div>
                      )}
                      <span>{editingOffer ? 'Update' : 'Create'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}