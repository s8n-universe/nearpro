import { isOpenNow } from '../api.js';
import L from 'leaflet';
import { State } from '../state.js';

export function renderProfessionalModal(lead) {
    // Initial avatar extract
    const initials = lead.name
        .split(' ')
        .filter(x => x.length > 0)
        .slice(0, 2)
        .map(x => x[0].toUpperCase())
        .join('');

    // Ratings star generator
    const rating = lead.rating || 0;
    const reviewCount = lead.review_count || 0;
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            starsHTML += '★';
        } else if (i - 0.5 <= rating) {
            starsHTML += '½';
        } else {
            starsHTML += '☆';
        }
    }

    // Complete dots
    const score = lead.completeness_score || 0;
    let dotsHTML = '';
    for (let i = 0; i < 5; i++) {
        dotsHTML += `<span class="complete-dot ${i < score ? 'filled' : ''}"></span>`;
    }

    // Hours Mapping Table
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const currentDayIndex = (new Date().getDay() + 6) % 7; // Convert Sun=0, Mon=1 to Mon=0, Sun=6
    const todayName = dayNames[currentDayIndex];
    
    let hoursRowsHTML = '';
    const hours = lead.hours || {};
    
    for (const day of dayNames) {
        const timeStr = hours[day] || "Unavailable";
        const isToday = day === todayName;
        hoursRowsHTML += `
            <tr class="${isToday ? 'today' : ''}">
                <td>${day}</td>
                <td>${timeStr}</td>
            </tr>
        `;
    }

    const hasConnectAccess = State.profile && (State.profile.is_premium === true || State.profile.tier === 'connect' || State.profile.tier === 'pro');

    const phoneDisplay = !hasConnectAccess 
        ? `<span onclick="window.State.setPricingModal(true);" style="color: var(--accent-gold); cursor: pointer; text-decoration: underline; font-size: 13px;">🔒 Locked (Upgrade to Connect)</span>`
        : (lead.phone || '<span style="color: var(--text-muted);">Not available</span>');

    const emailDisplay = !hasConnectAccess
        ? `<span onclick="window.State.setPricingModal(true);" style="color: var(--accent-gold); cursor: pointer; text-decoration: underline; font-size: 13px;">🔒 Locked (Upgrade to Connect)</span>`
        : (lead.email || '<span style="color: var(--text-muted);">Not available</span>');

    const websiteDisplay = !hasConnectAccess
        ? `<span onclick="window.State.setPricingModal(true);" style="color: var(--accent-gold); cursor: pointer; text-decoration: underline; font-size: 13px;">🔒 Locked (Upgrade to Connect)</span>`
        : (lead.website ? `<a href="${lead.website}" target="_blank" style="color: var(--accent-gold); text-decoration: underline;">Visit Site</a>` : '<span style="color: var(--text-muted);">Not available</span>');

    const mapHTML = lead.latitude && lead.longitude
        ? (hasConnectAccess 
            ? `
                <div class="sidebar-title">Location Map</div>
                <div id="modalMapElement" class="modal-map"></div>
              `
            : `
                <div class="sidebar-title">Location Map</div>
                <div class="modal-map" style="display: flex; align-items: center; justify-content: center; background: rgba(9, 9, 11, 0.4); border: 1px dashed var(--border); height: 180px; border-radius: var(--radius-md); flex-direction: column;">
                    <div style="font-size: 24px; margin-bottom: 8px;">🔒</div>
                    <span style="font-size: 12px; color: var(--text-muted); text-align: center; max-width: 240px; line-height: 1.4;">
                        Location maps are locked. Upgrade to Connect to view professional map locations.
                    </span>
                    <button class="brand-btn" style="padding: 6px 12px; font-size: 11px; margin-top: 12px;" onclick="window.State.setPricingModal(true);">Upgrade Plan</button>
                </div>
              `
          )
        : '';

    const bottomCtaHTML = !hasConnectAccess
        ? `
            <button class="brand-btn" style="width: 100%;" onclick="window.State.setPricingModal(true);">
                🔒 Unlock Phone & Contact Details
            </button>
          `
        : (lead.phone 
            ? `
                <a href="tel:${lead.phone}" class="brand-btn" style="width: 100%;">
                    Call Now (${lead.phone})
                </a>
              `
            : ''
          );

    return `
        <div class="modal-card">
            <button class="modal-close-btn" id="closeModalBtn">&times;</button>
            <div class="modal-content">
                <div class="modal-header-section">
                    <div class="avatar-wrap">${initials}</div>
                    <div class="card-title-wrap">
                        <span class="category-badge">${lead.category || lead.parent_category}</span>
                        <h2 style="font-size: 22px; margin-bottom: 6px;">${lead.name}</h2>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="star-rating" style="color: var(--accent-gold);">${starsHTML}</span>
                            <span style="font-size: 13px; color: var(--text-muted);">(${reviewCount} reviews)</span>
                        </div>
                    </div>
                </div>
                
                <div class="modal-meta-grid">
                    <div>
                        <div class="sidebar-title">Contact Info</div>
                        <div style="margin-bottom: 12px; font-size: 14px;">
                            <strong>Phone:</strong> ${phoneDisplay}
                        </div>
                        <div style="margin-bottom: 12px; font-size: 14px;">
                            <strong>Email:</strong> ${emailDisplay}
                        </div>
                        <div style="margin-bottom: 12px; font-size: 14px;">
                            <strong>Website:</strong> ${websiteDisplay}
                        </div>
                        <div style="margin-bottom: 12px; font-size: 14px;">
                            <strong>Area:</strong> ${lead.area || "Mumbai"}
                        </div>
                        <div style="margin-bottom: 12px; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                            <strong>Completeness:</strong> 
                            <div class="completeness-dots">${dotsHTML}</div>
                        </div>
                    </div>
                    
                    <div>
                        <div class="sidebar-title">Business Hours</div>
                        <table class="hours-table">
                            <tbody>
                                ${hoursRowsHTML}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                ${mapHTML}
                
                <div class="modal-ctas">
                    ${bottomCtaHTML}
                    
                    <a href="#" class="secondary-btn" style="width: 100%; border-color: var(--accent-pink); color: var(--text-primary);">
                        Connect on NearPro Mobile App
                    </a>
                    
                    <div style="display: flex; gap: 12px; width: 100%;">
                        <button id="shareQRBtn" class="secondary-btn" style="flex: 1;">Share via QR Code</button>
                        ${lead.source_url && hasConnectAccess ? `
                            <a href="${lead.source_url}" target="_blank" class="secondary-btn" style="flex: 1; text-align: center; justify-content: center;">
                                View on Google Maps
                            </a>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Inner QR Modal placeholder -->
                <div id="qrPlaceholder" style="display: none;"></div>
            </div>
        </div>
    `;
}

export function bindProfessionalModalEvents(lead, onClose) {
    // Handle close button
    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (onClose) onClose();
        });
    }

    const hasConnectAccess = State.profile && (State.profile.is_premium === true || State.profile.tier === 'connect' || State.profile.tier === 'pro');

    // Initialize Leaflet Mini-Map if coordinates are available and user has connect access
    if (lead.latitude && lead.longitude && hasConnectAccess) {
        try {
            // Leaflet requires a brief pause to render inside a newly created DOM element
            setTimeout(() => {
                const mapContainer = document.getElementById('modalMapElement');
                if (!mapContainer) return;
                
                const map = L.map('modalMapElement', {
                    zoomControl: false,
                    attributionControl: false
                }).setView([lead.latitude, lead.longitude], 15);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                
                // Add custom colored circle marker
                L.circleMarker([lead.latitude, lead.longitude], {
                    radius: 8,
                    fillColor: '#ffa000',
                    color: '#ffffff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(map);
            }, 100);
        } catch (e) {
            console.error("Failed to render Leaflet mini-map in modal: ", e);
        }
    }

    // Share via QR Code listener
    const shareQRBtn = document.getElementById('shareQRBtn');
    if (shareQRBtn) {
        shareQRBtn.addEventListener('click', async () => {
            const qrPlaceholder = document.getElementById('qrPlaceholder');
            if (qrPlaceholder.style.display === 'none') {
                try {
                    // Dynamically import the qrcode generator package
                    const QRCode = (await import('qrcode')).default;
                    const canvas = document.createElement('canvas');
                    
                    // Generate QR encoding for maps link or phone
                    const qrData = lead.source_url || `tel:${lead.phone || ''}` || lead.name;
                    await QRCode.toCanvas(canvas, qrData, { width: 180, margin: 2 });
                    
                    qrPlaceholder.innerHTML = '';
                    qrPlaceholder.appendChild(canvas);
                    qrPlaceholder.insertAdjacentHTML('beforeend', '<p style="font-size: 12px; margin-top: 8px; font-family: var(--font-mono); color: var(--text-muted);">Scan this QR to view listing details instantly</p>');
                    qrPlaceholder.className = 'qr-container';
                    qrPlaceholder.style.display = 'flex';
                } catch (err) {
                    console.error("Failed to generate QR Code: ", err);
                }
            } else {
                qrPlaceholder.style.display = 'none';
            }
        });
    }
}
