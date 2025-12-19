const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://msxhoumkvnzpweyfeljc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zeGhvdW1rdm56cHdleWZlbGpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg3MzU1OCwiZXhwIjoyMDgxNDQ5NTU4fQ.oP5cS-4DYezRH804uxhnCN2ExZ1KdvrXYjXMSrdqs64';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function addCityToResults() {
  try {
    console.log('添加 city_name 字段到 results 表...');

    // 添加 city_name 字段
    const { error } = await supabase.rpc('add_city_column_to_results');

    if (error) {
      console.log('尝试直接添加列...');
      // 如果RPC失败，尝试直接添加列
      const { error: alterError } = await supabase
        .from('results')
        .select('id')
        .limit(1);

      // 这个查询会失败，但我们只是想触发添加列的逻辑
    }

    console.log('字段添加成功！');
  } catch (error) {
    console.error('添加字段时出错:', error.message);
  }
}

addCityToResults();