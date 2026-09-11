import os
import json
import re
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv

from constants import DEPARTMENTS, CATEGORY_CHOICES, LOCATION_REQUIRED_CATEGORIES

logger = logging.getLogger(__name__)

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

_model = None
_genai = None
_genai_available = False

try:
    try:
        import google.genai as genai_new
        _genai = genai_new
        _genai_available = True
        if GOOGLE_API_KEY:
            try:
                client = _genai.Client(api_key=GOOGLE_API_KEY)
                _model = client.models.GenerativeModel(GEMINI_MODEL)
            except Exception:
                _model = None
    except ImportError:
        import google.generativeai as genai_legacy
        _genai = genai_legacy
        _genai_available = True
        if GOOGLE_API_KEY:
            try:
                _genai.configure(api_key=GOOGLE_API_KEY)
                _model = _genai.GenerativeModel(GEMINI_MODEL)
            except Exception:
                _model = None
except ImportError:
    _genai = None
    _genai_available = False


def _is_legacy_sdk() -> bool:
    return _genai is not None and hasattr(_genai, "configure")


CATEGORIES_LIST = "\n".join([f"- {c}" for c in CATEGORY_CHOICES])

SYSTEM_PROMPT_EXTRACT = f"""You are an AI assistant for a municipal citizen complaint triage system.
Your job is to analyze complaint text and return STRICTLY VALID JSON with exactly the schema specified below.
DO NOT include any preamble, explanations, markdown fences, or extra text — ONLY the JSON object.

CATEGORIES (you MUST pick exactly ONE, fall back to "Other" if truly unclear):
{CATEGORIES_LIST}

Rules for classification and extraction:
1. category: Pick the single best matching category from the list above. If a complaint has multiple issues, pick the MOST URGENT one as the primary category.
2. urgency: "low" | "medium" | "high". Bump UP to higher urgency if:
   - Safety risk (electrical spark, gas leak, falling debris, violence, fire hazard)
   - Duration >= 3 days mentioned ("three days", "since Monday", "for a week")
   - Escalation language ("this is unacceptable", "nobody is responding", "I've complained before", "third time")
   - Vulnerable people mentioned (elderly, children, sick, disabled)
   - Infrastructure failure that blocks essential services
   Otherwise, use medium for standard complaints, low for minor/non-urgent.
3. location: STRICT RULE — Set location = null unless the user EXPLICITLY provides a SPECIFIC place such as: an address, building/house/plot/flat number, area name (e.g. "Koramangala", "Jayanagar"), street name, sector, ward, pincode, or a nearby named landmark (e.g. "near City railway station").
   - DO NOT use a generic noun phrase like "the road", "the street", "the park", "this area", "my area", "our locality", "nearby", "outside", "at home" as a location value — these are not specific enough to route, treat them as null.
   - If the complaint only mentions an infrastructure TYPE (e.g. "pothole on the road", "broken streetlight") but gives NO specific place name or address, leave location = null.
   - Only extract a location value if it directly appears verbatim in the user-provided input text. NEVER invent, assume, or infer a plausible city/area/address.
4. missing_fields: Array of required field names that are STILL missing after the strict extraction above. For categories in LOCATION_REQUIRED_CATEGORIES, location is mandatory. If the category requires a location and NO specific location was explicitly provided (even if vague place-words appear), include "location" in missing_fields. If all required fields are present, return empty array [].
5. clarification_question: If missing_fields is non-empty, write a SHORT, polite, specific natural-language question asking for the missing info. Example: "Could you please share the exact address or area where the water supply is cut off?" If missing_fields is empty, use null.

Final output MUST be valid JSON matching this exact schema (no ticket_id, no DB-only fields — those are added later):
{{
  "category": "string",
  "department": "string",
  "urgency": "low|medium|high",
  "location": "string or null",
  "missing_fields": ["field1"],
  "clarification_question": "string or null",
  "secondary_issue": "string or null"
}}

Tone handling: If the complaint is sarcastic or vague, infer the REAL underlying problem rather than taking words literally.
If the text is complete nonsense or non-civic (e.g. marketing spam, gibberish), use category="Other", urgency="medium", and ask for clarification.
"""

