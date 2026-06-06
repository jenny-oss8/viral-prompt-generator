/* ==========================================
   Viral POV Prompt Generator - Logic Engine
   ========================================== */

// --- 1. Data Banks & Templates ---

const dataBanks = {
    general: {
        imgStyles: ["4k realistic", "cinematic lighting", "high detail", "goPro max", "drone shot", "fisheye lens", "color grading", "bokeh"],
        verbs: ["saves", "finds", "discovers", "fixes", "builds", "captures", "rescues", "drifts"],
        atmospheres: ["epic", "intense", "dramatic", "suspenseful", "hypnotic", "surreal", "chaotic"],
        adjectives: ["dangerous", "luxurious", "extreme", "massive", "shocking", "unexpected"]
    },
    firefighter: {
        imgStyles: ["thermal imaging", "helmet cam", "action shot", "smoke filled", "dramatic lighting", "highiso 3200", "fire proximity"],
        verbs: ["enters", "rescues", "extracts", "suppresses", "ascends", "breaches"],
        atmospheres: ["dangerous", "chaotic", "heroic", "smoky", "intense", "critical"],
        adjectives: ["blazing", "inferno", "structural collapse", " flammable", "critical"]
    },
    construction: {
        imgStyles: ["aerial view", "timelapse", "dusty", "heavy machinery", "blueprint overlay", "drone footage", "worker perspective"],
        verbs: ["constructs", "demolishes", "pours", "lifts", "welds", "erects"],
        atmospheres: ["industrial", "busy", "dusty", "hardworking", "massive scale"],
        adjectives: ["tall", "heavy", "steel", "concrete", "massive"]
    },
    police: {
        imgStyles: ["bodycam footage", "dashcam", "high contrast", "tactical gear", "night vision", "grainy", "CSI style"],
        verbs: ["apprehends", "raids", "pursues", "detains", "negotiates", "clears"],
        atmospheres: ["tactical", " tense", "high stake", "serious", "dangerous"],
        adjectives: ["armed", "suspicious", "hostile", "critical", "precarious"]
    },
    survival: {
        imgStyles: ["cinematic documentary", "gritty", "natural light", "remote location", "extreme close up", "handheld camera"],
        verbs: ["survives", "escapes", "fends off", "navigates", "fights", "recovers"],
        atmospheres: ["desperate", "gripping", "adrenaline", "edge of seat", "raw"],
        adjectives: ["deadly", "wild", "hostile", "treacherous", "unforgiving"]
    },
    luxury: {
        imgStyles: ["drone shot", "golden hour", "architectural", "magazine cover", "macro details", "neon lights", "bokeh"],
        verbs: ["showcases", "parades", "cruises", "reveals", "unveils"],
        atmospheres: ["glamorous", "elegant", "opulent", "smooth", " dreamy"],
        adjectives: ["exclusive", "expensive", "sleek", "custom", "million dollar"]
    },
    lifeguard: {
        imgStyles: ["aerial drone", "underwater shot", "slow motion splas h", "beach day", "rescue buoy", "pov rescue"],
        verbs: ["dives in", "rescues", "pulls to safety", "alerts", "secures", "races"],
        atmospheres: ["urgent", "calm-after-storm", "heroic", "sunny day", "critical moment"],
        adjectives: ["rapid", "urgent", "calming", "critical", "splashing"]
    }
};

// Word banks for generic fillers
const banks = {
    sounds: ["screeching tires", "explosions", "heartbeat", "wind howling", "chainsaw", "sirens", "waves crashing"],
    cameraMoves: ["slow motion", "tracking shot", "spin cam", "crash zoom", "static wide", " shaky cam", "aerial dolly"],
    details: ["sparks flying", "steam rising", "dust clouds", "water splashing", "debris falling", "smoke pluming"]
};

// --- 2. State Management ---

let currentCategory = 'general';
let currentTopic = '';
let generatedData = {};

// --- 3. Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    loadSavedProjects();
    setupCategoryListeners();
    setupTabListeners();
    setupButtons();
});

// --- 4. Category & UI Handling ---

function setupCategoryListeners() {
    const list = document.getElementById('category-list');
    list.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            document.querySelectorAll('#category-list li').forEach(li => li.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.cat;
        }
    });
}

function setupTabListeners() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active');
        });
    });
}

function setupButtons() {
    // Generate Button
    document.getElementById('generateBtn').addEventListener('click', generateContent);
    
    // Copy All Buttons
    document.querySelectorAll('.copy-all').forEach(btn => {
        btn.addEventListener('click', () => {
            const source = btn.dataset.source;
            let text = "";
            if (source === 'img-pro') text = getTextFromList('img-prompts');
            if (source === 'vid-pro') text = getTextFromList('vid-prompts');
            
            copyToClipboard(text);
            showToast(`Copied ${source === 'img-pro' ? 'Images' : 'Videos'} to clipboard!`);
        });
    });

    // Save Project
    document.getElementById('saveProjectBtn').addEventListener('click', saveProject);

    // Download
    document.getElementById('downloadBtn').addEventListener('click', downloadTxt);

    // Clear Storage
    document.getElementById('clear-storage').addEventListener('click', () => {
        if(confirm("Clear all project history?")) {
            localStorage.removeItem('viralPovProjects');
            loadSavedProjects();
        }
    });
}

// --- 5. Core Generation Logic ---

