import secrets

def generate_secret_key(length: int = 32) -> str:
    """
    Generates a secure random secret key.
    Default length is 32 bytes (64 hex characters).
    """
    return secrets.token_hex(length)

if __name__ == "__main__":
    key = generate_secret_key()
    print("\nGenerated SECRET_KEY:\n")
    print(key)
