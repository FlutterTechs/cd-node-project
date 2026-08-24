data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Terraform generates the keypair itself - no manual key creation, no
# hand-hardening of the box once this applies.
resource "tls_private_key" "ssh" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "app" {
  key_name   = "${var.app_name}-key"
  public_key = tls_private_key.ssh.public_key_openssh
}

# Convenience copy for manual SSH; the real source of truth is the
# `ssh_private_key_pem` output. Never commit this file (see .gitignore).
resource "local_sensitive_file" "private_key" {
  filename        = "${path.module}/generated/${var.app_name}-key.pem"
  content         = tls_private_key.ssh.private_key_pem
  file_permission = "0600"
}

resource "aws_security_group" "app" {
  name        = "${var.app_name}-sg"
  description = "Allow SSH and app HTTP traffic"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_allowed_cidr]
  }

  ingress {
    description = "App HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.app_name}-sg" }
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.app.key_name
  vpc_security_group_ids = [aws_security_group.app.id]

  user_data = templatefile("${path.module}/templates/user_data.sh.tpl", {
    docker_image = var.ghcr_image
  })
  user_data_replace_on_change = true

  tags = { Name = var.app_name }
}

resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"

  tags = { Name = "${var.app_name}-eip" }
}
