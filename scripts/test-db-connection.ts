import 'dotenv/config';
dotenv.config();

import { pgPool, closePool } from '../src/integrations/supabase/client';


async function testConnection() {
  try {
    const result = await pgPool.query('SELECT NOW()');
    console.log('החיבור למסד הנתונים הצליח!');
    console.log('זמן שרת:', result.rows[0].now);
    
    // בדיקת טבלאות
    const tablesResult = await pgPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('\nטבלאות קיימות במסד הנתונים:');
    tablesResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('שגיאה בחיבור למסד הנתונים:', error);
  } finally {
    await closePool();
  }
}

testConnection();