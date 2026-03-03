#!/usr/bin/env node
/**
 * dotenv-validator — Validate .env files against .env.example
 * Zero external dependencies. Built-in modules only.
 */

import { readFileSync, existsSync, readdirSync, writeFileSync } from 'fs';
import { resolve, basename, dirname } from 'path';
import { argv, exit, stdout, stderr } from 'process';

const VERSION = '1.0.0';

// ─── ANSI Colors ───────────────────────────────────────────────────────────
const NO_COLOR = !stdout.isTTY || process.env.NO_COLOR;
const c = {
  red:    s => NO_COLOR ? s : `\x1b[31m${s}\x1b[0m`,
  yellow: s => NO_COLOR ? s : `\x1b[33m${s}\x1b[0m`,
  green:  s => NO_COLOR ? s : `\x1b[32m${s}\x1b[0m`,
  cyan:   s => NO_COLOR ? s : `\x1b[36m${s}\x1b[0m`,
  bold:   s => NO_COLOR ? s : `\x1b[1m${s}\x1b[0m`,
  dim:    s => NO_COLOR ? s : `\x1b[2m${s}\x1b[0m`,
};

// ─── Help / Version ────────────────────────────────────────────────────────
function printHelp() {
  console.log(`
${c.bold('dotenv-validator')} v${VERSION} — Validate .env files against .env.example

${c.bold('USAGE')}
  dotenv-validator [options]
  denv [options]

${c.bold('OPTIONS')}
  --env <file>        Path to .env file          (default: .env)
  --example <file>    Path to .env.example file  (default: .env.example)
  --dir <path>        Validate all .env* files in directory
  --strict            Treat extra keys as errors  (default: warnings)
  --no-empty-check    Allow empty values
  --ci                Machine-readable output, exit 1 on any error
  --json              Output results as JSON
  --fix               Generate .env from .env.example with placeholders
  --version           Show version
  --help              Show this help

${c.bold('ANNOTATION FORMAT')} (.env.example)
  Add comment annotations before a key to enable richer validation:

  # @required
  # @type url|email|uuid|number|bool|json
  # @pattern ^[A-Z]{3}$
  # @description Human-readable description
  API_KEY=

${c.bold('TYPE HINTS')}
  url     — must start with http:// or https://
  email   — must match email format
  uuid    — must match UUID v4 format
  number  — must be a valid number
  bool    — must be true/false/1/0/yes/no
  json    — must be valid JSON

${c.bold('EXAMPLES')}
  dotenv-validator
  dotenv-validator --env .env.local --example .env.example
  dotenv-validator --dir ./apps --strict
  dotenv-validator --ci --json
  dotenv-validator --fix
`);
}

// ─── Argument Parser ───────────────────────────────────────────────────────
function parseArgs(args) {
  const opts = {
    envFile: null,
    exampleFile: null,
    dir: null,
    strict: false,
    noEmptyCheck: false,
    ci: false,
    json: false,
    fix: false,
    help: false,
    version: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--env':        opts.envFile = args[++i]; break;
      case '--example':   opts.exampleFile = args[++i]; break;
      case '--dir':       opts.dir = args[++i]; break;
      case '--strict':    opts.strict = true; break;
      case '--no-empty-check': opts.noEmptyCheck = true; break;
      case '--ci':        opts.ci = true; break;
      case '--json':      opts.json = true; break;
      case '--fix':       opts.fix = true; break;
      case '--help':      opts.help = true; break;
      case '--version':   opts.version = true; break;
      default:
        stderr.write(`Unknown option: ${arg}\n`);
        exit(1);
    }
  }
  return opts;
}

// ─── .env Parser ───────────────────────────────────────────────────────────
/**
 * Parse an .env file into a Map of key -> value.
 * Handles: quoted values, inline comments, multi-line (basic), blank lines.
 * Returns Map<string, string>
 */
function parseEnvFile(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const map = new Map();
  const lines = raw.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;

    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;

    const key = line.slice(0, eqIdx).trim();
    if (!key || !/^[A-Za-z_][A-Za-z0-9_.]*$/.test(key)) continue;

    let value = line.slice(eqIdx + 1);

    // Strip inline comment (not inside quotes)
    const firstChar = value.trimStart()[0];
    if (firstChar === '"' || firstChar === "'") {
      const quote = firstChar;
      const startIdx = value.indexOf(quote);
      const endIdx = value.indexOf(quote, startIdx + 1);
      if (endIdx !== -1) {
        value = value.slice(startIdx + 1, endIdx);
      } else {
        value = value.slice(startIdx + 1);
      }
    } else {
      // Remove inline comment
      const commentIdx = value.indexOf(' #');
      if (commentIdx !== -1) {
        value = value.slice(0, commentIdx);
      }
      value = value.trim();
    }

    map.set(key, value);
  }

  return map;
}

