import os
import re
from flask import Flask, render_template, request, jsonify, Response, stream_with_context
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'nexora_ai_default_key_8482')

# Supported Groq Models
SUPPORTED_MODELS = [
    {
        "id": "qwen/qwen3.8-27b",
        "name": "Qwen 3.8 27B",
        "badge": "Ultra Fast",
        "description": "Lightning-fast responses (140ms) with exceptional reasoning and coding capabilities."
    },
    {
        "id": "openai/gpt-oss-120b",
        "name": "GPT-OSS 120B",
        "badge": "Flagship",
        "description": "State-of-the-art frontier reasoning for deep analysis, logic, and architecture."
    },
    {
        "id": "openai/gpt-oss-20b",
        "name": "GPT-OSS 20B",
        "badge": "Fast & Smart",
        "description": "Balanced high-performance model optimized for rapid problem solving."
    },
    {
        "id": "groq/compound",
        "name": "Groq Compound",
        "badge": "Compound AI",
        "description": "Specialized agentic system architecture executed on Groq LPUs."
    },
    {
        "id": "groq/compound-mini",
        "name": "Groq Compound Mini",
        "badge": "Instant",
        "description": "Compact compound model for immediate assistance and lightweight tasks."
    }
]

DEFAULT_MODEL = "qwen/qwen3.8-27b"

DEFAULT_SYSTEM_PROMPT = (
    "You are NEXORA AI, an intelligent, sophisticated, and helpful AI assistant. "
    "Your guiding philosophy is 'Think. Remember. Create. Act.' "
    "Provide clear, insightful, beautifully structured, and accurate responses. "
    "When providing code, use markdown code blocks with correct language identifiers. "
    "Be concise when appropriate and thoroughly articulate when detailed reasoning is needed."
)

def get_api_key():
    # Reload from .env if present so any edits are immediately picked up
    load_dotenv(override=True)
    return os.getenv("GROQ_API_KEY", "").strip()

def get_groq_client():
    api_key = get_api_key()
    if not api_key:
        return None
    try:
        from groq import Groq
        return Groq(api_key=api_key)
    except Exception as e:
        app.logger.error(f"Error initializing Groq client: {e}")
        return None

@app.route('/')
def index():
    """Serves the main application page."""
    return render_template('index.html')

@app.route('/api/status', methods=['GET'])
def get_status():
    """Returns the API connection status and configuration."""
    api_key = get_api_key()
    has_key = bool(api_key and len(api_key) > 8)
    
    # Mask key for privacy
    masked_key = ""
    if has_key:
        if len(api_key) > 12:
            masked_key = f"{api_key[:4]}...{api_key[-4:]}"
        else:
            masked_key = "***configured***"
            
    return jsonify({
        "status": "online",
        "configured": has_key,
        "masked_key": masked_key,
        "default_model": DEFAULT_MODEL
    })

@app.route('/api/models', methods=['GET'])
def get_models():
    """Returns supported Groq models."""
    return jsonify({
        "models": SUPPORTED_MODELS,
        "default": DEFAULT_MODEL
    })

