import { State } from '../state.js';

export function renderCategorySidebar() {
    if (!State.category_groups || State.category_groups.length === 0) {
        return `
            <div class="sidebar-title">Categories</div>
            <div style="padding: 20px 0; text-align: center; color: var(--text-muted); font-size: 13px;">
                Loading categories...
            </div>
        `;
    }

    const currentParent = State.filters.parentCategory;
    const currentSub = State.filters.category;

    const groupHTML = State.category_groups.map(group => {
        const isOpen = currentParent === group.name;
        const subListHTML = group.subcategories.map(sub => {
            const isActive = currentSub === sub.name;
            return `
                <a href="#/category/${encodeURIComponent(group.name)}/${encodeURIComponent(sub.name)}" 
                   class="sub-list-link ${isActive ? 'active' : ''}">
                    <span>${sub.name}</span>
                    <span class="cat-count">${sub.count}</span>
                </a>
            `;
        }).join('');

        // Icon lookup or fallback
        const iconMap = {
            "Healthcare": "activity",
            "Beauty & Wellness": "sparkles",
            "Real Estate": "building",
            "Education": "book-open",
            "Food & Dining": "utensils",
            "Finance & Legal": "scale",
            "Technology": "laptop",
            "Daily Services": "wrench",
            "Retail & Shopping": "shopping-bag",
            "Events & Entertainment": "ticket",
            "Other": "tag"
        };
        const icon = iconMap[group.name] || "tag";

        return `
            <div class="cat-block ${isOpen ? 'open' : ''}" data-category-group="${group.name}">
                <div class="cat-header">
                    <div class="cat-header-wrap" style="display:flex; align-items:center; gap:8px;">
                        <i data-lucide="${icon}" class="cat-icon" style="width: 14px; height: 14px; stroke-width: 2px; color: var(--text-secondary); flex-shrink: 0;"></i>
                        <span>${group.name}</span>
                    </div>
                    <div class="cat-header-wrap" style="display:flex; align-items:center; gap:6px;">
                        <span class="cat-count">${group.total}</span>
                        <span class="cat-toggle-icon" style="display:flex; align-items:center;">
                            <i data-lucide="chevron-right" class="toggle-chevron" style="width: 12px; height: 12px; stroke-width: 2.5px;"></i>
                        </span>
                    </div>
                </div>
                <div class="sub-list">
                    <a href="#/category/${encodeURIComponent(group.name)}" 
                       class="sub-list-link ${currentParent === group.name && !currentSub ? 'active' : ''}">
                        <span>All ${group.name}</span>
                        <span class="cat-count">${group.total}</span>
                    </a>
                    ${subListHTML}
                </div>
            </div>
        `;
    }).join('');

    const isCollapsed = State.category_sidebar_collapsed;
    const toggleButtonHTML = `
        <button id="toggleCatSidebarBtn" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 14px; padding: 4px; display: flex; align-items: center; justify-content: center; outline: none; transition: transform 0.2s;" title="${isCollapsed ? 'Expand Categories' : 'Collapse Categories'}">
            ${isCollapsed ? '<i data-lucide="chevron-right" style="width:16px; height:16px;"></i>' : '<i data-lucide="chevron-left" style="width:16px; height:16px;"></i>'}
        </button>
    `;

    return `
        <div class="sidebar-header-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; width: 100%;">
            <div class="sidebar-title" style="margin: 0; font-family: var(--font-heading); font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted);">Categories</div>
            ${toggleButtonHTML}
        </div>
        <div class="categories-tree">
            ${groupHTML}
        </div>
    `;
}

export function bindCategorySidebarEvents() {
    // Process Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    document.querySelectorAll('.cat-header').forEach(header => {
        header.addEventListener('click', (e) => {
            const isCollapsed = document.querySelector('.dashboard-category-sidebar')?.classList.contains('collapsed') 
                || document.querySelector('.app-sidebar')?.classList.contains('collapsed');
            
            if (isCollapsed) {
                const toggleBtn = document.getElementById('toggleCatSidebarBtn');
                if (toggleBtn) toggleBtn.click();
            }

            const block = header.closest('.cat-block');
            block.classList.toggle('open');
        });
    });

    const toggleBtn = document.getElementById('toggleCatSidebarBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const sidebars = [
                document.querySelector('.dashboard-category-sidebar'),
                document.querySelector('.app-sidebar')
            ].filter(Boolean);

            sidebars.forEach(sidebar => {
                const willCollapse = !sidebar.classList.contains('collapsed');
                if (willCollapse) {
                    sidebar.classList.add('collapsed');
                    toggleBtn.innerHTML = '<i data-lucide="chevron-right" style="width:16px; height:16px;"></i>';
                    toggleBtn.title = 'Expand Categories';
                    State.category_sidebar_collapsed = true;
                    localStorage.setItem('nearpro_cat_sidebar_collapsed', 'true');
                } else {
                    sidebar.classList.remove('collapsed');
                    toggleBtn.innerHTML = '<i data-lucide="chevron-left" style="width:16px; height:16px;"></i>';
                    toggleBtn.title = 'Collapse Categories';
                    State.category_sidebar_collapsed = false;
                    localStorage.setItem('nearpro_cat_sidebar_collapsed', 'false');
                }
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            });
        });
    }
}
