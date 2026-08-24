output "public_ip" {
  description = "Stable public IP - use for EC2_HOST secret"
  value       = aws_eip.app.public_ip
}

output "ssh_private_key_pem" {
  description = "Private key for the generated keypair - copy into EC2_SSH_KEY secret"
  value       = tls_private_key.ssh.private_key_pem
  sensitive   = true
}
