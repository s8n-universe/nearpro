import { State } from '../state.js';
import { currentUserHasAccess } from '../auth.js';

export function renderPlatformOverviewLayout() {
    const userTier = (State.profile?.subscription_tier || State.profile?.tier || 'free').toLowerCase();
    const userName = State.profile?.full_name || State.user?.email?.split('@')[0] || 'Agency Founder';

    // Onboarding task lists state tracking
    const taskDirectory = localStorage.getItem('nearpro_task_directory') === 'true';
    const taskSaveLead = localStorage.getItem('nearpro_task_save_lead') === 'true';
    const taskProposal = localStorage.getItem('nearpro_task_proposal') === 'true';
    const taskEnrichmentKeys = localStorage.getItem('nearpro_task_enrichment_keys') === 'true';
    const taskSequence = localStorage.getItem('nearpro_task_sequence') === 'true';
    const taskAudit = localStorage.getItem('nearpro_task_audit') === 'true';

    const tasks = [
        {
            id: 'task_directory',
            completed: taskDirectory,
            title: 'Search local leads in the business directory',
            desc: 'Find verified local businesses with review counts or unoptimized websites.',
            btnText: 'Go to directory',
            hash: '#/dashboard/directory'
        },
        {
            id: 'task_save_lead',
            completed: taskSaveLead,
            title: 'Save a lead to start building your pipeline',
            desc: 'Add contacts from searches to your workspace lead database.',
            btnText: 'Save a prospect',
            hash: '#/dashboard/directory'
        },
        {
            id: 'task_proposal',
            completed: taskProposal,
            title: 'Generate a 1-click PDF proposal for a prospect',
            desc: 'Create personalized audits featuring revenue loss estimates and competitor comparison grids.',
            btnText: 'Create proposal',
            hash: '#/dashboard/proposals'
        },
        {
            id: 'task_enrichment_keys',
            completed: taskEnrichmentKeys,
            title: 'Configure your personalized API keys to bypass limits',
            desc: 'Add personal credential keys (Hunter.io or Apollo) to run waterfall enrichment logs.',
            btnText: 'Configure keys',
            hash: '#/dashboard/enrichment'
        },
        {
            id: 'task_sequence',
            completed: taskSequence,
            title: 'Launch an automated outreach sequence campaign',
            desc: 'Set up multi-channel email, WhatsApp, or twilio drip sequences.',
            btnText: 'Create sequence',
            hash: '#/dashboard/sequences'
        },
        {
            id: 'task_audit',
            completed: taskAudit,
            title: 'Run a technical SEO & website health check audit',
            desc: 'Perform technical lighthouse, mobile speed, and security check scans.',
            btnText: 'Run audit',
            hash: '#/dashboard/audit'
        }
    ];

    const completedCount = tasks.filter(t => t.completed).length;
    const progressPercent = Math.round((completedCount / tasks.length) * 100);

    return `
        <div class="platform-overview-container" style="display: flex; flex-direction: column; gap: 32px; padding: 24px; background: #f8fafc; color: #0f172a; border-radius: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 1000px; margin: 0 auto; width:100%;">
            
            <!-- HEADER SECTION -->
            <div>
                <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; font-family: var(--font-heading);">
                    Get started with NearPro
                </h1>
                <p style="color: #475569; font-size: 13.5px; margin: 0; line-height: 1.5;">
                    Complete these tasks in your first 14 days to earn up to 75 credits and start reaching prospects and booking meetings.
                </p>
            </div>

            <!-- TASK LIST COMPONENT CARD -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 20px;">
                
                <!-- PROGRESS BAR HEADER -->
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 700; color: #475569;">
                        <span>Start reaching the right prospects (Earn 30 credits)</span>
                        <span>${completedCount} of ${tasks.length} completed</span>
                    </div>
                    <div style="height: 6px; background: #e2e8f0; border-radius: 10px; overflow: hidden; position: relative;">
                        <div style="width: ${progressPercent}%; height: 100%; background: #10b981; border-radius: 10px; transition: width 0.3s ease;"></div>
                    </div>
                </div>

                <!-- CHECKLIST GRID -->
                <div style="display: flex; flex-direction: column; border-top: 1px solid #f1f5f9;">
                    ${tasks.map(t => `
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 0; border-bottom: 1.5px solid #f1f5f9;">
                            <div style="display: flex; align-items: flex-start; gap: 12px; flex: 1;">
                                <!-- Custom Styled Checkbox -->
                                <div class="onboarding-checkbox" data-id="${t.id}" style="width: 20px; height: 20px; border-radius: 4px; border: 1.5px solid ${t.completed ? '#10b981' : '#cbd5e1'}; background: ${t.completed ? '#e8f5e9' : '#ffffff'}; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; margin-top: 2px;">
                                    ${t.completed ? '<span style="color:#10b981; font-weight:900; font-size:12px;">✓</span>' : ''}
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 3px;">
                                    <h4 style="margin: 0; font-size: 13.5px; font-weight: 700; color: #0f172a; text-decoration: ${t.completed ? 'line-through' : 'none'};">${t.title}</h4>
                                    <p style="margin: 0; font-size: 12px; color: #64748b;">${t.desc}</p>
                                </div>
                            </div>
                            <a href="${t.hash}" class="onboarding-btn" data-task-id="${t.id}" style="padding: 7px 14px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-size: 12px; font-weight: 700; text-decoration: none; display: inline-block; white-space: nowrap; transition: all 0.2s;">
                                ${t.btnText}
                            </a>
                        </div>
                    `).join('')}
                </div>

                <!-- Load more trigger -->
                <div style="text-align: center; padding-top: 4px;">
                    <span style="font-size: 12px; font-weight: 800; color: #475569; cursor: pointer; text-decoration: underline;">Load more</span>
                </div>
            </div>

            <!-- RESOURCES TO MASTER NEARPRO -->
            <div>
                <h3 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; font-family: var(--font-heading);">
                    More resources to help you master NearPro
                </h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
                    <!-- Resource 1 -->
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 15px rgba(0,0,0,0.01);">
                        <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); height: 110px; display: flex; align-items: center; justify-content: center; position: relative;">
                            <div style="width: 48px; height: 48px; border-radius: 12px; background: #2563eb; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(37,99,235,0.2);">
                                <span style="font-size: 20px; color: white;">🎓</span>
                            </div>
                        </div>
                        <div style="padding: 18px; display: flex; flex-direction: column; gap: 12px; flex: 1; justify-content: space-between;">
                            <div>
                                <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: #0f172a;">Learn with NearPro Academy</h4>
                                <p style="margin: 6px 0 0 0; font-size: 12px; color: #475569; line-height: 1.45;">Explore tutorials and best practices designed to help you get started with sales automation.</p>
                            </div>
                            <button class="secondary-btn" style="width: 100%; padding: 8px; font-size: 12px; border-radius: 6px; font-weight: 700; border: 1px solid #cbd5e1; background: #ffffff; color: #0f172a; cursor: pointer;">Visit Academy</button>
                        </div>
                    </div>

                    <!-- Resource 2 -->
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 15px rgba(0,0,0,0.01);">
                        <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); height: 110px; display: flex; align-items: center; justify-content: center; position: relative;">
                            <div style="width: 48px; height: 48px; border-radius: 12px; background: #10b981; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(16,185,129,0.2);">
                                <span style="font-size: 20px; color: white;">▶</span>
                            </div>
                        </div>
                        <div style="padding: 18px; display: flex; flex-direction: column; gap: 12px; flex: 1; justify-content: space-between;">
                            <div>
                                <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: #0f172a;">Watch a webinar</h4>
                                <p style="margin: 6px 0 0 0; font-size: 12px; color: #475569; line-height: 1.45;">See NearPro in action through live sessions or on-demand walkthroughs you can watch anytime.</p>
                            </div>
                            <button class="secondary-btn" style="width: 100%; padding: 8px; font-size: 12px; border-radius: 6px; font-weight: 700; border: 1px solid #cbd5e1; background: #ffffff; color: #0f172a; cursor: pointer;">Browse webinars</button>
                        </div>
                    </div>

                    <!-- Resource 3 -->
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 15px rgba(0,0,0,0.01);">
                        <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); height: 110px; display: flex; align-items: center; justify-content: center; position: relative;">
                            <div style="width: 48px; height: 48px; border-radius: 12px; background: #f59e0b; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(245,158,11,0.2);">
                                <span style="font-size: 20px; color: white;">💡</span>
                            </div>
                        </div>
                        <div style="padding: 18px; display: flex; flex-direction: column; gap: 12px; flex: 1; justify-content: space-between;">
                            <div>
                                <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: #0f172a;">Go deeper with help docs</h4>
                                <p style="margin: 6px 0 0 0; font-size: 12px; color: #475569; line-height: 1.45;">Find detailed answers, setup guidance, and platform tutorials at your own pace.</p>
                            </div>
                            <button class="secondary-btn" style="width: 100%; padding: 8px; font-size: 12px; border-radius: 6px; font-weight: 700; border: 1px solid #cbd5e1; background: #ffffff; color: #0f172a; cursor: pointer;">Search help docs</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    `;
}

