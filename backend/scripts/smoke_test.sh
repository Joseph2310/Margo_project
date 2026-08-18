#!/usr/bin/env sh
set -eu

api_base_url="${API_BASE_URL:-http://localhost:8000}"
smoke_temp_dir="$(mktemp -d)"
trap 'rm -rf "$smoke_temp_dir"' EXIT

curl -fsS "${api_base_url}/health" -o "${smoke_temp_dir}/health.json"
curl -fsS \
  -X POST "${api_base_url}/api/v1/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"joy.barakat@hotmail.com","password":"Password1"}' \
  -o "${smoke_temp_dir}/session.json"

access_token="$(sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p' "${smoke_temp_dir}/session.json")"
test -n "$access_token"

for endpoint in \
  profile \
  home \
  events \
  readings/today \
  questions/categories \
  questions/know-me \
  retreat/activities \
  retreat/reflection/latest \
  conversations \
  notifications
do
  output_name="$(printf '%s' "$endpoint" | tr '/' '-')"
  curl -fsS \
    "${api_base_url}/api/v1/${endpoint}" \
    -H "Authorization: Bearer ${access_token}" \
    -o "${smoke_temp_dir}/${output_name}.json"
done

curl -fsS "${api_base_url}/openapi.json" -o "${smoke_temp_dir}/openapi.json"
printf 'API smoke test passed: authentication plus 10 protected reads and OpenAPI.\n'
