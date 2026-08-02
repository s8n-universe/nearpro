import { supabase } from '../supabase.js';

/**
 * Creates and displays a sleek, premium auto-dismissing toast notification
 * for errors or warnings, ensuring a beautiful fallback visual without crashing the UI.
 */
export function showToast(message, type = 'error', duration = 5000) {
    let container = document.getElementById('nearpro-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'nearpro-toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 380px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
        background: rgba(18, 18, 18, 0.95);
        border-left: 4px solid ${type === 'success' ? '#10B981' : type === 'warning' ? '#F59E0B' : '#EF4444'};
        color: #F3F4F6;
        padding: 14px 16px;
        border-radius: 8px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
        font-family: var(--font-body, system-ui, sans-serif);
        font-size: 13px;
        font-weight: 500;
        line-height: 1.4;
        display: flex;
        align-items: center;
        gap: 12px;
        backdrop-filter: blur(12px);
        transform: translateY(20px);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: auto;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-left-width: 4px;
    `;

    // Premium icon indicator
    const icon = document.createElement('span');
    icon.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        font-size: 11px;
        color: #fff;
        background: ${type === 'success' ? '#10B981' : type === 'warning' ? '#F59E0B' : '#EF4444'};
        flex-shrink: 0;
    `;
    icon.textContent = type === 'success' ? '✓' : type === 'warning' ? '⚠' : '✕';

    const text = document.createElement('div');
    text.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(text);
    container.appendChild(toast);

    // Trigger animate-in
    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    });

    // Auto-dismiss
    setTimeout(() => {
        toast.style.transform = 'translateY(-10px)';
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

/**
 * Executes a Supabase query/API call with automatic retry mechanism,
 * autohealing fallbacks, and user-friendly visual alerts.
 */
export async function safeApiCall(apiFn, fallbackValue = null, options = {}) {
    const {
        retries = 1,
        delay = 1000,
        shouldThrow = false,
        silent = false,
        contextName = 'Database Query'
    } = options;

    let attempt = 0;
    while (attempt <= retries) {
        try {
            return await apiFn();
        } catch (error) {
            attempt++;
            console.error(`[Api Error - Attempt ${attempt}/${retries + 1}] in ${contextName}:`, error);
            
            // If we have retries left, wait and retry
            if (attempt <= retries) {
                await new Promise(resolve => setTimeout(resolve, delay * attempt));
                continue;
            }

            // If we ran out of retries, heal dynamically and report/toast
            if (!silent) {
                const cleanMsg = error?.message || 'A transient connection problem occurred. Please check your network and try again.';
                showToast(`[${contextName}] ${cleanMsg}`, 'error');
            }

            if (shouldThrow) {
                throw error;
            }
            
            return fallbackValue;
        }
    }
    return fallbackValue;
}

/**
 * Invokes DB RPC function to atomically increment a profile/row counter.
 */
export async function atomicIncrement(table, id, column, amount = 1) {
    return safeApiCall(
        async () => {
            const { error } = await supabase.rpc('atomic_increment', {
                p_table: table,
                p_id: id,
                p_column: column,
                p_amount: parseInt(amount)
            });
            if (error) throw error;
            return true;
        },
        false,
        { silent: true, contextName: 'Atomic Increment' }
    );
}

/**
 * Invokes DB RPC function to atomically decrement a profile/row counter.
 */
export async function atomicDecrement(table, id, column, amount = 1) {
    return safeApiCall(
        async () => {
            const { error } = await supabase.rpc('atomic_decrement', {
                p_table: table,
                p_id: id,
                p_column: column,
                p_amount: parseInt(amount)
            });
            if (error) throw error;
            return true;
        },
        false,
        { silent: true, contextName: 'Atomic Decrement' }
    );
}

/**
 * Safely updates professional intent signals and active counter details via RLS-bypassing RPC function.
 */
export async function safeUpdateProfessionalSignals(professionalId, scoreDiff) {
    return safeApiCall(
        async () => {
            const { error } = await supabase.rpc('safe_update_professional_signals', {
                p_professional_id: professionalId,
                p_score_diff: parseInt(scoreDiff)
            });
            if (error) throw error;
            return true;
        },
        false,
        { silent: true, contextName: 'Safe Update Signal' }
    );
}
