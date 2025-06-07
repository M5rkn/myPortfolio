// ========== CALCULATOR COMPONENT MODULE ==========
// Модуль калькулятора стоимости веб-проектов

// Initialize cost calculator
function initializeCostCalculator() {
    const calculatorToggle = secureGetElementById('calculator-toggle');
    const calculatorWindow = secureGetElementById('calculator-window');
    const calculatorClose = secureGetElementById('calculator-close');
    
    if (!calculatorToggle || !calculatorWindow) {
        console.warn('Calculator elements not found');
        return;
    }
    
    // Toggle calculator window
    calculatorToggle.addEventListener('click', () => {
        calculatorWindow.classList.toggle('active');
    });
    
    // Close calculator
    if (calculatorClose) {
        calculatorClose.addEventListener('click', () => {
            calculatorWindow.classList.remove('active');
        });
    }
    
    // Initialize calculation logic
    initializeCalculationLogic();
    
    // Initialize PDF generation (lazy loading)
    setupPDFGeneration();
}

// Initialize calculation logic
function initializeCalculationLogic() {
    const inputs = secureQuerySelectorAll('.calc-input');
    const calculateBtn = secureGetElementById('calculate-btn');
    
    // Add event listeners to all inputs
    inputs.forEach(input => {
        input.addEventListener('change', calculateCost);
        input.addEventListener('input', () => {
            // Real-time calculation for range inputs
            if (input.type === 'range') {
                calculateCost();
            }
        });
    });
    
    // Calculate button
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateCost);
    }
    
    // Initial calculation
    calculateCost();
}

// Main calculation function
function calculateCost() {
    try {
        // Base prices
        const basePrices = {
            'landing': 15000,
            'corporate': 30000,
            'ecommerce': 50000,
            'webapp': 80000,
            'custom': 100000
        };
        
        // Get form values
        const projectType = secureQuerySelector('input[name="project-type"]:checked')?.value || 'landing';
        const pages = parseInt(secureGetElementById('pages-count')?.value) || 1;
        const features = secureQuerySelectorAll('input[name="features"]:checked');
        const timeline = secureGetElementById('timeline')?.value || 'standard';
        const design = secureGetElementById('design-complexity')?.value || 'simple';
        
        // Calculate base cost
        let totalCost = basePrices[projectType] || basePrices.landing;
        
        // Pages multiplier (beyond base pages)
        const basePages = projectType === 'landing' ? 1 : projectType === 'corporate' ? 5 : 10;
        if (pages > basePages) {
            const additionalPages = pages - basePages;
            const pagePrice = projectType === 'webapp' ? 5000 : 2000;
            totalCost += additionalPages * pagePrice;
        }
        
        // Features cost
        const featurePrices = {
            'responsive': 0, // Included by default
            'cms': 15000,
            'ecommerce': 25000,
            'auth': 20000,
            'api': 30000,
            'analytics': 5000,
            'seo': 10000,
            'multilingual': 15000,
            'payment': 20000,
            'chat': 8000,
            'booking': 25000,
            'crm': 40000
        };
        
        features.forEach(feature => {
            const featureValue = feature.value;
            if (featurePrices[featureValue]) {
                totalCost += featurePrices[featureValue];
            }
        });
        
        // Timeline multiplier
        const timelineMultipliers = {
            'urgent': 1.5,     // +50% за срочность
            'fast': 1.2,       // +20% за быструю разработку
            'standard': 1.0,   // Обычная цена
            'extended': 0.9    // -10% за длительные сроки
        };
        
        totalCost *= timelineMultipliers[timeline] || 1.0;
        
        // Design complexity multiplier
        const designMultipliers = {
            'simple': 1.0,
            'moderate': 1.3,
            'complex': 1.6,
            'premium': 2.0
        };
        
        totalCost *= designMultipliers[design] || 1.0;
        
        // Update UI
        updateCalculatorResults(totalCost, {
            projectType,
            pages,
            features: Array.from(features).map(f => f.value),
            timeline,
            design
        });
        
        return totalCost;
        
    } catch (error) {
        console.error('Calculation error:', error);
        const resultElement = secureGetElementById('calc-result');
        if (resultElement) {
            resultElement.textContent = 'Ошибка расчета';
        }
        return 0;
    }
}

// Update calculator results display
function updateCalculatorResults(totalCost, params) {
    // Main result
    const resultElement = secureGetElementById('calc-result');
    const detailsElement = secureGetElementById('calc-details');
    
    if (resultElement) {
        // Format price with animation
        animatePrice(resultElement, totalCost);
    }
    
    if (detailsElement) {
        // Generate breakdown
        const breakdown = generateCostBreakdown(totalCost, params);
        detailsElement.innerHTML = breakdown;
    }
    
    // Update timeline estimate
    updateTimelineEstimate(params);
    
    // Show/hide PDF button
    const pdfButton = secureGetElementById('download-pdf');
    if (pdfButton) {
        pdfButton.style.display = totalCost > 0 ? 'block' : 'none';
    }
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
    const timelineElement = secureGetElementById('calc-timeline');
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
    const pdfButton = secureGetElementById('download-pdf');
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
    const resultElement = secureGetElementById('calc-result');
    const detailsElement = secureGetElementById('calc-details');
    const timelineElement = secureGetElementById('calc-timeline');
    
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
    initializeCostCalculator();
    
    console.log('🔢 Calculator module initialized');
}

// Export functions for other modules
window.CalculatorModule = {
    initializeCalculator,
    calculateCost,
    generatePDF
}; 