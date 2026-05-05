'use client';

import { Search, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import api from '@/lib/api';

import AppLayout from '@/components/AppLayout';
import PartsCardGrid from '@/components/PartsCardGrid';
import PartsTable, { PartsTableSkeleton } from '@/components/PartsTable';
import ProtectedRoute from '@/components/ProtectedRoute';
import QuickViewModal from '@/components/QuickViewModal';
import ViewModeToggle, { type CatalogView } from '@/components/ViewModeToggle';

import { useCart } from '@/context/CartContext';
import { getCartQuantityForPart } from '@/utils/catalog';

import type { Part } from '@/types/index';

const VIEW_STORAGE_KEY = 'catalog_view';

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
  const [view, setView] = useState<CatalogView>('table');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (stored === 'table' || stored === 'cards') setView(stored);
  }, []);

  const handleViewChange = useCallback((next: CatalogView) => {
    setView(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    }
  }, []);

  const { items, addToCart, updateQuantity } = useCart();
  const cartTotal = items.reduce((sum, item) => sum + item.part.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
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
        <div className={`space-y-6 ${totalItems > 0 ? 'pb-24' : ''}`}>
          {/* Compact command bar */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-5 sm:px-7 py-5 sm:py-6 shadow-xl shadow-slate-900/15">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent pointer-events-none" />
            <div className="absolute top-0 left-1/3 w-[420px] h-[420px] bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[280px] h-[280px] bg-gradient-to-tl from-indigo-500/10 to-transparent rounded-full blur-3xl translate-y-1/2 translate-x-1/4 pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-7">
              <div className="lg:flex-shrink-0 lg:max-w-[300px]">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-blue-300 text-[10px] font-bold uppercase tracking-[0.12em] mb-2 border border-white/10">
                  <Sparkles className="w-3 h-3" strokeWidth={2.5} />
                  كتالوج القطع
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                  اعثر على القطعة{' '}
                  <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    المناسبة
                  </span>
                </h1>
              </div>

              <div className="lg:flex-1 relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <Search className="w-5 h-5 text-slate-400" strokeWidth={2.2} />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث برقم القطعة، الاسم، أو الماركة..."
                  className="w-full pr-12 pl-12 py-3.5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 text-sm sm:text-base font-medium shadow-2xl shadow-black/30 border-0 transition-all duration-200"
                />
                {search && !loading && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
                    aria-label="مسح البحث"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </button>
                )}
                {search && loading && (
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>
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
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 font-semibold bg-white border border-gray-200/80 px-3.5 py-1.5 rounded-full shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="tabular-nums" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{total}</span>
                  <span>نتيجة</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <ViewModeToggle view={view} onChange={handleViewChange} />
              {view === 'cards' && (
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-5 py-3 rounded-xl bg-white border border-gray-200/80 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-gray-300 cursor-pointer hover:shadow-md transition-all"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              )}
            </div>
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
          {loading && view === 'table' && <PartsTableSkeleton />}
          {loading && view === 'cards' && (
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

          {/* Parts list */}
          {!loading && filteredParts.length > 0 && (
            view === 'table' ? (
              <PartsTable
                parts={filteredParts}
                cartItems={items}
                onAddToCart={handleAddToCart}
                onUpdateQuantity={updateQuantity}
                onSelect={setSelectedPart}
              />
            ) : (
              <PartsCardGrid
                parts={filteredParts}
                cartItems={items}
                onAddToCart={handleAddToCart}
                onUpdateQuantity={updateQuantity}
                onSelect={setSelectedPart}
              />
            )
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

        {/* Sticky cart bar */}
        {totalItems > 0 && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4 pointer-events-none">
            <a
              href="/cart"
              className="pointer-events-auto flex items-center justify-between bg-slate-900 hover:bg-slate-800 text-white px-5 py-3.5 rounded-2xl shadow-2xl shadow-slate-900/40 transition-all duration-200 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                  </svg>
                  <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[9px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-0.5">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                </div>
                <span className="text-sm font-semibold">
                  {totalItems} {totalItems === 1 ? 'قطعة' : 'قطع'} في السلة
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-emerald-400">{cartTotal.toFixed(2)} ر.س</span>
                <svg className="w-4 h-4 text-gray-400 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </div>
            </a>
          </div>
        )}

        <AddedToast show={toastVisible} />
        <QuickViewModal
          part={selectedPart}
          isOpen={selectedPart !== null}
          onClose={() => setSelectedPart(null)}
          onAddToCart={(part) => { handleAddToCart(part); }}
          onUpdateQuantity={updateQuantity}
          cartQuantity={selectedPart ? getCartQuantityForPart(items, selectedPart.id) : 0}
        />
      </AppLayout>
    </ProtectedRoute>
  );
}
