from flask import Flask, send_from_directory

# Flask servirá archivos directamente desde la carpeta actual
app = Flask(__name__, static_folder='.', static_url_path='')

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)

