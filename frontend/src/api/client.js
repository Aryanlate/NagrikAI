const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function getApiUrl(path) {
  if (API_BASE_URL) {
    return `${API_BASE_URL}${path}`;
  }
  return path;
}

async function request(path, options = {}) {
  const url = getApiUrl(path);
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errBody = await response.json();
      if (errBody && errBody.detail) {
        errorMessage = errBody.detail;
      }
    } catch (_) {
      // ignore json parse error on error body
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}

const DEPARTMENT_COLORS = {
  'BBMP Works': '#2563EB',
  'BWSSB': '#0284C7',
  'BESCOM': '#D97706',
  'BBMP SWM': '#059669',
  'Health & Safety': '#7C3AED',
  'General Grievance Cell': '#64748B',
};

function formatDeadlineRemaining(slaDeadline, breached) {
  if (breached) {
    try {
      const now = new Date();
      const dl = new Date(slaDeadline);
      const diffMs = now - dl;
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `Breached (+${diffHrs}h ${diffMins}m)`;
    } catch (_) {
      return 'Breached';
    }
  }
  try {
    const now = new Date();
    const dl = new Date(slaDeadline);
    const diffMs = dl - now;
    if (diffMs <= 0) return '0m remaining';
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (diffHrs > 0) return `${diffHrs}h ${diffMins}m remaining`;
    return `${diffMins}m remaining`;
  } catch (_) {
    return 'Pending';
  }
}

function computeSlaStatus(slaDeadline, breached) {
  if (breached) return 'breached';
  try {
    const now = new Date();
    const dl = new Date(slaDeadline);
    const diffMs = dl - now;
    const twoHoursMs = 2 * 60 * 60 * 1000;
    if (diffMs <= twoHoursMs) return 'approaching';
    return 'on-track';
  } catch (_) {
    return 'on-track';
  }
}

function formatCreatedAt(createdAt) {
  try {
    const d = new Date(createdAt);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `${timeStr} Today`;
    return d.toLocaleString([], {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  } catch (_) {
    return createdAt || 'Unknown';
  }
}

function mapBackendTicketToFrontend(backendTicket) {
  const id = backendTicket.ticket_id || `T-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const urgency = capitalizeUrgency(backendTicket.urgency);
  const slaStatus = computeSlaStatus(backendTicket.sla_deadline, backendTicket.breached);
  const summary = (backendTicket.raw_text || '').length > 70
    ? (backendTicket.raw_text || '').substring(0, 70) + '...'
    : (backendTicket.raw_text || '');

  const timeframe = backendTicket.sla_hours
    ? `Within ${backendTicket.sla_hours} Hours`
    : 'Per Statutory SLA';

  return {
    id,
    ticket_id: backendTicket.ticket_id,
    summary,
    details: backendTicket.raw_text || '',
    raw_text: backendTicket.raw_text,
    category: backendTicket.category || 'Uncategorized',
    location: backendTicket.location || 'Bengaluru',
    ward: backendTicket.location || 'Bengaluru Ward',
    department: backendTicket.department || 'General Grievance Cell',
    urgency,
    slaStatus,
    slaRemaining: formatDeadlineRemaining(backendTicket.sla_deadline, backendTicket.breached),
    slaDeadline: backendTicket.sla_deadline,
    sla_hours: backendTicket.sla_hours,
    createdAt: formatCreatedAt(backendTicket.created_at),
    created_at: backendTicket.created_at,
    timestamp: backendTicket.created_at ? new Date(backendTicket.created_at).getTime() : Date.now(),
    assignedOfficer: `${backendTicket.department || 'Municipal'} Field Unit`,
    escalated: !!backendTicket.escalation_action,
    resolutionTimeframe: timeframe,
    statusText: backendTicket.escalation_action || statusToText(backendTicket.status, slaStatus),
    statusMessage: backendTicket.citizen_response_message || 'Docket Registered',
    breached: !!backendTicket.breached,
    status: backendTicket.status,
    escalation_action: backendTicket.escalation_action,
    reasoning: backendTicket.reasoning || "Classified based on complaint content.",
    related_ticket_ids: backendTicket.related_ticket_ids || [],
  };
}

function capitalizeUrgency(u) {
  if (!u) return 'Medium';
  const s = String(u).toLowerCase();
  if (s === 'critical') return 'Critical';
  if (s === 'high') return 'High';
  if (s === 'medium') return 'Medium';
  if (s === 'low') return 'Low';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function statusToText(status, slaStatus) {
  if (slaStatus === 'breached') return 'SLA Breached - Immediate Action';
  if (status === 'resolved') return 'Resolved & Closed';
  if (status === 'in_progress') return 'Field Team Dispatched';
  return 'Dispatched to Ward Rapid Response Unit';
}

export function mapAnalyzeResponseToFrontend(result, originalText) {
  const missing = result.missing_fields || [];
  if (missing.length > 0) {
    return {
      needs_clarification: true,
      question: result.clarification_question || "Please provide additional details to process your grievance.",
      original_text: originalText,
      missing_fields: missing,
    };
  }

  const ticket = mapBackendTicketToFrontend({
    ...result,
    raw_text: result.raw_text || originalText,
  });

  return {
    needs_clarification: false,
    ticket,
    ticket_id: result.ticket_id,
    citizen_response_message: result.citizen_response_message ||
      "Thank you for being an active citizen. Your grievance has been registered and dispatched.",
  };
}

export async function analyzeComplaint(text) {
  const data = await request('/api/analyze', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  return mapAnalyzeResponseToFrontend(data, text);
}

export async function clarifyComplaint(originalText, reply) {
  const data = await request('/api/clarify', {
    method: 'POST',
    body: JSON.stringify({ original_text: originalText, reply }),
  });
  return mapAnalyzeResponseToFrontend(data, originalText);
}

export async function fetchTickets() {
  const data = await request('/api/tickets', { method: 'GET' });
  const list = Array.isArray(data) ? data : (data.tickets || []);
  return list.map(mapBackendTicketToFrontend);
}

export async function fetchStats() {
  const data = await request('/api/stats', { method: 'GET' });

  const byDepartment = Object.entries(data.by_department || {}).map(([dept, count]) => ({
    department: dept,
    count: Number(count) || 0,
    resolvedRate: 85,
    color: DEPARTMENT_COLORS[dept] || '#64748B',
  }));

  const byCategory = Object.entries(data.by_category || {}).map(([cat, count]) => ({
    category: cat,
    count: Number(count) || 0,
    color: DEPARTMENT_COLORS[cat] || '#64748B',
  }));

  return { byDepartment, byCategory };
}

export async function checkBreaches() {
  const data = await request('/api/check-breaches', { method: 'POST' });
  const list = Array.isArray(data) ? data : (data.tickets || []);
  return list.map(mapBackendTicketToFrontend);
}

export async function escalateTicket(ticketId, reason) {
  try {
    await request(`/api/tickets/${ticketId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'breached',
        breached: true,
        escalation_action: reason || 'SLA Breached - Escalated to Zonal Authority',
      }),
    });
    return { success: true, ticketId };
  } catch (err) {
    throw err;
  }
}

export { API_BASE_URL };
