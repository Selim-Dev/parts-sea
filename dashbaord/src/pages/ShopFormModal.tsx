import { useEffect, useState } from 'react';
import client from '../api/client';
import type { ShopUser } from '../types/index';

interface ShopFormModalProps {
  show: boolean;
  shop: ShopUser | null;
  onClose: () => void;
  onSaved: () => void;
}

const emptyForm = {
  username: '',
  password: '',
  shopName: '',
};

export default function ShopFormModal({ show, shop, onClose, onSaved }: ShopFormModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = shop !== null;

  useEffect(() => {
    if (show && shop) {
      setForm({
        username: shop.username,
        password: '',
        shopName: shop.shopName || '',
      });
    } else if (show) {
      setForm(emptyForm);
    }
    setError('');
  }, [show, shop]);

  if (!show) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        const payload: { shopName: string; password?: string } = {
          shopName: form.shopName,
        };
        if (form.password) {
          payload.password = form.password;
        }
        await client.put(`/users/${shop.id}`, payload);
      } else {
        await client.post('/users', {
          username: form.username,
          password: form.password,
          shopName: form.shopName,
        });
      }
      onSaved();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 409) {
        setError('اسم المستخدم موجود مسبقاً');
      } else {
        setError('حدث خطأ أثناء الحفظ، يرجى المحاولة لاحقاً');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md text-right mx-4" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {isEdit ? 'تعديل بيانات المتجر' : 'إضافة متجر جديد'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              disabled={isEdit}
              required={!isEdit}
              placeholder="مثال: shop1"
              dir="ltr"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
            />
            {!isEdit && (
              <p className="text-xs text-gray-400 mt-1">اسم المستخدم الذي سيستخدمه المتجر لتسجيل الدخول</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المتجر</label>
            <input
              type="text"
              name="shopName"
              value={form.shopName}
              onChange={handleChange}
              placeholder="مثال: متجر النور لقطع الغيار"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isEdit ? 'كلمة المرور الجديدة (اتركها فارغة إن لم ترد تغييرها)' : 'كلمة المرور'}
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required={!isEdit}
              minLength={4}
              placeholder={isEdit ? '••••••' : 'أدخل كلمة المرور'}
              dir="ltr"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {!isEdit && (
              <p className="text-xs text-gray-400 mt-1">4 أحرف على الأقل</p>
            )}
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
