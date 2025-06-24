#!/bin/bash

# Smoke Test Suite for Notion Relay Worker
# Usage: ./test/smoke-test.sh [worker-url]

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default URL or use provided one
WORKER_URL=${1:-"https://notion-relay.betoiii.workers.dev"}

echo -e "${BLUE}🧪 Starting Smoke Tests for: ${WORKER_URL}${NC}\n"

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0

run_test() {
    local test_name="$1"
    local expected_status="$2"
    local curl_command="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${YELLOW}Test ${TOTAL_TESTS}: ${test_name}${NC}"
    echo "Command: $curl_command"
    
    # Execute curl and capture response
    response=$(eval "$curl_command" 2>/dev/null)
    status_code=$(eval "$curl_command -w '%{http_code}' -o /dev/null -s" 2>/dev/null)
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} - Expected: $expected_status, Got: $status_code"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAIL${NC} - Expected: $expected_status, Got: $status_code"
    fi
    
    echo "Response: $response"
    echo "---"
    echo
}

# Test 1: Valid JSON payload
run_test "Valid JSON payload" "200" \
    "curl -X POST -H 'Content-Type: application/json' -d '{\"callerName\":\"Test User\",\"foo\":\"bar\"}' '$WORKER_URL'"

# Test 2: Invalid JSON (missing closing brace)
run_test "Invalid JSON - Missing closing brace" "400" \
    "curl -X POST -H 'Content-Type: application/json' -d '{\"callerName\":\"Test User\",\"foo\":\"bar\"' '$WORKER_URL'"

# Test 3: Invalid JSON (malformed)
run_test "Invalid JSON - Malformed" "400" \
    "curl -X POST -H 'Content-Type: application/json' -d 'not-json-at-all' '$WORKER_URL'"

# Test 4: Empty JSON object
run_test "Empty JSON object" "200" \
    "curl -X POST -H 'Content-Type: application/json' -d '{}' '$WORKER_URL'"

# Test 5: Empty body
run_test "Empty body" "400" \
    "curl -X POST -H 'Content-Type: application/json' '$WORKER_URL'"

# Test 6: Wrong Content-Type but valid JSON
run_test "Wrong Content-Type (text/plain)" "400" \
    "curl -X POST -H 'Content-Type: text/plain' -d '{\"callerName\":\"Test User\"}' '$WORKER_URL'"

# Test 7: No Content-Type header
run_test "No Content-Type header" "400" \
    "curl -X POST -d '{\"callerName\":\"Test User\"}' '$WORKER_URL'"

# Test 8: GET request (should return 405)
run_test "GET request (Method Not Allowed)" "405" \
    "curl -X GET '$WORKER_URL'"

# Test 9: PUT request (should return 405)
run_test "PUT request (Method Not Allowed)" "405" \
    "curl -X PUT -H 'Content-Type: application/json' -d '{\"test\":\"data\"}' '$WORKER_URL'"

# Test 10: Large JSON payload
run_test "Large JSON payload" "200" \
    "curl -X POST -H 'Content-Type: application/json' -d '{\"callerName\":\"Large Test\",\"data\":\"$(printf 'A%.0s' {1..1000})\"}' '$WORKER_URL'"

# Test 11: JSON with special characters
run_test "JSON with special characters" "200" \
    "curl -X POST -H 'Content-Type: application/json' -d '{\"callerName\":\"Test 特殊字符 🚀\",\"message\":\"Hello\\nMultiline\\tWith\\\"Quotes\\\"\"}' '$WORKER_URL'"

# Test 12: Null values in JSON
run_test "JSON with null values" "200" \
    "curl -X POST -H 'Content-Type: application/json' -d '{\"callerName\":null,\"foo\":null}' '$WORKER_URL'"

# Test 13: Nested JSON object
run_test "Nested JSON object" "200" \
    "curl -X POST -H 'Content-Type: application/json' -d '{\"callerName\":\"Nested Test\",\"metadata\":{\"source\":\"test\",\"timestamp\":\"2024-01-01\"}}' '$WORKER_URL'"

# Test 14: JSON Array (should still work)
run_test "JSON Array payload" "200" \
    "curl -X POST -H 'Content-Type: application/json' -d '[{\"callerName\":\"Array Test\"}]' '$WORKER_URL'"

# Test 15: Extremely long field value
run_test "Very long field value" "200" \
    "curl -X POST -H 'Content-Type: application/json' -d '{\"callerName\":\"$(printf 'VeryLongName%.0s' {1..100})\"}' '$WORKER_URL'"

# Test 16: Truncation test - payload exceeding 2000 character limit
run_test "Truncation test - Large payload (>2000 chars)" "200" \
    "curl -X POST -H 'Content-Type: application/json' -d '{\"callerName\":\"Truncation Test\",\"largeField\":\"$(printf 'X%.0s' {1..3000})\",\"summary\":\"This payload should trigger truncation logic as it exceeds Notions 2000 character limit for text blocks\",\"additionalData\":\"$(printf 'Y%.0s' {1..2000})\"}' '$WORKER_URL'"

# Test 17: Extreme truncation test - payload similar to the 91k character failure
run_test "Extreme truncation test - Very large payload (~10k chars)" "200" \
    "curl -X POST -H 'Content-Type: application/json' -d '{\"callerName\":\"Extreme Test\",\"transcript\":\"$(printf 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. %.0s' {1..200})\",\"call_data\":\"$(printf 'Call data entry %.0s' {1..500})\",\"metadata\":{\"duration\":\"300\",\"quality\":\"high\"},\"variables\":{\"user_id\":\"123\",\"session_id\":\"abc-def-ghi\"}}' '$WORKER_URL'"

# Summary
echo -e "${BLUE}📊 Test Summary${NC}"
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$((TOTAL_TESTS - PASSED_TESTS))${NC}"

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed${NC}"
    exit 1
fi 