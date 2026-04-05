import { useState } from 'react';
import client from '../api/client';

interface ExcelImportModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportSummary {
  totalRows: number;
  imported: number;
  updated: number;
  failed: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    value: any;
  }>;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ExcelImportModal({ show, onClose, onSuccess }: ExcelImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  if (!show) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      setError('الملف المرفوع ليس ملف Excel صالح. يرجى اختيار ملف .xlsx أو .xls');
      setSelectedFile(null);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('حجم الملف يتجاوز الحد الأقصى المسموح (10 ميجابايت)');
      setSelectedFile(null);
      return;
    }

    setError('');
    setSummary(null);
    setSelectedFile(file);
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await client.get('/parts/template', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'parts-template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('حدث خطأ أثناء تحميل القالب، يرجى المحاولة لاحقاً');
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('يرجى اختيار ملف Excel أولاً');
      return;
    }

    setLoading(true);
    setError('');
    setSummary(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await client.post('/parts/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const importSummary = response.data.data as ImportSummary;
      setSummary(importSummary);

      if (importSummary.failed === 0) {
        // Success - all rows imported
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err: any) {
      if (err.response?.data?.data) {
        // Server returned validation errors
        setSummary(err.response.data.data);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('حدث خطأ أثناء الاستيراد، يرجى المحاولة لاحقاً');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError('');
    setSummary(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl text-right mx-4 max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">استيراد القطع من Excel</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4 flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {summary && (
          <div className={`rounded-lg px-4 py-3 mb-4 ${
            summary.failed === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-start gap-2 mb-2">
              {summary.failed === 0 ? (
                <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <div className="flex-1">
                <h3 className={`text-sm font-semibold mb-1 ${
                  summary.failed === 0 ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {summary.failed === 0 ? 'تم الاستيراد بنجاح!' : 'اكتمل الاستيراد مع بعض الأخطاء'}
                </h3>
                <div className={`text-sm ${summary.failed === 0 ? 'text-green-700' : 'text-yellow-700'}`}>
                  <p>إجمالي الصفوف: {summary.totalRows}</p>
                  <p>تم الاستيراد: {summary.imported} قطعة جديدة</p>
                  <p>تم التحديث: {summary.updated} قطعة موجودة</p>
                  {summary.failed > 0 && <p className="font-semibold">فشل: {summary.failed} صف</p>}
                </div>
              </div>
            </div>

            {summary.errors && summary.errors.length > 0 && (
              <div className="mt-3 pt-3 border-t border-yellow-200">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">تفاصيل الأخطاء:</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {summary.errors.map((err, idx) => (
                    <div key={idx} className="text-xs bg-white rounded px-3 py-2 text-yellow-900">
                      <span className="font-semibold">الصف {err.row}:</span> {err.message}
                      {err.field && <span className="text-yellow-600"> (الحقل: {err.field})</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اختر ملف Excel (.xlsx أو .xls)
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={loading}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {selectedFile && (
              <p className="mt-2 text-xs text-gray-500">
                الملف المحدد: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} كيلوبايت)
              </p>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-3 py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">جاري الاستيراد...</span>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={loading}
              className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              تحميل القالب
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={loading || !selectedFile}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              استيراد
            </button>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-50 disabled:bg-gray-50 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border border-gray-200"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
