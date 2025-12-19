import pandas as pd
import numpy as np

# 水浒传108位英雄名单
heroes = [
    "宋江", "卢俊义", "吴用", "公孙胜", "关胜", "林冲", "秦明", "呼延灼", "花荣", "柴进",
    "李应", "朱仝", "鲁智深", "武松", "董平", "张清", "杨志", "徐宁", "索超", "戴宗",
    "刘唐", "李逵", "史进", "穆弘", "雷横", "李俊", "阮小二", "张横", "阮小五", "张顺",
    "阮小七", "杨雄", "石秀", "解珍", "解宝", "燕青", "朱武", "黄信", "孙立", "宣赞",
    "郝思文", "韩滔", "彭玘", "单廷珪", "魏定国", "萧让", "裴宣", "欧鹏", "邓飞", "燕顺",
    "杨林", "凌振", "蒋敬", "吕方", "郭盛", "安道全", "皇甫端", "王英", "扈三娘", "鲍旭",
    "樊瑞", "孔明", "孔亮", "项充", "李衮", "马麟", "童威", "童猛", "孟康", "陈达", "杨春",
    "郑天寿", "陶宗旺", "宋清", "乐和", "龚旺", "丁得孙", "穆春", "曹正", "宋万", "杜迁",
    "薛永", "施恩", "周通", "李忠", "汤隆", "杜兴", "邹渊", "邹润", "朱贵", "朱富", "蔡福",
    "蔡庆", "李立", "李云", "焦挺", "石勇", "孙新", "顾大嫂", "张青", "孙二娘", "王定六",
    "郁保四", "白胜", "时迁", "段景住"
]

# 生成工资数据
def generate_salary_data():
    data = []

    # 2024年的12个月
    months = [f"2024{m:02d}" for m in range(1, 13)]

    # 设置随机种子以确保结果可重现
    np.random.seed(42)

    for i, hero in enumerate(heroes):
        employee_id = f"SH{i+1:03d}"

        # 根据英雄的地位设定基础工资范围
        if i < 5:  # 前5位首领
            base_salary = np.random.randint(20000, 30001)
        elif i < 20:  # 高级将领
            base_salary = np.random.randint(15000, 25001)
        elif i < 50:  # 中级将领
            base_salary = np.random.randint(10000, 18001)
        else:  # 普通好汉
            base_salary = np.random.randint(6000, 12001)

        # 每个月工资有小幅波动（±10%）
        for month in months:
            # 生成每个月的工资，有小幅随机波动
            fluctuation = np.random.uniform(0.9, 1.1)
            monthly_salary = int(base_salary * fluctuation)

            # 确保工资在合理范围内
            monthly_salary = max(5000, min(35000, monthly_salary))

            data.append({
                'employee_id': employee_id,
                'employee_name': hero,
                'month': month,
                'salary_amount': monthly_salary
            })

    return data

# 生成数据
print("正在生成水浒传108位英雄的2024年工资数据...")
salary_data = generate_salary_data()

# 转换为DataFrame
df = pd.DataFrame(salary_data)

# 保存为CSV文件（UTF-8编码）
csv_file = 'public/salaries-heroes.csv'
df.to_csv(csv_file, index=False, encoding='utf-8-sig')

# 保存为Excel文件
excel_file = 'public/salaries-heroes.xlsx'
df.to_excel(excel_file, index=False, engine='openpyxl')

print(f"\n✅ 成功生成 {len(heroes)} 位英雄的工资数据！")
print(f"📊 总共 {len(salary_data)} 条记录（108人 × 12个月）")
print(f"📁 CSV文件: {csv_file}")
print(f"📄 Excel文件: {excel_file}")

# 统计信息
print("\n📈 工资统计：")
print(f"   最高工资: ¥{df['salary_amount'].max():,}")
print(f"   最低工资: ¥{df['salary_amount'].min():,}")
print(f"   平均工资: ¥{df['salary_amount'].mean():,.0f}")