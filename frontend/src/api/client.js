import { INITIAL_TICKETS } from './mockData';

// Local storage or in-memory persistence for mock ticket state
let cachedTickets = [...INITIAL_TICKETS];

/**
 * Endpoint 1: POST /api/analyze
 * Expects: { text: string }
 * Returns: Ticket JSON or Clarification JSON
 *
 * Clarification JSON shape:
 * {
 *   needs_clarification: true,
 *   question: string,
 *   original_text: string
 * }
 *
 * Ticket JSON shape:
 * {
 *   needs_clarification: false,
 *   ticket: {
 *     id: string,
 *     summary: string,
 *     category: string,
 *     department: string,
 *     location: string,
 *     urgency: string,
 *     slaStatus: string,
 *     resolutionTimeframe: string,
 *     assignedOfficer: string,
 *     createdAt: string,
 *     statusMessage: string
 *   }
 * }
 */
export async function analyzeComplaint(text) {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    // Graceful fallback to mock AI logic if backend is not yet connected
    console.info('[NagrikAI] /api/analyze backend not reachable. Using intelligent client mock fallback.');
  }

  // Simulate network latency (800ms) for realistic UX
  await new Promise((res) => setTimeout(res, 800));

  const lower = text.toLowerCase();
  const hasLocationHint =
    lower.includes('road') ||
    lower.includes('street') ||
    lower.includes('block') ||
    lower.includes('stage') ||
    lower.includes('layout') ||
    lower.includes('nagar') ||
    lower.includes('near') ||
    lower.includes('ward') ||
    lower.includes('main') ||
    lower.includes('cross');

  // If vague or lacks location specification, request clarification
  if (!hasLocationHint || text.trim().length < 30) {
    let specificQuestion = "Which locality, landmark, or street is affected, and approximately how many households are impacted?";
    if (lower.includes('water') || lower.includes('pipe') || lower.includes('tanker')) {
      specificQuestion = "To dispatch the BWSSB emergency tanker or pipeline repair squad immediately, which street or building is affected, and how long has the supply been disrupted?";
    } else if (lower.includes('pothole') || lower.includes('road') || lower.includes('tar')) {
      specificQuestion = "To send the BBMP Quick Response asphalt team, please share the specific road name, nearest landmark, or metro pillar number.";
    } else if (lower.includes('light') || lower.includes('power') || lower.includes('electric') || lower.includes('wire')) {
      specificQuestion = "Is there an active live wire hazard on the ground, and what is the pole number or street address?";
    }

    return {
      needs_clarification: true,
      question: specificQuestion,
      original_text: text,
    };
  }

  // Otherwise, automatically generate the Ticket JSON
  return {
    needs_clarification: false,
    ticket: generateMockTicket(text),
  };
}

/**
 * Endpoint 2: POST /api/clarify
 * Expects: { original_text: string, reply: string }
 * Returns: Updated Ticket JSON
 */
export async function clarifyComplaint(original_text, reply) {
  try {
    const response = await fetch('/api/clarify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ original_text, reply }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.info('[NagrikAI] /api/clarify backend not reachable. Using client mock fallback.');
  }

  await new Promise((res) => setTimeout(res, 750));
  const mergedDescription = `${original_text} [Citizen Clarification: ${reply}]`;
  const ticket = generateMockTicket(mergedDescription, reply);

  // Auto-append to our live cached tickets so Staff Dashboard immediately reflects it
  cachedTickets.unshift(ticket);

  return {
    needs_clarification: false,
    ticket,
  };
}

/**
 * Endpoint 3: GET /api/tickets
 * Returns: Array of ticket objects
 */
export async function fetchTickets() {
  try {
    const response = await fetch('/api/tickets', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        cachedTickets = data;
        return data;
      }
    }
  } catch (err) {
    console.info('[NagrikAI] /api/tickets backend not reachable. Serving local mock tickets.');
  }

  await new Promise((res) => setTimeout(res, 300));
  return [...cachedTickets];
}

