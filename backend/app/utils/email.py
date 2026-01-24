from typing import Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Environment, FileSystemLoader
import os

from app.settings import (
    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD,
    SMTP_FROM_EMAIL, SMTP_FROM_NAME, FRONTEND_URL
)

# Initialize Jinja2 environment
template_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'templates', 'email')
env = Environment(loader=FileSystemLoader(template_dir))

async def send_email(
    to_email: str,
    subject: str,
    # html_content: str,
    text_content: Optional[str] = None
) -> None:
    """Send an email using SMTP."""
    try:
        message = MIMEMultipart('alternative')
        message['Subject'] = subject
        message['From'] = SMTP_FROM_EMAIL
        message['To'] = to_email


        # Attach plain text content if provided
        if text_content:
            text_part = MIMEText(text_content, 'plain')
            message.attach(text_part)

        print("=== Email Variables Debug ===")
        print(f"To Email: {to_email}")
        print(f"Subject: {subject}")
        print(f"Text Content: {text_content}")

        print(f"  From: {message['From']}")
        print(f"  To: {message['To']}")
        print(f"  Subject: {message['Subject']}")
        print("=== End Debug ===")
        # Send email using Gmail SMTP
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()  # Secure the connection
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM_EMAIL, [to_email], message.as_string())
            print("Email sent successfully")

    except Exception as e:
        print(f"Failed to send email: {e}")
        raise  # Re-raise the exception to be handled by the caller

async def send_verification_email(email: str, token: str) -> None:
    """Send email verification email."""
    # Create plain text content only
    text_content = f"""
    Email Verification

    Your verification code is: {token}

    This code will expire in 24 hours.

    If you did not create an account, please ignore this email.

    For support, contact: {SMTP_FROM_EMAIL}
    """
    
    await send_email(
        to_email=email,
        subject="Verify your email address",
        # html_content="",  # Empty HTML content
        text_content=text_content
    )

async def send_password_reset_email(email: str, token: str) -> None:
    """Send password reset email."""
    reset_url = f"{FRONTEND_URL}/reset-password?token={token}"
    
    # Render email template
    # html_content = template.render(
    #     reset_url=reset_url,
    #     support_email=SMTP_FROM_EMAIL
    # )
    
    # Create plain text version
    text_content = f"""
    You have requested to reset your password. Click the following link to reset it:
    {reset_url}
    
    If you did not request a password reset, please ignore this email.
    
    For support, contact: {SMTP_FROM_EMAIL}
    """
    
    await send_email(
        to_email=email,
        subject="Reset your password",
        # html_content=html_content,
        text_content=text_content
    )

async def send_welcome_email(email: str, first_name: str) -> None:
    """Send welcome email after successful registration."""
    
    
    # Create plain text version
    text_content = f"""
    Welcome to our platform, {first_name}!
    
    You can now log in to your account at: {FRONTEND_URL}/login
    
    For support, contact: {SMTP_FROM_EMAIL}
    """
    
    await send_email(
        to_email=email,
        subject="Welcome to our platform!",
        text_content=text_content
    )

async def send_password_changed_email(email: str, first_name: str) -> None:
    """Send email notification when password is changed."""
    template = env.get_template('password_changed.html')
    
    # # Render email template
    # html_content = template.render(
    #     first_name=first_name,
    #     support_email=SMTP_FROM_EMAIL
    # )
    
    # Create plain text version
    text_content = f"""
    Hello {first_name},
    
    Your password has been changed successfully.
    
    If you did not make this change, please contact us immediately at: {SMTP_FROM_EMAIL}
    """
    
    await send_email(
        to_email=email,
        subject="Your password has been changed",
        # html_content=html_content,
        text_content=text_content
    ) 