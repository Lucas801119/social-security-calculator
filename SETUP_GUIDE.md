# 五险一金计算器 - 完整配置指南

## 第一步：配置 Supabase 数据库

### 1. 登录 Supabase

1. 访问 [https://supabase.com/](https://supabase.com/)
2. 使用你的账号登录（GitHub 账号可直接登录）

### 2. 创建新项目

1. 点击 "New Project" 按钮
2. 填写项目信息：
   - **Name**: `social-security-calculator`（或你喜欢的名字）
   - **Database Password**: 设置一个强密码（请妥善保存）
   - **Region**: 选择离你最近的区域（如 Northeast Asia (Tokyo)）
3. 点击 "Create new project"
4. 等待项目初始化完成（约 1-2 分钟）

### 3. 执行数据库初始化脚本

1. 在 Supabase 项目页面，点击左侧菜单的 **"SQL Editor"**
2. 点击 "+ New query" 创建新查询
3. 打开本项目的 `supabase-init.sql` 文件
4. **复制全部内容**并粘贴到 SQL Editor 中
5. 点击 "Run" 按钮执行脚本
6. 看到成功提示即表示数据库初始化完成

### 4. 获取 API 密钥

1. 点击左侧菜单的 **"Settings"** (齿轮图标)
2. 点击 "API" 子菜单
3. 找到以下两个信息：
   - **Project URL**: 类似 `https://xxx...
xxx.supabase.co`
   - **anon / public key**: 一长串字符（点击复制图标）

**重要**: 请妥善保存这两个值，稍后需要配置到项目中。

---

## 第二步：配置项目环境变量

### 1. 创建环境变量文件

在项目根目录下，创建 `.env.local` 文件（注意：文件名以点开头）

你可以直接复制 `.env.local.example` 并重命名为 `.env.local`

### 2. 填写 Supabase 配置

打开 `.env.local` 文件，填入你在上一步获取的信息：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-very-long-anon-key-here
```

**示例**（请替换为你自己的真实值）：

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBh...
```

### 3. 保存文件

确保文件已保存，且文件名正确（`.env.local`，不是 `.env.local.txt`）

---

## 第三步：启动项目

### 1. 打开终端

在项目根目录（`d:\Codes\Social Security Calculator`）打开终端

### 2. 安装依赖（如果还没安装）

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 访问应用

打开浏览器，访问：[http://localhost:3000](http://localhost:3000)

你应该能看到五险一金计算器的主页！

---

## 第四步：测试功能

### 1. 测试数据上传

1. 点击首页的 "数据上传" 卡片
2. 点击 "选择 Cities 文件"，上传项目中的 `cities.xlsx`
3. 等待上传成功提示
4. 点击 "选择 Salaries 文件"，上传项目中的 `salaries.xlsx`
5. 等待上传成功提示

### 2. 测试计算功能

1. 点击 "执行计算" 按钮
2. 等待计算完成（应该很快）
3. 看到成功提示（如"共处理 10 位员工..."）

### 3. 查看结果

1. 点击 "查看计算结果" 链接，或返回首页点击 "结果查询"
2. 应该能看到一个表格，展示所有员工的计算结果

---

## 常见问题排查

### 问题 1: "缺少 Supabase 环境变量"

**原因**: `.env.local` 文件不存在或配置错误

**解决**:
1. 确认文件名是 `.env.local`（不是 `.env` 或其他名字）
2. 确认文件在项目根目录
3. 确认文件内容格式正确（参考上面的示例）
4. 重启开发服务器（Ctrl+C 停止，然后再次运行 `npm run dev`）

### 问题 2: "数据库查询失败"

**原因**: Supabase API 密钥错误或数据库未初始化

**解决**:
1. 检查 `.env.local` 中的 URL 和 Key 是否正确（从 Supabase 重新复制）
2. 确认已在 Supabase SQL Editor 中执行了 `supabase-init.sql`
3. 在 Supabase 的 "Table Editor" 中检查是否存在 cities、salaries、results 三个表

### 问题 3: "Excel 文件解析失败"

**原因**: Excel 文件格式不正确

**解决**:
1. 确保文件是 `.xlsx` 格式（不是 `.xls` 或 `.csv`）
2. 打开 Excel 文件，检查第一行的列名是否与要求完全一致：
   - cities.xlsx: `city_name`, `year`, `base_min`, `base_max`, `rate`
   - salaries.xlsx: `employee_id`, `employee_name`, `month`, `salary_amount`
3. 确保列名没有多余空格，且大小写完全一致

### 问题 4: "年份不匹配"

**原因**: cities 表和 salaries 表的年份不一致

**解决**:
1. 检查 cities.xlsx 中的 year 列（如 2024）
2. 检查 salaries.xlsx 中的 month 列，所有月份的年份部分（前4位）必须与 cities 的 year 一致
3. 例如：如果 cities 是 2024，salaries 的 month 必须都是 202401, 202402, ..., 202412

---

## 验证数据库表是否创建成功

### 方法 1: 使用 Supabase Table Editor

1. 在 Supabase 项目页面，点击左侧的 "Table Editor"
2. 你应该能看到 3 个表：
   - `cities`
   - `salaries`
   - `results`
3. 点击每个表，查看表结构是否正确

### 方法 2: 使用 SQL Editor

在 SQL Editor 中运行：

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

应该返回：
- cities
- salaries
- results

---

## 下一步

配置完成后，你可以：

1. 准备你自己的 Excel 数据文件
2. 按照 Excel 格式要求填写数据
3. 上传并计算
4. 查看结果并导出（如需要）

## 需要帮助？

如果遇到其他问题，请检查：

1. 浏览器控制台（F12 → Console）是否有错误信息
2. 终端是否有错误提示
3. Supabase 项目是否正常运行

祝使用愉快！
