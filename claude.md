# 五险一金计算器 Web 应用 - 项目规划文档

## 项目概述

本项目是一个迷你的"五险一金"计算器Web应用，用于根据员工工资数据和城市社保标准，自动计算公司为每位员工应缴纳的社保公积金费用。

---

## 技术栈

- **前端框架**: Next.js
- **UI/样式**: Tailwind CSS
- **数据库/后端**: Supabase
- **Excel处理**: xlsx 库（用于解析上传的Excel文件）

---

## 数据库设计 (Supabase)

### 1. cities 表（城市社保标准表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int (主键) | 自增ID |
| city_name | text | 城市名称（如"佛山"） |
| year | text | 年份（如"2024"） |
| base_min | int | 社保缴费基数下限 |
| base_max | int | 社保缴费基数上限 |
| rate | float | 综合缴纳比例（如 0.15 表示 15%） |

**数据来源**: 通过上传 `cities.xlsx` 导入

---

### 2. salaries 表（员工工资表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int (主键) | 自增ID |
| employee_id | text | 员工工号 |
| employee_name | text | 员工姓名 |
| month | text | 年份月份（格式：YYYYMM，如"202401"） |
| salary_amount | int | 该月工资金额 |

**数据来源**: 通过上传 `salaries.xlsx` 导入

---

### 3. results 表（计算结果表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int (主键) | 自增ID |
| employee_name | text | 员工姓名 |
| avg_salary | float | 年度月平均工资 |
| contribution_base | float | 最终缴费基数 |
| company_fee | float | 公司缴纳金额 |

**数据来源**: 由核心计算逻辑生成并存储

---

## 核心业务逻辑

### 计算流程（按步骤执行）

1. **数据读取**
   - 从 `salaries` 表读取所有员工工资数据
   - 从 `cities` 表读取城市社保标准（以表中的 city_name 为准）

2. **年份验证**
   - 提取 `cities` 表中的 `year` 字段
   - 提取 `salaries` 表中所有 `month` 字段的年份部分（YYYYMM 的前4位）
   - **如果年份不一致**，程序终止并提示："年份不匹配，需要重新上传数据"

3. **分组计算平均工资**
   - 按 `employee_name` 分组
   - 计算每位员工在该年度的**月平均工资** = SUM(salary_amount) / COUNT(month)

4. **确定缴费基数**
   - 对于每位员工，将其"年度月平均工资"与 cities 表中的 `base_min` 和 `base_max` 比较
   - 规则：
     - 如果 平均工资 < base_min，则缴费基数 = base_min
     - 如果 平均工资 > base_max，则缴费基数 = base_max
     - 否则，缴费基数 = 平均工资

5. **计算公司应缴金额**
   - 公司应缴金额 = 缴费基数 × rate

6. **存储结果**
   - **清空 `results` 表**的所有旧数据
   - 将每位员工的计算结果（姓名、平均工资、缴费基数、公司应缴金额）插入 `results` 表

---

## 前端页面设计

### 1. 主页 `/` (Homepage)

**功能定位**: 应用入口和导航中枢

**页面布局**:
- 页面标题: "五险一金计算器"
- 两个功能卡片（Card），采用现代化设计风格

**卡片一: 数据上传**
- 标题: "数据上传"
- 说明文字: "上传员工工资和城市社保标准数据"
- 整个卡片可点击，跳转到 `/upload`

**卡片二: 结果查询**
- 标题: "结果查询"
- 说明文字: "查看已计算的社保缴费结果"
- 整个卡片可点击，跳转到 `/results`

**样式要求**:
- 使用 Tailwind CSS
- 卡片需要有 hover 效果
- 响应式设计，支持移动端

---

### 2. 数据上传页 `/upload` (Upload Page)

**功能定位**: 后台操作控制面板

**页面元素**:

**按钮一: "上传 Cities 数据"**
- 点击后打开文件选择器，选择 `cities.xlsx`
- 解析 Excel 文件内容
- **清空 `cities` 表**的所有旧数据
- 将新数据插入 `cities` 表
- 显示上传成功/失败提示

**按钮二: "上传 Salaries 数据"**
- 点击后打开文件选择器，选择 `salaries.xlsx`
- 解析 Excel 文件内容
- **清空 `salaries` 表**的所有旧数据
- 将新数据插入 `salaries` 表
- 显示上传成功/失败提示

**按钮三: "执行计算并存储结果"**
- 点击后触发核心计算逻辑（见上文"核心业务逻辑"）
- 显示计算进度或加载状态
- 计算完成后显示成功提示（如"成功计算 X 位员工的社保数据"）
- 如果年份不匹配，显示错误提示："年份不匹配，需要重新上传数据"

**样式要求**:
- 按钮清晰醒目，有 loading 状态
- 操作反馈明确（成功/失败提示）

---

### 3. 结果展示页 `/results` (Results Page)

**功能定位**: 计算成果展示

**页面功能**:
- 页面加载时，自动从 Supabase 的 `results` 表获取所有数据
- 使用表格（Table）展示所有计算结果

**表格列**:
1. 员工姓名 (employee_name)
2. 年度月平均工资 (avg_salary) - 保留2位小数
3. 缴费基数 (contribution_base) - 保留2位小数
4. 公司缴纳金额 (company_fee) - 保留2位小数

**样式要求**:
- 使用 Tailwind CSS 设计简洁、清晰的表格
- 表头加粗，行间隔色
- 响应式设计
- 如果没有数据，显示"暂无数据，请先上传并计算"

---

