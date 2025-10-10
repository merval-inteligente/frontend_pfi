variable "aws_region" {
  description = "Región de AWS donde se desplegará la infraestructura"
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "Nombre del bucket S3 para el sitio web (debe ser único globalmente)"
  type        = string
  default     = "pfi-frontend-web-app"
}

variable "environment" {
  description = "Ambiente de despliegue"
  type        = string
  default     = "production"
}

variable "cloudfront_price_class" {
  description = "Clase de precio de CloudFront"
  type        = string
  default     = "PriceClass_100" # USA, Canada, Europe
  
  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.cloudfront_price_class)
    error_message = "La clase de precio debe ser PriceClass_100, PriceClass_200 o PriceClass_All"
  }
}

variable "tags" {
  description = "Tags adicionales para los recursos"
  type        = map(string)
  default     = {}
}
