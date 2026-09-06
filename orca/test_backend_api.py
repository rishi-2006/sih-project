import urllib.request
import json

endpoints = [
    "http://127.0.0.1:8000/",
    "http://127.0.0.1:8000/api/weather",
    "http://127.0.0.1:8000/api/ocean",
    "http://127.0.0.1:8000/api/alerts",
    "http://127.0.0.1:8000/api/geospatial",
    "http://127.0.0.1:8000/api/risk",
    "http://127.0.0.1:8000/api/route",
    "http://127.0.0.1:8000/api/agent-trace"
]

print("=== TESTING FASTAPI ENDPOINTS ===")
for ep in endpoints:
    try:
        req = urllib.request.urlopen(ep)
        res = json.loads(req.read().decode())
        print(f"[OK] {ep} => {list(res.keys())[:4]}")
    except Exception as e:
        print(f"[ERR] {ep} => {e}")

# Test POST /api/chat
try:
    data = json.dumps({"message": "Is it safe to go fishing tomorrow morning?"}).encode()
    req = urllib.request.Request("http://127.0.0.1:8000/api/chat", data=data, headers={"Content-Type": "application/json"})
    res = json.loads(urllib.request.urlopen(req).read().decode())
    print(f"[OK] POST /api/chat => Response length: {len(res['message']['content'])}")
except Exception as e:
    print(f"[ERR] POST /api/chat => {e}")