// ─── Annotation Parser ─────────────────────────────────────────────────────
/**
 * Parse .env.example with annotations.
 * Returns Map<string, { value: string, required: bool, type: string|null, pattern: string|null, description: string|null }>
 */
function parseExampleFile(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const entries = new Map();
  const lines = raw.split('\n');

  let pendingAnnotations = { required: false, type: null, pattern: null, description: null };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#')) {
      const commentBody = line.slice(1).trim();

      if (commentBody.startsWith('@required')) {
        pendingAnnotations.required = true;
      } else if (commentBody.startsWith('@type ')) {
        pendingAnnotations.type = commentBody.slice(6).trim().toLowerCase();
      } else if (commentBody.startsWith('@pattern ')) {
        pendingAnnotations.pattern = commentBody.slice(9).trim();
      } else if (commentBody.startsWith('@description ')) {
        pendingAnnotations.description = commentBody.slice(13).trim();
      }
      // non-annotation comments are ignored
      continue;
    }

    if (!line) {
      // blank line resets pending annotations
      pendingAnnotations = { required: false, type: null, pattern: null, description: null };
      continue;
    }

    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) {
      pendingAnnotations = { required: false, type: null, pattern: null, description: null };
      continue;
    }

    const key = line.slice(0, eqIdx).trim();
    if (!key || !/^[A-Za-z_][A-Za-z0-9_.]*$/.test(key)) {
      pendingAnnotations = { required: false, type: null, pattern: null, description: null };
      continue;
    }

    const value = line.slice(eqIdx + 1).trim();

    entries.set(key, {
      value,
      required: pendingAnnotations.required,
      type: pendingAnnotations.type,
      pattern: pendingAnnotations.pattern,
      description: pendingAnnotations.description,
    });

    pendingAnnotations = { required: false, type: null, pattern: null, description: null };
  }

  return entries;
}

// ─── Type Validators ───────────────────────────────────────────────────────
const TYPE_VALIDATORS = {
  url: v => /^https?:\/\/.+/.test(v),
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  uuid: v => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v),
  number: v => v !== '' && !Number.isNaN(Number(v)),
  bool: v => /^(true|false|1|0|yes|no)$/i.test(v),
  json: v => { try { JSON.parse(v); return true; } catch { return false; } },
};

// ─── Core Validator ────────────────────────────────────────────────────────
/**
 * Validate .env against .env.example.
 * Returns { errors: [], warnings: [], ok: [] }
 * CRITICAL: never include actual values in output — only key names.
 */
