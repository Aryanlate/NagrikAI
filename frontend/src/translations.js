export const LANGUAGES = [
  { code: 'en', label: 'EN', native: 'English' },
  { code: 'hi', label: 'हिंदी', native: 'Hindi' },
  { code: 'mr', label: 'मराठी', native: 'Marathi' },
];

export const TRANSLATIONS = {
  en: {
    // Navbar top strip
    'nav.strip.portal': 'Public Civic Redressal Portal · Urban Development Directorate',
    'nav.strip.tollfree': 'Toll-Free Control Room: 1913',
    'nav.strip.aiActive': 'AI Triage 24x7 Active',
    'nav.citizenPortal': 'Citizen Portal',
    'nav.staffDashboard': 'Staff Dashboard',

    // Citizen header
    'citizen.hero.badge': 'BBMP Autonomous AI Civic Redressal',
    'citizen.hero.brand': 'Report civic issues, get action.',
    'citizen.hero.subtitle':
      'Direct automated dispatch to municipal ward engineering units with real-time statutory SLA tracking.',

    // Error banner
    'citizen.error.title': 'Unable to Process Request',

    // IDLE form
    'citizen.form.step1Title': 'Describe your civic issue or grievance',
    'citizen.form.placeholder':
      "Describe your issue, e.g. 'No water supply in our area for three days'",
    'citizen.form.presetsTitle': 'Quick Category Presets',
    'citizen.form.attachPhoto': 'Attach Photo',
    'citizen.form.gpsActive': 'GPS Active',
    'citizen.form.submit': 'Submit Grievance',

    // Preset labels (shown in chip UI, kept English to match backend routing)
    'preset.waterShortage': 'Water Shortage',
    'preset.roadPothole': 'Road Pothole Hazard',
    'preset.streetlights': 'Streetlights Out',
    'preset.garbage': 'Garbage Dump',

    // LOADING
    'citizen.loading.title': 'AI Municipal Triage in Progress',
    'citizen.loading.stage1': 'Analyzing grievance syntax...',
    'citizen.loading.stage2': 'AI Municipal Engine parsing category & jurisdiction...',
    'citizen.loading.stage3': 'Synthesizing details & calculating statutory SLA...',
    'citizen.loading.guarantee': 'BBMP Statutory SLA Guarantee Engine',

    // CLARIFYING
    'citizen.clarify.title': 'AI Grievance Interlocutor',
    'citizen.clarify.subtitle': 'Clarification required for accurate ward dispatch',
    'citizen.clarify.badge': 'Live Dialectic',
    'citizen.clarify.userBubble': 'Your Initial Complaint',
    'citizen.clarify.assistant': 'NagrikAi Assistant',
    'citizen.clarify.justNow': 'just now',
    'citizen.clarify.fallbackQuestion':
      'Which locality or street is affected, and approximately how many households are impacted?',
    'citizen.clarify.helperTitle': 'Estimated Locations (Click to populate)',
    'citizen.clarify.replyPlaceholder':
      "Type your reply (e.g., '12th Main Road, near post office, 40 houses')...",
    'citizen.clarify.sendReply': 'Send Reply',

    // SUCCESS ribbon
    'citizen.success.ribbonBadge': 'Statutory Docket Generated',
    'citizen.success.ribbonTitle': 'Grievance Docket Registered Successfully',
    'citizen.success.ribbonSubtitle':
      'Your incident has been verified by BBMP AI and routed to the jurisdictional field engineer.',

    'citizen.success.ticketIdLabel': 'Official Ticket ID',
    'citizen.success.copyId': 'Copy ID',
    'citizen.success.copied': 'Copied!',
    'citizen.success.copyTitle': 'Copy Ticket ID',

    'citizen.success.meta.category': 'Category',
    'citizen.success.meta.department': 'Department Routed',
    'citizen.success.meta.timeframe': 'Resolution Timeframe',
    'citizen.success.meta.slaGuarantee': 'Tier 1 Municipal SLA Guarantee',
    'citizen.success.meta.unit': 'Assigned Unit',
    'citizen.success.meta.dispatched': 'Dispatched',

    'citizen.success.track.title': 'Redressal Progression',
    'citizen.success.track.stage2': 'Stage 2 of 4: Dispatched',
    'citizen.success.track.submitted': 'Submitted',
    'citizen.success.track.aiVerified': 'AI Verified',
    'citizen.success.track.dispatched': 'Dispatched',
    'citizen.success.track.resolved': 'Resolved',

    'citizen.success.thanks': 'Thank you for being an active citizen.',
    'citizen.success.defaultMsg':
      'Your local ward engineering squad has received this automated dispatch. You will receive real-time SMS status updates as the crew reaches the spot.',

    'citizen.success.submitAnother': 'Submit Another Issue',

    // Footer
    'footer.brand':
      'NagrikAi Public Grievance Redressal',
    'footer.description':
      'Official AI-assisted civic response platform for Bengaluru Mahanagara Palike (BBMP), Bangalore Water Supply and Sewerage Board (BWSSB), and BESCOM. Powered by autonomous triage and statutory SLA compliance guarantees.',
    'footer.triageNode': 'Statutory 24x7 Triage Node: Active (Ward SLA Monitoring v2.4)',
    'footer.publicServices': 'Public Services',
    'footer.reportGrievance': 'Report Civic Grievance',
    'footer.staffCenter': 'Staff SLA Command Center',
    'footer.citizenCharter': "Citizen's Charter SLA",
    'footer.emergencyHelplines': 'Emergency Helplines',
    'footer.bbmp': 'BBMP Control Room: ',
    'footer.bwssb': 'BWSSB Water Desk: ',
    'footer.bescom': 'BESCOM Power Line: ',
    'footer.copyright':
      '© 2025 Government of Karnataka. Department of Urban Development. All statutory rights reserved.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Redressal',
    'footer.sakala': 'Sakala Mission',
  },

  hi: {
    'nav.strip.portal': 'नागरिक निवारण पोर्टल · नगर विकास निदेशालय',
    'nav.strip.tollfree': 'टोल-फ्री कंट्रोल रूम: 1913',
    'nav.strip.aiActive': 'AI ट्राइएज 24x7 सक्रिय',
    'nav.citizenPortal': 'नागरिक पोर्टल',
    'nav.staffDashboard': 'कर्मचारी डैशबोर्ड',

    'citizen.hero.badge': 'BBMP स्वायत्त AI नागरिक निवारण',
    'citizen.hero.brand': 'नागरिक समस्याएँ दर्ज करें, कार्रवाई पाएँ।',
    'citizen.hero.subtitle':
      'वास्तविक समय की वैधानिक SLA ट्रैकिंग के साथ नगरपालिका वार्ड इंजीनियरिंग इकाइयों को सीधा स्वचालित प्रेषण।',

    'citizen.error.title': 'अनुरोध संसाधित नहीं किया जा सका',

    'citizen.form.step1Title': 'अपनी नागरिक समस्या या शिकायत का वर्णन करें',
    'citizen.form.placeholder':
      'अपनी समस्या का वर्णन करें, उदा. \"हमारे क्षेत्र में तीन दिनों से पानी की आपूर्ति नहीं हो रही\"',
    'citizen.form.presetsTitle': 'शीघ्र श्रेणी प्रीसेट',
    'citizen.form.attachPhoto': 'फोटो संलग्न करें',
    'citizen.form.gpsActive': 'GPS सक्रिय',
    'citizen.form.submit': 'शिकायत दर्ज करें',

    'preset.waterShortage': 'Water Shortage',
    'preset.roadPothole': 'Road Pothole Hazard',
    'preset.streetlights': 'Streetlights Out',
    'preset.garbage': 'Garbage Dump',

    'citizen.loading.title': 'AI नगरपालिका ट्राइएज चल रहा है',
    'citizen.loading.stage1': 'शिकायत का वाक्य-विन्यास विश्लेषण हो रहा है...',
    'citizen.loading.stage2': 'AI नगरपालिका इंजन श्रेणी और अधिकार-क्षेत्र पार्स कर रहा है...',
    'citizen.loading.stage3': 'विवरण संश्लेषित तथा वैधानिक SLA की गणना हो रही है...',
    'citizen.loading.guarantee': 'BBMP वैधानिक SLA गारंटी इंजन',

    'citizen.clarify.title': 'AI शिकायत वार्ताकार',
    'citizen.clarify.subtitle': 'सटीक वार्ड प्रेषण हेतु स्पष्टीकरण आवश्यक',
    'citizen.clarify.badge': 'लाइव संवाद',
    'citizen.clarify.userBubble': 'आपकी प्रारंभिक शिकायत',
    'citizen.clarify.assistant': 'NagrikAi सहायक',
    'citizen.clarify.justNow': 'अभी',
    'citizen.clarify.fallbackQuestion':
      'कौन-सा इलाका या गली प्रभावित है, और लगभग कितने घर प्रभावित हैं?',
    'citizen.clarify.helperTitle': 'अनुमानित स्थान (भरने के लिए क्लिक करें)',
    'citizen.clarify.replyPlaceholder':
      'अपना उत्तर टाइप करें (जैसे, \"12वीं मेन रोड, पोस्ट ऑफिस के पास, 40 घर\")...',
    'citizen.clarify.sendReply': 'उत्तर भेजें',

    'citizen.success.ribbonBadge': 'वैधानिक डॉकेट उत्पन्न',
    'citizen.success.ribbonTitle': 'शिकायत डॉकेट सफलतापूर्वक पंजीकृत',
    'citizen.success.ribbonSubtitle':
      'आपकी घटना BBMP AI द्वारा सत्यापित की गई है और अधिकार-क्षेत्र के फील्ड इंजीनियर को प्रेषित की गई है।',

    'citizen.success.ticketIdLabel': 'आधिकारिक टिकट ID',
    'citizen.success.copyId': 'ID कॉपी करें',
    'citizen.success.copied': 'कॉपी किया गया!',
    'citizen.success.copyTitle': 'टिकट ID कॉपी करें',

    'citizen.success.meta.category': 'श्रेणी',
    'citizen.success.meta.department': 'भेजा गया विभाग',
    'citizen.success.meta.timeframe': 'समाधान की समय-सीमा',
    'citizen.success.meta.slaGuarantee': 'स्तर 1 नगरपालिका SLA गारंटी',
    'citizen.success.meta.unit': 'नियुक्त इकाई',
    'citizen.success.meta.dispatched': 'प्रेषित',

    'citizen.success.track.title': 'निवारण प्रगति',
    'citizen.success.track.stage2': 'चरण 2 में से 4: प्रेषित',
    'citizen.success.track.submitted': 'प्रस्तुत',
    'citizen.success.track.aiVerified': 'AI सत्यापित',
    'citizen.success.track.dispatched': 'प्रेषित',
    'citizen.success.track.resolved': 'समाधान',

    'citizen.success.thanks': 'सक्रिय नागरिक होने के लिए धन्यवाद।',
    'citizen.success.defaultMsg':
      'आपके स्थानीय वार्ड इंजीनियरिंग दल को यह स्वचालित प्रेषण प्राप्त हुआ है। दल के स्थान पर पहुँचने पर आपको SMS द्वारा वास्तविक समय की स्थिति अपडेट प्राप्त होती रहेंगी।',

    'citizen.success.submitAnother': 'एक और समस्या दर्ज करें',

    'footer.brand': 'NagrikAi लोक शिकायत निवारण',
    'footer.description':
      'बेंगलुरु महानगर पालिका (BBMP), बेंगलुरु जलापूर्ति एवं निकासी मंडल (BWSSB) और BESCOM के लिए आधिकारिक AI सहायता प्राप्त नागरिक प्रतिक्रिया मंच। स्वायत्त ट्राइएज और वैधानिक SLA अनुपालन गारंटी द्वारा संचालित।',
    'footer.triageNode': 'वैधानिक 24x7 ट्राइएज नोड: सक्रिय (वार्ड SLA मॉनिटरिंग v2.4)',
    'footer.publicServices': 'लोक सेवाएँ',
    'footer.reportGrievance': 'नागरिक शिकायत दर्ज करें',
    'footer.staffCenter': 'कर्मचारी SLA कमांड केंद्र',
    'footer.citizenCharter': 'नागरिक चार्टर SLA',
    'footer.emergencyHelplines': 'आपातकालीन हेल्पलाइन',
    'footer.bbmp': 'BBMP कंट्रोल रूम: ',
    'footer.bwssb': 'BWSSB जल डेस्क: ',
    'footer.bescom': 'BESCOM बिजली लाइन: ',
    'footer.copyright':
      '© 2025 कर्नाटक सरकार। नगर विकास विभाग। सर्व वैधानिक अधिकार सुरक्षित।',
    'footer.privacy': 'गोपनीयता नीति',
    'footer.terms': 'निवारण की शर्तें',
    'footer.sakala': 'सकल मिशन',
  },

  mr: {
    'nav.strip.portal': 'नागरिक त्रुटीपूर्ती पोर्टल · शहरी विकास संचालनालय',
    'nav.strip.tollfree': 'टोल-फ्री नियंत्रण कक्ष: 1913',
    'nav.strip.aiActive': 'AI ट्रायेज २४x७ सक्रिय',
    'nav.citizenPortal': 'नागरिक पोर्टल',
    'nav.staffDashboard': 'कर्मचारी डॅशबोर्ड',

    'citizen.hero.badge': 'BBMP स्वायत्त AI नागरिक निवारण',
    'citizen.hero.brand': 'नागरिक समस्या नोंदवा, कारवाई मिळवा.',
    'citizen.hero.subtitle':
      'वास्तविक वेळेतील वैधानिक SLA ट्रॅकिंगसह नगरपालिका वॉर्ड अभियांत्रिकी युनिट्सना थेट स्वयंचलित प्रेषण.',

    'citizen.error.title': 'विनंतीवर प्रक्रिया करता आली नाही',

    'citizen.form.step1Title': 'आपल्या नागरिक समस्येचे किंवा तक्रारीचे वर्णन करा',
    'citizen.form.placeholder':
      'आपल्या समस्येचे वर्णन करा, उदा. \"आमच्या परिसरात तीन दिवसांपासून पाणी पुरवठा बंद आहे\"',
    'citizen.form.presetsTitle': 'जलद श्रेणी प्रीसेट्स',
    'citizen.form.attachPhoto': 'छायाचित्र जोडा',
    'citizen.form.gpsActive': 'GPS सक्रिय',
    'citizen.form.submit': 'तक्रार सादर करा',

    'preset.waterShortage': 'Water Shortage',
    'preset.roadPothole': 'Road Pothole Hazard',
    'preset.streetlights': 'Streetlights Out',
    'preset.garbage': 'Garbage Dump',

    'citizen.loading.title': 'AI नगरपालिका ट्रायेज सुरू आहे',
    'citizen.loading.stage1': 'तक्रारीचे वाक्यरचना विश्लेषण होत आहे...',
    'citizen.loading.stage2': 'AI नगरपालिका इंजिन श्रेणी आणि अधिकार-क्षेत्र पार्स करत आहे...',
    'citizen.loading.stage3': 'तपशील संश्लेषित आणि वैधानिक SLA ची गणना होत आहे...',
    'citizen.loading.guarantee': 'BBMP वैधानिक SLA हमी इंजिन',

    'citizen.clarify.title': 'AI तक्रार संवादस्थ',
    'citizen.clarify.subtitle': 'अचूक वॉर्ड प्रेषणासाठी स्पष्टीकरण आवश्यक',
    'citizen.clarify.badge': 'लाइव्ह संवाद',
    'citizen.clarify.userBubble': 'तुमची प्रारंभिक तक्रार',
    'citizen.clarify.assistant': 'NagrikAi सहाय्यक',
    'citizen.clarify.justNow': 'आत्ताच',
    'citizen.clarify.fallbackQuestion':
      'कोणता परिसर किंवा रस्ता प्रभावित आहे, आणि अंदाजे किती घरे प्रभावित आहेत?',
    'citizen.clarify.helperTitle': 'अंदाजित स्थाने (भरण्यासाठी क्लिक करा)',
    'citizen.clarify.replyPlaceholder':
      'तुमचे उत्तर टाइप करा (जसे, \"१२वी मेन रोड, पोस्ट ऑफिसजवळ, ४० घरे\")...',
    'citizen.clarify.sendReply': 'उत्तर पाठवा',

    'citizen.success.ribbonBadge': 'वैधानिक डॉकेट तयार',
    'citizen.success.ribbonTitle': 'तक्रार डॉकेट यशस्वीरित्या नोंदवला गेला',
    'citizen.success.ribbonSubtitle':
      'तुमची घटना BBMP AI द्वारे पडताळण्यात आली आहे आणि अधिकार-क्षेत्राच्या फील्ड अभियंत्याला पाठवण्यात आली आहे.',

    'citizen.success.ticketIdLabel': 'अधिकृत टिकट ID',
    'citizen.success.copyId': 'ID कॉपी करा',
    'citizen.success.copied': 'कॉपी झाले!',
    'citizen.success.copyTitle': 'टिकट ID कॉपी करा',

    'citizen.success.meta.category': 'श्रेणी',
    'citizen.success.meta.department': 'पाठवलेले विभाग',
    'citizen.success.meta.timeframe': 'निराकरणाची वेळ-सीमा',
    'citizen.success.meta.slaGuarantee': 'स्तर १ नगरपालिका SLA हमी',
    'citizen.success.meta.unit': 'नियुक्त युनिट',
    'citizen.success.meta.dispatched': 'पाठवले',

    'citizen.success.track.title': 'त्रुटीपूर्ती प्रगती',
    'citizen.success.track.stage2': 'चरण २/४: पाठवले',
    'citizen.success.track.submitted': 'सादर केले',
    'citizen.success.track.aiVerified': 'AI पडताळणी पूर्ण',
    'citizen.success.track.dispatched': 'पाठवले',
    'citizen.success.track.resolved': 'निराकरण',

    'citizen.success.thanks': 'सक्रिय नागरिक असण्याबद्दल धन्यवाद.',
    'citizen.success.defaultMsg':
      'आपल्या स्थानिक वॉर्ड अभियांत्रिकी पथकाला हे स्वयंचलित प्रेषण मिळाले आहे. क्रू स्थानावर पोहोचताच तुम्हाला SMS द्वारे वास्तविक वेळेतील स्थिती अपडेट्स मिळत राहतील.',

    'citizen.success.submitAnother': 'दुसरी समस्या नोंदवा',

    'footer.brand': 'NagrikAi लोक तक्रार निवारण',
    'footer.description':
      'बेंगळुरू महानगर पालिका (BBMP), बेंगळुरू जलपुरवठा आणि गटार मंडळ (BWSSB) आणि BESCOM साठी अधिकृत AI-सहाय्य युक्त नागरिक प्रतिसाद व्यासपीठ. स्वायत्त ट्रायेज आणि वैधानिक SLA अनुपालन हमीद्वारे चालवले जाते.',
    'footer.triageNode': 'वैधानिक २४x७ ट्रायेज नोड: सक्रिय (वॉर्ड SLA मॉनिटरिंग v2.4)',
    'footer.publicServices': 'सार्वजनिक सेवा',
    'footer.reportGrievance': 'नागरिक तक्रार नोंदवा',
    'footer.staffCenter': 'कर्मचारी SLA कमांड केंद्र',
    'footer.citizenCharter': 'नागरिक चार्टर SLA',
    'footer.emergencyHelplines': 'आपत्कालीन हेल्पलाइन',
    'footer.bbmp': 'BBMP नियंत्रण कक्ष: ',
    'footer.bwssb': 'BWSSB पाणी डेस्क: ',
    'footer.bescom': 'BESCOM वीज लाइन: ',
    'footer.copyright':
      '© २०२५ कर्नाटक सरकार. शहरी विकास विभाग. सर्व वैधानिक अधिकार राखीव.',
    'footer.privacy': 'गोपनीयता धोरण',
    'footer.terms': 'निवारणाच्या अटी',
    'footer.sakala': 'सकल मिशन',
  },
};

export function translate(lang, key) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  if (dict[key] !== undefined) return dict[key];
  const fallback = TRANSLATIONS.en[key];
  return fallback !== undefined ? fallback : key;
}
