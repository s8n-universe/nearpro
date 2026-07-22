export function initCustomSelect(selectEl, customClass = '') {
    if (!selectEl) return null;
    
    // Check if already initialized
    if (selectEl.dataset.customSelectInitialized) {
        const existingWrapper = selectEl.parentElement.querySelector(`.custom-select-wrapper[data-select-id="${selectEl.id}"]`);
        if (existingWrapper) {
            rebuildOptions(selectEl, existingWrapper);
            return existingWrapper;
        }
    }
    
    // Set initialization flag
    selectEl.dataset.customSelectInitialized = 'true';
    
    // Hide native select
    selectEl.style.display = 'none';
    
    // Create custom wrapper
    const wrapper = document.createElement('div');
    wrapper.className = `custom-select-wrapper ${customClass}`;
    wrapper.id = `custom-select-${selectEl.id}`;
    wrapper.setAttribute('data-select-id', selectEl.id || '');
    
    // Trigger
    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    
    const triggerText = document.createElement('span');
    triggerText.className = 'custom-select-trigger-text';
    
    const arrow = document.createElement('span');
    arrow.className = 'custom-select-arrow';
    arrow.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;
    
    trigger.appendChild(triggerText);
    trigger.appendChild(arrow);
    wrapper.appendChild(trigger);
    
    // Dropdown list
    const dropdown = document.createElement('div');
    dropdown.className = 'custom-select-dropdown';
    wrapper.appendChild(dropdown);
    
    // Insert wrapper next to original select
    selectEl.parentNode.insertBefore(wrapper, selectEl.nextSibling);
    
    // Populate options
    function rebuildOptions(sourceSelect, container) {
        const drop = container.querySelector('.custom-select-dropdown');
        const trigText = container.querySelector('.custom-select-trigger-text');
        drop.innerHTML = '';
        
        const selectedOption = sourceSelect.options[sourceSelect.selectedIndex] || sourceSelect.options[0];
        if (selectedOption) {
            trigText.innerHTML = selectedOption.innerHTML;
        } else {
            trigText.textContent = '';
        }
        
        Array.from(sourceSelect.options).forEach((opt) => {
            const customOpt = document.createElement('div');
            customOpt.className = 'custom-select-option';
            if (opt.value === sourceSelect.value) {
                customOpt.classList.add('selected');
            }
            customOpt.innerHTML = opt.innerHTML;
            customOpt.setAttribute('data-value', opt.value);
            
            customOpt.addEventListener('click', (e) => {
                e.stopPropagation();
                sourceSelect.value = opt.value;
                
                // Trigger change event on original select
                const event = new Event('change', { bubbles: true });
                sourceSelect.dispatchEvent(event);
                
                container.classList.remove('open');
            });
            
            drop.appendChild(customOpt);
        });
    }
    
    rebuildOptions(selectEl, wrapper);
    
    // Listen for change on original select (to sync external/programmatic updates)
    const onSelectChange = () => {
        const selectedOpt = selectEl.options[selectEl.selectedIndex];
        if (selectedOpt) {
            triggerText.innerHTML = selectedOpt.innerHTML;
        }
        // Update selected class
        const customOpts = dropdown.querySelectorAll('.custom-select-option');
        customOpts.forEach((customOpt) => {
            if (customOpt.getAttribute('data-value') === selectEl.value) {
                customOpt.classList.add('selected');
            } else {
                customOpt.classList.remove('selected');
            }
        });
    };
    
    selectEl.addEventListener('change', onSelectChange);
    
    // Toggle open
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Close all other open custom selects
        document.querySelectorAll('.custom-select-wrapper').forEach((other) => {
            if (other !== wrapper) {
                other.classList.remove('open');
            }
        });
        
        wrapper.classList.toggle('open');
    });
    
    return wrapper;
}

// Global click handler to close dropdowns when clicking outside
if (!window._customSelectGlobalClickRegistered) {
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select-wrapper.open').forEach((w) => {
            w.classList.remove('open');
        });
    });
    window._customSelectGlobalClickRegistered = true;
}
