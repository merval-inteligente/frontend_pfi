# Null resource para ejecutar el build y deploy
resource "null_resource" "build_and_deploy" {
  triggers = {
    always_run = timestamp()
  }

  # Build de la aplicación web
  provisioner "local-exec" {
    command     = "npx expo export --platform web"
    working_dir = "${path.module}/.."
  }

  # Deploy a S3
  provisioner "local-exec" {
    command = "aws s3 sync ${path.module}/../dist/ s3://${aws_s3_bucket.web_app.id}/ --delete --cache-control max-age=3600"
  }

  depends_on = [
    aws_s3_bucket.web_app,
    aws_s3_bucket_website_configuration.web_app,
    aws_s3_bucket_policy.web_app
  ]
}

output "deploy_timestamp" {
  description = "Timestamp del último deploy"
  value       = null_resource.build_and_deploy.triggers.always_run
}
