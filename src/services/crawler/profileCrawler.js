import puppeteer from 'puppeteer';
import { Profile } from '../../models/Profile.js';
import logger from '../../config/logger.js';
import { delay, extractLocation } from '../../utils/crawlerUtils.js';

class ProfileCrawler {
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
  
    async crawlProfile(profileUrl) {
      try {
        if (this.requestCount >= 20) {
          const waitTime = 60000 - (Date.now() - this.lastRequestTime);
          if (waitTime > 0) await delay(waitTime);
          this.requestCount = 0;
          this.lastRequestTime = Date.now();
        }
  
        await this.page.goto(profileUrl, { waitUntil: 'networkidle0' });
        await this.page.waitForSelector('.pv-top-card');
  
        const profile = await this.page.evaluate(() => ({
          name: document.querySelector('.pv-top-card--list li')?.textContent.trim(),
          headline: document.querySelector('.pv-top-card h2')?.textContent.trim(),
          location: document.querySelector('.pv-top-card .pv-top-card--list-bullet li')?.textContent.trim(),
          currentPosition: {
            title: document.querySelector('.pv-top-card--experience-list-item .pv-entity__summary-info h3')?.textContent.trim(),
            company: document.querySelector('.pv-top-card--experience-list-item .pv-entity__secondary-title')?.textContent.trim(),
          },
          skills: Array.from(
            document.querySelectorAll('.pv-skill-category-entity__name-text')
          ).map(el => ({
            name: el.textContent.trim(),
            endorsements: parseInt(el.closest('.pv-skill-category-entity')
              ?.querySelector('.pv-skill-category-entity__endorsement-count')
              ?.textContent.trim() || '0', 10)
          })),
          experience: Array.from(
            document.querySelectorAll('.experience-section .pv-entity__summary-info')
          ).map(exp => ({
            title: exp.querySelector('h3')?.textContent.trim(),
            company: exp.querySelector('.pv-entity__secondary-title')?.textContent.trim(),
            duration: exp.querySelector('.pv-entity__date-range span:nth-child(2)')?.textContent.trim(),
            description: exp.querySelector('.pv-entity__description')?.textContent.trim()
          }))
        }));
  
        const locationDetails = extractLocation(profile.location);
        
        const profileDoc = {
          ...profile,
          locationDetails,
          sourceUrl: profileUrl,
          crawlStatus: {
            lastCrawled: new Date(),
            isActive: true
          },
          profileScore: this.calculateProfileScore(profile)
        };
  
        await Profile.findOneAndUpdate(
          { sourceUrl: profileUrl },
          profileDoc,
          { upsert: true, new: true }
        );
  
        this.requestCount++;
        return profile;
  
      } catch (error) {
        logger.error('Error crawling profile:', error);
        throw error;
      }
    }
  
    calculateProfileScore(profile) {
      let score = 0;
      if (profile.name) score += 10;
      if (profile.headline) score += 10;
      if (profile.location) score += 10;
      if (profile.currentPosition?.title) score += 15;
      if (profile.currentPosition?.company) score += 15;
      if (profile.skills?.length > 0) score += Math.min(20, profile.skills.length * 2);
      if (profile.experience?.length > 0) score += Math.min(20, profile.experience.length * 5);
      return score;
    }
  
    async close() {
      if (this.browser) await this.browser.close();
    }
  }
  

export default ProfileCrawler;