function generateContent() {
    const topic = document.getElementById('topicInput').value;
    if (!topic) {
        alert("Please enter a topic!");
        return;
    }
    currentTopic = topic;

    // UI Loading State
    const dashboard = document.getElementById('dashboard');
    const loading = document.getElementById('loading');
    
    dashboard.classList.add('hidden');
    loading.classList.remove('hidden');

    // Simulate Processing Delay
    setTimeout(() => {
        const catData = dataBanks[currentCategory] || dataBanks.general;
        
        const result = {
            imgPrompts: generateImgPrompts(topic, catData),
            vidPrompts: generateVidPrompts(topic, catData),
            hooks: generateHooks(topic, catData),
            script: generateScript(topic, catData),
            scenes: generateScenes(topic, catData, result),
            title: generateTitle(topic, catData),
            description: generateDesc(topic, catData),
            tags: generateTags(topic, currentCategory),
            thumbPrompt: generateThumb(topic, catData)
        };
        
        generatedData = result;
        renderResults(result);
        
        loading.classList.add('hidden');
        dashboard.classList.remove('hidden');
    }, 1200);
}

function generateImgPrompts(topic, cat) {
    const prompts = [];
    const styles = cat.imgStyles;
    
    for (let i = 0; i < 10; i++) {
        const style1 = styles[Math.floor(Math.random() * styles.length)];
        const style2 = banks.details[Math.floor(Math.random() * banks.details.length)];
        const adj = cat.adjectives[Math.floor(Math.random() * cat.adjectives.length)];
        
        prompts.push(`${topic}, ${adj}, ${style1}, ${style2}, ultra realistic, 8k, highly detailed, photorealistic, cinematic.`);
    }
    return prompts;
}

function generateVidPrompts(topic, cat) {
    const prompts = [];
    const moves = banks.cameraMoves;
    
    for (let i = 0; i < 10; i++) {
        const move = moves[Math.floor(Math.random() * moves.length)];
        const verb = cat.verbs[Math.floor(Math.random() * cat.verbs.length)];
        
        prompts.push(`${topic} ${verb}, ${move}, cinema grade, 24fps, high bitrate, realistic physics, --s 250 --ar 9:16 --motion`);
    }
    return prompts;
}

function generateHooks(topic, cat) {
    const templates = [
        "I drove 500 miles to see this. What happens at hour 3 is unbelievable.",
        "Wait for it... (POV of " + topic + ")",
        "Nobody believed this could happen until they saw the recording.",
        "3 seconds in... I couldn't look away.",
        "This is why we never do this. (Extreme " + topic + " POV)",
        "POV: You just made the biggest mistake of your life...",
        "The moment everyone feared finally happened.",
        "Stop scrolling. You need to see this. #" + currentCategory,
        "Why did no one tell me it would be like this?",
        "Rescue Mission: Part 1"
    ];
    return templates.slice(0, 5); // Return 5 hooks
}

function generateScript(topic, cat) {
    return `INTRO: (Emotional/Wide Shot) The camera pans to ${topic}. Sound of ${banks.sounds[Math.floor(Math.random() * banks.sounds.length)]} in background.\n\nMAIN ACTION: ${cat.atmospheres[0]} moment. First person POV of ${cat.verbs[0]} the ${topic}. Extreme close up details showing intensity.\n\nCLIMAX: Sudden turn of events. Fast cuts, slow motion impact.\n\nOUTRO: The aftermath. Reflection.`;
}

function generateScenes(topic, cat, data) {
    let html = "<ul>";
    for(let i=1; i<=6; i++) {
        html += `<li><strong>Scene ${i}:</strong> ${topic} - ${cat.verbs[i%cat.verbs.length]} action. ${banks.cameraMoves[i%banks.cameraMoves.length]}.</li>`;
    }
    html += "</ul>";
    return html;
}

function generateTitle(topic, cat) {
    const starters = ["POV:", "I witnessed", "Ultimate", "Epic", "Gone wrong"];
    const start = starters[Math.floor(Math.random() * starters.length)];
    return `${start} ${topic} ${cat.adjectives[0]} POV`;
}

function generateDesc(topic, cat) {
    return `🔥 WATCH IN HD 🔥\n\nThis is a POV experience of ${topic}. \n\nDisclaimer: Some scenes are ${cat.atmospheres[0]} and may be intense.\n\n#${currentCategory} #Shorts #Viral #POV #Trending`;
}

function generateTags(topic, cat) {
    return `${topic},${currentCategory},pov,shorts,trending,rescue,fyp,gonewrong,viralvideo,${currentCategory}pov,realistic,drama,action,adventure,insane,wow`;
}

function generateThumb(topic, cat) {
    return `Extreme close up of ${topic}, big text "DON'T LOOK AWAY", dramatic lighting, yellow and black hazard colors, cinematic font, high contrast, YouTube thumbnail style.`;
}

// --- 6. Rendering & DOM Manipulation ---

function renderResults(data) {
    // Helper to create cards
    const createCard = (text) => `
        <div class="prompt-card">
            ${text}
            <button class="copy-btn" onclick="copyText(this)"><i class="fa-regular fa-copy"></i></button>
        </div>`;

    // 1. Images
    const imgContainer = document.getElementById('img-prompts');
    imgContainer.innerHTML = data.imgPrompts.map(t => createCard(t)).join('');

    // 2. Videos
    const vidContainer = document.getElementById('vid-prompts');
    vidContainer.innerHTML = data.vidPrompts.map(t => createCard(t)).join('');

    // 3. Hooks
    const hooksContainer = document.getElementById('hooks');
    hooksContainer.innerHTML = data.hooks.map(t => createCard(t)).join('');

    // 4. Script
    document.getElementById('full-script').innerHTML = `<pre>${data.script}</pre><div class="card-act"><button class="copy-btn" onclick="copyText(this)"><i class="fa-regular fa-copy"></i></button></div>`;

    // 5. Scenes
    document.getElementById('scene-break').innerHTML = data.scenes + `<
