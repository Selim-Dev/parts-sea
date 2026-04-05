'use client';

import { useCallback, useEffect, useState } from 'react';

import api from '@/lib/api';

import AppLayout from '@/components/AppLayout';
import CartIndicatorBadge from '@/components/CartIndicatorBadge';
import ProtectedRoute from '@/components/ProtectedRoute';
import QuickViewModal from '@/components/QuickViewModal';

import { useCart } from '@/context/CartContext';
import { formatStockDisplay, getCartQuantityForPart } from '@/utils/catalog';

import type { Part } from '@/types/index';

const LIMIT = 12;

const PRICE_RANGES = [
  { label: 'الكل', min: 0, max: Infinity },
  { label: 'أقل من 50', min: 0, max: 50 },
  { label: '50 – 200', min: 50, max: 200 },
  { label: '200 – 500', min: 200, max: 500 },
  { label: 'أكثر من 500', min: 500, max: Infinity },
];

const SORT_OPTIONS = [
  { label: 'الأحدث', value: 'newest' },
  { label: 'السعر: الأقل', value: 'price-asc' },
  { label: 'السعر: الأعلى', value: 'price-desc' },
  { label: 'الاسم', value: 'name' },
];

function AddedToast({ show }: { show: boolean }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
      <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-medium">
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        تمت الإضافة للسلة
      </div>
    </div>
  );
}

