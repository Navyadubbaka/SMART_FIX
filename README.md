# SMART_FIX
SmartFix transforms traditional maintenance systems into intelligent, automated service platforms using AI. By simply uploading an image, users can instantly detect issues and get connected with the right technician—eliminating delays, reducing manual effort, and delivering faster, smarter service experiences.

Required Verisons:
Required versions
OS: Windows 10/11 (or macOS/Linux with equivalent commands)
Git: 2.40+
Node.js: v20 LTS (recommended)
npm: comes with Node 20
Python: 3.11.x (recommended)
MongoDB Server: 8.2.x (Community Edition)
mongosh: latest (optional but useful)
Python packages (AI service)

Use these install versions (compatible with your current setup issue):
flask==3.1.0
tensorflow==2.21.0
numpy (latest)
pillow==11.1.0

Commands to run the Application
Project run commands after install
Backend(Terminal 1)
cd /d "...\SMART FIX\smartfix\backend"
copy .env.example .env
npm install
npm run dev

AI service(Terminal 2)
cd /d "...\SMART FIX\smartfix\ai-service"
python -m venv .venv
.\.venv\Scripts\activate
pip install --upgrade pip
pip install flask==3.1.0 tensorflow==2.21.0 pillow==11.1.0 numpy
python app.py

Frontend(Terminal 3)
cd /d "...\SMART FIX\smartfix\frontend"
python -m http.server 5500

RUN THROUGH
http://localhost:5500/index.html