/**
 * Helper: Escalate a ticket in memory or through API
 */
export async function escalateTicket(ticketId, reason = 'SLA Breached - Escalated to Zonal Authority') {
  try {
    const response = await fetch(`/api/tickets/${ticketId}/escalate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (response.ok) return await response.json();
  } catch (err) {
    // fallback
  }

  // Update in cache
  cachedTickets = cachedTickets.map((t) =>
    t.id === ticketId
      ? { ...t, escalated: true, statusText: `ESCALATED: ${reason}` }
      : t
  );
  return { success: true, ticketId };
}

/**
 * Helper to dynamically create a structured Ticket from text
 */
function generateMockTicket(text, locationHint = '') {
  const lower = text.toLowerCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const ticketId = `NAG-${randomNum}`;

  let category = "General Municipal Works";
  let department = "BBMP Works";
  let urgency = "Medium";
  let timeframe = "Within 48 Hours";
  let officer = "Eng. Rajesh Gowda";
  let extractedLocation = locationHint || "Bengaluru East Ward 112";

  if (lower.includes('water') || lower.includes('drain') || lower.includes('pipeline') || lower.includes('sewage')) {
    category = "Water Supply & Sanitation";
    department = "BWSSB";
    urgency = "High";
    timeframe = "Within 24 Hours";
    officer = "Eng. Suresh Patil (BWSSB Unit 4)";
    if (!locationHint) extractedLocation = "Indiranagar 12th Main, Ward 112";
  } else if (lower.includes('pothole') || lower.includes('road') || lower.includes('traffic') || lower.includes('footpath') || lower.includes('bridge')) {
    category = "Roads & Infrastructure";
    department = "BBMP Works";
    urgency = "High";
    timeframe = "Within 36 Hours";
    officer = "Asst. Exec. Eng. Ramesh Babu";
    if (!locationHint) extractedLocation = "Outer Ring Road Junction, Ward 85";
  } else if (lower.includes('wire') || lower.includes('light') || lower.includes('power') || lower.includes('spark') || lower.includes('transformer')) {
    category = "Electricity & Streetlights";
    department = "BESCOM";
    urgency = lower.includes('wire') || lower.includes('spark') ? "Critical" : "Medium";
    timeframe = urgency === "Critical" ? "Immediate / 4 Hours" : "Within 24 Hours";
    officer = "Lineman K. Raghu (Subdivision East)";
    if (!locationHint) extractedLocation = "Malleshwaram 8th Cross, Ward 45";
  } else if (lower.includes('garbage') || lower.includes('waste') || lower.includes('dump') || lower.includes('trash')) {
    category = "Solid Waste Management";
    department = "BBMP SWM";
    urgency = "Medium";
    timeframe = "Within 24 Hours";
    officer = "Health Inspector N. Manjunath";
    if (!locationHint) extractedLocation = "Koramangala 4th Block, Ward 151";
  } else if (lower.includes('dog') || lower.includes('animal') || lower.includes('mosquito') || lower.includes('dengue')) {
    category = "Public Health & Safety";
    department = "Health & Safety";
    urgency = "Medium";
    timeframe = "Within 48 Hours";
    officer = "Dr. P. Venkatesh (Vet Officer)";
    if (!locationHint) extractedLocation = "Jayanagar 4th T Block, Ward 168";
  }

  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    id: ticketId,
    summary: text.length > 70 ? text.substring(0, 70) + '...' : text,
    details: text,
    category,
    department,
    location: extractedLocation,
    ward: extractedLocation,
    urgency,
    slaStatus: 'on-track',
    slaRemaining: '23h 50m remaining',
    slaDeadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    createdAt: `${timeString} Today`,
    timestamp: Date.now(),
    assignedOfficer: officer,
    escalated: false,
    resolutionTimeframe: timeframe,
    statusText: 'Dispatched to Ward Rapid Response Unit',
    statusMessage: 'Grievance Docket Registered Successfully'
  };
}
