import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* 顶部装饰线 */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mb-12"></div>

        {/* 标题区域 */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 mx-auto mb-6">
              <span className="text-4xl">💼</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            五险一金计算器
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            智能计算公司为员工缴纳的社保公积金费用，简单高效，一键完成
          </p>
        </div>

        {/* 功能卡片 */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* 数据上传卡片 */}
          <Link href="/upload">
            <div className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200 hover:-translate-y-1 overflow-hidden">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">数据上传</h2>
                    <p className="text-blue-100 text-sm">Data Upload</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-3xl">📤</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-3 leading-relaxed">
                  上传员工工资和城市社保标准数据
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">✓</span>
                  <span>支持 Excel 文件（.xlsx）</span>
                </div>
                <div className="mt-4 flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-2 transition-transform">
                  <span>开始上传</span>
                  <span className="ml-2">→</span>
                </div>
              </div>
            </div>
          </Link>

          {/* 结果查询卡片 */}
          <Link href="/results">
            <div className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-green-200 hover:-translate-y-1 overflow-hidden">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-6">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">结果查询</h2>
                    <p className="text-green-100 text-sm">Results View</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-3xl">📊</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-3 leading-relaxed">
                  查看已计算的社保缴费结果
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">✓</span>
                  <span>详细展示每位员工的缴费信息</span>
                </div>
                <div className="mt-4 flex items-center text-green-600 font-medium text-sm group-hover:translate-x-2 transition-transform">
                  <span>查看结果</span>
                  <span className="ml-2">→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* 操作流程提示 */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-center text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">
              操作流程
            </h3>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <span className="ml-2 text-gray-700 font-medium">上传数据</span>
              </div>
              <div className="text-gray-400">→</div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <span className="ml-2 text-gray-700 font-medium">执行计算</span>
              </div>
              <div className="text-gray-400">→</div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <span className="ml-2 text-gray-700 font-medium">查看结果</span>
              </div>
            </div>
          </div>
        </div>

        {/* 底部装饰 */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-400">
            © 2024 五险一金计算器 - 让社保计算更简单
          </p>
        </div>
      </div>
    </main>
  );
}

