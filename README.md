# 五险一金计算器

一个基于 Next.js + Tailwind CSS + Supabase 的 Web 应用，用于计算公司为每位员工应缴纳的社保公积金费用。

## 功能特点

- 📊 支持 Excel 文件批量导入城市社保标准和员工工资数据
- 🧮 自动计算每位员工的年度月平均工资和社保缴费基数
- 💡 根据佛山市社保标准计算公司应缴纳金额
- 📱 响应式设计，支持桌面和移动端
- 🔒 数据安全存储在 Supabase 云数据库

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI/样式**: Tailwind CSS
- **数据库/后端**: Supabase
- **类型安全**: TypeScript
- **Excel 处理**: xlsx

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd cities-calculator
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 Supabase

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在项目的 SQL 编辑器中执行 `supabase/init.sql` 文件创建数据表
3. 获取项目 URL 和 API 密钥

### 4. 配置环境变量

创建 `.env.local` 文件并填入以下内容：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 5. 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 使用说明

### 1. 数据上传

#### 城市社保标准文件格式

Excel 文件应包含以下列：

| 列名 | 说明 | 示例 |
|------|------|------|
| city_name | 城市名 | 佛山 |
| year | 年份 | 2024 |
| base_min | 社保基数下限 | 1900 |
| base_max | 社保基数上限 | 25000 |
| rate | 综合缴纳比例 | 0.154 |

#### 员工工资文件格式

Excel 文件应包含以下列：

| 列名 | 说明 | 示例 |
|------|------|------|
| employee_id | 员工工号 | EMP001 |
| employee_name | 员工姓名 | 张三 |
| month | 年份月份（YYYYMM） | 202401 |
| salary_amount | 工资金额 | 8000 |

### 2. 执行计算

上传数据后，点击"执行计算并存储结果"按钮，系统会：
1. 按员工分组计算年度月平均工资
2. 根据佛山市社保标准确定缴费基数
3. 计算公司应缴纳金额

### 3. 查看结果

在结果页面可以查看所有员工的计算结果，包括：
- 员工姓名
- 年度月平均工资
- 最终缴费基数
- 公司应缴纳金额

## 计算规则

### 缴费基数确定

- 低于下限 → 使用下限（1900元）
- 高于上限 → 使用上限（25000元）
- 介于之间 → 使用平均工资本身

### 公司缴纳金额

```
公司缴纳金额 = 缴费基数 × 缴纳比例（15.4%）
```

## 项目结构

```
cities-calculator/
├── app/                  # Next.js App Router
│   ├── api/             # API 路由
│   │   ├── upload/      # 文件上传接口
│   │   ├── calculate/   # 计算接口
│   │   └── results/     # 结果查询接口
│   ├── upload/          # 上传页面
│   ├── results/         # 结果页面
│   └── page.tsx         # 主页
├── lib/                 # 工具函数
│   ├── supabase.ts      # Supabase 客户端配置
│   ├── database.ts      # 数据库操作函数
│   └── calculator.ts    # 核心计算逻辑
├── types/               # TypeScript 类型定义
├── supabase/            # 数据库初始化脚本
└── public/              # 静态资源
```

## 部署

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量
4. 部署完成

### 其他平台

确保在生产环境中设置正确的环境变量，并且 Supabase 的 RLS 策略已正确配置。

## 注意事项

- 当前版本仅支持佛山市社保标准
- 计算结果会先清空再插入，避免重复数据
- 请确保上传的 Excel 文件格式正确
- 建议在生产环境中配置更严格的 RLS 策略

## 后续计划

- [ ] 支持多城市选择
- [ ] 增加更多社保项目细分
- [ ] 支持数据导出功能
- [ ] 添加计算历史记录
- [ ] 优化大数据量处理性能

## 许可证

MIT