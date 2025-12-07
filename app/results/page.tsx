'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ResultRow {
  employee_name: string;
  avg_salary: number;
  contribution_base: number;
  company_fee: number;
}

export default function ResultsPage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/results');
      const data = await response.json();

      if (data.success) {
        setResults(data.data.results);
        setMetadata(data.data.metadata);
      } else {
        setError(data.message || '获取数据失败');
      }
    } catch (err: any) {
      setError(`获取数据失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors group"
          >
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
            <span>返回首页</span>
          </Link>
        </div>

        {/* 页面标题 */}
        <div className="text-center mb-10">
          <div className="inline-block w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            计算结果
          </h1>
          <p className="text-gray-600">
            查看员工社保缴费详情
          </p>
        </div>

        {/* 统计卡片 */}
        {metadata && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">城市</p>
                <span className="text-2xl">🏙️</span>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                {metadata.cityName}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">年份</p>
                <span className="text-2xl">📅</span>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                {metadata.year}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">员工总数</p>
                <span className="text-2xl">👥</span>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                {metadata.totalEmployees}<span className="text-lg ml-1">人</span>
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">公司总缴费</p>
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                ¥{metadata.totalCompanyFee.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* 数据表格 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-700">加载中...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchResults}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                重试
              </button>
            </div>
          ) : results.length === 0 ? (
            <div className="p-16 text-center">
              <div className="text-7xl mb-6">📋</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                暂无数据
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                请先上传数据并执行计算
              </p>
              <Link
                href="/upload"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-200 hover:shadow-xl transition-all hover:scale-105"
              >
                <span className="mr-2">📤</span>
                去上传数据
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      序号
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      员工姓名
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                      年度月平均工资（元）
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                      缴费基数（元）
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                      公司缴纳金额（元）
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((row, index) => (
                    <tr
                      key={index}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {row.employee_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-700 font-medium">
                        ¥{row.avg_salary.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-700 font-medium">
                        ¥{row.contribution_base.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                        ¥{row.company_fee.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 刷新按钮 */}
        {!loading && results.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={fetchResults}
              className="inline-flex items-center px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all shadow-sm hover:shadow-md"
            >
              <span className="mr-2">🔄</span>
              刷新数据
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
