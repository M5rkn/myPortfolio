/**
 * Cookie Consent Manager
 * Управление согласием пользователя на использование cookies
 */

class CookieConsent {
    constructor() {
        this.consentKey = 'cookieConsent';
        this.preferencesKey = 'cookiePreferences';
        this.bannerShown = false;
        
        // Типы cookies
        this.cookieTypes = {
            essential: {
                name: 'Необходимые',
                description: 'Обеспечивают базовую функциональность сайта',
                required: true
            },
            functional: {
                name: 'Функциональные', 
                description: 'Сохраняют ваши предпочтения и настройки',
                required: false
            },
            analytics: {
                name: 'Аналитические',
                description: 'Помогают понять, как используется сайт',
                required: false
            }
        };
        
        this.init();
    }
    
    init() {
        // Проверяем, дал ли пользователь согласие
        const consent = this.getConsent();
        
        if (!consent) {
            this.showBanner();
        } else {
            this.applyConsent(consent);
        }
        
        // Добавляем обработчики событий
        this.bindEvents();
    }
    
    getConsent() {
        try {
            const consent = localStorage.getItem(this.consentKey);
            return consent ? JSON.parse(consent) : null;
        } catch (error) {
            console.warn('Ошибка чтения согласия на cookies:', error);
            return null;
        }
    }
    
    setConsent(preferences) {
        const consent = {
            timestamp: Date.now(),
            version: '1.0',
            preferences: preferences
        };
        
        try {
            localStorage.setItem(this.consentKey, JSON.stringify(consent));
            localStorage.setItem(this.preferencesKey, JSON.stringify(preferences));
            this.applyConsent(consent);
            this.hideBanner();
            
            // Уведомляем об изменении согласия
            this.dispatchConsentEvent(preferences);
        } catch (error) {
            console.error('Ошибка сохранения согласия на cookies:', error);
        }
    }
    
    applyConsent(consent) {
        const preferences = consent.preferences;
        
        // Применяем настройки для каждого типа cookies
        Object.keys(this.cookieTypes).forEach(type => {
            const allowed = preferences[type];
            this.toggleCookieType(type, allowed);
        });
    }
    
    toggleCookieType(type, enabled) {
        switch (type) {
            case 'essential':
                // Необходимые cookies всегда включены
                break;
                
            case 'functional':
                if (!enabled) {
                    // Удаляем функциональные cookies
                    this.removeCookiesByPattern(/^userPreferences/);
                    this.removeCookiesByPattern(/^theme/);
                }
                break;
                
            case 'analytics':
                if (enabled) {
                    this.enableAnalytics();
                } else {
                    this.disableAnalytics();
                }
                break;
        }
    }
    
    enableAnalytics() {
        // Включаем Google Analytics если он еще не загружен
        if (typeof gtag === 'undefined' && !document.querySelector('[src*="googletagmanager"]')) {
            this.loadGoogleAnalytics();
        }
    }
    
    disableAnalytics() {
        // Отключаем Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
        }
        
