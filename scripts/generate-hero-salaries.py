import pandas as pd
import numpy as np
from datetime import datetime

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

print("Generating salary data for 108 heroes...")
print(f"Total heroes: {len(heroes)}")

# 生成工资数据
data = []
months = [f"2024{m:02d}" for m in range(1, 13)]

# 设置随机种子
np.random.seed(2024)

for i, hero in enumerate(heroes):
    employee_id = f"SH{i+1:03d}"

    # 根据排名设定基础工资
    if i < 5:
        base = np.random.randint(20000, 30001)
    elif i < 20:
        base = np.random.randint(15000, 25001)
    elif i < 50:
        base = np.random.randint(10000, 18001)
    else:
        base = np.random.randint(6000, 12001)

    # 生成12个月的工资
    for month in months:
        # 工资波动 ±10%
        salary = int(base * np.random.uniform(0.9, 1.1))
        salary = max(5000, min(35000, salary))

        data.append({
            'employee_id': employee_id,
            'employee_name': hero,
            'month': month,
            'salary_amount': salary
        })

# 创建DataFrame
df = pd.DataFrame(data)

# 保存文件
try:
    # 保存为Excel
    excel_file = 'public/heroes-salaries-2024.xlsx'
    df.to_excel(excel_file, index=False, engine='openpyxl')

    # 保存为CSV
    csv_file = 'public/heroes-salaries-2024.csv'
    df.to_csv(csv_file, index=False, encoding='utf-8-sig')

    print(f"\nGeneration completed!")
    print(f"Excel file saved: {excel_file}")
    print(f"CSV file saved: {csv_file}")
    print(f"Total records: {len(data)}")

    # 显示样例数据
    print("\nSample data (first 5 records):")
    print(df.head().to_string(index=False))

except Exception as e:
    print(f"Error saving files: {e}")