export function bindPlatformOverviewEvents() {
    localStorage.setItem('nearpro_onboarding_completed', 'true');
    if (window.refreshLucideIcons) window.refreshLucideIcons();

    // Bind onboarding buttons to automatically check tasks when clicked
    document.querySelectorAll('.onboarding-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const taskId = btn.getAttribute('data-task-id');
            const keyMap = {
                'task_directory': 'nearpro_task_directory',
                'task_save_lead': 'nearpro_task_save_lead',
                'task_proposal': 'nearpro_task_proposal',
                'task_enrichment_keys': 'nearpro_task_enrichment_keys',
                'task_sequence': 'nearpro_task_sequence',
                'task_audit': 'nearpro_task_audit'
            };
            
            const storageKey = keyMap[taskId];
            if (storageKey) {
                localStorage.setItem(storageKey, 'true');
            }
        });
    });

    // Also allow manual toggling of the checkboxes
    document.querySelectorAll('.onboarding-checkbox').forEach(box => {
        box.addEventListener('click', () => {
            const taskId = box.getAttribute('data-id');
            const keyMap = {
                'task_directory': 'nearpro_task_directory',
                'task_save_lead': 'nearpro_task_save_lead',
                'task_proposal': 'nearpro_task_proposal',
                'task_enrichment_keys': 'nearpro_task_enrichment_keys',
                'task_sequence': 'nearpro_task_sequence',
                'task_audit': 'nearpro_task_audit'
            };
            
            const storageKey = keyMap[taskId];
            if (storageKey) {
                const current = localStorage.getItem(storageKey) === 'true';
                localStorage.setItem(storageKey, (!current).toString());
                
                // Refresh view dynamically
                const content = document.getElementById('dashboardContent');
                if (content) {
                    content.innerHTML = renderPlatformOverviewLayout();
                    bindPlatformOverviewEvents();
                }
            }
        });
    });
}