function validateEnvPair(envFile, exampleFile, opts) {
  const results = { errors: [], warnings: [], ok: [], file: envFile };

  if (!existsSync(envFile)) {
    results.errors.push({ key: null, code: 'FILE_MISSING', message: `File not found: ${envFile}` });
    return results;
  }
  if (!existsSync(exampleFile)) {
    results.errors.push({ key: null, code: 'EXAMPLE_MISSING', message: `Example file not found: ${exampleFile}` });
    return results;
  }

  const envMap = parseEnvFile(envFile);
  const exampleMap = parseExampleFile(exampleFile);

  const exampleKeys = new Set(exampleMap.keys());
  const envKeys = new Set(envMap.keys());

  // 1. Missing keys (in example but not in env)
  for (const key of exampleKeys) {
    if (!envKeys.has(key)) {
      const meta = exampleMap.get(key);
      const code = meta.required ? 'MISSING_REQUIRED' : 'MISSING';
      const level = meta.required ? 'error' : 'warning';
      const msg = meta.required
        ? `Missing required key: ${key}`
        : `Missing key: ${key}`;

      if (level === 'error') {
        results.errors.push({ key, code, message: msg });
      } else {
        results.warnings.push({ key, code, message: msg });
      }
    }
  }

  // 2. Extra keys (in env but not in example)
  for (const key of envKeys) {
    if (!exampleKeys.has(key)) {
      const msg = `Extra key not in example: ${key}`;
      if (opts.strict) {
        results.errors.push({ key, code: 'EXTRA_KEY', message: msg });
      } else {
        results.warnings.push({ key, code: 'EXTRA_KEY', message: msg });
      }
    }
  }

  // 3. Keys present in both — check empty, type, pattern
  for (const key of exampleKeys) {
    if (!envKeys.has(key)) continue; // already handled above

    const value = envMap.get(key);
    const meta = exampleMap.get(key);

    // 3a. Empty check
    if (!opts.noEmptyCheck && value === '') {
      const msg = `Empty value for key: ${key}`;
      if (meta.required) {
        results.errors.push({ key, code: 'EMPTY_REQUIRED', message: msg });
      } else {
        results.warnings.push({ key, code: 'EMPTY_VALUE', message: msg });
      }
      continue; // skip type/pattern checks for empty values
    }

    let valid = true;

    // 3b. Type validation
    if (meta.type && value !== '') {
      const types = meta.type.split('|').map(t => t.trim());
      const typeValid = types.some(t => TYPE_VALIDATORS[t] ? TYPE_VALIDATORS[t](value) : true);
      if (!typeValid) {
        results.errors.push({
          key,
          code: 'INVALID_TYPE',
          message: `Invalid type for key: ${key} (expected: ${meta.type})`,
        });
        valid = false;
      }
    }

    // 3c. Pattern validation
    if (meta.pattern && value !== '') {
      let patternValid = false;
      try {
        const re = new RegExp(meta.pattern);
        patternValid = re.test(value);
      } catch {
        results.warnings.push({ key, code: 'INVALID_PATTERN_DEF', message: `Invalid @pattern regex for key: ${key}` });
        patternValid = true; // don't fail the key if the pattern itself is broken
      }
      if (!patternValid) {
        results.errors.push({
          key,
          code: 'PATTERN_MISMATCH',
          message: `Pattern mismatch for key: ${key} (pattern: ${meta.pattern})`,
        });
        valid = false;
      }
    }

    if (valid && value !== '') {
      results.ok.push({ key, code: 'OK', message: `OK: ${key}` });
    } else if (valid && value === '' && opts.noEmptyCheck) {
      results.ok.push({ key, code: 'OK_EMPTY_ALLOWED', message: `OK (empty allowed): ${key}` });
    }
  }

  return results;
}