@app.route('/api/settings/save-key', methods=['POST'])
def save_api_key():
    """Saves the Groq API key to .env and updates the current environment."""
    data = request.get_json() or {}
    new_key = data.get("api_key", "").strip()
    
    if not new_key:
        return jsonify({"success": False, "error": "API Key cannot be empty"}), 400
    
    # Validate with a quick test call to Groq
    try:
        from groq import Groq
        test_client = Groq(api_key=new_key)
        # Quick validation ping
        test_client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[{"role": "user", "content": "ping"}],
            max_tokens=1
        )
    except Exception as e:
        err_msg = str(e)
        if "invalid_api_key" in err_msg.lower() or "authentication" in err_msg.lower():
            return jsonify({"success": False, "error": "Invalid Groq API key. Please verify your key on groq.com"}), 401
        # If other error (e.g. rate limit), allow it but log
        app.logger.warning(f"Key test error: {e}")

    # Update in memory
    os.environ["GROQ_API_KEY"] = new_key
    
    # Update in .env file safely
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    try:
        content = ""
        if os.path.exists(env_path):
            with open(env_path, 'r', encoding='utf-8') as f:
                content = f.read()
        
        if re.search(r'^GROQ_API_KEY=.*', content, flags=re.MULTILINE):
            content = re.sub(r'^GROQ_API_KEY=.*', f'GROQ_API_KEY={new_key}', content, flags=re.MULTILINE)
        else:
            content += f"\nGROQ_API_KEY={new_key}\n"
            
        with open(env_path, 'w', encoding='utf-8') as f:
            f.write(content)
    except Exception as e:
        app.logger.error(f"Failed to write .env file: {e}")
        return jsonify({"success": True, "warning": "API key loaded into memory but could not update .env file"}), 200

    masked = f"{new_key[:4]}...{new_key[-4:]}" if len(new_key) > 8 else "***configured***"
    return jsonify({"success": True, "masked_key": masked})

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handles chat completions with Groq API (supports streaming SSE or direct JSON)."""
    data = request.get_json() or {}
    messages = data.get("messages", [])
    model = data.get("model", DEFAULT_MODEL)
    temperature = float(data.get("temperature", 0.7))
    custom_system_prompt = data.get("system_prompt", "").strip()
    stream = data.get("stream", True)
    
    # Check API key configuration
    client = get_groq_client()
    if not client:
        return jsonify({
            "error": "Groq API Key is not configured.",
            "code": "MISSING_API_KEY",
            "message": "Please add your GROQ_API_KEY inside the `.env` file or click Settings (⚙️) to enter your key."
        }), 400
        
    if not messages:
        return jsonify({"error": "No messages provided"}), 400

    # Build conversation payload
    system_content = custom_system_prompt if custom_system_prompt else DEFAULT_SYSTEM_PROMPT
    groq_messages = [{"role": "system", "content": system_content}]
    
    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role in ["user", "assistant", "system"] and content:
            groq_messages.append({"role": role, "content": content})

    # Validate model
    valid_model_ids = [m["id"] for m in SUPPORTED_MODELS]
    if model not in valid_model_ids:
        model = DEFAULT_MODEL

    # Streaming mode
    if stream:
        def generate():
            import json
            try:
                completion = client.chat.completions.create(
                    model=model,
                    messages=groq_messages,
                    temperature=max(0.0, min(temperature, 1.5)),
                    stream=True
                )
                for chunk in completion:
                    delta = chunk.choices[0].delta
                    if delta and delta.content:
                        payload = json.dumps({"content": delta.content})
                        yield f"data: {payload}\n\n"
                        
                yield "data: [DONE]\n\n"
            except Exception as e:
                app.logger.error(f"Streaming error: {e}")
                err_payload = json.dumps({"error": str(e)})
                yield f"data: {err_payload}\n\n"
                yield "data: [DONE]\n\n"

        return Response(stream_with_context(generate()), content_type='text/event-stream')

    # Non-streaming mode
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=groq_messages,
            temperature=max(0.0, min(temperature, 1.5)),
            stream=False
        )
        reply = completion.choices[0].message.content
        return jsonify({
            "success": True,
            "message": {
                "role": "assistant",
                "content": reply
            }
        })
    except Exception as e:
        app.logger.error(f"Chat completion error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/firebase-config', methods=['GET'])
def get_firebase_config():
    """Returns non-sensitive public Firebase Web SDK configuration."""
    api_key = os.getenv("FIREBASE_API_KEY", "").strip()
    auth_domain = os.getenv("FIREBASE_AUTH_DOMAIN", "").strip()
    project_id = os.getenv("FIREBASE_PROJECT_ID", "").strip()
    storage_bucket = os.getenv("FIREBASE_STORAGE_BUCKET", "").strip()
    messaging_sender_id = os.getenv("FIREBASE_MESSAGING_SENDER_ID", "").strip()
    app_id = os.getenv("FIREBASE_APP_ID", "").strip()

    is_configured = bool(api_key and project_id)
    return jsonify({
        "configured": is_configured,
        "config": {
            "apiKey": api_key,
            "authDomain": auth_domain,
            "projectId": project_id,
            "storageBucket": storage_bucket,
            "messagingSenderId": messaging_sender_id,
            "appId": app_id
        }
    })

@app.route('/api/ai/breakdown-goal', methods=['POST'])
def breakdown_goal():
    """Breaks down a high-level goal into structured milestones and tasks using Groq."""
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    deadline = data.get("deadline", "3 months")

    if not title:
        return jsonify({"error": "Goal title is required"}), 400

    client = get_groq_client()
    if not client:
        return jsonify({"error": "Groq API Key not configured"}), 400

    prompt = f"""You are the NEXORA AI Strategic Goal Planner.
