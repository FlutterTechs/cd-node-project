variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type (t2.micro / t3.micro are free-tier eligible)"
  type        = string
  default     = "t3.micro"
}

variable "app_name" {
  description = "Name used to tag resources"
  type        = string
  default     = "cd-node-project"
}

variable "ghcr_image" {
  description = "Full ghcr.io image reference (must be all lowercase) the server pulls"
  type        = string
  default     = "ghcr.io/fluttertechs/cd-node-project:latest"
}

variable "ssh_allowed_cidr" {
  description = "CIDR allowed on port 22. 0.0.0.0/0 is required if you SSH from arbitrary/changing IPs (including GitHub Actions runners); narrow it to your own IP/32 if you only SSH manually and deploy some other way."
  type        = string
  default     = "0.0.0.0/0"
}

variable "github_oidc_subjects" {
  description = "Allowed values of the GitHub Actions OIDC token's `sub` claim that may assume the deploy role. This repo's default subject format embeds immutable owner/repo IDs (repo:OWNER@OWNER_ID/REPO@REPO_ID:ref:REF) rather than plain names - verify via `gh api repos/<owner>/<repo>/actions/oidc/customization/sub` if this repo is ever renamed or transferred."
  type        = list(string)
  default = [
    "repo:FlutterTechs@168553497/cd-node-project@1343745796:ref:refs/heads/main",
    "repo:FlutterTechs@168553497/cd-node-project@1343745796:ref:refs/heads/master",
  ]
}
