Place local development certificates in this directory only if you explicitly need HTTPS in development.

Recommended setup:
- Keep real certificates outside the repository.
- Set `TLS_KEY_PATH` and `TLS_CERT_PATH` in a local `.env` file.
- Leave both variables empty for normal local development over `http://localhost:3000`.