Deconstruct this user goal into a high-impact execution plan.
Goal Title: {title}
Description: {description}
Target Deadline: {deadline}

Respond ONLY with valid JSON in this exact structure without markdown formatting or code blocks:
{{
  "summary": "Brief 1-sentence strategic focus",
  "milestones": [
    {{"title": "Milestone 1 title", "description": "Target outcome", "target_week": 1}},
    {{"title": "Milestone 2 title", "description": "Target outcome", "target_week": 3}},
    {{"title": "Milestone 3 title", "description": "Target outcome", "target_week": 6}}
  ],
  "tasks": [
    {{"title": "Actionable task 1", "priority": "High", "milestone_ref": "Milestone 1", "due_days": 3}},
    {{"title": "Actionable task 2", "priority": "High", "milestone_ref": "Milestone 1", "due_days": 7}},
    {{"title": "Actionable task 3", "priority": "Medium", "milestone_ref": "Milestone 2", "due_days": 14}},
    {{"title": "Actionable task 4", "priority": "Medium", "milestone_ref": "Milestone 3", "due_days": 21}}
  ]
}}"""

    try:
        completion = client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": "You are a strategic JSON planner. You output pure raw JSON without any markdown formatting."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4
        )
        raw_text = completion.choices[0].message.content.strip()
        # Clean markdown fences if any
        if raw_text.startswith("```"):
            raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
            raw_text = re.sub(r"\s*```$", "", raw_text)
        
        import json
        plan_data = json.loads(raw_text)
        return jsonify({"success": True, "plan": plan_data})
    except Exception as e:
        app.logger.error(f"Goal breakdown error: {e}")
        return jsonify({"error": f"Failed to generate goal breakdown: {str(e)}"}), 500

@app.route('/api/ai/challenge-idea', methods=['POST'])
def challenge_idea():
    """Analyzes a project, startup, code, or business idea through rigorous contrarian critique."""
    data = request.get_json() or {}
    idea = data.get("idea", "").strip()
    category = data.get("category", "General Idea").strip()

    if not idea:
        return jsonify({"error": "Idea text is required"}), 400

    client = get_groq_client()
    if not client:
        return jsonify({"error": "Groq API Key not configured"}), 400

    prompt = f"""You are NEXORA AI's Contrarian Critic. Your goal is NOT to flatter or agree with the user.
Your objective is to stress-test their concept like a tier-1 venture partner, principal architect, and adversarial thinker.
Category: {category}
User Idea / Submission:
\"\"\"{idea}\"\"\"

Provide an articulate, structured markdown critique formatted with these specific sections:
### 1. Honest Reality Check
A direct, unsweetened executive assessment of the fundamental premise.

### 2. Critical Flaws & Blind Spots
Top 3 hidden assumptions, systemic failure points, or vulnerabilities the user likely overlooked.

### 3. Market & Execution Obstacles
Direct competitive risks, adoption friction, or technical bottlenecks.