        // Удаляем аналитические cookies
        this.removeCookiesByPattern(/^_ga/);
        this.removeCookiesByPattern(/^_gid/);
        this.removeCookiesByPattern(/^_gat/);
    }
    
    loadGoogleAnalytics() {
        // Загружаем Google Analytics только если пользователь дал согласие
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-H8Y6Z1V6P5';
        document.head.appendChild(script);
        
        script.onload = () => {
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            
            gtag('js', new Date());
            gtag('config', 'G-H8Y6Z1V6P5', {
                'anonymize_ip': true,
                'cookie_flags': 'SameSite=Strict;Secure'
            });
        };
    }
    
    removeCookiesByPattern(pattern) {
        document.cookie.split(';').forEach(cookie => {
            const name = cookie.split('=')[0].trim();
            if (pattern.test(name)) {
                this.deleteCookie(name);
            }
        });
    }
    
    deleteCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
    }
    
    showBanner() {
        if (this.bannerShown) return;
        
        const banner = this.createBanner();
        document.body.appendChild(banner);
        this.bannerShown = true;
        
        // Анимация появления
        setTimeout(() => {
            banner.classList.add('show');
        }, 100);
    }
    
    hideBanner() {
        const banner = document.getElementById('cookieConsentBanner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.remove();
                this.bannerShown = false;
            }, 300);
        }
    }
    
    createBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookieConsentBanner';
        banner.className = 'cookie-consent-banner';
        
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-banner-text">
                    <div class="cookie-banner-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C13.1046 2 14 2.89543 14 4C14 5.10457 13.1046 6 12 6C10.8954 6 10 5.10457 10 4C10 2.89543 10.8954 2 12 2Z" fill="currentColor"/>
                            <path d="M8 7C9.10457 7 10 7.89543 10 9C10 10.1046 9.10457 11 8 11C6.89543 11 6 10.1046 6 9C6 7.89543 6.89543 7 8 7Z" fill="currentColor"/>
                            <path d="M16 8C17.1046 8 18 8.89543 18 10C18 11.1046 17.1046 12 16 12C14.8954 12 14 11.1046 14 10C14 8.89543 14.8954 8 16 8Z" fill="currentColor"/>
                            <path d="M7 14C8.10457 14 9 14.8954 9 16C9 17.1046 8.10457 18 7 18C5.89543 18 5 17.1046 5 16C5 14.8954 5.89543 14 7 14Z" fill="currentColor"/>
                            <path d="M17 15C18.1046 15 19 15.8954 19 17C19 18.1046 18.1046 19 17 19C15.8954 19 15 18.1046 15 17C15 15.8954 15.8954 15 17 15Z" fill="currentColor"/>
                            <path d="M12 20C13.1046 20 14 20.8954 14 22C14 23.1046 13.1046 24 12 24C10.8954 24 10 23.1046 10 22C10 20.8954 10.8954 20 12 20Z" fill="currentColor"/>
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                    </div>
                    <div class="cookie-banner-message">
                        <h3 class="cookie-banner-title">Мы используем cookies</h3>
                        <p class="cookie-banner-description">
                            Этот сайт использует файлы cookie для обеспечения наилучшего пользовательского опыта. 
                            <a href="/cookie-policy.html" class="cookie-policy-link" target="_blank">Подробнее о cookies</a>
                        </p>
                    </div>
                </div>
                <div class="cookie-banner-actions">
                    <button class="cookie-btn cookie-btn-settings" id="cookieSettings">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2"/>
                            <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2579 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.01127 9.77251C4.28053 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Настройки
                    </button>
                    <button class="cookie-btn cookie-btn-accept" id="cookieAcceptAll">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Принять все
                    </button>
                </div>
            </div>
        `;
        
        return banner;
    }
    
    showSettings() {
        const modal = this.createSettingsModal();
        document.body.appendChild(modal);
        
        // Анимация появления
        setTimeout(() => {
            modal.classList.add('show');
        }, 100);
    }
    
    hideSettings() {
        const modal = document.getElementById('cookieSettingsModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }
    
    createSettingsModal() {
        const modal = document.createElement('div');
        modal.id = 'cookieSettingsModal';
        modal.className = 'cookie-settings-modal';
        
        const currentPreferences = this.getConsent()?.preferences || {
            essential: true,
            functional: false,
            analytics: false
        };
        
        modal.innerHTML = `
            <div class="cookie-modal-overlay"></div>
            <div class="cookie-modal-content">
                <div class="cookie-modal-header">
                    <h2 class="cookie-modal-title">Настройки cookies</h2>
                    <button class="cookie-modal-close" id="cookieModalClose">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div class="cookie-modal-body">
                    <p class="cookie-modal-description">
                        Выберите, какие типы cookies вы хотите разрешить. Это поможет нам предоставить вам лучший опыт использования сайта.
                    </p>
                    <div class="cookie-types">
                        ${Object.entries(this.cookieTypes).map(([type, config]) => `
                            <div class="cookie-type-item">
                                <div class="cookie-type-header">
                                    <label class="cookie-type-label">
                                        <input 
                                            type="checkbox" 
                                            id="cookie-${type}" 
                                            ${currentPreferences[type] ? 'checked' : ''}
                                            ${config.required ? 'disabled' : ''}
                                            class="cookie-type-checkbox"
                                        >
                                        <span class="cookie-type-checkmark"></span>
                                        <div class="cookie-type-info">
                                            <h3 class="cookie-type-name">${config.name}</h3>
                                            ${config.required ? '<span class="cookie-type-required">Обязательные</span>' : ''}
                                        </div>
                                    </label>
                                </div>
                                <p class="cookie-type-description">${config.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="cookie-modal-footer">
                    <button class="cookie-btn cookie-btn-outline" id="cookieRejectAll">
                        Только необходимые
                    </button>
                    <button class="cookie-btn cookie-btn-primary" id="cookieSaveSettings">
                        Сохранить настройки
                    </button>
                </div>
            </div>
        `;
        
        return modal;
    }
    
    bindEvents() {
        // Обработчики для баннера
        document.addEventListener('click', (e) => {
            if (e.target.id === 'cookieAcceptAll') {
                this.acceptAll();
            } else if (e.target.id === 'cookieSettings') {
                this.showSettings();
            } else if (e.target.id === 'cookieModalClose') {
                this.hideSettings();
            } else if (e.target.id === 'cookieRejectAll') {
                this.rejectAll();
            } else if (e.target.id === 'cookieSaveSettings') {
                this.saveSettings();
            } else if (e.target.classList.contains('cookie-modal-overlay')) {
                this.hideSettings();
            }
        });
    }
    
    acceptAll() {
        const preferences = {};
        Object.keys(this.cookieTypes).forEach(type => {
            preferences[type] = true;
        });
        this.setConsent(preferences);
    }
    
    rejectAll() {
        const preferences = {};
        Object.keys(this.cookieTypes).forEach(type => {
            preferences[type] = this.cookieTypes[type].required;
        });
        this.setConsent(preferences);
        this.hideSettings();
    }
    
    saveSettings() {
        const preferences = {};
        Object.keys(this.cookieTypes).forEach(type => {
            const checkbox = document.getElementById(`cookie-${type}`);
            preferences[type] = checkbox ? checkbox.checked : this.cookieTypes[type].required;
        });
        this.setConsent(preferences);
        this.hideSettings();
    }
    
    dispatchConsentEvent(preferences) {
        const event = new CustomEvent('cookieConsentChanged', {
            detail: { preferences }
        });
        document.dispatchEvent(event);
    }
    
    // Публичные методы для управления согласием
    hasConsent(type = null) {
        const consent = this.getConsent();
        if (!consent) return false;
        
        if (type) {
            return consent.preferences[type] || false;
        }
        
        return true; // Есть любое согласие
    }
    
    updateConsent(type, enabled) {
        const consent = this.getConsent();
        if (consent) {
            consent.preferences[type] = enabled;
            this.setConsent(consent.preferences);
        }
    }
    
    resetConsent() {
        localStorage.removeItem(this.consentKey);
        localStorage.removeItem(this.preferencesKey);
        this.showBanner();
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.cookieConsent = new CookieConsent();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CookieConsent;
} 