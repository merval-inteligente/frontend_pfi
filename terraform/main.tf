terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "aws" {
  region = var.aws_region
}

# S3 Bucket para el sitio web
resource "aws_s3_bucket" "web_app" {
  bucket = var.bucket_name

  tags = {
    Name        = "PFI Frontend Web App"
    Environment = var.environment
    Project     = "PFI"
  }
}

# Configuración de sitio web estático
resource "aws_s3_bucket_website_configuration" "web_app" {
  bucket = aws_s3_bucket.web_app.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# Desactivar bloqueo de acceso público
resource "aws_s3_bucket_public_access_block" "web_app" {
  bucket = aws_s3_bucket.web_app.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Política del bucket para acceso público
resource "aws_s3_bucket_policy" "web_app" {
  bucket = aws_s3_bucket.web_app.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.web_app.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.web_app]
}

# CORS Configuration para permitir requests desde el frontend
resource "aws_s3_bucket_cors_configuration" "web_app" {
  bucket = aws_s3_bucket.web_app.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Outputs
output "bucket_name" {
  description = "Nombre del bucket S3"
  value       = aws_s3_bucket.web_app.id
}

output "bucket_arn" {
  description = "ARN del bucket S3"
  value       = aws_s3_bucket.web_app.arn
}

output "website_endpoint" {
  description = "Endpoint del website S3"
  value       = aws_s3_bucket_website_configuration.web_app.website_endpoint
}

output "website_url" {
  description = "URL del sitio web"
  value       = "http://${aws_s3_bucket_website_configuration.web_app.website_endpoint}"
}
