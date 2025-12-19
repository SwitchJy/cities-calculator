const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase配置
const supabaseUrl = 'https://msxhoumkvnzpweyfeljc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zeGhvdW1rdm56cHdleWZlbGpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg3MzU1OCwiZXhwIjoyMDgxNDQ5NTU4fQ.oP5cS-4DYezRH804uxhnCN2ExZ1KdvrXYjXMSrdqs64';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixCitiesData() {
  try {
    console.log('开始修复城市数据...');

    // 1. 清空现有的城市数据
    console.log('清空现有的城市数据...');
    const { error: deleteError } = await supabase
      .from('cities')
      .delete()
      .neq('id', 0); // 删除所有行

    if (deleteError) {
      throw deleteError;
    }
    console.log('已清空现有数据');

    // 2. 读取正确的城市数据
    const csvPath = path.join(__dirname, '../public/cities-data.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');

    // 跳过标题行
    const dataLines = lines.slice(1).filter(line => line.trim());

    const citiesData = dataLines.map(line => {
      const [city_name, year, base_min, base_max, rate] = line.split(',');
      return {
        city_name: city_name.trim(),
        year: year.trim(),
        base_min: parseInt(base_min),
        base_max: parseInt(base_max),
        rate: parseFloat(rate)
      };
    });

    console.log(`准备插入${citiesData.length}条城市数据`);

    // 3. 插入正确的数据
    const { data, error: insertError } = await supabase
      .from('cities')
      .insert(citiesData)
      .select();

    if (insertError) {
      throw insertError;
    }

    console.log('成功插入城市数据：');
    data.forEach(city => {
      console.log(`- ${city.city_name} (${city.year}): ${city.base_min}-${city.base_max}, 比例: ${city.rate}`);
    });

    console.log('\n城市数据修复完成！');
  } catch (error) {
    console.error('修复城市数据时出错：', error.message);
  }
}

fixCitiesData();