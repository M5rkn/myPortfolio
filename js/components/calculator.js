// ========== CALCULATOR COMPONENT MODULE ==========
// Модуль калькулятора стоимости веб-проектов

// Initialize cost calculator
function initializeCostCalculator() {
    const calculatorToggle = secureGetElementById('calculatorToggle');
    const calculatorWindow = secureGetElementById('calculatorWindow');
    const calculatorClose = secureGetElementById('calculatorClose');
    
    if (!calculatorToggle || !calculatorWindow) {
        console.warn('Calculator elements not found');
        return;
    }
    
    // Удаляем все существующие обработчики
    const newToggle = calculatorToggle.cloneNode(true);
    calculatorToggle.parentNode.replaceChild(newToggle, calculatorToggle);
    
    // Toggle calculator window - ЕДИНСТВЕННЫЙ обработчик
    newToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        calculatorWindow.classList.toggle('active');
        
        return false;
    }, { once: false, passive: false });
    
    // Close calculator
    if (calculatorClose) {
        const newClose = calculatorClose.cloneNode(true);
        calculatorClose.parentNode.replaceChild(newClose, calculatorClose);
        
        newClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            calculatorWindow.classList.remove('active');
            
            return false;
        }, { once: false, passive: false });
    }
    
    // Initialize calculation logic
    initializeCalculationLogic();
    
    // Initialize PDF generation (lazy loading)
    setupPDFGeneration();
}

// Initialize calculation logic
function initializeCalculationLogic() {
    // Add event listeners to project type inputs
    const projectTypeInputs = document.querySelectorAll('input[name="projectType"]');
    projectTypeInputs.forEach(input => {
        input.addEventListener('change', calculateCost);
    });
    
    // Add event listeners to feature checkboxes
    const featureInputs = document.querySelectorAll('input[name="features"]');
    featureInputs.forEach(input => {
        input.addEventListener('change', calculateCost);
    });
    
    // Add event listener to quote button
    const quoteButton = document.getElementById('requestQuote');
    if (quoteButton) {
        quoteButton.addEventListener('click', handleQuoteRequest);
    }
    
    // Initial calculation
    calculateCost();
}

// Main calculation function
function calculateCost() {
    try {
        let totalCost = 0;
        
        // Get selected project type
        const projectTypeInput = document.querySelector('input[name="projectType"]:checked');
        if (projectTypeInput) {
            totalCost += parseInt(projectTypeInput.dataset.cost) || 0;
        }
        
        // Add feature costs
        const featureInputs = document.querySelectorAll('input[name="features"]:checked');
        featureInputs.forEach(input => {
            totalCost += parseInt(input.dataset.cost) || 0;
        });
        
        // Update display
        const totalCostElement = document.getElementById('totalCost');
        if (totalCostElement) {
            totalCostElement.textContent = `${totalCost}€`;
        }
        
        return totalCost;
        
    } catch (error) {
        console.error('Calculation error:', error);
        const resultElement = document.getElementById('totalCost');
        if (resultElement) {
            resultElement.textContent = 'Ошибка расчета';
        }
        return 0;
    }
}

// Handle quote request
function handleQuoteRequest() {
    const projectTypeInput = document.querySelector('input[name="projectType"]:checked');
    const featureInputs = document.querySelectorAll('input[name="features"]:checked');
    const totalCostElement = document.getElementById('totalCost');
    
    if (!projectTypeInput) {
        window.FormsModule.showNotification('Выберите тип проекта', 'error');
        return;
    }
    
    const projectType = projectTypeInput.nextElementSibling.textContent;
    const features = Array.from(featureInputs).map(input => 
        input.nextElementSibling.textContent
    );
    const totalCost = totalCostElement.textContent;
    
    // Заполнить форму контакта с информацией о расчете
    const messageTextarea = document.getElementById('message');
    if (messageTextarea) {
        const calculationDetails = `
Запрос расчета стоимости проекта:

Тип проекта: ${projectType}
${features.length > 0 ? `Дополнительные опции: ${features.join(', ')}` : ''}
Примерная стоимость: ${totalCost}

Прошу предоставить детальное коммерческое предложение.
        `.trim();
        
        messageTextarea.value = calculationDetails;
        
        // Прокрутить к форме контакта
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
            
            // Подсветить форму
            setTimeout(() => {
                messageTextarea.focus();
                messageTextarea.style.borderColor = '#667eea';
                setTimeout(() => {
                    messageTextarea.style.borderColor = '';
                }, 2000);
            }, 1000);
        }
    }
    
    // Закрыть калькулятор
    const calculatorWindow = document.getElementById('calculatorWindow');
    const costCalculator = document.getElementById('costCalculator');
    if (calculatorWindow && costCalculator) {
        calculatorWindow.classList.remove('active');
        costCalculator.classList.remove('active');
    }
    
    window.FormsModule.showNotification('Данные перенесены в форму контакта!', 'success');
}

// Animate price change
function animatePrice(element, targetPrice) {
    const currentPrice = parseInt(element.textContent.replace(/[^\d]/g, '')) || 0;
    const difference = targetPrice - currentPrice;
    const duration = 1000; // 1 second
    const steps = 50;
    const increment = difference / steps;
    const stepDuration = duration / steps;
    
    let step = 0;
    const interval = setInterval(() => {
        step++;
        const currentValue = currentPrice + (increment * step);
        
        if (step >= steps) {
            element.textContent = `${Math.round(targetPrice).toLocaleString('ru-RU')} ₽`;
            clearInterval(interval);
        } else {
            element.textContent = `${Math.round(currentValue).toLocaleString('ru-RU')} ₽`;
        }
    }, stepDuration);
}

