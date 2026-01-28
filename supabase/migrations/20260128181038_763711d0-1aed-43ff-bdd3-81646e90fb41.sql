-- Enable pgcrypto extension for proper encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create encryption function for API keys (uses AES encryption)
-- The encryption key is passed from the edge function (stored in secrets)
CREATE OR REPLACE FUNCTION public.encrypt_api_key(p_api_key TEXT, p_encryption_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use AES encryption with the provided key
  -- The key is padded/hashed to ensure consistent length
  RETURN encode(
    encrypt(
      p_api_key::bytea, 
      digest(p_encryption_key, 'sha256'), 
      'aes'
    ), 
    'base64'
  );
END;
$$;

-- Create decryption function for API keys
CREATE OR REPLACE FUNCTION public.decrypt_api_key(p_encrypted_key TEXT, p_encryption_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN convert_from(
    decrypt(
      decode(p_encrypted_key, 'base64'), 
      digest(p_encryption_key, 'sha256'), 
      'aes'
    ), 
    'UTF8'
  );
EXCEPTION WHEN OTHERS THEN
  -- Return NULL if decryption fails (wrong key, corrupted data, etc.)
  RETURN NULL;
END;
$$;

-- Revoke direct access to these functions from public
-- Only service_role (edge functions) should use them
REVOKE EXECUTE ON FUNCTION public.encrypt_api_key(TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.decrypt_api_key(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.encrypt_api_key(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.decrypt_api_key(TEXT, TEXT) TO service_role;