import { Pool } from 'pg';

// קרא משתני סביבה מקובץ .env
const {
  POSTGRES_HOST = 'localhost',
  POSTGRES_PORT = 5432,
  POSTGRES_DB = 'your_database_name',
  POSTGRES_USER = 'postgres',
  POSTGRES_PASSWORD = 'your_password',
} = process.env;

// יצירת מאגר חיבורים למסד הנתונים
const pool = new Pool({
  host: POSTGRES_HOST,
  port: Number(POSTGRES_PORT),
  database: POSTGRES_DB,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
});

// יצירת מופע "supabase-like" לשמירת התאימות עם הקוד הקיים
export const supabase = {
  from: (table: string) => ({
    select: async (columns = '*') => {
      try {
        const { rows } = await pool.query(`SELECT ${columns} FROM ${table}`);
        return { data: rows, error: null };
      } catch (error) {
        console.error(`Error selecting from ${table}:`, error);
        return { data: null, error };
      }
    },
    insert: async (rows: any[]) => {
      try {
        if (rows.length === 0) return { error: new Error('No rows to insert') };
        
        const sampleRow = rows[0];
        const columns = Object.keys(sampleRow);
        const values = rows.map(row => 
          columns.map(col => row[col])
        );
        
        const placeholders = values.map((row, rowIndex) => 
          `(${row.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`).join(', ')})`
        ).join(', ');
        
        const flatValues = values.flat();
        
        const query = `
          INSERT INTO ${table} (${columns.join(', ')})
          VALUES ${placeholders}
          RETURNING *
        `;
        
        const { rows: returnedRows } = await pool.query(query, flatValues);
        return { data: returnedRows, error: null };
      } catch (error) {
        console.error(`Error inserting into ${table}:`, error);
        return { data: null, error };
      }
    },
    update: async (updates: any) => {
      try {
        const columns = Object.keys(updates);
        if (columns.length === 0) return { error: new Error('No updates provided') };
        
        const setClause = columns
          .map((col, i) => `${col} = $${i + 1}`)
          .join(', ');
        
        const values = columns.map(col => updates[col]);
        
        const query = `
          UPDATE ${table}
          SET ${setClause}
          RETURNING *
        `;
        
        const { rows: returnedRows } = await pool.query(query, values);
        return { data: returnedRows, error: null };
      } catch (error) {
        console.error(`Error updating ${table}:`, error);
        return { data: null, error };
      }
    },
    delete: async () => {
      try {
        const { rows } = await pool.query(`DELETE FROM ${table} RETURNING *`);
        return { data: rows, error: null };
      } catch (error) {
        console.error(`Error deleting from ${table}:`, error);
        return { data: null, error };
      }
    },
    // לשאילתות מתקדמות יותר (עם where, order by וכו')
    // תצטרך להרחיב את המימוש כאן בהתאם לצרכי האפליקציה
    where: (column: string, operator: string, value: any) => {
      // זו יכולה להיות מחלקה מורכבת יותר עם מימוש של where, order by וכו'
      // בדוגמה זו נממש רק חיפוש בסיסי
      return {
        select: async (columns = '*') => {
          try {
            const { rows } = await pool.query(
              `SELECT ${columns} FROM ${table} WHERE ${column} ${operator} $1`,
              [value]
            );
            return { data: rows, error: null };
          } catch (error) {
            console.error(`Error selecting from ${table} with where clause:`, error);
            return { data: null, error };
          }
        },
        delete: async () => {
          try {
            const { rows } = await pool.query(
              `DELETE FROM ${table} WHERE ${column} ${operator} $1 RETURNING *`,
              [value]
            );
            return { data: rows, error: null };
          } catch (error) {
            console.error(`Error deleting from ${table} with where clause:`, error);
            return { data: null, error };
          }
        },
        update: async (updates: any) => {
          try {
            const columns = Object.keys(updates);
            if (columns.length === 0) return { error: new Error('No updates provided') };
            
            const setClause = columns
              .map((col, i) => `${col} = $${i + 1}`)
              .join(', ');
            
            const values = [
              ...columns.map(col => updates[col]),
              value // ערך ה-where
            ];
            
            const query = `
              UPDATE ${table}
              SET ${setClause}
              WHERE ${column} ${operator} $${columns.length + 1}
              RETURNING *
            `;
            
            const { rows: returnedRows } = await pool.query(query, values);
            return { data: returnedRows, error: null };
          } catch (error) {
            console.error(`Error updating ${table} with where clause:`, error);
            return { data: null, error };
          }
        }
      };
    }
  })
};

// פונקציה עוזרת לסגירת החיבור למסד הנתונים בעת סיום האפליקציה
export const closePool = async () => {
  await pool.end();
};

// ייצוא ישיר של המאגר למקרה שנדרשות שאילתות מותאמות אישית
export { pool as pgPool };