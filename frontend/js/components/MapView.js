import L from 'leaflet';
import 'leaflet.markercluster';

export function renderMapView() {
    return `<div id="fullMapElement" class="map-element"></div>`;
}

// Icon emoji map per parent category
const categoryIcons = {
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

// CSS class lookup per parent category
const categoryPinClasses = {
    "Healthcare": "pin-healthcare",
    "Beauty & Wellness": "pin-beauty",
    "Real Estate": "pin-realestate",
    "Education": "pin-education",
    "Food & Dining": "pin-dining",
    "Finance & Legal": "pin-finance",
    "Technology": "pin-tech",
    "Daily Services": "pin-services",
    "Retail & Shopping": "pin-shopping",
    "Events & Entertainment": "pin-events",
    "Other": "pin-other"
};

export function initFullMap(professionals, onPinClick) {
    try {
        const mapContainer = document.getElementById('fullMapElement');
        if (!mapContainer) return null;
        
        // Center on Mumbai coordinates (Bandra: 19.0596, 72.8295)
        const map = L.map('fullMapElement', {
            zoomControl: true,
            zoomAnimation: true
        }).setView([19.0760, 72.8777], 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        // Marker Cluster group init
        const markers = L.markerClusterGroup({
            showCoverageOnHover: false,
            spiderfyOnMaxZoom: true,
            maxClusterRadius: 50
        });

        professionals.forEach(p => {
            if (!p.latitude || !p.longitude) return;
            
            const parentCat = p.parent_category || "Other";
            const iconName = categoryIcons[parentCat] || "tag";
            const pinClass = categoryPinClasses[parentCat] || "pin-other";
            
            // Create custom HTML icon matching map.css spec
            const icon = L.divIcon({
                html: `<div class="custom-pin ${pinClass}"><div class="custom-pin-inner" style="display:flex; align-items:center; justify-content:center;"><i data-lucide="${iconName}" style="width:14px; height:14px; stroke-width:2.5px;"></i></div></div>`,
                className: 'custom-div-icon',
                iconSize: [30, 30],
                iconAnchor: [15, 30],
                popupAnchor: [0, -30]
            });
            
            const marker = L.marker([p.latitude, p.longitude], { icon });
            
            // Build popup
            const popupContent = `
                <div style="padding: 4px;">
                    <h4>${p.name}</h4>
                    <p style="margin-bottom: 2px;"><strong>${p.category || parentCat}</strong></p>
                    <p style="margin-bottom: 6px; font-family: var(--font-mono); color: var(--text-muted);">${p.area || "Mumbai"}</p>
                    <a href="javascript:void(0);" class="popup-btn" data-id="${p.id}">View Full Details &rarr;</a>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            
            // Listen for popup details click
            marker.on('popupopen', () => {
                const btn = document.querySelector(`.popup-btn[data-id="${p.id}"]`);
                if (btn) {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        if (onPinClick) onPinClick(p.id);
                    });
                }
            });
            
            markers.addLayer(marker);
        });
        
        map.addLayer(markers);

        // Process Lucide Icons for map pin elements
        if (window.lucide) {
            window.lucide.createIcons();
        }

        return map;
    } catch (e) {
        console.error("Failed to initialize Leaflet cluster map: ", e);
        return null;
    }
}
