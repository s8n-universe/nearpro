import { State } from '../state.js';
import { currentUserHasAccess } from '../auth.js';

export function renderPlatformOverviewLayout() {
    const userTier = (State.profile?.subscription_tier || State.profile?.tier || 'free').toLowerCase();
    const userName = State.profile?.full_name || State.user?.email?.split('@')[0] || 'Agency Founder';

    // Onboarding task lists state tracking (DB-backed or local storage fallback)
    const completedTasks = State.user && State.profile?.onboarding_tasks_completed
        ? State.profile.onboarding_tasks_completed
        : [];
        
    const isCompleted = (taskId) => {
        if (State.user) {
            return completedTasks.includes(taskId);
        }
        // Guest fallback
        const keyMap = {
            'task_directory': 'nearpro_task_directory',
            'task_save_lead': 'nearpro_task_save_lead',
            'task_proposal': 'nearpro_task_proposal',
            'task_enrichment_keys': 'nearpro_task_enrichment_keys',
            'task_sequence': 'nearpro_task_sequence',
            'task_audit': 'nearpro_task_audit'
        };
        return localStorage.getItem(keyMap[taskId]) === 'true';
    };

    const tasks = [
        {
            id: 'task_directory',
            completed: isCompleted('task_directory'),
            title: 'Search local leads in the business directory',
            desc: 'Find verified local businesses with review counts or unoptimized websites.',
            btnText: 'Go to directory',
            hash: '#/dashboard/directory'
        },
        {
            id: 'task_save_lead',
            completed: isCompleted('task_save_lead'),
            title: 'Save a lead to start building your pipeline',
            desc: 'Add contacts from searches to your workspace lead database.',
            btnText: 'Save a prospect',
            hash: '#/dashboard/directory'
        },
        {
            id: 'task_proposal',
            completed: isCompleted('task_proposal'),
            title: 'Generate a 1-click PDF proposal for a prospect',
            desc: 'Create personalized audits featuring revenue loss estimates and competitor comparison grids.',
            btnText: 'Create proposal',
            hash: '#/dashboard/proposals'
        },
        {
            id: 'task_enrichment_keys',
            completed: isCompleted('task_enrichment_keys'),
            title: 'Configure your personalized API keys to bypass limits',
            desc: 'Add personal credential keys (Hunter.io or Apollo) to run waterfall enrichment logs.',
            btnText: 'Configure keys',
            hash: '#/dashboard/enrichment'
        },
        {
            id: 'task_sequence',
            completed: isCompleted('task_sequence'),
            title: 'Launch an automated outreach sequence campaign',
            desc: 'Set up multi-channel email, WhatsApp, or twilio drip sequences.',
            btnText: 'Create sequence',
            hash: '#/dashboard/sequences'
        },
        {
            id: 'task_audit',
            completed: isCompleted('task_audit'),
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
                    Get started with NearPro, ${userName}
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
                        <div class="onboarding-row" data-hash="${t.hash}" data-task-id="${t.id}" style="display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 12px; border-bottom: 1.5px solid #f1f5f9; cursor: pointer; border-radius: 8px; transition: all 0.2s ease; margin: 2px 0;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
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
                            <button class="secondary-btn" style="width: 100%; padding: 8px; font-size: 12px; border-radius: 6px; font-weight: 700; border: 1px solid #cbd5e1; background: #ffffff; color: #0f172a; cursor: pointer;" onclick="window.location.hash = '#/docs';">Visit Academy</button>
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
                            <button class="secondary-btn" style="width: 100%; padding: 8px; font-size: 12px; border-radius: 6px; font-weight: 700; border: 1px solid #cbd5e1; background: #ffffff; color: #0f172a; cursor: pointer;" onclick="window.location.hash = '#/docs';">Browse webinars</button>
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
                            <button class="secondary-btn" style="width: 100%; padding: 8px; font-size: 12px; border-radius: 6px; font-weight: 700; border: 1px solid #cbd5e1; background: #ffffff; color: #0f172a; cursor: pointer;" onclick="window.location.hash = '#/docs';">Search help docs</button>
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

    // Bind click anywhere on the row to navigate to the target hash and trigger the tour
    document.querySelectorAll('.onboarding-row').forEach(row => {
        row.addEventListener('click', (e) => {
            // If the user clicked the checkbox, don't trigger row navigation
            if (e.target.closest('.onboarding-checkbox')) {
                return;
            }
            
            const hash = row.getAttribute('data-hash');
            const taskId = row.getAttribute('data-task-id');
            
            // Set active tour key so that target page can auto-run it
            localStorage.setItem('nearpro_active_tour', taskId);
            
            // Navigate to route
            window.location.hash = hash;
        });
    });

    // Bind onboarding buttons to automatically set active tour when clicked
    document.querySelectorAll('.onboarding-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid double action on row click
            const taskId = btn.getAttribute('data-task-id');
            localStorage.setItem('nearpro_active_tour', taskId);
        });
    });

    // Allow toggling of the checkboxes manually
    document.querySelectorAll('.onboarding-checkbox').forEach(box => {
        box.addEventListener('click', async (e) => {
            e.stopPropagation(); // Stop propagation to row click handler
            const taskId = box.getAttribute('data-id');
            
            if (State.user) {
                // DB-backed toggle
                try {
                    const completedTasks = State.profile?.onboarding_tasks_completed || [];
                    const isCompleted = completedTasks.includes(taskId);
                    const { Api } = await import('../api.js');
                    const result = await Api.updateOnboardingTask(State.user.id, taskId, !isCompleted);
                    
                    State.profile = result.profile;
                    State.notify();
                    
                    if (result.creditsAwarded) {
                        alert("🎉 Congratulations! You have completed all onboarding steps and earned 30 enrichment credits!");
                    }
                    
                    // Refresh view dynamically
                    const content = document.getElementById('dashboardContent');
                    if (content) {
                        content.innerHTML = renderPlatformOverviewLayout();
                        bindPlatformOverviewEvents();
                    }
                } catch (err) {
                    console.error("Failed to toggle onboarding task:", err);
                    alert("Failed to update task completion.");
                }
            } else {
                // Guest local storage fallback
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
                    
                    // Check if all are completed in guest mode
                    const allKeys = Object.values(keyMap);
                    const completedAll = allKeys.every(k => localStorage.getItem(k) === 'true');
                    if (completedAll && !localStorage.getItem('nearpro_guest_credits_notified')) {
                        alert("🎉 You checked all steps! Sign up / Log in to claim your 30 onboarding credits.");
                        localStorage.setItem('nearpro_guest_credits_notified', 'true');
                    }
                    
                    // Refresh view dynamically
                    const content = document.getElementById('dashboardContent');
                    if (content) {
                        content.innerHTML = renderPlatformOverviewLayout();
                        bindPlatformOverviewEvents();
                    }
                }
            }
        });
    });
}
