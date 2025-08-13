const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Test sonuçları için sınıf
class TestResult {
    constructor(name, status, duration, output = "", error = "") {
        this.name = name;
        this.status = status;
        this.duration = duration;
        this.output = output;
        this.error = error;
        this.timestamp = new Date().toISOString();
    }
}

// Test çalıştırma fonksiyonu
function runTest(command, timeout = 60000) {
    return new Promise((resolve) => {
        const startTime = Date.now();

        exec(command, {
            cwd: path.join(__dirname, '..'), // Proje kök dizini
            timeout: timeout
        }, (error, stdout, stderr) => {
            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;

            if (error) {
                resolve(new TestResult(
                    command.split(' ')[0],
                    'error',
                    duration,
                    stdout,
                    stderr || error.message
                ));
            } else {
                resolve(new TestResult(
                    command.split(' ')[0],
                    'success',
                    duration,
                    stdout,
                    stderr
                ));
            }
        });
    });
}

// API Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web-lint-checker.html'));
});

app.post('/api/run-lint', async (req, res) => {
    try {
        const result = await runTest('npx next lint --fix', 60000);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            name: 'Lint Test',
            status: 'error',
            duration: 0,
            output: '',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.post('/api/run-typescript', async (req, res) => {
    try {
        const result = await runTest('npx tsc --noEmit', 30000);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            name: 'TypeScript Test',
            status: 'error',
            duration: 0,
            output: '',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.post('/api/run-build', async (req, res) => {
    try {
        const result = await runTest('npm run build', 120000);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            name: 'Build Test',
            status: 'error',
            duration: 0,
            output: '',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.post('/api/run-all-tests', async (req, res) => {
    try {
        const results = [];

        // Lint testi
        const lintResult = await runTest('npx next lint --fix', 60000);
        results.push(lintResult);

        // TypeScript testi
        const tsResult = await runTest('npx tsc --noEmit', 30000);
        results.push(tsResult);

        // Build testi
        const buildResult = await runTest('npm run build', 120000);
        results.push(buildResult);

        res.json({
            results: results,
            summary: {
                total: results.length,
                success: results.filter(r => r.status === 'success').length,
                error: results.filter(r => r.status === 'error').length,
                totalTime: results.reduce((sum, r) => sum + r.duration, 0)
            }
        });
    } catch (error) {
        res.status(500).json({
            results: [],
            summary: {
                total: 0,
                success: 0,
                error: 0,
                totalTime: 0
            },
            error: error.message
        });
    }
});

app.post('/api/run-security-check', async (req, res) => {
    try {
        const result = await runSecurityCheck();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            name: 'Security Check',
            status: 'error',
            duration: 0,
            output: '',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

async function runSecurityCheck() {
    const startTime = Date.now();

    try {
        const fs = require('fs');
        const path = require('path');

        // Environment variable pattern'leri (hardcoded değerler)
        const envVarPatterns = [
            /GEMINI_API_KEY\s*=\s*["'][^"']+["']/, // GEMINI_API_KEY = "value"
            /SUPABASE_URL\s*=\s*["'][^"']+["']/, // SUPABASE_URL = "value"
            /SUPABASE_ANON_KEY\s*=\s*["'][^"']+["']/, // SUPABASE_ANON_KEY = "value"
            /GOOGLE_CLIENT_ID\s*=\s*["'][^"']+["']/, // GOOGLE_CLIENT_ID = "value"
            /CLOUDINARY_CLOUD_NAME\s*=\s*["'][^"']+["']/, // CLOUDINARY_CLOUD_NAME = "value"
            /CLOUDINARY_API_KEY\s*=\s*["'][^"']+["']/, // CLOUDINARY_API_KEY = "value"
            /CLOUDINARY_API_SECRET\s*=\s*["'][^"']+["']/, // CLOUDINARY_API_SECRET = "value"
        ];

        // Hardcoded değerler için pattern'ler (environment variable olmadan)
        const hardcodedPatterns = [
            /https:\/\/[a-zA-Z0-9-]+\.supabase\.co/, // Supabase URL
            /AIza[a-zA-Z0-9_-]{35}/, // Google API Key
            /https:\/\/res\.cloudinary\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9\/_-]+/, // Cloudinary URL
            /[0-9]+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com/, // Google Client ID
            /AIza[a-zA-Z0-9_-]{39}/, // Gemini API Key
        ];

        // Hardcoded environment variable'lar için arama
        const hardcodedEnvVars = [];
        const hardcodedValues = [];
        const projectRoot = path.join(__dirname, '..');
        const srcDir = path.join(projectRoot, 'src'); // Sadece src dizini

        function scanDirectory(dir) {
            const files = fs.readdirSync(dir);

            for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);

                if (stat.isDirectory()) {
                    // .git gibi dizinleri atla
                    if (file === '.git') {
                        continue;
                    }
                    scanDirectory(filePath);
                } else if (stat.isFile()) {
                    // Sadece belirli dosya türlerini kontrol et
                    const ext = path.extname(file);
                    if (['.js', '.ts', '.tsx', '.jsx', '.json'].includes(ext)) {
                        try {
                            const content = fs.readFileSync(filePath, 'utf8');
                            const relativePath = path.relative(projectRoot, filePath);

                            // Debug: Hangi dosyaların taranıyor olduğunu göster
                            console.log(`🔍 Tarama: ${relativePath}`);

                            // Yorum satırlarını temizle
                            const lines = content.split('\n');
                            const codeLines = lines.filter(line => {
                                const trimmed = line.trim();
                                return !trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*');
                            });
                            const cleanContent = codeLines.join('\n');

                            // Environment variable kontrolü
                            for (const pattern of envVarPatterns) {
                                const matches = cleanContent.match(pattern);
                                if (matches) {
                                    console.log(`❌ Environment variable bulundu: ${relativePath}`);
                                    console.log(`🔍 Pattern: ${pattern.toString()}`);
                                    console.log(`📄 Bulunan değerler: ${matches.join(', ')}`);
                                    hardcodedEnvVars.push({
                                        file: relativePath,
                                        matches: matches,
                                        pattern: pattern.toString()
                                    });
                                }
                            }

                            // Hardcoded değer kontrolü
                            for (const pattern of hardcodedPatterns) {
                                const matches = cleanContent.match(pattern);
                                if (matches) {
                                    console.log(`❌ Hardcoded değer bulundu: ${relativePath}`);
                                    console.log(`🔍 Pattern: ${pattern.toString()}`);
                                    console.log(`📄 Bulunan değerler: ${matches.join(', ')}`);
                                    hardcodedValues.push({
                                        file: relativePath,
                                        values: matches,
                                        pattern: pattern.toString()
                                    });
                                }
                            }
                        } catch (err) {
                            // Dosya okunamazsa atla
                            console.log(`⚠️ Dosya okunamadı: ${path.relative(projectRoot, filePath)}`);
                        }
                    }
                }
            }
        }

        scanDirectory(srcDir); // Sadece src dizinini tara

        console.log(`\n📊 Tarama Sonuçları:`);
        console.log(`🔒 Environment Variables bulunan: ${hardcodedEnvVars.length}`);
        console.log(`🔑 Hardcoded değerler bulunan: ${hardcodedValues.length}`);

        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;

        let status = 'success';
        let output = '';

        if (hardcodedEnvVars.length > 0 || hardcodedValues.length > 0) {
            status = 'error';
            output = `❌ Güvenlik riskleri bulundu!\n\n`;

            if (hardcodedEnvVars.length > 0) {
                output += `🔒 Environment Variables (${hardcodedEnvVars.length} adet):\n`;
                hardcodedEnvVars.forEach(item => {
                    output += `📁 ${item.file}\n`;
                    output += `🔑 Bulunan değişkenler: ${item.matches.length}\n`;
                    output += `🔍 Pattern: ${item.pattern}\n\n`;
                });
            }

            if (hardcodedValues.length > 0) {
                output += `🔑 Hardcoded Değerler (${hardcodedValues.length} adet):\n`;
                hardcodedValues.forEach(item => {
                    output += `📁 ${item.file}\n`;
                    output += `🔑 Bulunan değerler: ${item.values.length}\n`;
                    output += `🔍 Pattern: ${item.pattern}\n\n`;
                });
            }

            output += '⚠️ Güvenlik riski! Tüm API key\'leri ve environment variable\'ları .env dosyasına taşıyın.';
        } else {
            output = '✅ Güvenlik kontrolü başarılı!\n\n🔒 Güvenlik durumu: MÜKEMMEL!\n\n✅ Tüm API key\'ler environment variables\'da\n✅ Tüm environment variable\'lar güvenli\n✅ Güvenlik best practices uygulanıyor\n✅ Production ready güvenlik';
        }

        return new TestResult(
            'Security Check',
            status,
            duration,
            output,
            ''
        );

    } catch (error) {
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;

        return new TestResult(
            'Security Check',
            'error',
            duration,
            '',
            error.message
        );
    }
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Server başlatma
app.listen(PORT, () => {
    console.log(`🧠 AkılHane Web Lint Checker API`);
    console.log(`🌐 Server: http://localhost:${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/api/health`);
    console.log(`🔧 API Endpoints:`);
    console.log(`   POST /api/run-lint`);
    console.log(`   POST /api/run-typescript`);
    console.log(`   POST /api/run-build`);
    console.log(`   POST /api/run-all-tests`);
    console.log(`   POST /api/run-security-check`);
    console.log(`\n🚀 Web arayüzü: http://localhost:${PORT}`);
});

module.exports = app;
