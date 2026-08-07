import { State } from '../state.js';

export const UserTour = {
    activeTour: null,
    currentStepIndex: 0,
    tooltipEl: null,
    highlightEl: null,
    resizeHandler: null,
    
    steps: {
        task_directory: [
            {
                selector: '#searchInput',
                title: '🔍 Search Local Leads',
                text: 'Enter a business niche or category (e.g., "Dentists", "Lawyers", "Cafes") here to search in our directory.',
                position: 'bottom'
            },
            {
                selector: '#areaFilter',
                title: '📍 Filter by Location',
                text: 'Select a neighborhood or suburb in Mumbai (like Bandra or Powai) to narrow your search targets.',
                position: 'bottom'
            },
            {
                selector: '#resetSearchBtn',
                title: '🔄 Reset Search',
                text: 'Click here anytime to clear filters and view all directory listings again.',
                position: 'left'
            }
        ],
        task_save_lead: [
            {
                selector: '.track-card-btn',
                title: '📋 Save Lead to CRM',
                text: 'Click the "Track" button on any business listing card to save it directly to your workspace CRM pipeline.',
                position: 'bottom'
            },
            {
                selector: 'a[href="#/dashboard/crm"]',
                title: 'Outreach Workstation',
                text: 'Your saved leads are sent here! Navigate to your Pipeline to manage outreach sequences and proposal generation.',
                position: 'right'
            }
        ],
        task_proposal: [
            {
                selector: '#proposalLeadSelect',
                title: '👤 Choose Target Lead',
                text: 'Select a saved lead from your pipeline to automatically fetch their business name and website audit data.',
                position: 'bottom'
            },
            {
                selector: '#generateProposalBtn',
                title: '📄 Generate client PDF proposal',
                text: 'Click here to automatically generate a professional, customized 3-page growth audit and proposal ready for your clients.',
                position: 'top'
            }
        ],
        task_enrichment_keys: [
            {
                selector: '.configure-key-btn',
                title: '🔑 Setup Personal API Keys',
                text: 'Click Configure to add your personal Hunter.io or Apollo keys. This allows you to bypass general platform limits.',
                position: 'left'
            }
        ],
        task_sequence: [
            {
                selector: '#dashboardNewSeqBtn, #adminCreateSeqScratch, #adminCreateSeqAI',
                title: '✉️ Create outreach sequence campaign',
                text: 'Click here to launch a new cold email campaign or AI sequence with automated multi-channel follow-ups.',
                position: 'bottom'
            }
        ],
        task_audit: [
            {
                selector: '.audit-lead-item',
                title: '📋 Select Lead for Audit',
                text: 'Choose a lead with an active website from your list to run a technical health check.',
                position: 'right'
            },
            {
                selector: '#auditRunNowBtn',
                title: '🩺 Run Website Audit',
                text: 'Click here to run a deep technical audit scanning PageSpeed, mobile layouts, SSL, and schema tags.',
                position: 'top'
            }
        ]
    },

    start(tourKey) {
        this.end();
        if (!this.steps[tourKey]) return;
        this.activeTour = tourKey;
        this.currentStepIndex = 0;
        localStorage.setItem('nearpro_active_tour', tourKey);
        
        // Wait briefly for page rendering
        setTimeout(() => this.showStep(), 650);

        // Listen for screen resize/scroll to reposition overlay
        this.resizeHandler = () => {
            const tourSteps = this.steps[this.activeTour];
            if (tourSteps && tourSteps[this.currentStepIndex]) {
                const step = tourSteps[this.currentStepIndex];
                const element = document.querySelector(step.selector);
                if (element && this.tooltipEl && this.highlightEl) {
                    const rect = element.getBoundingClientRect();
                    this.highlightEl.style.top = `${rect.top + window.scrollY - 4}px`;
                    this.highlightEl.style.left = `${rect.left + window.scrollX - 4}px`;
                    this.highlightEl.style.width = `${rect.width + 8}px`;
                    this.highlightEl.style.height = `${rect.height + 8}px`;
                    this.positionTooltip(rect, step.position);
                }
            }
        };
        window.addEventListener('resize', this.resizeHandler);
        window.addEventListener('scroll', this.resizeHandler);
    },

    showStep() {
        this.removeUI();
        if (!this.activeTour) return;
        
        const tourSteps = this.steps[this.activeTour];
        if (this.currentStepIndex >= tourSteps.length) {
            this.complete();
            return;
        }

        const step = tourSteps[this.currentStepIndex];
        const element = document.querySelector(step.selector);

        if (!element) {
            console.warn(`Tour target element "${step.selector}" not found. Retrying in 1000ms...`);
            setTimeout(() => {
                const retryEl = document.querySelector(step.selector);
                if (retryEl) {
                    this.renderTooltip(retryEl, step);
                } else {
                    // Try next step if still not found
                    this.currentStepIndex++;
                    this.showStep();
                }
            }, 1000);
            return;
        }

        this.renderTooltip(element, step);
    },

    renderTooltip(element, step) {
        const rect = element.getBoundingClientRect();
        
        element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
        
        setTimeout(() => {
            const updatedRect = element.getBoundingClientRect();
            
            // Highlight frame
            const highlight = document.createElement('div');
            highlight.id = 'tour-highlight-glow';
            highlight.style.position = 'absolute';
            highlight.style.top = `${updatedRect.top + window.scrollY - 4}px`;
            highlight.style.left = `${updatedRect.left + window.scrollX - 4}px`;
            highlight.style.width = `${updatedRect.width + 8}px`;
            highlight.style.height = `${updatedRect.height + 8}px`;
            highlight.style.border = '2.5px solid #ffa000'; // Golden glow
            highlight.style.borderRadius = '8px';
            highlight.style.boxShadow = '0 0 14px 4px rgba(255, 160, 0, 0.6)';
            highlight.style.zIndex = '99999';
            highlight.style.pointerEvents = 'none';
            highlight.style.animation = 'tour-pulse 1.8s infinite ease-in-out';
            document.body.appendChild(highlight);
            this.highlightEl = highlight;

            // Tooltip card
            const tooltip = document.createElement('div');
            tooltip.id = 'tour-tooltip-card';
            tooltip.style.position = 'absolute';
            tooltip.style.background = 'rgba(10, 10, 12, 0.95)';
            tooltip.style.backdropFilter = 'blur(8px)';
            tooltip.style.border = '1px solid rgba(255, 255, 255, 0.15)';
            tooltip.style.borderRadius = '12px';
            tooltip.style.padding = '18px';
            tooltip.style.width = '310px';
            tooltip.style.color = '#ffffff';
            tooltip.style.fontFamily = 'var(--font-body)';
            tooltip.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.6)';
            tooltip.style.zIndex = '999999';
            
            const stepsCount = this.steps[this.activeTour].length;
            const stepNum = this.currentStepIndex + 1;
            
            tooltip.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <span style="font-size:10px; font-weight:800; color:#ffa000; text-transform:uppercase; letter-spacing:1px; font-family:var(--font-heading);">Step ${stepNum} of ${stepsCount}</span>
                    <button id="tour-skip-btn" style="background:none; border:none; color:#6f6f76; font-size:11px; cursor:pointer; font-weight:700; padding:2px;">Skip ✕</button>
                </div>
                <h4 style="margin:0 0 8px 0; font-size:14px; font-weight:800; color:#ffffff; font-family:var(--font-heading);">${step.title}</h4>
                <p style="margin:0 0 16px 0; font-size:12.5px; color:#c5c5c9; line-height:1.45;">${step.text}</p>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <button id="tour-back-btn" style="padding:6px 12px; font-size:11px; background:transparent; border:1px solid rgba(255,255,255,0.15); color:#c5c5c9; border-radius:6px; cursor:pointer; font-weight:700; transition:all 0.2s; visibility:${stepNum > 1 ? 'visible' : 'hidden'};" onmouseover="this.style.background='rgba(255,255,255,0.05)';" onmouseout="this.style.background='transparent';">Back</button>
                    <button id="tour-next-btn" style="padding:6px 14px; font-size:11px; background:linear-gradient(135deg, #ffa000, #ec4899); border:none; color:#ffffff; border-radius:6px; cursor:pointer; font-weight:800; transition:all 0.2s;" onmouseover="this.style.opacity='0.9';" onmouseout="this.style.opacity='1';">${stepNum === stepsCount ? 'Finish ✓' : 'Next ➔'}</button>
                </div>
            `;
            
            document.body.appendChild(tooltip);
            this.tooltipEl = tooltip;

            this.positionTooltip(updatedRect, step.position);

            document.getElementById('tour-next-btn').addEventListener('click', () => {
                this.currentStepIndex++;
                this.showStep();
            });

            document.getElementById('tour-back-btn')?.addEventListener('click', () => {
                if (this.currentStepIndex > 0) {
                    this.currentStepIndex--;
                    this.showStep();
                }
            });

            document.getElementById('tour-skip-btn').addEventListener('click', () => {
                this.end();
            });
        }, 350);
    },

    positionTooltip(targetRect, placement) {
        if (!this.tooltipEl) return;
        
        const tooltipRect = this.tooltipEl.getBoundingClientRect();
        let top = 0;
        let left = 0;
        const padding = 14;

        const targetCenterX = targetRect.left + window.scrollX + targetRect.width / 2;
        const targetCenterY = targetRect.top + window.scrollY + targetRect.height / 2;

        if (placement === 'bottom') {
            top = targetRect.bottom + window.scrollY + padding;
            left = targetCenterX - tooltipRect.width / 2;
        } else if (placement === 'top') {
            top = targetRect.top + window.scrollY - tooltipRect.height - padding;
            left = targetCenterX - tooltipRect.width / 2;
        } else if (placement === 'left') {
            top = targetCenterY - tooltipRect.height / 2;
            left = targetRect.left + window.scrollX - tooltipRect.width - padding;
        } else if (placement === 'right') {
            top = targetCenterY - tooltipRect.height / 2;
            left = targetRect.right + window.scrollX + padding;
        } else {
            top = window.innerHeight / 2 + window.scrollY - tooltipRect.height / 2;
            left = window.innerWidth / 2 + window.scrollX - tooltipRect.width / 2;
        }

        left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 20));
        top = Math.max(10, Math.min(top, document.documentElement.scrollHeight - tooltipRect.height - 20));

        this.tooltipEl.style.top = `${top}px`;
        this.tooltipEl.style.left = `${left}px`;
    },

    removeUI() {
        if (this.tooltipEl && this.tooltipEl.parentNode) {
            this.tooltipEl.parentNode.removeChild(this.tooltipEl);
        }
        this.tooltipEl = null;

        if (this.highlightEl && this.highlightEl.parentNode) {
            this.highlightEl.parentNode.removeChild(this.highlightEl);
        }
        this.highlightEl = null;
    },

    end() {
        this.removeUI();
        this.activeTour = null;
        localStorage.removeItem('nearpro_active_tour');
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            window.removeEventListener('scroll', this.resizeHandler);
            this.resizeHandler = null;
        }
    },

    complete() {
        this.end();
        if (window.showToast) {
            window.showToast("✨ Tour completed! You're ready to master this page.", "success");
        }
    }
};