// Generate cost breakdown
function generateCostBreakdown(totalCost, params) {
    const projectTypes = {
        'landing': 'Лендинг',
        'corporate': 'Корпоративный сайт',
        'ecommerce': 'Интернет-магазин',
        'webapp': 'Веб-приложение',
        'custom': 'Индивидуальный проект'
    };
    
    const featureNames = {
        'cms': 'Система управления контентом',
        'ecommerce': 'Электронная коммерция',
        'auth': 'Система авторизации',
        'api': 'API интеграции',
        'analytics': 'Аналитика',
        'seo': 'SEO оптимизация',
        'multilingual': 'Мультиязычность',
        'payment': 'Платежные системы',
        'chat': 'Онлайн-чат',
        'booking': 'Система бронирования',
        'crm': 'CRM система'
    };
    
    let breakdown = `
        <div class="breakdown-item">
            <span>Тип проекта:</span>
            <span>${projectTypes[params.projectType]}</span>
        </div>
    `;
    
    if (params.pages > 1) {
        breakdown += `
            <div class="breakdown-item">
                <span>Количество страниц:</span>
                <span>${params.pages}</span>
            </div>
        `;
    }
    
    if (params.features.length > 0) {
        breakdown += '<div class="breakdown-section">Дополнительные функции:</div>';
        params.features.forEach(feature => {
            if (featureNames[feature]) {
                breakdown += `
                    <div class="breakdown-item feature">
                        <span>+ ${featureNames[feature]}</span>
                    </div>
                `;
            }
        });
    }
    
    return breakdown;
}

// Update timeline estimate
function updateTimelineEstimate(params) {
    const timelineElement = document.getElementById('calc-timeline');
    if (!timelineElement) return;
    
    const baseTimelines = {
        'landing': { min: 3, max: 7, unit: 'дней' },
        'corporate': { min: 1, max: 2, unit: 'недели' },
        'ecommerce': { min: 2, max: 4, unit: 'недели' },
        'webapp': { min: 1, max: 3, unit: 'месяца' },
        'custom': { min: 2, max: 6, unit: 'месяцев' }
    };
    
    const timeline = baseTimelines[params.projectType] || baseTimelines.landing;
    
    // Adjust for complexity
    let multiplier = 1;
    if (params.features.length > 3) multiplier += 0.5;
    if (params.design === 'complex' || params.design === 'premium') multiplier += 0.3;
    
    const adjustedMin = Math.ceil(timeline.min * multiplier);
    const adjustedMax = Math.ceil(timeline.max * multiplier);
    
    timelineElement.textContent = `${adjustedMin}-${adjustedMax} ${timeline.unit}`;
}

// Setup PDF generation with lazy loading
function setupPDFGeneration() {
    const pdfButton = document.getElementById('download-pdf');
    if (!pdfButton) return;
    
    pdfButton.addEventListener('click', async () => {
        try {
            // Show loading state
            const originalText = pdfButton.textContent;
            pdfButton.disabled = true;
            pdfButton.textContent = 'Создание PDF...';
            
            // Lazy load jsPDF
            if (!window.jsPDF) {
                await loadJsPDF();
            }
            
            await generatePDF();
            
        } catch (error) {
            console.error('PDF generation error:', error);
            window.FormsModule.showNotification('Ошибка создания PDF', 'error');
        } finally {
            // Restore button state
            pdfButton.disabled = false;
            pdfButton.textContent = 'Скачать PDF';
        }
    });
}

// Lazy load jsPDF library
async function loadJsPDF() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => {
            window.jsPDF = window.jspdf.jsPDF;
            resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Generate PDF with calculation results
async function generatePDF() {
    if (!window.jsPDF) {
        throw new Error('jsPDF not loaded');
    }
    
    const doc = new window.jsPDF();
    
    // Get calculation data
    const resultElement = document.getElementById('calc-result');
    const detailsElement = document.getElementById('calc-details');
    const timelineElement = document.getElementById('calc-timeline');
    
    const totalCost = resultElement?.textContent || '0 ₽';
    const timeline = timelineElement?.textContent || 'Не указано';
    
    // PDF Content
    doc.setFontSize(20);
    doc.text('Расчет стоимости проекта', 20, 30);
    
    doc.setFontSize(14);
    doc.text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, 20, 50);
    
    doc.setFontSize(16);
    doc.text(`Общая стоимость: ${totalCost}`, 20, 70);
    doc.text(`Сроки разработки: ${timeline}`, 20, 85);
    
    // Project details
    doc.setFontSize(12);
    doc.text('Детали проекта:', 20, 110);
    
    let yPosition = 125;
    const maxWidth = 170;
    
    if (detailsElement) {
        const items = detailsElement.querySelectorAll('.breakdown-item');
        items.forEach(item => {
            const text = item.textContent.trim();
            if (text) {
                const splitText = doc.splitTextToSize(text, maxWidth);
                doc.text(splitText, 25, yPosition);
                yPosition += splitText.length * 5 + 5;
            }
        });
    }
    
    // Footer
    doc.setFontSize(10);
    doc.text('TechPortal - Профессиональная веб-разработка', 20, 280);
    doc.text('Email: contact@techportal.dev | Telegram: @techportal_dev', 20, 290);
    
    // Save PDF
    const fileName = `calculation_${new Date().getTime()}.pdf`;
    doc.save(fileName);
    
    // Show success notification
    window.FormsModule.showNotification('PDF успешно создан и загружен!', 'success');
}

// Initialize calculator module
function initializeCalculator() {
    // Защита от повторной инициализации
    if (window.calculatorInitialized) {
        return;
    }
    
    initializeCostCalculator();
    
    window.calculatorInitialized = true;
}

// Export functions for other modules
window.CalculatorModule = {
    initializeCalculator,
    calculateCost,
    generatePDF
}; 