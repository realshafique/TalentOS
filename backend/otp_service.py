import hashlib
import os
import secrets

from dotenv import load_dotenv
from brevo import Brevo
from brevo.transactional_emails import (
    SendTransacEmailRequestSender,
    SendTransacEmailRequestToItem,
)

load_dotenv()

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
BREVO_FROM_EMAIL = os.getenv("BREVO_FROM_EMAIL")
BREVO_FROM_NAME = os.getenv("BREVO_FROM_NAME", "TalentOS")


def generate_otp() -> str:
    """Generate a secure 6-digit OTP."""
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_otp(otp: str) -> str:
    """Hash OTP before storing it in the database."""
    return hashlib.sha256(
        otp.encode("utf-8")
    ).hexdigest()


def send_otp_email(email: str, otp: str):
    """Send OTP email using Brevo."""

    if not BREVO_API_KEY:
        raise RuntimeError(
            "BREVO_API_KEY is not configured."
        )

    if not BREVO_FROM_EMAIL:
        raise RuntimeError(
            "BREVO_FROM_EMAIL is not configured."
        )

    client = Brevo(api_key=BREVO_API_KEY)

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
        font-family: Arial, sans-serif;
    ">

        <div style="
            max-width: 600px;
            margin: 40px auto;
            background: white;
            padding: 35px;
            border-radius: 14px;
            border: 1px solid #e5e7eb;
        ">

            <h2 style="margin-top: 0;">
                Welcome to TalentOS 🚀
            </h2>

            <p style="color: #374151;">
                Thanks for creating your TalentOS account.
            </p>

            <p style="color: #374151;">
                Your verification code is:
            </p>

            <div style="
                margin: 25px 0;
                padding: 20px;
                text-align: center;
                background: #f3f4f6;
                border-radius: 12px;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
            ">
                {otp}
            </div>

            <p style="color: #6b7280;">
                This code expires in 5 minutes.
            </p>

            <p style="color: #6b7280;">
                If you didn't create a TalentOS account,
                you can safely ignore this email.
            </p>

            <hr style="
                border: none;
                border-top: 1px solid #e5e7eb;
                margin: 30px 0;
            ">

            <p style="
                color: #9ca3af;
                font-size: 12px;
            ">
                TalentOS — Discover Talent. Build Teams.
            </p>

        </div>

    </body>
    </html>
    """

    result = client.transactional_emails.send_transac_email(
        subject="Verify your TalentOS account",

        html_content=html_content,

        sender=SendTransacEmailRequestSender(
            name=BREVO_FROM_NAME,
            email=BREVO_FROM_EMAIL,
        ),

        to=[
            SendTransacEmailRequestToItem(
                email=email,
            )
        ],
    )

    return result