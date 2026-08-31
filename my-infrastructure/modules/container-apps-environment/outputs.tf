output "id" {
  description = "Fully qualified Azure resource ID of the Container Apps environment."
  value       = azurerm_container_app_environment.this.id
}

output "name" {
  description = "Name of the Container Apps environment."
  value       = azurerm_container_app_environment.this.name
}

output "default_domain" {
  description = "Default domain apps in this environment are published under."
  value       = azurerm_container_app_environment.this.default_domain
}

output "log_analytics_workspace_id" {
  description = "Resource ID of the Log Analytics workspace attached to the environment."
  value       = azurerm_log_analytics_workspace.this.id
}

output "log_analytics_workspace_name" {
  description = "Name of the Log Analytics workspace attached to the environment."
  value       = azurerm_log_analytics_workspace.this.name
}
