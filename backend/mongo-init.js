
db = db.getSiblingDB('yaralex_api');

db.createCollection('users');

db.users.insertMany([
  {
    "hashed_password": "$2b$12$JlUc26OYkMPTFYWv2kPjt.eyhMKa/lCgHBtytovU6zUD0V9oZeUB.",
    "google_id": null,
    "access_token_expires_at": {
      "$date": "2025-08-01T19:30:41.971Z"
    },
    "refresh_token_expires_at": {
      "$date": "2025-08-31T09:30:41.978Z"
    },
    "verification_code": null,
    "verification_code_created_at": {
      "$date": "2025-07-10T13:25:59.328Z"
    },
    "verification_code_expires_at": null,
    "created_at": {
      "$date": "2025-07-10T13:25:59.328Z"
    },
    "last_login": {
      "$date": "2025-08-01T09:30:41.979Z"
    },
    "locked_until": null,
    "email": "admin@yaralex.com",
    "username": "yaralex-admin",
    "first_name": "Admin",
    "last_name": "Yaralex",
    "bio": null,
    "avatar_url": null,
    "role": "admin",
    "provider": "local",
    "is_email_verified": true,
    "subscribed_channels": null
  }
]);

print("Database initialized");