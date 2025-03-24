import 'dotenv/config';
dotenv.config();
import { pgPool, closePool } from '../src/integrations/supabase/client';

async function setupDatabase() {
  try {
    console.log('מתחיל להקים את מסד הנתונים...');

    // יצירת טבלת תיקים
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS tblCases (
        id SERIAL PRIMARY KEY,
        ClientName VARCHAR(255) NOT NULL,
        CaseNum INTEGER NOT NULL,
        CaseOpenDate DATE NOT NULL,
        CaseDescription TEXT NOT NULL,
        OpposingParty VARCHAR(255),
        OpposingPartyLAW VARCHAR(255),
        Status VARCHAR(50) NOT NULL,
        CaseType VARCHAR(50) NOT NULL,
        DiscussionDate DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('טבלת תיקים נוצרה בהצלחה');

    // יצירת טבלת משימות
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS tblTasks (
        id SERIAL PRIMARY KEY,
        case_id INTEGER REFERENCES tblCases(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL,
        due_date DATE,
        priority VARCHAR(20),
        assigned_to VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('טבלת משימות נוצרה בהצלחה');

    console.log('הקמת מסד הנתונים הושלמה בהצלחה!');
  } catch (error) {
    console.error('שגיאה בהקמת מסד הנתונים:', error);
  } finally {
    await closePool();
  }
}

setupDatabase();