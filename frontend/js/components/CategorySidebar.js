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

    // Sort category groups: alphabetical by name, but keep "Other" at the very bottom
    const sortedGroups = [...State.category_groups].sort((a, b) => {
        if (a.name === 'Other') return 1;
        if (b.name === 'Other') return -1;
        return a.name.localeCompare(b.name);
    });

    const groupHTML = sortedGroups.map(group => {
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
        const isActive = currentParent === group.name;

        return `
            <a href="#/category/${encodeURIComponent(group.name)}" 
               class="sub-list-link ${isActive ? 'active' : ''}">
                <div class="cat-link-label">
                    <i data-lucide="${icon}" class="cat-icon"></i>
                    <span>${group.name}</span>
                </div>
                <span class="cat-count">${group.total}</span>
            </a>
        `;
    }).join('');

    const isCollapsed = State.category_sidebar_collapsed;
    const toggleButtonHTML = `
        <button id="toggleCatSidebarBtn" class="toggle-cat-btn" title="${isCollapsed ? 'Expand Categories' : 'Collapse Categories'}">
            ${isCollapsed ? '<i data-lucide="chevron-right" style="width:16px; height:16px;"></i>' : '<i data-lucide="chevron-left" style="width:16px; height:16px;"></i>'}
        </button>
    `;

    return `
        <div class="sidebar-header-row">
            <div class="sidebar-title">Categories</div>
            ${toggleButtonHTML}
        </div>
        <div class="categories-tree">
            ${groupHTML}
        </div>

        <style>
            /* Hover drawer panel transition styling */
            .dashboard-category-sidebar {
                width: 0 !important;
                min-width: 0 !important;
                max-width: 0 !important;
                opacity: 0 !important;
                padding: 0 !important;
                border-right: none !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                overflow-x: hidden !important;
                white-space: nowrap !important;
            }
            .dashboard-category-sidebar.visible {
                width: 240px !important;
                min-width: 240px !important;
                max-width: 240px !important;
                opacity: 1 !important;
                padding: 20px 14px !important;
                border-right: 1px solid var(--border) !important;
            }
        </style>
    `;
}

export function bindCategorySidebarEvents() {
    // Process Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

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