SYSTEM_PROMPT_CLARIFY = f"""You are an AI assistant for a municipal citizen complaint triage system.
This is a FOLLOW-UP CLARIFICATION step. The citizen previously submitted a complaint that was missing required fields.
The citizen has now replied with the additional information you asked for.

Your job is to analyze the MERGED text (original complaint + citizen's clarification reply) and return STRICTLY VALID JSON with exactly the schema specified below.
DO NOT include any preamble, explanations, markdown fences, or extra text — ONLY the JSON object.

IMPORTANT INSTRUCTIONS FOR THIS FOLLOW-UP:
- You MUST extract information from BOTH the "Original complaint" section AND the "Additional info from citizen reply" section.
- The citizen's reply section contains the answers to your earlier clarification questions — treat these answers as FACTUAL DATA that fills previously-missing fields.
- For example, if the citizen's reply says "Koregaon Park, Pune", that is the LOCATION for the complaint — extract it into the "location" field.
- Re-evaluate ALL required fields from scratch using the COMBINED information. Do NOT treat any fields as "still missing" if the combined text now provides them.

CATEGORIES (you MUST pick exactly ONE, fall back to "Other" if truly unclear):
{CATEGORIES_LIST}

Rules for classification and extraction:
1. category: Pick the single best matching category from the list above. If a complaint has multiple issues, pick the MOST URGENT one as the primary category.
2. urgency: "low" | "medium" | "high". Bump UP to higher urgency if:
   - Safety risk (electrical spark, gas leak, falling debris, violence, fire hazard)
   - Duration >= 3 days mentioned ("three days", "since Monday", "for a week")
   - Escalation language ("this is unacceptable", "nobody is responding", "I've complained before", "third time")
   - Vulnerable people mentioned (elderly, children, sick, disabled)
   - Infrastructure failure that blocks essential services
   Otherwise, use medium for standard complaints, low for minor/non-urgent.
3. location: STRICT RULE — Set location = null unless the MERGED text EXPLICITLY provides a SPECIFIC place such as: an address, building/house/plot/flat number, area name (e.g. "Koramangala", "Jayanagar"), street name, sector, ward, pincode, or a nearby named landmark (e.g. "near City railway station").
   - DO NOT use a generic noun phrase like "the road", "the street", "the park", "this area", "my area", "our locality", "nearby", "outside", "at home" as a location value — these are not specific enough to route, treat them as null.
   - If the merged text only mentions an infrastructure TYPE (e.g. "pothole on the road", "broken streetlight") but gives NO specific place name or address anywhere, leave location = null.
   - Only extract a location value if it directly appears verbatim somewhere in the combined text. NEVER invent, assume, or infer a plausible city/area/address.
4. missing_fields: Array of required field names that are STILL missing after evaluating the ENTIRE merged text. For categories in LOCATION_REQUIRED_CATEGORIES, location is mandatory. If the category requires a location and NONE was provided in EITHER section, include "location" in missing_fields. If all required fields are now present from the merged text, return empty array [].
5. clarification_question: If missing_fields is STILL non-empty after checking merged text, write a SHORT, polite, specific natural-language question asking for the still-missing info. If missing_fields is empty, use null.

Final output MUST be valid JSON matching this exact schema (no ticket_id, no DB-only fields — those are added later):
{{
  "category": "string",
  "department": "string",
  "urgency": "low|medium|high",
  "location": "string or null",
  "missing_fields": ["field1"],
  "clarification_question": "string or null",
  "secondary_issue": "string or null"
}}

Tone handling: If the complaint is sarcastic or vague, infer the REAL underlying problem rather than taking words literally.
If the text is complete nonsense or non-civic (e.g. marketing spam, gibberish), use category="Other", urgency="medium", and ask for clarification.
"""


