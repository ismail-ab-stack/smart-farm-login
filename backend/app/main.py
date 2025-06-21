from flask import Flask, request, jsonify
app = Flask(__name__)
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
