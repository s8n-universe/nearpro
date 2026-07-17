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
            "Healthcare": "🏥",
            "Beauty & Wellness": "💄",
            "Real Estate": "🏗️",
            "Education": "📚",
            "Food & Dining": "🍽️",
            "Finance & Legal": "⚖️",
            "Technology": "💻",
            "Daily Services": "🔧",
            "Retail & Shopping": "🛍️",
            "Events & Entertainment": "🎉",
            "Other": "📌"
        };
        const icon = iconMap[group.name] || "📌";

        return `
            <div class="cat-block ${isOpen ? 'open' : ''}" data-category-group="${group.name}">
                <div class="cat-header">
                    <div class="cat-header-wrap">
                        <span>${icon}</span>
                        <span>${group.name}</span>
                    </div>
                    <div class="cat-header-wrap">
                        <span class="cat-count">${group.total}</span>
                        <span class="cat-toggle-icon">▶</span>
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

    return `
        <div class="sidebar-title">Categories</div>
        <div class="categories-tree">
            ${groupHTML}
        </div>
    `;
}

export function bindCategorySidebarEvents() {
    document.querySelectorAll('.cat-header').forEach(header => {
        header.addEventListener('click', (e) => {
            const block = header.closest('.cat-block');
            const groupName = block.getAttribute('data-category-group');
            
            // Toggle open class on click
            block.classList.toggle('open');
        });
    });
}
