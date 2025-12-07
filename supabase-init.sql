-- ============================================
-- 五险一金计算器 - Supabase 数据库初始化脚本
-- ============================================
-- 执行说明：
-- 1. 登录 Supabase 控制台
-- 2. 进入 SQL Editor
-- 3. 复制此文件的全部内容并执行
-- ============================================

-- 1. 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- 2. 创建 cities 表（城市社保标准表）
-- ============================================

CREATE TABLE IF NOT EXISTS public.cities (
  id bigserial PRIMARY KEY,
  city_name text NOT NULL,
  year smallint NOT NULL,
  base_min integer NOT NULL CHECK (base_min > 0),
  base_max integer NOT NULL CHECK (base_max >= base_min),
  rate numeric(5,4) NOT NULL CHECK (rate > 0 AND rate <= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_city_year UNIQUE (city_name, year)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_cities_city_year ON public.cities(city_name, year);
CREATE INDEX IF NOT EXISTS idx_cities_year ON public.cities(year);

-- 创建更新时间戳触发器
DROP TRIGGER IF EXISTS update_cities_updated_at ON public.cities;
CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON public.cities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 添加表注释
COMMENT ON TABLE public.cities IS '城市社保标准表';
COMMENT ON COLUMN public.cities.city_name IS '城市名称（如"佛山"）';
COMMENT ON COLUMN public.cities.year IS '年份（如 2024）';
COMMENT ON COLUMN public.cities.base_min IS '社保缴费基数下限（元）';
COMMENT ON COLUMN public.cities.base_max IS '社保缴费基数上限（元）';
COMMENT ON COLUMN public.cities.rate IS '综合缴纳比例（如 0.1500 表示 15%）';

-- ============================================
-- 3. 创建 salaries 表（员工工资表）
-- ============================================

CREATE TABLE IF NOT EXISTS public.salaries (
  id bigserial PRIMARY KEY,
  employee_id text NOT NULL,
  employee_name text NOT NULL,
  month integer NOT NULL CHECK (month >= 190001 AND month <= 299912),
  salary_amount numeric(12,2) NOT NULL CHECK (salary_amount >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_employee_month UNIQUE (employee_id, month)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_salaries_employee_id ON public.salaries(employee_id);
CREATE INDEX IF NOT EXISTS idx_salaries_employee_name ON public.salaries(employee_name);
CREATE INDEX IF NOT EXISTS idx_salaries_month ON public.salaries(month);
CREATE INDEX IF NOT EXISTS idx_salaries_employee_month ON public.salaries(employee_id, month);

-- 年份提取函数索引（用于快速年份验证）
CREATE INDEX IF NOT EXISTS idx_salaries_year ON public.salaries((month / 100));

-- 创建更新时间戳触发器
DROP TRIGGER IF EXISTS update_salaries_updated_at ON public.salaries;
CREATE TRIGGER update_salaries_updated_at BEFORE UPDATE ON public.salaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 添加表注释
COMMENT ON TABLE public.salaries IS '员工工资表';
COMMENT ON COLUMN public.salaries.employee_id IS '员工工号';
COMMENT ON COLUMN public.salaries.employee_name IS '员工姓名';
COMMENT ON COLUMN public.salaries.month IS '年份月份（格式：YYYYMM，如 202401）';
COMMENT ON COLUMN public.salaries.salary_amount IS '该月工资金额（元）';

-- ============================================
-- 4. 创建 results 表（计算结果表）
-- ============================================

CREATE TABLE IF NOT EXISTS public.results (
  id bigserial PRIMARY KEY,
  employee_id text NOT NULL,
  employee_name text NOT NULL,
  year smallint NOT NULL,
  city_name text NOT NULL,
  avg_salary numeric(12,2) NOT NULL CHECK (avg_salary >= 0),
  contribution_base numeric(12,2) NOT NULL CHECK (contribution_base >= 0),
  company_fee numeric(12,2) NOT NULL CHECK (company_fee >= 0),
  calculated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_employee_year_city UNIQUE (employee_id, year, city_name)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_results_employee_id ON public.results(employee_id);
CREATE INDEX IF NOT EXISTS idx_results_employee_name ON public.results(employee_name);
CREATE INDEX IF NOT EXISTS idx_results_year ON public.results(year);
CREATE INDEX IF NOT EXISTS idx_results_city_year ON public.results(city_name, year);
CREATE INDEX IF NOT EXISTS idx_results_calculated_at ON public.results(calculated_at DESC);

-- 添加表注释
COMMENT ON TABLE public.results IS '社保缴费计算结果表';
COMMENT ON COLUMN public.results.employee_id IS '员工工号';
COMMENT ON COLUMN public.results.employee_name IS '员工姓名';
COMMENT ON COLUMN public.results.year IS '计算年份';
COMMENT ON COLUMN public.results.city_name IS '计算城市';
COMMENT ON COLUMN public.results.avg_salary IS '年度月平均工资（元）';
COMMENT ON COLUMN public.results.contribution_base IS '最终缴费基数（元）';
COMMENT ON COLUMN public.results.company_fee IS '公司缴纳金额（元）';
COMMENT ON COLUMN public.results.calculated_at IS '计算时间';

-- ============================================
-- 5. RLS 策略（禁用，适用于内部工具）
-- ============================================

ALTER TABLE public.cities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.salaries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.results DISABLE ROW LEVEL SECURITY;

-- 如果需要启用 RLS 并添加简单认证策略，请取消以下注释：
-- ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow authenticated users all access on cities"
--   ON public.cities FOR ALL TO authenticated
--   USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow authenticated users all access on salaries"
--   ON public.salaries FOR ALL TO authenticated
--   USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow authenticated users all access on results"
--   ON public.results FOR ALL TO authenticated
--   USING (true) WITH CHECK (true);

-- ============================================
-- 6. 辅助函数（可选）
-- ============================================

-- 年份匹配验证函数
CREATE OR REPLACE FUNCTION validate_year_match()
RETURNS boolean AS $$
DECLARE
  city_years integer[];
  salary_years integer[];
BEGIN
  SELECT ARRAY_AGG(DISTINCT year) INTO city_years FROM public.cities;
  SELECT ARRAY_AGG(DISTINCT month / 100) INTO salary_years FROM public.salaries;

  IF city_years IS NULL OR salary_years IS NULL THEN
    RETURN false;
  END IF;

  RETURN city_years = salary_years;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_year_match() IS '验证 cities 表和 salaries 表的年份是否匹配';

-- ============================================
-- 初始化完成
-- ============================================

-- 验证表是否创建成功
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE '数据库初始化完成！';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '已创建的表:';
  RAISE NOTICE '  1. public.cities（城市社保标准表）';
  RAISE NOTICE '  2. public.salaries（员工工资表）';
  RAISE NOTICE '  3. public.results（计算结果表）';
  RAISE NOTICE '';
  RAISE NOTICE '下一步操作:';
  RAISE NOTICE '  1. 在应用中配置 SUPABASE_URL 和 SUPABASE_ANON_KEY';
  RAISE NOTICE '  2. 上传 cities.xlsx 和 salaries.xlsx 文件';
  RAISE NOTICE '  3. 执行计算并查看结果';
  RAISE NOTICE '==============================================';
END $$;
