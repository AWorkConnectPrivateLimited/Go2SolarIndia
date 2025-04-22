import { supabase } from './client';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', 'alter_solar_projects.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      console.error('Migration failed:', error);
      return;
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error running migration:', error);
  }
}

// Run the migration
runMigration(); 