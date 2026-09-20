import { readFileSync, readdirSync, existsSync } from 'fs';
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

async function executeSql(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return text;
}

async function run() {
  const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
  const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  console.log(`Encontradas ${files.length} migraciones en ${migrationsDir}\n`);

  for (const file of files) {
    console.log(`Aplicando ${file}...`);
    const sql = readFileSync(join(migrationsDir, file), 'utf8');
    try {
      await executeSql(sql);
      console.log(`✅ ${file} aplicado con éxito.\n`);
    } catch (err) {
      console.error(`❌ Error en ${file}:`, err.message);
      process.exit(1);
    }
  }

  console.log('Todas las migraciones se aplicaron con éxito.');
}

run();
