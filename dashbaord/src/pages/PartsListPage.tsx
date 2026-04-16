import { useEffect, useState } from 'react';
import client from '../api/client';
import type { Part } from '../types/index';
import { filterLowStockParts } from '../utils/analytics';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import PartFormModal from './PartFormModal.tsx';
import ExcelImportModal from '../components/ExcelImportModal';

export default function PartsListPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [searchText, setSearchText] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeBrand, setActiveBrand] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [confirmDeletePart, setConfirmDeletePart] = useState<Part | null>(null);

  const fetchParts = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await client.get('/parts', { params: { limit: 1000 } });
      setParts(res.data.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        client.get('/parts/categories'),
        client.get('/parts/brands'),
      ]);
      setCategories(catRes.data);
      setBrands(brandRes.data);
    } catch {
      /* filters are non-critical */
    }
  };

  useEffect(() => {
    fetchParts();
    fetchFilters();
  }, []);

  const handleAdd = () => {
    setEditingPart(null);
    setShowModal(true);
  };

  const handleEdit = (part: Part) => {
    setEditingPart(part);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingPart(null);
  };

  const handleSaved = () => {
    setShowModal(false);
    setEditingPart(null);
    fetchParts();
    fetchFilters();
  };

  const handleDelete = async (part: Part) => {
    setConfirmDeletePart(null);
    setDeletingId(part.id);
    try {
      await client.delete(`/parts/${part.id}`);
      showToast('تم حذف القطعة بنجاح', 'success');
      fetchParts();
      fetchFilters();
    } catch {
      showToast('حدث خطأ أثناء حذف القطعة', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (part: Part) => {
    setTogglingId(part.id);
    try {
      await client.patch(`/parts/${part.id}/active`);
      setParts((prev) =>
        prev.map((p) => (p.id === part.id ? { ...p, isActive: !p.isActive } : p))
      );
      showToast(
        part.isActive ? 'تم إيقاف تفعيل القطعة' : 'تم تفعيل القطعة',
        'success'
      );
    } catch {
      showToast('حدث خطأ أثناء تغيير حالة القطعة', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleImportSuccess = () => {
    setShowImportModal(false);
    fetchParts();
    fetchFilters();
    showToast('تم استيراد القطع بنجاح!', 'success');
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const lowStockParts = filterLowStockParts(parts);

  const filteredParts = parts.filter((p) => {
    if (activeCategory && p.category !== activeCategory) return false;
    if (activeBrand && p.brand !== activeBrand) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      return (
        p.partNumber.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState onRetry={fetchParts} />;
  }

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className={`rounded-lg px-6 py-3 shadow-lg flex items-center gap-3 ${
            toastType === 'success' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {toastType === 'success' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة القطع</h1>
          <p className="text-sm text-gray-500 mt-1">
            إدارة وتتبع جميع قطع الغيار — {parts.length} قطعة
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            استيراد من Excel
          </button>
          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            إضافة قطعة جديدة
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="بحث برقم القطعة أو الاسم أو الماركة..."
            className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 placeholder-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Category filter chips */}
      {categories.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeCategory === ''
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            كل التصنيفات
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Brand filter chips */}
      {brands.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveBrand('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeBrand === ''
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            كل الماركات
          </button>
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => setActiveBrand(activeBrand === b ? '' : b)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeBrand === b
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      )}

      {lowStockParts.length > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.499-2.599 4.499H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.004ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
          </svg>
          <span>{lowStockParts.length} قطعة بمخزون منخفض</span>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {filteredParts.length === 0 ? (
          <EmptyState
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
            }
            message={searchText || activeCategory || activeBrand ? 'لا توجد نتائج مطابقة' : 'لا توجد قطع حالياً'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50/80">
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">رقم القطعة</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">الاسم</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">التصنيف</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">الماركة</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">السعر</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">المخزون</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">الحالة</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredParts.map((part) => (
                  <tr
                    key={part.id}
                    className={`border-b border-gray-100 transition-colors hover:bg-blue-50/40 ${part.isActive === false ? 'opacity-60 bg-gray-50/80' : 'even:bg-gray-50/50'}`}
                  >
                    <td className="px-5 py-3.5 text-sm text-gray-700 font-mono">{part.partNumber}</td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm text-gray-800 font-medium">{part.name}</div>
                      {part.description && (
                        <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{part.description}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm">
                      {part.category ? (
                        <span className="inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                          {part.category}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm">
                      {part.brand ? (
                        <span className="inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700">
                          {part.brand}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-700 font-medium">{part.price.toFixed(2)} ر.س</td>
                    <td className="px-5 py-3.5 text-sm">
                      <span className="inline-flex items-center gap-1">
                        {part.stock === 0 ? (
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                            نفذ المخزون
                          </span>
                        ) : (
                          <>
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                part.stock > 10
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {part.stock}
                            </span>
                            {part.stock <= 5 && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.499-2.599 4.499H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.004ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                              </svg>
                            )}
                          </>
                        )}
                      </span>
                    </td>
                    {/* Active toggle */}
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggleActive(part)}
                        disabled={togglingId === part.id}
                        dir="ltr"
                        title={part.isActive === false ? 'تفعيل القطعة' : 'إيقاف تفعيل القطعة'}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                          part.isActive === false ? 'bg-gray-300' : 'bg-green-500'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                            part.isActive === false ? 'translate-x-0' : 'translate-x-5'
                          }`}
                        />
                      </button>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(part)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors cursor-pointer"
                        >
                          تعديل
                        </button>
                        <span className="text-gray-200">|</span>
                        <button
                          onClick={() => setConfirmDeletePart(part)}
                          disabled={deletingId === part.id}
                          className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === part.id ? '...' : 'حذف'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {confirmDeletePart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">تأكيد الحذف</h3>
                <p className="text-sm text-gray-500">هذا الإجراء لا يمكن التراجع عنه</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-6 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              هل أنت متأكد من حذف القطعة <strong className="text-gray-900">{confirmDeletePart.name}</strong>؟
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeletePart(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDelete(confirmDeletePart)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                حذف نهائياً
              </button>
            </div>
          </div>
        </div>
      )}

      <PartFormModal
        show={showModal}
        part={editingPart}
        onClose={handleClose}
        onSaved={handleSaved}
      />

      <ExcelImportModal
        show={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
}