def _strip_fences(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def _find_json_object(text: str) -> Optional[Dict[str, Any]]:
    start = text.find("{")
    if start == -1:
        return None
    end = text.rfind("}")
    if end == -1 or end <= start:
        return None
    candidate = text[start : end + 1]
    try:
        return json.loads(candidate)
    except json.JSONDecodeError:
        return None


_VAGUE_LOCATION_PATTERNS = (
    r"^(the|this|that|my|our|your|a|an|any|some)\s*$",
    r"^(road|roads|street|streets|area|areas|locality|place|spot|park|neighborhood|neighbourhood|block|zone)\s*$",
    r"^(nearby|outside|inside|here|there|everywhere|anywhere|somewhere|home|house|office|school|work|hospital|market)$",
    r"^(city|town|village|country)$",
)


_VAGUE_LOCATION_PHRASES_SUBSTR = (
    "my place", "my house", "my home", "my area", "my locality", "my street", "my road",
    "our place", "our house", "our home", "our area", "our locality",
    "his place", "her place", "their place", "your place",
    "at my", "at our", "at home", "at office", "at work", "at school", "at hospital",
    "near me", "near here", "nearby me", "around me", "around here", "there is", "there are",
    "water supply", "no water", "garbage", "pothole", "street light", "streetlight",
    "electric", "power cut", "power outage",
)


def _is_vague_location(value: Any) -> bool:
    if value is None:
        return True
    if not isinstance(value, str):
        return True
    s = value.strip()
    if s == "":
        return True
    low = s.lower().strip(" .,-!?")
    if low in ("null", "none", "n/a", "na", "unknown", "not mentioned", "not given", "tbd"):
        return True
    if "see raw text" in low or "provided location" in low or "citizen provided" in low:
        return True
    for phrase in _VAGUE_LOCATION_PHRASES_SUBSTR:
        if phrase in low:
            return True
    if len(low.split()) <= 1 and re.match(_VAGUE_LOCATION_PATTERNS[0], low):
        return True
    for pat in _VAGUE_LOCATION_PATTERNS[1:]:
        if re.match(pat, low):
            return True
    has_any_capital_letter = any(c.isupper() for c in s if c.isalpha())
    if not has_any_capital_letter and len(low.split()) >= 2:
        digit_count = sum(1 for c in s if c.isdigit())
        if digit_count < 3 and not re.search(r"(nagar|colony|layout|park|marg|road|street|avenue|lane|sector|phase|circle|chowk|bazaar|block|ward)\b", low):
            return True
    return False


def _validate_and_normalize_extraction(parsed: Dict[str, Any], raw_text: str) -> Dict[str, Any]:
    category = parsed.get("category", "Other")
    if category not in DEPARTMENTS:
        category = "Other"

    department = parsed.get("department")
    valid_depts = [v["department"] for v in DEPARTMENTS.values()]
    if not department or department not in valid_depts:
        department = DEPARTMENTS[category]["department"]

    urgency = parsed.get("urgency", "medium")
    if urgency not in ("low", "medium", "high"):
        urgency = "medium"

    location = parsed.get("location")
    if isinstance(location, str):
        location = location.strip()
        if location == "":
            location = None
    else:
        location = None
    if _is_vague_location(location):
        location = None

    missing_fields = parsed.get("missing_fields", [])
    if not isinstance(missing_fields, list):
        missing_fields = []
    missing_fields = [str(f).strip() for f in missing_fields if str(f).strip()]

    if category in LOCATION_REQUIRED_CATEGORIES and location is None and "location" not in missing_fields:
        missing_fields.append("location")

    seen = set()
    deduped = []
    for f in missing_fields:
        if f not in seen:
            seen.add(f)
            deduped.append(f)
    missing_fields = deduped

    clarification_question = parsed.get("clarification_question")
    if not isinstance(clarification_question, str):
        clarification_question = None

    if missing_fields and not clarification_question:
        if "location" in missing_fields:
            clarification_question = (
                "Could you please share the exact location (address, area name, or landmark) "
                "so we can route this complaint to the correct ward team?"
            )
        else:
            clarification_question = (
                "Could you please provide a bit more detail so we can assist you better?"
            )

    if not missing_fields:
        clarification_question = None

    secondary_issue = parsed.get("secondary_issue")
    if not isinstance(secondary_issue, str):
        secondary_issue = None

    result: Dict[str, Any] = {
        "category": category,
        "department": department,
        "urgency": urgency,
        "location": location,
        "missing_fields": missing_fields,
        "clarification_question": clarification_question,
        "secondary_issue": secondary_issue,
    }

    try:
        text_snippet = (raw_text or "").replace("\n", " ")[:120]
        logger.info(
            "Parsed JSON after extraction: %s | source_snippet=%r",
            json.dumps(result, ensure_ascii=False),
            text_snippet,
        )
    except Exception:
        pass

    return result


def _fallback_extract(raw_text: str, reason: str = "") -> Dict[str, Any]:
    lower_text = (raw_text or "").lower()

    extracted_location: Optional[str] = None

    if isinstance(raw_text, str) and raw_text.strip():
        reply_section = None
        if "Additional info from citizen reply:" in raw_text:
            parts = raw_text.split("Additional info from citizen reply:", 1)
            if len(parts) == 2:
                reply_section = parts[1].strip()
        search_source = reply_section if reply_section else raw_text
        search_lower = search_source.lower()

        specific_loc_anchors = [
            "near ", "opposite ", "behind ", "beside ", "next to ",
            "address", "located at", "in the area of", "around ",
            "plot no", "plot number", "house no", "house number",
            "flat no", "h.no", "hno", "h no",
            "pin code", "pincode", "postal code", "zip code",
        ]
        explicit_area_names = [
            "koregaon park", "jp nagar", "jayanagar", "indiranagar", "koramangala",
            "hsr layout", "btm layout", "whitefield", "electronic city",
            "marathahalli", "banashankari", "rajajinagar", "malleswaram",
            "basavanagudi", "vimanapura", "yeshwantpur", "hebbal",
            "j p nagar", "jayanagar", "btm", "hsr",
        ]
        number_patterns = re.search(
            r"(\b\d{5,6}\b|\bplot\s*#?\s*\d+|\bhouse\s*#?\s*\d+|\bflat\s*#?\s*\d+)",
            search_source,
            re.IGNORECASE,
        )
        has_anchor = any(a in search_lower for a in specific_loc_anchors)
        has_area_name = any(nm in search_lower for nm in explicit_area_names)
        has_number = bool(number_patterns)

        if has_anchor or has_area_name or has_number:
            m1 = re.search(
                r"(?:near|opposite|behind|beside|next to|address|located at|in the area of|around|pin code|pincode)[^\w]*([A-Za-z0-9][^.!?\n]{3,90})",
                search_source,
                re.IGNORECASE,
            )
            if m1:
                extracted_location = m1.group(1).strip(" ,.-:;")
            else:
                m2 = re.search(
                    r"((?:[A-Z][a-z]+ ){1,5}(?:Nagar|Colony|Layout|Park|Marg|Road|Street|Avenue|Lane|Sector|Phase|Circle|Chowk|Bazaar|Block|Ward))",
                    search_source,
                )
                if m2:
                    extracted_location = m2.group(0).strip()
                elif has_number and number_patterns:
                    extracted_location = number_patterns.group(0).strip()
                else:
                    extracted_location = None
            if extracted_location and _is_vague_location(extracted_location):
                extracted_location = None

    category_heuristic = "Other"
    urgency_heuristic = "medium"
    if len(lower_text) > 0:
        if any(w in lower_text for w in ["water", "tap", "supply", "pipe leak", "tank", "sewage", "drain", "overflow"]):
            if any(w in lower_text for w in ["drain", "sewer", "sewage", "overflow", "choke"]):
                category_heuristic = "Drainage & Sewage"
            else:
                category_heuristic = "Water Supply"
        elif any(w in lower_text for w in ["electric", "power cut", "power outage", "wire", "cable", "shock", "spark", "transformer", "pole"]):
            if any(w in lower_text for w in ["street light", "streetlight", "lamp post"]):
                category_heuristic = "Streetlights"
            else:
                category_heuristic = "Electricity"
        elif any(w in lower_text for w in ["streetlight", "street light", "lamp"]):
            category_heuristic = "Streetlights"
        elif any(w in lower_text for w in ["road", "pothol", "speed break", "damaged road", "cracked road", "footpath", "sidewalk"]):
            category_heuristic = "Roads & Potholes"
        elif any(w in lower_text for w in ["garbage", "waste", "trash", "dustbin", "litter", "sanitation", "sweeping", "stink", "smell from"]):
            category_heuristic = "Garbage & Sanitation"
        elif any(w in lower_text for w in ["safety", "crime", "theft", "accident", "fire", "fight", "harass", "threat", "dangerous", "unsafe"]):
            category_heuristic = "Public Safety"
        elif any(w in lower_text for w in ["noise", "loud music", "loud sound", "dj", "speaker", "horn", "public address", "construction noise"]):
            category_heuristic = "Noise Complaint"
        elif any(w in lower_text for w in ["illegal construction", "unauthorized construction", "encroachment"]):
            category_heuristic = "Illegal Construction"

        if any(w in lower_text for w in ["spark", "gas leak", "fire", "falling", "violence", "danger", "emergency", "electrocution", "live wire"]):
            urgency_heuristic = "high"
        elif any(w in lower_text for w in ["3 day", "three day", "a week", "since monday", "third time", "complained before", "no one responded", "elderly", "children", "sick person", "disabled"]):
            urgency_heuristic = "high"
        elif any(w in lower_text for w in ["urgent", "immediately", "asap", "please hurry"]):
            urgency_heuristic = "high"
        elif any(w in lower_text for w in ["minor", "whenever possible", "not urgent", "low priority", "next week"]):
            urgency_heuristic = "low"

    raw_parsed = {
        "category": category_heuristic,
        "department": DEPARTMENTS[category_heuristic]["department"],
        "urgency": urgency_heuristic,
        "location": extracted_location,
        "clarification_question": None,
        "secondary_issue": None,
        "_fallback_reason": reason,
    }
    return _validate_and_normalize_extraction(raw_parsed, raw_text or "")



def _normalize_extract_result(parsed: Dict[str, Any], raw_text: str) -> Dict[str, Any]:
    return _validate_and_normalize_extraction(parsed, raw_text)


def _call_gemini_json(system_prompt: str, user_text: str, max_retries: int = 1) -> Dict[str, Any]:
    if not _genai_available or _model is None:
        return _fallback_extract(user_text, reason="google-genai not available or API key not set")

    attempt = 0
    last_error = ""
    full_prompt = f"{system_prompt}\n\nComplaint text:\n{user_text}"

    while attempt <= max_retries:
        attempt += 1
        try:
            legacy = _is_legacy_sdk()
            if legacy:
                if hasattr(_genai, "types"):
                    cfg = _genai.types.GenerationConfig(
                        temperature=0.1,
                        response_mime_type="application/json",
                        max_output_tokens=1024,
                    )
                else:
                    cfg = {
                        "temperature": 0.1,
                        "response_mime_type": "application/json",
                        "max_output_tokens": 1024,
                    }
                response = _model.generate_content(full_prompt, generation_config=cfg)
            else:
                cfg = _genai.types.GenerateContentConfig(
                    temperature=0.1,
                    response_mime_type="application/json",
                    max_output_tokens=1024,
                )
                response = _model.generate_content(full_prompt, config=cfg)
            raw_answer = ""
            if hasattr(response, "text"):
                raw_answer = response.text or ""
            elif hasattr(response, "parts"):
                for part in response.parts or []:
                    if hasattr(part, "text"):
                        raw_answer += part.text or ""
            cleaned = _strip_fences(raw_answer)
            parsed = _find_json_object(cleaned)
            if parsed is None:
                try:
                    parsed = json.loads(cleaned)
                except json.JSONDecodeError:
                    last_error = f"could not parse JSON response (attempt {attempt})"
                    continue
            return _normalize_extract_result(parsed, user_text)
        except Exception as e:
            last_error = f"{type(e).__name__}: {e}"
            continue

    return _fallback_extract(user_text, reason=last_error or "unknown gemini error")


def _utcnow_iso() -> str:
    return datetime.now(timezone.utc).replace(tzinfo=None).isoformat()


def _derive_sla_fields(category: str, urgency: str, created_at_iso: str) -> Dict[str, Any]:
    dept_info = DEPARTMENTS.get(category, DEPARTMENTS["Other"])
    sla_hours = dept_info["default_sla_hours"].get(urgency, dept_info["default_sla_hours"]["medium"])
    try:
        created = datetime.fromisoformat(created_at_iso)
    except ValueError:
        created = datetime.now(timezone.utc).replace(tzinfo=None)
    deadline = created + timedelta(hours=sla_hours)
    return {
        "sla_hours": sla_hours,
        "sla_deadline": deadline.isoformat(),
    }


def extract_ticket(text: str) -> Dict[str, Any]:
    raw_text = (text or "").strip()
    if not raw_text:
        parsed = _fallback_extract("", reason="empty input text")
    else:
        parsed = _call_gemini_json(SYSTEM_PROMPT_EXTRACT, raw_text)

    created_at = _utcnow_iso()
    sla = _derive_sla_fields(parsed["category"], parsed["urgency"], created_at)

    is_complete = len(parsed.get("missing_fields", [])) == 0

    ticket = {
        "ticket_id": None,
        "raw_text": raw_text,
        "category": parsed["category"],
        "department": parsed["department"],
        "urgency": parsed["urgency"],
        "sla_hours": sla["sla_hours"],
        "sla_deadline": sla["sla_deadline"],
        "status": "open",
        "breached": False,
        "location": parsed["location"],
        "missing_fields": parsed["missing_fields"],
        "clarification_question": parsed["clarification_question"],
        "citizen_response_message": None,
        "created_at": created_at,
        "escalation_action": None,
    }

    if is_complete:
        ticket["citizen_response_message"] = generate_citizen_response(ticket)

    return ticket


def clarify_ticket(original_text: str, reply: str) -> Dict[str, Any]:
    combined_text = (
        f"Original complaint: {original_text.strip()}\n"
        f"Additional info from citizen reply: {(reply or '').strip()}"
    )
    logger.info(f"Combined text for clarify: {combined_text}")

    raw_text = combined_text.strip()
    if not raw_text:
        parsed = _fallback_extract("", reason="empty input text")
    else:
        parsed = _call_gemini_json(SYSTEM_PROMPT_CLARIFY, raw_text)

    created_at = _utcnow_iso()
    sla = _derive_sla_fields(parsed["category"], parsed["urgency"], created_at)

    is_complete = len(parsed.get("missing_fields", [])) == 0

    ticket = {
        "ticket_id": None,
        "raw_text": raw_text,
        "category": parsed["category"],
        "department": parsed["department"],
        "urgency": parsed["urgency"],
        "sla_hours": sla["sla_hours"],
        "sla_deadline": sla["sla_deadline"],
        "status": "open",
        "breached": False,
        "location": parsed["location"],
        "missing_fields": parsed["missing_fields"],
        "clarification_question": parsed["clarification_question"],
        "citizen_response_message": None,
        "created_at": created_at,
        "escalation_action": None,
    }

    if is_complete:
        ticket["citizen_response_message"] = generate_citizen_response(ticket)

    return ticket


SYSTEM_PROMPT_RESPONSE = """You are a polite, concise civic customer-service bot for a municipal government.
Given a ticket JSON, write a short (1-3 sentence) friendly confirmation message in plain language.
Include:
- The ticket ID (if present, otherwise omit it gracefully)
- Which department the complaint has been routed to
- The expected response timeframe in plain language (e.g. "within 4 hours", "within 1 business day")
- Reassurance that the team is on it.

Do NOT use markdown. Do NOT output JSON. Just the plain text message.
"""


def generate_citizen_response(ticket: Dict[str, Any]) -> str:
    sla_hours = ticket.get("sla_hours", 24)
    dept = ticket.get("department", "the concerned department")
    ticket_id = ticket.get("ticket_id")

    if sla_hours <= 4:
        timeframe = "within a few hours"
    elif sla_hours <= 12:
        timeframe = "within the same day"
    elif sla_hours <= 24:
        timeframe = "within 24 hours"
    elif sla_hours <= 72:
        timeframe = "within 2-3 business days"
    else:
        timeframe = "as soon as capacity allows"

    id_line = f" (Reference: {ticket_id})" if ticket_id else ""
    base = (
        f"Thank you for reaching out{id_line}. Your complaint has been registered with the {dept}. "
        f"A team member will follow up with you {timeframe}. "
        f"We appreciate your patience as we work to resolve this."
    )

    if not _genai_available or _model is None:
        return base

    try:
        ticket_json = json.dumps(ticket, indent=2, default=str)
        full_prompt = f"{SYSTEM_PROMPT_RESPONSE}\n\nTicket JSON:\n{ticket_json}"
        legacy = _is_legacy_sdk()
        if legacy:
            cfg = {
                "temperature": 0.3,
                "max_output_tokens": 300,
            }
            if hasattr(_genai, "types"):
                cfg = _genai.types.GenerationConfig(
                    temperature=0.3,
                    max_output_tokens=300,
                )
            response = _model.generate_content(full_prompt, generation_config=cfg)
        else:
            cfg = _genai.types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=300,
            )
            response = _model.generate_content(full_prompt, config=cfg)
        message_text = ""
        if hasattr(response, "text"):
            message_text = (response.text or "").strip()
        elif hasattr(response, "parts"):
            for part in response.parts or []:
                if hasattr(part, "text"):
                    message_text += (part.text or "")
            message_text = message_text.strip()
        if message_text:
            return message_text
    except Exception:
        pass

    return base
