import { supabase } from '../supabase.js';
import { State } from '../state.js';
import { safeApiCall, atomicIncrement } from './apiHelpers.js';

export const SequencesApi = {
    // 1. Fetch all sequences for user
    async getSequences() {
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('email_sequences')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(100); // Pagination guard
                if (error) throw error;
                return data || [];
            },
            [],
            { contextName: 'Fetch Sequences' }
        );
    },

    // 2. Create a new sequence
    async createSequence(name, description = '', channel = 'email') {
        if (!State.user) throw new Error("User must be logged in to create sequences");
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('email_sequences')
                    .insert([{
                        user_id: State.user.id,
                        name,
                        description,
                        channel,
                        status: 'draft'
                    }])
                    .select()
                    .single();
                if (error) throw error;
                return data;
            },
            null,
            { shouldThrow: true, contextName: 'Create Sequence' }
        );
    },

    // 3. Update sequence details
    async updateSequence(id, patch) {
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('email_sequences')
                    .update({ ...patch, updated_at: new Date().toISOString() })
                    .eq('id', id)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            },
            null,
            { shouldThrow: true, contextName: 'Update Sequence' }
        );
    },

    // 4. Delete sequence
    async deleteSequence(id) {
        return safeApiCall(
            async () => {
                const { error } = await supabase
                    .from('email_sequences')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
                return true;
            },
            false,
            { shouldThrow: true, contextName: 'Delete Sequence' }
        );
    },

    // 5. Fetch steps inside a sequence
    async getSequenceSteps(sequenceId) {
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('sequence_steps')
                    .select('*')
                    .eq('sequence_id', sequenceId)
                    .order('step_number', { ascending: true })
                    .limit(100); // Pagination guard
                if (error) throw error;
                return data || [];
            },
            [],
            { contextName: 'Fetch Steps' }
        );
    },

    // 6. Save or update steps inside a sequence with transactional backup recovery autohealing
    async saveSequenceSteps(sequenceId, steps) {
        return safeApiCall(
            async () => {
                // 1. Fetch current steps as backup in case of insertion failures
                const { data: backupSteps, error: backupError } = await supabase
                    .from('sequence_steps')
                    .select('*')
                    .eq('sequence_id', sequenceId)
                    .order('step_number', { ascending: true });
                
                if (backupError) throw backupError;

                // 2. Perform delete
                const { error: deleteError } = await supabase
                    .from('sequence_steps')
                    .delete()
                    .eq('sequence_id', sequenceId);
                if (deleteError) throw deleteError;

                if (steps.length === 0) {
                    // Update sequence total_steps count to 0
                    await supabase
                        .from('email_sequences')
                        .update({ total_steps: 0, updated_at: new Date().toISOString() })
                        .eq('id', sequenceId);
                    return [];
                }

                // 3. Prepare steps to insert
                const stepsToInsert = steps.map((step, idx) => ({
                    sequence_id: sequenceId,
                    step_number: idx + 1,
                    step_type: step.step_type || 'email',
                    subject_line: step.subject_line || '',
                    body_template: step.body_template || '',
                    delay_days: parseInt(step.delay_days) || 0,
                    delay_hours: parseInt(step.delay_hours) || 0,
                    send_time_window: step.send_time_window || '10:00-18:00',
                    ab_variant: step.ab_variant || 'A',
                    is_active: step.is_active !== false
                }));

                try {
                    // 4. Try inserting new steps
                    const { data, error: insertError } = await supabase
                        .from('sequence_steps')
                        .insert(stepsToInsert)
                        .select();
                    if (insertError) throw insertError;

                    // 5. Update sequence total_steps count
                    await supabase
                        .from('email_sequences')
                        .update({ total_steps: steps.length, updated_at: new Date().toISOString() })
                        .eq('id', sequenceId);

                    return data || [];
                } catch (err) {
                    // AUTOHEALING: If insertion fails, restore backup steps
                    console.warn("[Autohealing] Restoring sequence steps from backup due to insert failure:", err);
                    if (backupSteps && backupSteps.length > 0) {
                        const cleanBackup = backupSteps.map(s => {
                            const { id, created_at, ...rest } = s;
                            return rest;
                        });
                        await supabase.from('sequence_steps').insert(cleanBackup);
                    }
                    throw err; // Re-throw to inform safeApiCall/user
                }
            },
            [],
            { shouldThrow: true, contextName: 'Save Sequence Steps' }
        );
    },

    // 7. Enroll leads in a sequence
    async enrollLeads(sequenceId, leads) {
        if (!State.user) throw new Error("User must be logged in to enroll leads");
        if (leads.length === 0) return [];
        
        return safeApiCall(
            async () => {
                const enrollments = leads.map(lead => ({
                    sequence_id: sequenceId,
                    user_id: State.user.id,
                    professional_id: lead.professional_id || lead.id,
                    saved_lead_id: lead.saved_lead_id || lead.id,
                    current_step: 1,
                    status: 'active',
                    next_step_due_at: new Date().toISOString() // Trigger immediately on cron next cycle
                }));

                const { data, error } = await supabase
                    .from('sequence_enrollments')
                    .insert(enrollments)
                    .select();
                if (error) throw error;

                // Autohealing: Atomic counter update instead of race-prone local calculation
                await atomicIncrement('email_sequences', sequenceId, 'total_enrolled', leads.length);

                return data || [];
            },
            [],
            { shouldThrow: true, contextName: 'Enroll Leads' }
        );
    },

    // 8. Fetch enrollments for a sequence
    async getEnrollments(sequenceId) {
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('sequence_enrollments')
                    .select(`
                        *,
                        professionals:professional_id (
                            id,
                            name,
                            email,
                            phone,
                            category,
                            area,
                            rating,
                            website
                        )
                    `)
                    .eq('sequence_id', sequenceId)
                    .limit(100); // Pagination guard
                if (error) throw error;
                return data || [];
            },
            [],
            { contextName: 'Fetch Enrollments' }
        );
    },

    // 9. Fetch sequence performance logs
    async getSendLogs(enrollmentIds) {
        if (enrollmentIds.length === 0) return [];
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .from('sequence_send_log')
                    .select('*')
                    .in('enrollment_id', enrollmentIds)
                    .order('sent_at', { ascending: false })
                    .limit(100); // Pagination guard
                if (error) throw error;
                return data || [];
            },
            [],
            { contextName: 'Fetch Send Logs' }
        );
    },

    // 10. Fetch aggregated sequence analytics dashboard
    async getSequenceAnalytics() {
        if (!State.user) return null;
        return safeApiCall(
            async () => {
                const { data, error } = await supabase
                    .rpc('get_sequence_analytics', { p_user_id: State.user.id });
                if (error) throw error;
                return data;
            },
            null,
            { contextName: 'Fetch Sequence Analytics' }
        );
    }
};
