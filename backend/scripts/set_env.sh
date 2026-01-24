#!/bin/bash

# Create .env file if it doesn't exist
ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
    echo "Creating .env file..."
    cat > "$ENV_FILE" << EOL
# Google OAuth Settings
GOOGLE_CLIENT_ID=940538258951-mepajb01hrgf29h74ppv62k0bkub3qnf.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:8000/public/auth/callback

# Security Settings
SECRET_KEY=e132075bcc8c48809bb20b9bda648e16
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCKOUT_MINUTES=30
PASSWORD_MIN_LENGTH=8
PASSWORD_MAX_LENGTH=32
HASHING_COST=6

# MongoDB Settings
MONGO_URI=mongodb://127.0.0.1:27017/yaralex
MONGO_DB_NAME=y2

# Email Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yaralex.co@gmail.com
SMTP_PASSWORD=avsq dgru rgwp izwq
SMTP_FROM_EMAIL=yaralex.co@gmail.com
SMTP_FROM_NAME=YaraLex

# Application Settings
ENV=development
LANGUAGES=en
MAX_SESSION_COUNT=5
FRONTEND_URL=http://localhost:3000
EOL
    echo ".env file created successfully!"
else
    echo ".env file already exists. Skipping creation."
fi

# Make the script executable
chmod +x "$0"

echo "Environment setup complete!"
echo "You can now start the application." 