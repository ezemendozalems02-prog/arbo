import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

function loadEnv() {
  const env = { ...process.env };
  const envPath = join(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [k, ...v] = trimmed.split('=');
      if (k && v.length) env[k.trim()] = v.join('=').trim();
    }
  }
  return env;
}

const env = loadEnv();
const PROJECT_REF = env.SUPABASE_PROJECT_REF || 'hvpbzxowfppysymyxjfs';
const TOKEN = env.SUPABASE_ACCESS_TOKEN;

if (!TOKEN) {
  console.error('❌ Error: SUPABASE_ACCESS_TOKEN no está definido en el entorno o en .env.local');
  process.exit(1);
}

async function query(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  const data = await res.json();
  return data;
}

async function run() {
  console.log('Insertando usuarios mock en auth.users...');
  const authUsersSql = `
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES 
    (
      'a0000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'thiago.dueno@arbo.internal',
      '',
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"first_name":"Thiago","last_name":"Mendoza"}',
      now(),
      now()
    ),
    (
      'a0000000-0000-0000-0000-000000000002',
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'martin.cajero@arbo.internal',
      '',
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"first_name":"Martin","last_name":"Gomez"}',
      now(),
      now()
    ),
    (
      'b0000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'lucia.duena@arbo.internal',
      '',
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"first_name":"Lucia","last_name":"Rivadavia"}',
      now(),
      now()
    )
    ON CONFLICT (id) DO NOTHING;
  `;

  const authRes = await query(authUsersSql);
  console.log('Resultado insercion auth:', authRes);

  console.log('Aplicando supabase/seed.sql...');
  const seedSql = readFileSync('supabase/seed.sql', 'utf8');
  const seedRes = await query(seedSql);
  console.log('Resultado seed:', seedRes);
  console.log('✅ Seed completado.');
}

run().catch(console.error);
