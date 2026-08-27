output "id" {
  description = "Fully qualified Azure resource ID of the Container App."
  value       = azurerm_container_app.this.id
}

output "name" {
  description = "Name of the Container App."
  value       = azurerm_container_app.this.name
}

output "fqdn" {
  description = "Ingress FQDN. Public when external_enabled is true; internal-only otherwise."
  value       = azurerm_container_app.this.ingress[0].fqdn
}

output "url" {
  description = "HTTPS URL for the app ingress."
  value       = "https://${azurerm_container_app.this.ingress[0].fqdn}"
}
