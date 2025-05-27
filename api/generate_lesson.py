from http.server import BaseHTTPRequestHandler
import json
import os
from openai import OpenAI
from typing import Dict, Any

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def generate_lesson_plan(content: Dict[str, Any]) -> str:
    """
    Generate a lesson plan based on the scraped content using OpenAI.
    """
    # Extract relevant information from the content
    title = content.get('metadata', {}).get('title', '')
    main_content = content.get('mainContent', '')
    
    # Create the prompt for OpenAI
    prompt = f"""Create a comprehensive lesson plan based on the following content:

Title: {title}

Content: {main_content}

Please structure the lesson plan with the following sections:
1. Learning Objectives
2. Key Concepts
3. Lesson Outline
4. Activities
5. Assessment Questions
6. Additional Resources

Make the lesson plan engaging and educational, suitable for classroom use."""

    try:
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",  # Using the latest GPT-4 model
            messages=[
                {"role": "system", "content": "You are an experienced educator creating detailed lesson plans."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating lesson plan: {str(e)}")
        raise

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Get the content length
        content_length = int(self.headers['Content-Length'])
        
        # Read the POST data
        post_data = self.rfile.read(content_length)
        
        try:
            # Parse the JSON data
            data = json.loads(post_data.decode('utf-8'))
            
            # Generate the lesson plan
            lesson_plan = generate_lesson_plan(data)
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')  # Enable CORS
            self.end_headers()
            
            response = {
                'status': 'success',
                'lesson_plan': lesson_plan
            }
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            # Handle errors
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {
                'status': 'error',
                'message': str(e)
            }
            
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        # Handle preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers() 