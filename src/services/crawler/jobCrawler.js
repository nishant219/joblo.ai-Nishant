import puppeteer from 'puppeteer';
import { Job } from '../../models/Job.js';
import logger from '../../config/logger.js';
import { delay, extractLocation } from '../../utils/crawlerUtils.js';

class JobCrawler {
  constructor() {
    this.browser = null;
    this.page = null;
    this.requestCount = 0;
    this.lastRequestTime = Date.now();
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
  }

  async crawlJobs(searchQuery, maxJobs = 50) {
    try {
      // Rate limiting // 20 requests per minute
      if (this.requestCount >= 20) { 
        const waitTime = 60000 - (Date.now() - this.lastRequestTime);
        if (waitTime > 0) await delay(waitTime);
        this.requestCount = 0;
        this.lastRequestTime = Date.now();
      }

      await this.page.goto(
        `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(searchQuery)}`,
        { waitUntil: 'networkidle0' }
      );

      await this.page.waitForSelector('.jobs-search__results-list');

      const jobs = await this.page.evaluate(() => {
        const jobElements = document.querySelectorAll('.jobs-search__results-list > li');
        return Array.from(jobElements, element => ({
          title: element.querySelector('.job-card-list__title')?.textContent.trim(),
          company: element.querySelector('.job-card-container__company-name')?.textContent.trim(),
          location: element.querySelector('.job-card-container__metadata-item')?.textContent.trim(),
          description: element.querySelector('.job-card-list__description')?.textContent.trim(),
          sourceUrl: element.querySelector('a')?.href,
          employmentType: element.querySelector('.job-card-container__metadata-item--workplace-type')?.textContent.trim(),
          postDate: element.querySelector('time')?.getAttribute('datetime'),
        }));
      });

      for (const job of jobs.slice(0, maxJobs)) {
        const locationDetails = extractLocation(job.location);
        
        const jobDoc = {
          ...job,
          locationDetails,
          status: 'ACTIVE',
          crawlStatus: {
            lastCrawled: new Date(),
            isActive: true
          }
        };

        await Job.findOneAndUpdate(
          { sourceUrl: job.sourceUrl },
          jobDoc,
          { upsert: true, new: true }
        );

        this.requestCount++;
      }

      return jobs.length;
    } catch (error) {
      logger.error('Error crawling jobs:', error);
      throw error;
    }
  }

  async close() {
    if (this.browser) await this.browser.close();
  }
}


export default JobCrawler;