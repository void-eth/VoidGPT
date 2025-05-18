from flask import Flask, render_template, request, jsonify
from voidgpt import ChatGPT
app = Flask(__name__)

# INTEGRATION POINT: Replace this function with your existing AI function
def generate_ai_response(prompt, model):
	# Call the AI function with the prompt
    client = ChatGPT()
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    
    # Access the response data
    return response["choices"][0]["message"]["content"]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    prompt = data.get('prompt', '')
    model = data.get('model', 'auto')
    
    # Call the AI function with the prompt
    response = generate_ai_response(prompt, model)
    
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True)