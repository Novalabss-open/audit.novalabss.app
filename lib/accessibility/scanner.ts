import puppeteer, { type Browser, type Page } from 'puppeteer';
import puppeteerCore from 'puppeteer-core';
import { AxePuppeteer } from '@axe-core/puppeteer';
import type { AxeResults } from 'axe-core';
import { calculateScore, calculateSummary } from './score-calculator';
import type { ScanResult, Violation, ViolationNode } from './types';

// Check if we're in production (Vercel)
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Launch Puppeteer browser instance
 */
async function launchBrowser(): Promise<Browser> {
  if (isProduction) {
    // Check if we're running in Docker (custom Chromium path)
    const isDocker = process.env.PUPPETEER_EXECUTABLE_PATH;

    if (isDocker) {
      // Docker: Use system Chromium with puppeteer-core
      return puppeteerCore.launch({
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-extensions',
          '--disable-background-networking',
          '--disable-default-apps',
          '--disable-sync',
          '--metrics-recording-only',
          '--mute-audio',
          '--no-first-run',
          '--safebrowsing-disable-auto-update',
          '--single-process',
          '--no-zygote',
          // Fix crashpad handler error
          '--disable-crash-reporter',
          '--disable-breakpad',
          '--user-data-dir=/tmp/chrome-profile',
        ],
        headless: true,
        defaultViewport: { width: 1920, height: 1080 },
      });
    } else {
      // Vercel: Use @sparticuz/chromium
      const chromium = await import('@sparticuz/chromium');
      chromium.default.setGraphicsMode = false;

      return puppeteerCore.launch({
        args: [
          ...chromium.default.args,
          '--disable-dev-shm-usage',
          '--no-zygote',
          '--single-process',
        ],
        defaultViewport: chromium.default.defaultViewport,
        executablePath: await chromium.default.executablePath(),
        headless: chromium.default.headless,
      });
    }
  }

  // Development: Use local Chromium
  return puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });
}

/**
 * Transform axe-core violations to our format
 */
function transformViolations(axeViolations: AxeResults['violations']): Violation[] {
  return axeViolations.map((violation) => ({
    id: violation.id,
    impact: violation.impact as 'critical' | 'serious' | 'moderate' | 'minor',
    description: violation.description,
    help: violation.help,
    helpUrl: violation.helpUrl,
    tags: violation.tags,
    nodes: violation.nodes.map((node) => ({
      html: node.html,
      target: node.target,
      failureSummary: node.failureSummary || '',
    })) as ViolationNode[],
  }));
}

/**
 * Validate URL format
 */
function validateUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsedUrl = new URL(url);

    // Check protocol
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return { valid: false, error: 'URL debe usar protocolo HTTP o HTTPS' };
    }

    // Block localhost and internal IPs
    const hostname = parsedUrl.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.')
    ) {
      return { valid: false, error: 'No se pueden escanear URLs locales o internas' };
    }

    // Check URL length
    if (url.length > 2000) {
      return { valid: false, error: 'URL demasiado larga' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Formato de URL inválido' };
  }
}

/**
 * Main scanner function
 * Scans a URL for WCAG accessibility violations
 *
 * @param url - The URL to scan
 * @returns ScanResult with score and violations
 * @throws Error if scan fails
 */
export async function scanUrl(url: string): Promise<ScanResult> {
  // Validate URL
  const validation = validateUrl(url);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // Launch browser
    browser = await launchBrowser();
    page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Set user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AccessibilityChecker/1.0'
    );

    // Navigate to URL with timeout
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000, // 30 seconds
    });

    // Run axe analysis using @axe-core/puppeteer
    const axeResults = await new AxePuppeteer(page)
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag21a', 'best-practice'])
      .analyze();

    // Transform violations
    const violations = transformViolations(axeResults.violations);

    // Calculate score
    const score = calculateScore(violations);

    // Calculate summary
    const summary = calculateSummary(violations);

    // Build result
    const result: ScanResult = {
      url,
      score,
      timestamp: new Date().toISOString(),
      violations,
      passes: axeResults.passes.length,
      incomplete: axeResults.incomplete.length,
      summary,
    };

    return result;
  } catch (error) {
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Navigation timeout')) {
        throw new Error('Timeout: El sitio tardó demasiado en cargar (>30s)');
      }
      if (error.message.includes('net::ERR')) {
        throw new Error('No se pudo acceder al sitio. Verifica que la URL esté online.');
      }
      throw error;
    }
    throw new Error('Error desconocido al escanear el sitio');
  } finally {
    // Cleanup
    if (page) await page.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }
}
