// ========== FORMS MODULE ==========
// Обработка форм, валидация и уведомления

// Field error highlighting
function showFieldError(field, message) {
    if (!field) return;
    
    // Add error styling to field
    field.classList.add('error');
    field.style.borderColor = '#ff4757';
    
    // Show notification
    showNotification(message, 'error');
    
    // Focus on error field
    field.focus();
    
    // Scroll to field if not visible
    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Clear validation errors
function clearValidationErrors(form) {
    if (!form) return;
    
    // Remove error styling from all fields
    const fields = form.querySelectorAll('input, textarea, select');
    fields.forEach(field => {
        field.classList.remove('error');
        field.style.borderColor = '';
    });
    
    // Remove any existing error messages
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
}

// Real-time validation
function addRealTimeValidation() {
    const contactForm = secureGetElementById('contact-form');
    if (!contactForm) return;
    
    const nameField = secureGetElementById('name');
    const emailField = secureGetElementById('email');
    const messageField = secureGetElementById('message');
    
    // Name validation
    if (nameField) {
        nameField.addEventListener('blur', () => {
            const name = nameField.value.trim();
            if (!name) {
                showFieldError(nameField, 'Имя обязательно для заполнения');
            } else if (!validateInput(name, 'name')) {
                showFieldError(nameField, 'Имя должно содержать от 2 до 50 символов');
            } else {
                nameField.classList.remove('error');
                nameField.style.borderColor = '#4ade80';
            }
        });
        
        nameField.addEventListener('input', () => {
            if (nameField.classList.contains('error')) {
                nameField.classList.remove('error');
                nameField.style.borderColor = '';
            }
        });
    }
    
    // Email validation
    if (emailField) {
        emailField.addEventListener('blur', () => {
            const email = emailField.value.trim();
            if (!email) {
                showFieldError(emailField, 'Email обязателен для заполнения');
            } else if (!isValidEmail(email)) {
                showFieldError(emailField, 'Введите корректный email адрес');
            } else {
                emailField.classList.remove('error');
                emailField.style.borderColor = '#4ade80';
            }
        });
        
        emailField.addEventListener('input', () => {
            if (emailField.classList.contains('error')) {
                emailField.classList.remove('error');
                emailField.style.borderColor = '';
            }
        });
    }
    
    // Message validation
    if (messageField) {
        messageField.addEventListener('blur', () => {
            const message = messageField.value.trim();
            if (!message) {
                showFieldError(messageField, 'Сообщение обязательно для заполнения');
            } else if (!validateInput(message, 'message')) {
                showFieldError(messageField, 'Сообщение должно содержать от 10 до 1000 символов');
            } else {
                messageField.classList.remove('error');
                messageField.style.borderColor = '#4ade80';
            }
        });
        
        messageField.addEventListener('input', () => {
            if (messageField.classList.contains('error')) {
                messageField.classList.remove('error');
                messageField.style.borderColor = '';
            }
        });
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = secureQuerySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Sanitize message
    const sanitizedMessage = sanitizeHTML(message);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    // Create content container
    const content = document.createElement('div');
    content.className = 'notification-content';
    
    // Create message span
    const messageSpan = document.createElement('span');
    messageSpan.className = 'notification-message';
    messageSpan.innerHTML = sanitizedMessage;
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'notification-close';
    closeButton.innerHTML = '&times;';
    closeButton.setAttribute('aria-label', 'Закрыть уведомление');
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ff4757' : type === 'success' ? '#2ed573' : '#5352ed'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        line-height: 1.4;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    // Add animation styles
    content.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
    `;
    
    closeButton.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        opacity: 0.8;
        transition: opacity 0.2s ease;
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.opacity = '1';
    });
    
    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.opacity = '0.8';
    });
    
    // Assemble notification
    content.appendChild(messageSpan);
    content.appendChild(closeButton);
    notification.appendChild(content);
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Close button functionality
    closeButton.addEventListener('click', () => {
        removeNotification(notification);
    });
    
    // Auto remove after 5 seconds
    const autoRemoveTimer = setTimeout(() => {
        removeNotification(notification);
    }, 5000);
    
    // Show animation
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    });
    
    function removeNotification(notificationElement) {
        clearTimeout(autoRemoveTimer);
        notificationElement.style.opacity = '0';
        notificationElement.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notificationElement.parentNode) {
                notificationElement.parentNode.removeChild(notificationElement);
            }
        }, 300);
    }
}

// Modal notification system
function showModalNotification(message, type = 'success') {
    // Remove existing modal notification
    const existingModalNotification = secureQuerySelector('.modal-notification');
    if (existingModalNotification) {
        existingModalNotification.remove();
    }
    
    // Get modal content container
    const modalContent = secureQuerySelector('.modal-content');
    if (!modalContent) return;
    
    // Sanitize message
    const sanitizedMessage = sanitizeHTML(message);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'modal-notification';
    
    // Create content container
    const content = document.createElement('div');
    content.className = 'modal-notification-content';
    
    // Create message span
    const messageSpan = document.createElement('span');
    messageSpan.className = 'modal-notification-message';
    messageSpan.innerHTML = sanitizedMessage;
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'modal-notification-close';
    closeButton.innerHTML = '&times;';
    closeButton.setAttribute('aria-label', 'Закрыть уведомление');
    
    // Add styles
    notification.style.cssText = `
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'error' ? '#ff4757' : '#2ed573'};
        color: white;
        padding: 12px 16px;
        border-radius: 6px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10001;
        max-width: 90%;
        font-size: 13px;
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
        transition: all 0.3s ease;
    `;
    
    // Add modal notification styles
    content.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    
    closeButton.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 16px;
        cursor: pointer;
        opacity: 0.8;
        transition: opacity 0.2s ease;
        margin-left: 8px;
    `;
    
    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.opacity = '1';
    });
    
    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.opacity = '0.8';
    });
    
    // Assemble notification
    content.appendChild(messageSpan);
    content.appendChild(closeButton);
    notification.appendChild(content);
    
    // Add to modal
    modalContent.appendChild(notification);
    
    // Close button functionality
    closeButton.addEventListener('click', () => {
        removeModalNotification(notification);
    });
    
    // Auto remove after 3 seconds
    const autoRemoveTimer = setTimeout(() => {
        removeModalNotification(notification);
    }, 3000);
    
    // Show animation
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(-50%) translateY(0)';
    });
    
    function removeModalNotification(notificationElement) {
        clearTimeout(autoRemoveTimer);
        notificationElement.style.opacity = '0';
        notificationElement.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => {
            if (notificationElement.parentNode) {
                notificationElement.parentNode.removeChild(notificationElement);
            }
        }, 300);
    }
}

