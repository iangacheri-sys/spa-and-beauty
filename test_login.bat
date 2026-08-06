@echo off
curl -s -X POST https://workspaceapi-server-production-4bfe.up.railway.app/api/auth/login -H "Content-Type: application/json" -d "{\"phone\":\"0712121212\",\"password\":\"password\"}"