### 4. How to Pivot / Bulletproof It
Concrete, high-leverage recommendations to transform this from a fragile idea into an exceptional, defensible execution.
"""

    try:
        completion = client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": "You are a brilliant, highly rigorous contrarian advisor who gives honest, analytical, constructive critique."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6
        )
        critique = completion.choices[0].message.content.strip()
        return jsonify({"success": True, "critique": critique})
    except Exception as e:
        app.logger.error(f"Challenge idea error: {e}")
        return jsonify({"error": f"Failed to critique idea: {str(e)}"}), 500

@app.route('/api/ai/doc-action', methods=['POST'])
def doc_action():
    """Executes actions on document content: Summarize, Explain, Quiz, or Generate Notes."""
    data = request.get_json() or {}
    action = data.get("action", "summarize").lower()
    text = data.get("text", "").strip()
    title = data.get("title", "Document")

    if not text:
        return jsonify({"error": "Document content is required"}), 400

    client = get_groq_client()
    if not client:
        return jsonify({"error": "Groq API Key not configured"}), 400

    prompts = {
        "summarize": f"Provide an executive, structured summary of '{title}' with core takeaways, bullet points, and key conclusions:\n\n{text[:6000]}",
        "explain": f"Explain the core mechanisms, concepts, and nuances of '{title}' in lucid, intuitive prose using analogies and clear breakdowns:\n\n{text[:6000]}",
        "quiz": f"Generate a 4-question interactive multiple-choice quiz based on '{title}'. For each question include 4 options (A, B, C, D) and specify the correct answer with an explanation:\n\n{text[:6000]}",
        "notes": f"Convert the following content from '{title}' into structured, high-yield study notes with headers, definitions, and action items:\n\n{text[:6000]}"
    }

    selected_prompt = prompts.get(action, prompts["summarize"])

    try:
        completion = client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": "You are NEXORA AI Knowledge Intelligence. Respond with clean, beautifully formatted markdown."},
                {"role": "user", "content": selected_prompt}
            ],
            temperature=0.5
        )
        result = completion.choices[0].message.content.strip()
        return jsonify({"success": True, "result": result, "action": action})
    except Exception as e:
        app.logger.error(f"Doc action error: {e}")
        return jsonify({"error": f"Failed to process document: {str(e)}"}), 500

@app.route('/api/ai/generate-learning-plan', methods=['POST'])
def generate_learning_plan():
    """Generates a structured learning syllabus and milestones for a given topic."""
    data = request.get_json() or {}
    topic = data.get("topic", "").strip()
    level = data.get("level", "Intermediate").strip()

    if not topic:
        return jsonify({"error": "Topic is required"}), 400

    client = get_groq_client()
    if not client:
        return jsonify({"error": "Groq API Key not configured"}), 400

    prompt = f"""Create a structured 4-phase learning syllabus for mastering: '{topic}' at the '{level}' level.
Respond ONLY with raw valid JSON in this exact structure without code fences:
{{
  "topic": "{topic}",
  "level": "{level}",
  "overview": "2-sentence roadmap description",
  "modules": [
    {{"phase": 1, "title": "Core Foundations", "duration": "Week 1", "key_concepts": ["Concept A", "Concept B", "Concept C"], "exercise": "Practical project or challenge"}},
    {{"phase": 2, "title": "Intermediate Deep Dive", "duration": "Week 2-3", "key_concepts": ["Concept D", "Concept E"], "exercise": "Hands-on implementation"}},
    {{"phase": 3, "title": "Advanced Mastery", "duration": "Week 4", "key_concepts": ["Concept F", "Concept G"], "exercise": "Production-grade optimization"}},
    {{"phase": 4, "title": "Synthesis & Real-world Project", "duration": "Week 5", "key_concepts": ["Integration", "Architecture"], "exercise": "Capstone project"}}
  ],
  "sample_quiz": [
    {{"question": "Core question testing key intuition?", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option A", "explanation": "Why this is correct"}}
  ]
}}"""

    try:
        completion = client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": "You are a master technical educator. Respond only with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5
        )
        raw_text = completion.choices[0].message.content.strip()
        if raw_text.startswith("```"):
            raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
            raw_text = re.sub(r"\s*```$", "", raw_text)
        
        import json
        plan = json.loads(raw_text)
        return jsonify({"success": True, "plan": plan})
    except Exception as e:
        app.logger.error(f"Learning plan error: {e}")
        return jsonify({"error": f"Failed to generate learning plan: {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("DEBUG", "True").lower() == "true"
    print(f"Starting NEXORA AI server at http://127.0.0.1:{port}")
    app.run(host='127.0.0.1', port=port, debug=debug)