## 开发任务清单 (Todo List)

### 阶段一: 项目初始化

- [ ] 1.1 初始化 Next.js 项目
- [ ] 1.2 安装并配置 Tailwind CSS
- [ ] 1.3 安装依赖包（xlsx, @supabase/supabase-js）
- [ ] 1.4 创建项目基础文件结构

### 阶段二: Supabase 配置

- [ ] 2.1 创建 Supabase 项目
- [ ] 2.2 在 Supabase 中创建 `cities` 表（按照数据库设计）
- [ ] 2.3 在 Supabase 中创建 `salaries` 表
- [ ] 2.4 在 Supabase 中创建 `results` 表
- [ ] 2.5 配置 Supabase 环境变量（.env.local）
- [ ] 2.6 创建 Supabase 客户端工具文件

### 阶段三: 后端逻辑开发

- [ ] 3.1 创建 API 路由：上传 Cities 数据
  - 解析 cities.xlsx
  - 清空旧数据
  - 插入新数据到 cities 表
- [ ] 3.2 创建 API 路由：上传 Salaries 数据
  - 解析 salaries.xlsx
  - 清空旧数据
  - 插入新数据到 salaries 表
- [ ] 3.3 创建 API 路由：执行计算逻辑
  - 读取 cities 和 salaries 数据
  - 验证年份匹配
  - 计算每位员工的平均工资
  - 确定缴费基数
  - 计算公司应缴金额
  - 清空并更新 results 表
- [ ] 3.4 创建 API 路由：获取 results 数据

### 阶段四: 前端页面开发

- [ ] 4.1 创建主页 `/`
  - 设计两个导航卡片
  - 实现路由跳转
  - 添加 hover 效果
- [ ] 4.2 创建数据上传页 `/upload`
  - 实现"上传 Cities 数据"按钮和文件选择器
  - 实现"上传 Salaries 数据"按钮和文件选择器
  - 实现"执行计算"按钮
  - 添加 loading 状态和提示信息
- [ ] 4.3 创建结果展示页 `/results`
  - 实现数据获取逻辑
  - 设计并实现结果表格
  - 添加空数据提示

### 阶段五: 样式优化与测试

- [ ] 5.1 优化整体 UI/UX 设计
- [ ] 5.2 实现响应式布局（移动端适配）
- [ ] 5.3 测试数据上传功能
- [ ] 5.4 测试计算逻辑准确性
- [ ] 5.5 测试年份不匹配的错误处理
- [ ] 5.6 测试结果展示功能

### 阶段六: 最终检查与部署

- [ ] 6.1 代码审查和优化
- [ ] 6.2 错误处理完善
- [ ] 6.3 性能优化
- [ ] 6.4 部署到 Vercel（可选）

---

## 关键技术要点

### Excel 文件处理
- 使用 `xlsx` 库读取 .xlsx 文件
- 解析工作表（Sheet）数据
- 将数据转换为 JSON 格式后插入数据库

### Supabase 数据操作
- **清空表数据**: `supabase.from('table_name').delete().neq('id', 0)`
- **批量插入**: `supabase.from('table_name').insert(dataArray)`
- **查询**: `supabase.from('table_name').select('*')`

### 年份验证逻辑
```javascript
// 伪代码
const cityYear = cities[0].year; // "2024"
const salaryYears = salaries.map(s => s.month.substring(0, 4)); // ["2024", "2024", ...]
const allMatch = salaryYears.every(y => y === cityYear);
if (!allMatch) {
  throw new Error("年份不匹配，需要重新上传数据");
}
```

### 缴费基数计算逻辑
```javascript
// 伪代码
function getContributionBase(avgSalary, baseMin, baseMax) {
  if (avgSalary < baseMin) return baseMin;
  if (avgSalary > baseMax) return baseMax;
  return avgSalary;
}
```

---

## 环境变量配置

`.env.local` 文件需包含：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 项目文件结构（预期）

```
social-security-calculator/
├── app/
│   ├── page.tsx              # 主页 (/)
│   ├── upload/
│   │   └── page.tsx          # 数据上传页 (/upload)
│   ├── results/
│   │   └── page.tsx          # 结果展示页 (/results)
│   ├── api/
│   │   ├── upload-cities/
│   │   │   └── route.ts      # 上传 cities 数据 API
│   │   ├── upload-salaries/
│   │   │   └── route.ts      # 上传 salaries 数据 API
│   │   ├── calculate/
│   │   │   └── route.ts      # 执行计算 API
│   │   └── get-results/
│   │       └── route.ts      # 获取 results 数据 API
│   ├── layout.tsx            # 根布局
│   └── globals.css           # 全局样式
├── lib/
│   └── supabase.ts           # Supabase 客户端
├── public/
├── .env.local                # 环境变量（需自行创建）
├── claude.md                 # 本规划文档
├── cities.xlsx               # 示例城市数据
├── salaries.xlsx             # 示例工资数据
├── package.json
├── tailwind.config.js
└── next.config.js
```

---

## 注意事项

1. **数据一致性**: 确保上传的 cities 和 salaries 数据年份一致
2. **错误处理**: 所有 API 操作都需要适当的错误处理和用户提示
3. **数据验证**: 上传时验证 Excel 文件格式是否正确
4. **性能**: 批量插入数据时注意性能优化
5. **用户体验**: 长时间操作（如计算）需要显示 loading 状态

---

## 下一步行动

等待确认此规划文档后，将按照 Todo List 的顺序逐步实现功能。

**当前状态**: 规划阶段完成，等待审查批准 ✅
