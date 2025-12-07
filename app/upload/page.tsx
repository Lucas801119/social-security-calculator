'use client';

import { useState } from 'react';
import Link from 'next/link';

type MessageType = 'success' | 'error' | 'warning' | 'info';

export default function UploadPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('info');
  const [details, setDetails] = useState<string[]>([]);

  const showMessage = (text: string, type: MessageType, detailsList: string[] = []) => {
    setMessage(text);
    setMessageType(type);
    setDetails(detailsList);
  };

  const handleUploadCities = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage('');
    setDetails([]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-cities', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        showMessage(
          `✅ 成功上传 ${result.data.cityName} (${result.data.year}) 的社保标准，共 ${result.data.recordsInserted} 条记录`,
          'success'
        );
      } else {
        showMessage(
          `❌ 上传失败: ${result.message}`,
          'error',
          result.details || []
        );
      }

    } catch (error: any) {
      showMessage(`❌ 上传过程出现错误: ${error.message}`, 'error');
    } finally {
      setLoading(false);
      e.target.value = ''; // 重置文件输入
    }
  };

  const handleUploadSalaries = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage('');
    setDetails([]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-salaries', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        const warnings = result.warnings || [];
        showMessage(
          `✅ 成功上传工资数据，共 ${result.data.recordsInserted} 条记录，涉及 ${result.data.employeeCount} 位员工`,
          warnings.length > 0 ? 'warning' : 'success',
          warnings
        );
      } else {
        showMessage(
          `❌ 上传失败: ${result.message}`,
          'error',
          result.details || []
        );
      }

    } catch (error: any) {
      showMessage(`❌ 上传过程出现错误: ${error.message}`, 'error');
    } finally {
      setLoading(false);
      e.target.value = ''; // 重置文件输入
    }
  };

  const handleCalculate = async () => {
    setLoading(true);
    setMessage('');
    setDetails([]);

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST'
      });

      const result = await response.json();

      if (result.success) {
        showMessage(
          `🎉 计算完成！共处理 ${result.data.employeesProcessed} 位员工，公司总缴费 ¥${result.data.totalCompanyFee.toFixed(2)} 元`,
          'success'
        );
      } else {
        if (result.error === 'YEAR_MISMATCH') {
          showMessage(
            `⚠️ 年份不匹配，需要重新上传数据`,
            'error',
            result.details ? [
              `城市年份: ${result.details.cityYear}`,
              `工资数据年份: ${result.details.salaryYears?.join(', ')}`,
              result.details.error
            ] : []
          );
        } else if (result.error === 'DATA_MISSING') {
          showMessage(
            `⚠️ 缺少必要数据，请先上传完整数据`,
            'error',
            [result.message]
          );
        } else {
          showMessage(
            `❌ 计算失败: ${result.message}`,
            'error',
            result.details ? [JSON.stringify(result.details)] : []
          );
        }
      }

    } catch (error: any) {
      showMessage(`❌ 计算过程出现错误: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const messageStyles = {
    success: 'bg-green-100 border-green-400 text-green-800',
    error: 'bg-red-100 border-red-400 text-red-800',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
    info: 'bg-blue-100 border-blue-400 text-blue-800'
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors group"
          >
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
            <span>返回首页</span>
          </Link>
          <div className="text-sm text-gray-500">
            步骤 1/3
          </div>
        </div>

        {/* 页面标题 */}
        <div className="text-center mb-10">
          <div className="inline-block w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 mb-4">
            <span className="text-3xl">📤</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            数据上传
          </h1>
          <p className="text-gray-600">
            上传 Excel 文件并执行社保计算
          </p>
        </div>

        {/* 消息提示 */}
        {message && (
          <div
            className={`mb-8 p-5 rounded-xl border-l-4 shadow-sm ${messageStyles[messageType]}`}
          >
            <p className="font-semibold text-base">{message}</p>
            {details.length > 0 && (
              <ul className="mt-3 ml-4 space-y-1 text-sm">
                {details.map((detail, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* 操作卡片 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-10 space-y-8">
          {/* 上传 Cities 数据 */}
          <div className="relative">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  上传城市社保标准数据
                </h2>
                <p className="text-gray-600 mb-5 text-sm leading-relaxed">
                  上传包含城市名称、年份、基数上下限和费率的 Excel 文件
                </p>
                <label className="inline-block">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleUploadCities}
                    disabled={loading}
                    className="hidden"
                  />
                  <span
                    className={`inline-flex items-center px-8 py-3 rounded-xl font-medium shadow-sm transition-all ${
                      loading
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 cursor-pointer text-white shadow-blue-200 hover:shadow-lg'
                    }`}
                  >
                    <span className="mr-2">📁</span>
                    {loading ? '处理中...' : '选择 Cities 文件'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* 分隔线 */}
          <div className="border-t border-gray-200"></div>

          {/* 上传 Salaries 数据 */}
          <div className="relative">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  上传员工工资数据
                </h2>
                <p className="text-gray-600 mb-5 text-sm leading-relaxed">
                  上传包含员工工号、姓名、月份和工资金额的 Excel 文件
                </p>
                <label className="inline-block">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleUploadSalaries}
                    disabled={loading}
                    className="hidden"
                  />
                  <span
                    className={`inline-flex items-center px-8 py-3 rounded-xl font-medium shadow-sm transition-all ${
                      loading
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 cursor-pointer text-white shadow-purple-200 hover:shadow-lg'
                    }`}
                  >
                    <span className="mr-2">📁</span>
                    {loading ? '处理中...' : '选择 Salaries 文件'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* 分隔线 */}
          <div className="border-t border-gray-200"></div>

          {/* 执行计算 */}
          <div className="relative">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  执行计算并存储结果
                </h2>
                <p className="text-gray-600 mb-5 text-sm leading-relaxed">
                  在上传完两个文件后，点击此按钮执行计算
                </p>
                <button
                  onClick={handleCalculate}
                  disabled={loading}
                  className={`inline-flex items-center px-10 py-4 rounded-xl font-semibold text-white transition-all shadow-sm ${
                    loading
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-200 hover:shadow-xl hover:scale-105'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      计算中...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🚀</span>
                      执行计算
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 查看结果链接 */}
        <div className="mt-10 text-center">
          <Link
            href="/results"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium group"
          >
            <span>查看计算结果</span>
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
