# Individual Curl Tests for Notion Relay Worker

Replace `YOUR_WORKER_URL` with your actual worker URL: `https://notion-relay.betoiii.workers.dev`

## 🟢 Tests that should work (200 status)

### Valid JSON payload
```bash
curl -X POST -H "Content-Type: application/json" -d '{"callerName":"Test User","foo":"bar"}' YOUR_WORKER_URL
```

### Empty JSON object
```bash
curl -X POST -H "Content-Type: application/json" -d '{}' YOUR_WORKER_URL
```

### JSON with null values
```bash
curl -X POST -H "Content-Type: application/json" -d '{"callerName":null,"foo":null}' YOUR_WORKER_URL
```

## 🔴 Tests that should fail with 400 (Bad Request)

### Invalid JSON - Missing closing brace
```bash
curl -X POST -H "Content-Type: application/json" -d '{"callerName":"Test User","foo":"bar"' YOUR_WORKER_URL
```

### Invalid JSON - Completely malformed
```bash
curl -X POST -H "Content-Type: application/json" -d 'this-is-not-json' YOUR_WORKER_URL
```

### Empty body
```bash
curl -X POST -H "Content-Type: application/json" YOUR_WORKER_URL
```

### Wrong Content-Type
```bash
curl -X POST -H "Content-Type: text/plain" -d '{"callerName":"Test User"}' YOUR_WORKER_URL
```

### No Content-Type header
```bash
curl -X POST -d '{"callerName":"Test User"}' YOUR_WORKER_URL
```

## 🟡 Tests that should fail with 405 (Method Not Allowed)

### GET request
```bash
curl -X GET YOUR_WORKER_URL
```

### PUT request
```bash
curl -X PUT -H "Content-Type: application/json" -d '{"test":"data"}' YOUR_WORKER_URL
```

## 🧪 Advanced Tests

### Large payload
```bash
curl -X POST -H "Content-Type: application/json" -d '{"callerName":"Large Test","data":"'$(printf 'A%.0s' {1..1000})'"}' YOUR_WORKER_URL
```

### Special characters and Unicode
```bash
curl -X POST -H "Content-Type: application/json" -d '{"callerName":"Test 特殊字符 🚀","message":"Hello\nMultiline\tWith\"Quotes\""}' YOUR_WORKER_URL
```

### Nested JSON
```bash
curl -X POST -H "Content-Type: application/json" -d '{"callerName":"Nested Test","metadata":{"source":"test","timestamp":"2024-01-01"}}' YOUR_WORKER_URL
```

## 🔍 Debugging Commands

### Show response headers
```bash
curl -I -X POST -H "Content-Type: application/json" -d '{"callerName":"Debug Test"}' YOUR_WORKER_URL
```

### Verbose output
```bash
curl -v -X POST -H "Content-Type: application/json" -d '{"callerName":"Verbose Test"}' YOUR_WORKER_URL
```

### Show response time
```bash
curl -w "Time: %{time_total}s\nStatus: %{http_code}\n" -X POST -H "Content-Type: application/json" -d '{"callerName":"Timing Test"}' YOUR_WORKER_URL
``` 