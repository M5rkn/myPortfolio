// ========== FORMS COMPONENT MODULE ==========
// Модуль форм с валидацией, уведомлениями и безопасностью

// Enhanced email validation
function isValidEmail(email) {
    return window.SecurityModule.validateInput(email, 'email');
}

// Show field error with animation
function showFieldError(field, message) {
    // Remove any existing error
    clearFieldError(field);
    
    // Create error element
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.opacity = '0';
    errorElement.style.transform = 'translateY(-10px)';
    
    // Insert after field
    field.parentNode.insertBefore(errorElement, field.nextSibling);
    
    // Add error styling to field
    field.classList.add('field-invalid');
    
    // Animate in
    setTimeout(() => {
        errorElement.style.opacity = '1';
        errorElement.style.transform = 'translateY(0)';
    }, 10);
}

// Clear field error
function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    field.classList.remove('field-invalid');
}

// Clear all validation errors from form
function clearValidationErrors(form) {
    const errorElements = form.querySelectorAll('.field-error');
    const invalidFields = form.querySelectorAll('.field-invalid');
    
    errorElements.forEach(el => el.remove());
    invalidFields.forEach(field => field.classList.remove('field-invalid'));
}

// Real-time form validation
function addRealTimeValidation() {
    const forms = secureQuerySelectorAll('form');
    
    forms.forEach(form => {
        const fields = form.querySelectorAll('input, textarea');
        
        fields.forEach(field => {
            // Validation on blur
            field.addEventListener('blur', () => {
                validateField(field);
            });
            
            // Clear errors on input
            field.addEventListener('input', () => {
                if (field.classList.contains('field-invalid')) {
                    clearFieldError(field);
                }
            });
        });
        
        // Form submission handler
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleFormSubmission(form);
        });
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const name = field.name;
    const required = field.hasAttribute('required');
    
    // Clear previous errors
    clearFieldError(field);
    
    // Check if required field is empty
    if (required && !value) {
        showFieldError(field, 'Это поле обязательно для заполнения');
        return false;
    }
    
    // Skip validation for empty optional fields
    if (!required && !value) {
        return true;
    }
    
    // Validate based on field type/name
    switch (name) {
        case 'email':
            if (!isValidEmail(value)) {
                showFieldError(field, 'Введите корректный email адрес');
                return false;
            }
            break;
            
        case 'name':
            if (!window.SecurityModule.validateInput(value, 'name')) {
                showFieldError(field, 'Имя должно содержать от 2 до 50 символов');
                return false;
            }
            break;
            
        case 'message':
            if (!window.SecurityModule.validateInput(value, 'message')) {
                showFieldError(field, 'Сообщение должно содержать от 10 до 1000 символов');
                return false;
            }
            break;
            
        case 'phone':
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,20}$/;
            if (!phoneRegex.test(value)) {
                showFieldError(field, 'Введите корректный номер телефона');
                return false;
            }
            break;
    }
    
    return true;
}

// Handle form submission
async function handleFormSubmission(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) {
        console.error('Submit button not found in form');
        return;
    }
    
    const originalText = submitButton.textContent || 'Отправить';
    
    try {
        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Отправка...';
        
        // Validate all fields
        const fields = form.querySelectorAll('input, textarea');
        let isValid = true;
        
        fields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            throw new Error('Пожалуйста, исправьте ошибки в форме');
        }
        
        // Prepare form data
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = window.SecurityModule.sanitizeHTML(value.trim());
        }
        
        // Determine API endpoint (временно тестируем простой endpoint)
        const action = form.getAttribute('action') || '/api/contact-simple';
        
        console.log('📤 Form action attribute:', form.getAttribute('action'));
        console.log('📤 Final endpoint:', action);
        console.log('📤 Form data:', data);
        console.log('📤 Current URL:', window.location.href);
        
        // Check if required modules are available
        if (!window.ApiModule || !window.ApiModule.secureApiCall) {
            throw new Error('API module не загружен. Пожалуйста, обновите страницу.');
        }
        
        if (!window.SecurityModule || !window.SecurityModule.sanitizeHTML) {
            throw new Error('Security module не загружен. Пожалуйста, обновите страницу.');
        }
        
        // Submit form
        const result = await window.ApiModule.secureApiCall(action, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        if (result && result.success) {
            showNotification('Сообщение успешно отправлено!', 'success');
            form.reset();
            clearValidationErrors(form);
        } else {
            throw new Error(result?.message || 'Произошла ошибка при отправке');
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        
        // Show user-friendly error message
        let errorMessage = 'Произошла ошибка при отправке сообщения';
        
        if (error.message.includes('getCSRFToken')) {
            errorMessage = 'Ошибка безопасности. Пожалуйста, обновите страницу и попробуйте снова.';
        } else if (error.message.includes('Rate limit')) {
            errorMessage = 'Слишком много запросов. Пожалуйста, подождите немного.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'Проблемы с подключением. Проверьте интернет и попробуйте снова.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showNotification(errorMessage, 'error');
    } finally {
        // Always restore button state
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = secureQuerySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${window.SecurityModule.sanitizeHTML(message)}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    `;
    
    // Type-specific styling
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
            notification.style.color = 'white';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
            notification.style.color = 'white';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #ffa726 0%, #ffcc02 100%)';
            notification.style.color = 'white';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            notification.style.color = 'white';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto-remove after delay
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Get notification icon
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return '✓';
        case 'error': return '✗';
        case 'warning': return '⚠';
        default: return 'ℹ';
    }
}

// Modal notification for special cases
function showModalNotification(message, type = 'success') {
    const modal = document.createElement('div');
    modal.className = 'modal-notification-overlay';
    modal.innerHTML = `
        <div class="modal-notification">
            <div class="modal-notification-icon ${type}">
                ${getNotificationIcon(type)}
            </div>
            <div class="modal-notification-message">
                ${window.SecurityModule.sanitizeHTML(message)}
            </div>
            <button class="modal-notification-close btn btn-primary">OK</button>
        </div>
    `;
    
    // Style the modal
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    // Add to page and animate
    document.body.appendChild(modal);
    setTimeout(() => modal.style.opacity = '1', 10);
    
    // Close handler
    const closeButton = modal.querySelector('.modal-notification-close');
    closeButton.addEventListener('click', () => {
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
    });
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeButton.click();
        }
    });
}

// Initialize forms module
function initializeForms() {
    addRealTimeValidation();
    console.log('📝 Forms module initialized');
}

// Export functions for other modules
window.FormsModule = {
    initializeForms,
    validateField,
    showNotification,
    showModalNotification,
    handleFormSubmission
}; 