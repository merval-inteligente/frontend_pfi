# Deploy de PFI Frontend a AWS

Este directorio contiene la infraestructura como código (IaC) usando Terraform para deployar la versión web de la aplicación PFI Frontend en AWS.

## Arquitectura

```
Internet
   |
   v
CloudFront (CDN)
   |
   v
S3 Bucket (Static Website Hosting)
   |
   v
React Native Web App
```

## Recursos creados

- **S3 Bucket**: Almacenamiento del sitio web estático
- **CloudFront Distribution**: CDN global para distribución rápida
- **S3 Bucket Policy**: Permisos de acceso público
- **CloudFront OAI**: Identidad de acceso de origen

## Pre-requisitos

1. **AWS CLI** configurado con credenciales válidas
2. **Terraform** instalado (>= 1.0)
3. **Node.js** y **npm** para el build de la aplicación

## Configuración inicial

1. Crear archivo de variables:
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

2. Editar `terraform.tfvars` con tus valores:
```hcl
bucket_name = "tu-nombre-unico-de-bucket"
aws_region = "us-east-1"
environment = "production"
```

## Build de la aplicación

Antes de deployar, necesitas hacer el build de la versión web:

```bash
# Desde la raíz del proyecto
npx expo export --platform web
```

Esto generará los archivos estáticos en la carpeta `dist/`.

## Deployment

### 1. Inicializar Terraform

```bash
cd terraform
terraform init
```

### 2. Verificar el plan de ejecución

```bash
terraform plan
```

### 3. Aplicar la infraestructura

```bash
terraform apply
```

### 4. Subir archivos al S3

Después de crear la infraestructura, sube los archivos del build:

```bash
# Obtener el nombre del bucket
$BUCKET_NAME = terraform output -raw bucket_name

# Subir archivos
aws s3 sync ../dist/ s3://$BUCKET_NAME/ --delete
```

### 5. Invalidar caché de CloudFront (opcional)

```bash
# Obtener el distribution ID
$DISTRIBUTION_ID = terraform output -raw cloudfront_distribution_id

# Invalidar caché
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```

## Acceder a la aplicación

Después del deploy, obtén la URL de CloudFront:

```bash
terraform output website_url
```

## Actualizar la aplicación

Para actualizar la aplicación después de cambios:

```bash
# 1. Build de la nueva versión
npx expo export --platform web

# 2. Subir archivos actualizados
$BUCKET_NAME = terraform output -raw bucket_name
aws s3 sync ../dist/ s3://$BUCKET_NAME/ --delete

# 3. Invalidar caché de CloudFront
$DISTRIBUTION_ID = terraform output -raw cloudfront_distribution_id
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```

## Destruir la infraestructura

⚠️ **CUIDADO**: Esto eliminará todos los recursos creados.

```bash
terraform destroy
```

## Variables disponibles

| Variable | Descripción | Default | Requerido |
|----------|-------------|---------|-----------|
| `aws_region` | Región de AWS | `us-east-1` | No |
| `bucket_name` | Nombre del bucket S3 | `pfi-frontend-web-app` | Sí (debe ser único) |
| `environment` | Ambiente | `production` | No |
| `cloudfront_price_class` | Clase de precio CloudFront | `PriceClass_100` | No |

## Outputs

Después del apply, Terraform mostrará:

- `bucket_name`: Nombre del bucket S3
- `cloudfront_distribution_id`: ID de la distribución CloudFront
- `cloudfront_domain_name`: Dominio de CloudFront
- `website_url`: URL completa del sitio web

## Costos estimados

- **S3**: ~$0.023 por GB almacenado
- **CloudFront**: ~$0.085 por GB transferido (primeros 10TB)
- **Requests**: Muy bajo para tráfico normal

El tier gratuito de AWS cubre los primeros 12 meses:
- 5 GB de S3 Standard Storage
- 20,000 requests GET S3
- 50 GB de transferencia CloudFront

## Troubleshooting

### Error: Bucket name already exists
El nombre del bucket debe ser único globalmente. Cambia `bucket_name` en `terraform.tfvars`.

### CloudFront tarda en actualizar
Las distribuciones de CloudFront pueden tardar 15-20 minutos en propagarse globalmente.

### Errores 404 en rutas de la app
Esto es normal para SPAs. CloudFront está configurado para redirigir 404s a `index.html`.

## Seguridad

- Los archivos en S3 son públicos pero solo accesibles vía CloudFront
- HTTPS está habilitado por defecto
- No se expone el endpoint directo de S3

## Notas

- La aplicación usa React Native Web y Expo Router
- Es una SPA (Single Page Application) con client-side routing
- CloudFront cachea los archivos estáticos por 1 hora por defecto