// ─── Fix Mode ──────────────────────────────────────────────────────────────
function generateFixedEnv(exampleFile, envFile) {
  const exampleMap = parseExampleFile(exampleFile);
  let existingMap = new Map();

  if (existsSync(envFile)) {
    existingMap = parseEnvFile(envFile);
  }

  const lines = [];
  lines.push('# Generated by dotenv-validator --fix');
  lines.push('# Replace placeholder values with actual values before use');
  lines.push('');

  for (const [key, meta] of exampleMap) {
    if (meta.description) {
      lines.push(`# ${meta.description}`);
    }
    if (meta.required) lines.push('# @required');
    if (meta.type) lines.push(`# @type ${meta.type}`);
    if (meta.pattern) lines.push(`# @pattern ${meta.pattern}`);

    // Use existing value if present, otherwise generate placeholder
    if (existingMap.has(key)) {
      lines.push(`${key}=${existingMap.get(key)}`);
    } else {
      // Generate safe type-appropriate placeholder (never real secrets)
      const placeholder = getPlaceholder(key, meta.type);
      lines.push(`${key}=${placeholder}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function getPlaceholder(key, type) {
  if (!type) return 'YOUR_VALUE_HERE';
  const t = type.split('|')[0];
  switch (t) {
    case 'url':    return 'https://example.com';
    case 'email':  return 'user@example.com';
    case 'uuid':   return '00000000-0000-0000-0000-000000000000';
    case 'number': return '0';
    case 'bool':   return 'false';
    case 'json':   return '{}';
    default:       return 'YOUR_VALUE_HERE';
  }
}

// ─── Output Formatters ─────────────────────────────────────────────────────
function printResults(allResults, opts) {
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalOk = 0;

  const jsonOutput = [];

  for (const result of allResults) {
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
    totalOk += result.ok.length;

    if (opts.json) {
      jsonOutput.push(result);
      continue;
    }

    if (!opts.ci) {
      console.log(`\n${c.bold(c.cyan('Validating:'))} ${result.file}`);
    }

    for (const e of result.errors) {
      if (opts.ci) {
        console.log(`ERROR|${result.file}|${e.key ?? ''}|${e.code}|${e.message}`);
      } else {
        console.log(`  ${c.red('✗')} ${c.red(e.message)}`);
      }
    }

    for (const w of result.warnings) {
      if (opts.ci) {
        console.log(`WARN|${result.file}|${w.key ?? ''}|${w.code}|${w.message}`);
      } else {
        console.log(`  ${c.yellow('!')} ${c.yellow(w.message)}`);
      }
    }

    for (const ok of result.ok) {
      if (opts.ci) {
        console.log(`OK|${result.file}|${ok.key}|${ok.code}|${ok.message}`);
      } else {
        console.log(`  ${c.green('✓')} ${c.dim(ok.message)}`);
      }
    }
  }

  if (opts.json) {
    console.log(JSON.stringify({
      summary: { errors: totalErrors, warnings: totalWarnings, ok: totalOk },
      results: jsonOutput,
    }, null, 2));
    return { totalErrors, totalWarnings };
  }

  if (!opts.ci) {
    console.log('');
    const summaryParts = [
      totalErrors > 0   ? c.red(`${totalErrors} error${totalErrors !== 1 ? 's' : ''}`)     : null,
      totalWarnings > 0 ? c.yellow(`${totalWarnings} warning${totalWarnings !== 1 ? 's' : ''}`) : null,
      totalOk > 0       ? c.green(`${totalOk} ok`)                                          : null,
    ].filter(Boolean).join(', ');

    console.log(c.bold('Summary: ') + (summaryParts || c.dim('nothing checked')));

    if (totalErrors === 0 && totalWarnings === 0) {
      console.log(c.green('All checks passed.'));
    }
  }

  return { totalErrors, totalWarnings };
}

// ─── Directory Mode ────────────────────────────────────────────────────────
function findEnvFilesInDir(dirPath) {
  const files = readdirSync(dirPath);
  return files.filter(f => /^\.env(\..+)?$/.test(f) && !f.includes('example') && !f.includes('sample'));
}

// ─── Main ──────────────────────────────────────────────────────────────────
function main() {
  const args = argv.slice(2);
  const opts = parseArgs(args);

  if (opts.help) {
    printHelp();
    exit(0);
  }

  if (opts.version) {
    console.log(`dotenv-validator v${VERSION}`);
    exit(0);
  }

  const cwd = process.cwd();
  const allResults = [];

  // ── Directory mode ─────────────────────────────────────────────────────
  if (opts.dir) {
    const dirPath = resolve(cwd, opts.dir);
    const exampleFile = resolve(dirPath, '.env.example');

    if (!existsSync(dirPath)) {
      stderr.write(`Directory not found: ${dirPath}\n`);
      exit(1);
    }

    const envFiles = findEnvFilesInDir(dirPath);
    if (envFiles.length === 0) {
      console.log(c.yellow(`No .env* files found in: ${dirPath}`));
      exit(0);
    }

    for (const f of envFiles) {
      const envFile = resolve(dirPath, f);
      const result = validateEnvPair(envFile, exampleFile, opts);
      allResults.push(result);
    }

  // ── Fix mode ───────────────────────────────────────────────────────────
  } else if (opts.fix) {
    const envFile = resolve(cwd, opts.envFile ?? '.env');
    const exampleFile = resolve(cwd, opts.exampleFile ?? '.env.example');

    if (!existsSync(exampleFile)) {
      stderr.write(`Example file not found: ${exampleFile}\n`);
      exit(1);
    }

    const content = generateFixedEnv(exampleFile, envFile);
    const outFile = resolve(cwd, opts.envFile ?? '.env');
    writeFileSync(outFile, content, 'utf8');
    console.log(c.green(`Generated: ${outFile}`));
    console.log(c.yellow('Replace placeholder values with actual credentials before use.'));
    exit(0);

  // ── Single file mode ───────────────────────────────────────────────────
  } else {
    const envFile = resolve(cwd, opts.envFile ?? '.env');
    const exampleFile = resolve(cwd, opts.exampleFile ?? '.env.example');
    const result = validateEnvPair(envFile, exampleFile, opts);
    allResults.push(result);
  }

  const { totalErrors, totalWarnings } = printResults(allResults, opts);

  // Exit code logic
  if (totalErrors > 0) {
    exit(1);
  }
  if (opts.ci && totalWarnings > 0) {
    exit(1);
  }
  exit(0);
}

main();
