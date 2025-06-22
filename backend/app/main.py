from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if username == 'admin' and password == 'admin123':
        return jsonify({'status': 'success', 'message': 'Login successful'})
    return jsonify({'status': 'fail', 'message': 'Invalid credentials'}), 401
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

