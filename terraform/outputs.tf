output "public_ip" {
  description = "Stable public IP - use for EC2_HOST secret"
  value       = aws_eip.app.public_ip
}