export default function CatalogPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [priceRange, setPriceRange] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeBrand, setActiveBrand] = useState('');

  const { items, addToCart } = useCart();
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  useEffect(() => {
    async function fetchFilters() {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get('/parts/categories'),
          api.get('/parts/brands'),
        ]);
        setCategories(catRes.data);
        setBrands(brandRes.data);
      } catch { /* non-critical */ }
    }
    fetchFilters();
  }, []);

  useEffect(() => { setPage(1); }, [search, activeCategory, activeBrand]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchParts(search, page, activeCategory, activeBrand);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, page, activeCategory, activeBrand]);

  async function fetchParts(query: string, currentPage: number, category: string, brand: string) {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: currentPage, limit: LIMIT };
      if (query) params.search = query;
      if (category) params.category = category;
      if (brand) params.brand = brand;
      const res = await api.get('/parts', { params });
      setParts(res.data.data);
      setTotal(res.data.total);
    } catch {
      setParts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  const handleAddToCart = useCallback((part: Part) => {
    addToCart(part);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1500);
  }, [addToCart]);

  const filteredParts = parts
    .filter((p) => {
      const range = PRICE_RANGES[priceRange];
      return p.price >= range.min && p.price < range.max;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'name': return a.name.localeCompare(b.name, 'ar');
        default: return 0;
      }
    });

  function getPageNumbers(): (number | '...')[] {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }

  const activeFilterCount = (priceRange > 0 ? 1 : 0) + (sortBy !== 'newest' ? 1 : 0) + (activeCategory ? 1 : 0) + (activeBrand ? 1 : 0);
  const clearAllFilters = () => { setActiveCategory(''); setActiveBrand(''); setPriceRange(0); setSortBy('newest'); };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          {/* Hero */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 px-6 sm:px-10 py-12 sm:py-16">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0di00aDR2NGgtMnYtMmgtMnptMC0zMHY0aDR2LTRoLTJ2MmgtMnpNNiAzNHYtNGg0djRIOHYtMkg2ek02IDR2NEgxMFY0SDh2Mkg2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-600/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-600/15 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

            <div className="relative z-10 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
                اعثر على القطعة <span className="text-blue-400">المناسبة</span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mb-8">
                ابحث في كتالوج قطع الغيار برقم القطعة أو الاسم أو الماركة
              </p>
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث برقم القطعة أو الاسم أو الماركة..."
                  className="w-full pr-12 pl-12 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:bg-white/15 focus:border-white/20 focus:ring-2 focus:ring-blue-500/30 text-base transition-all duration-200"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {loading && search && (
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  جاري البحث...
                </div>
              )}
            </div>
          </div>

          {/* Category bar */}
          {categories.length > 0 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
              <button
                onClick={() => setActiveCategory('')}
                className={`shrink-0 px-5 py-3 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeCategory === ''
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/25'
                    : 'bg-white text-gray-600 border border-gray-200/80 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                جميع التصنيفات
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)}
                  className={`shrink-0 px-5 py-3 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/25'
                      : 'bg-white text-gray-600 border border-gray-200/80 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  showFilters || activeFilterCount > 0
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/25'
                    : 'bg-white text-gray-700 border border-gray-200/80 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
                تصفية
                {activeFilterCount > 0 && (
                  <span className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${showFilters || activeFilterCount > 0 ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
              {!loading && (
                <span className="text-sm text-gray-500 font-medium">{total} نتيجة</span>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-5 py-3 rounded-xl bg-white border border-gray-200/80 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-gray-300 cursor-pointer hover:shadow-md transition-all"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Active filter chips */}
          {(activeCategory || activeBrand || priceRange > 0) && (
            <div className="flex flex-wrap gap-2.5 items-center">
              {activeCategory && (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold border border-slate-200/60">
                  {activeCategory}
                  <button onClick={() => setActiveCategory('')} className="hover:text-slate-900 cursor-pointer"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </span>
              )}
              {activeBrand && (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-200/60">
                  {activeBrand}
                  <button onClick={() => setActiveBrand('')} className="hover:text-blue-900 cursor-pointer"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </span>
              )}
              {priceRange > 0 && (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200/60">
                  {PRICE_RANGES[priceRange].label} ر.س
                  <button onClick={() => setPriceRange(0)} className="hover:text-emerald-900 cursor-pointer"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </span>
              )}
              <button onClick={clearAllFilters} className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer underline underline-offset-2 font-medium">
                مسح الكل
              </button>
            </div>
          )}

          {/* Expandable filter panel */}
          {showFilters && (
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-md space-y-6">
              {brands.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900">الماركة</h3>
                    {activeBrand && <button onClick={() => setActiveBrand('')} className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-semibold">إعادة تعيين</button>}
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {brands.map((b) => (
                      <button key={b} onClick={() => setActiveBrand(activeBrand === b ? '' : b)}
                        className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${activeBrand === b ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/25' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80 hover:shadow-md'}`}
                      >{b}</button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900">نطاق السعر (ر.س)</h3>
                  {priceRange > 0 && <button onClick={() => setPriceRange(0)} className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-semibold">إعادة تعيين</button>}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {PRICE_RANGES.map((range, i) => (
                    <button key={i} onClick={() => setPriceRange(i)}
                      className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${priceRange === i ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/25' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80 hover:shadow-md'}`}
                    >{range.label}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-[3px] border-gray-200" />
                  <div className="absolute inset-0 rounded-full border-[3px] border-slate-900 border-t-transparent animate-spin" />
                </div>
                <p className="text-sm text-gray-400">جاري التحميل...</p>
              </div>
            </div>
          )}

          {/* No results */}
          {!loading && filteredParts.length === 0 && (
            <div className="text-center py-24">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-5">
                <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <p className="text-gray-800 text-lg font-bold mb-1">لا توجد نتائج</p>
              <p className="text-gray-400 text-sm">جرّب تغيير كلمات البحث أو إزالة بعض الفلاتر</p>
            </div>
          )}

          {/* Product grid */}
          {!loading && filteredParts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredParts.map((part) => {
                const cartQty = getCartQuantityForPart(items, part.id);
                const stockDisplay = formatStockDisplay(part.stock);
                return (
                  <div
                    key={part.id}
                    className="group relative bg-white rounded-2xl border border-gray-200/60 overflow-hidden hover:shadow-2xl hover:shadow-slate-900/10 hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedPart(part)}
                  >
                    <CartIndicatorBadge quantity={cartQty} />

                    {/* Content */}
                    <div className="p-5">
                      {part.category && (
                        <span className="inline-block text-[11px] text-blue-600 bg-blue-50 font-semibold tracking-wide px-2.5 py-1 rounded-lg mb-2">{part.category}</span>
                      )}

                      <h3 className="font-bold text-gray-900 text-base leading-snug mb-1.5 line-clamp-2 group-hover:text-slate-900 transition-colors min-h-[3rem]">
                        {part.name}
                      </h3>

                      <p className="text-xs font-mono text-gray-400 mb-3 tracking-tight">{part.partNumber}</p>

                      {part.brand && (
                        <div className="inline-block bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg mb-3 border border-slate-200/60">
                          {part.brand}
                        </div>
                      )}

                      {part.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{part.description}</p>
                      )}

                      <div className="flex items-end justify-between gap-2 mb-4 pt-2 border-t border-gray-100">
                        <div className="mt-2">
                          <span className="text-2xl font-extrabold text-slate-900">{part.price.toFixed(0)}</span>
                          <span className="text-sm font-medium text-gray-400 mr-1">.{(part.price % 1).toFixed(2).slice(2)} ر.س</span>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                          stockDisplay.color === 'green' ? 'text-emerald-700 bg-emerald-50' :
                          stockDisplay.color === 'amber' ? 'text-amber-700 bg-amber-50' :
                          'text-red-600 bg-red-50'
                        }`}>
                          {part.stock > 0 ? `${part.stock} متوفر` : 'نفذ'}
                        </span>
                      </div>

                      {stockDisplay.color === 'amber' && part.stock > 0 && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-[11px] font-bold px-3 py-1.5 rounded-lg mb-3 text-center border border-amber-200/60">
                          ⚠️ كمية محدودة
                        </div>
                      )}

                      {part.stock === 0 && (
                        <div className="bg-gray-50 text-gray-500 text-xs font-bold px-4 py-2.5 rounded-xl mb-3 text-center border border-gray-200">
                          نفذ المخزون
                        </div>
                      )}

                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(part); }}
                        disabled={part.stock === 0}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 text-white text-sm font-semibold rounded-xl transition-all duration-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 active:scale-[0.97]"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        {part.stock === 0 ? 'نفذ المخزون' : 'أضف للسلة'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && total > LIMIT && (
            <div className="flex flex-col items-center gap-5 pt-8 pb-2">
              <p className="text-sm text-gray-500 font-medium">
                عرض {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} من {total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-white border border-gray-200/80 text-gray-700 hover:bg-gray-50 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >السابق</button>
                {getPageNumbers().map((p, i) =>
                  p === '...' ? (
                    <span key={`d-${i}`} className="px-2 py-2.5 text-sm text-gray-300 font-bold">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`min-w-[44px] py-2.5 text-sm font-semibold rounded-xl border transition-all cursor-pointer ${
                        p === page
                          ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/25'
                          : 'border-gray-200/80 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md'
                      }`}
                    >{p}</button>
                  )
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-white border border-gray-200/80 text-gray-700 hover:bg-gray-50 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >التالي</button>
              </div>
            </div>
          )}
        </div>

        <AddedToast show={toastVisible} />
        <QuickViewModal
          part={selectedPart}
          isOpen={selectedPart !== null}
          onClose={() => setSelectedPart(null)}
          onAddToCart={(part) => { handleAddToCart(part); setSelectedPart(null); }}
          cartQuantity={selectedPart ? getCartQuantityForPart(items, selectedPart.id) : 0}
        />
      </AppLayout>
    </ProtectedRoute>
  );
}