// Contact form handling
function initForm() {
    const contactForm = secureGetElementById('contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const name = formData.get('name')?.toString().trim() || '';
        const email = formData.get('email')?.toString().trim() || '';
        const message = formData.get('message')?.toString().trim() || '';
        
        // Clear previous error styling
        clearValidationErrors(contactForm);
        
        // Enhanced validation with detailed error messages
        let hasErrors = false;
        
        if (!name) {
            showFieldError(secureGetElementById('name'), 'Имя обязательно для заполнения');
            hasErrors = true;
        } else if (!validateInput(name, 'name')) {
            showFieldError(secureGetElementById('name'), 'Имя должно содержать от 2 до 50 символов и состоять только из букв');
            hasErrors = true;
        }
        
        if (!email) {
            showFieldError(secureGetElementById('email'), 'Email обязателен для заполнения');
            hasErrors = true;
        } else if (!isValidEmail(email)) {
            showFieldError(secureGetElementById('email'), 'Введите корректный email адрес');
            hasErrors = true;
        }
        
        if (!message) {
            showFieldError(secureGetElementById('message'), 'Сообщение обязательно для заполнения');
            hasErrors = true;
        } else if (!validateInput(message, 'message')) {
            showFieldError(secureGetElementById('message'), 'Сообщение должно содержать от 10 до 1000 символов');
            hasErrors = true;
        }
        
        if (hasErrors) return;
        
        // Show loading state
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton?.textContent || 'Отправить';
        if (submitButton) {
            submitButton.textContent = 'Отправка...';
            submitButton.disabled = true;
        }
        
        try {
            // Get CSRF token from server
            const csrfToken = await getCSRFToken();
            if (!csrfToken) {
                throw new Error('Не удалось получить токен безопасности');
            }
            
            // Send to backend with CSRF protection
            const response = await secureApiCall('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: sanitizeHTML(name),
                    email: sanitizeHTML(email),
                    message: sanitizeHTML(message)
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                showNotification('Сообщение успешно отправлено! Спасибо за обращение.', 'success');
                
                // Reset form
                contactForm.reset();
                
                // Add success animation to form
                contactForm.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    contactForm.style.transform = 'scale(1)';
                }, 200);
                
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Ошибка при отправке сообщения');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            showNotification(error.message || 'Ошибка при отправке сообщения. Попробуйте позже.', 'error');
        } finally {
            // Restore button state
            if (submitButton) {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        }
    });
    
    // Add real-time validation
    addRealTimeValidation();
}

// Initialize forms module
function initForms() {
    initForm();
}

// Export forms module
window.FormsModule = {
    showFieldError,
    clearValidationErrors,
    addRealTimeValidation,
    showNotification,
    showModalNotification,
    initForm,
    initForms
}; 