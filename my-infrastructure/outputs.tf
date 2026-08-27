output "resource_group_name" {
  description = "Name of the resource group."
  value       = module.resource_group.name
}

output "resource_group_id" {
  description = "Fully qualified Azure resource ID of the resource group."
  value       = module.resource_group.id
}

output "location" {
  description = "Azure region the resource group was created in."
  value       = module.resource_group.location
}

output "key_vault_name" {
  description = "Name of the Key Vault. Add secrets in the Azure portal; do not put values in Terraform."
  value       = module.key_vault.name
}

output "key_vault_id" {
  description = "Fully qualified Azure resource ID of the Key Vault."
  value       = module.key_vault.id
}

output "key_vault_uri" {
  description = "Vault URI for Container App secret references, e.g. @Microsoft.KeyVault(SecretUri=<uri>secrets/<name>)."
  value       = module.key_vault.uri
}

output "managed_identity_name" {
  description = "Name of the user-assigned identity used by Container Apps."
  value       = module.container_app_identity.name
}

output "managed_identity_id" {
  description = "Resource ID of the user-assigned identity. Attach this to the Container App."
  value       = module.container_app_identity.id
}

output "managed_identity_principal_id" {
  description = "Object ID of the user-assigned identity (Key Vault Secrets User / AcrPull principal)."
  value       = module.container_app_identity.principal_id
}

output "managed_identity_client_id" {
  description = "Client ID of the user-assigned identity. Used when selecting it on a Container App."
  value       = module.container_app_identity.client_id
}

output "container_app_environment_name" {
  description = "Name of the Container Apps environment later apps attach to."
  value       = module.container_app_environment.name
}

output "container_app_environment_id" {
  description = "Resource ID of the Container Apps environment."
  value       = module.container_app_environment.id
}

output "container_app_environment_default_domain" {
  description = "Default domain for apps in this environment."
  value       = module.container_app_environment.default_domain
}

output "log_analytics_workspace_name" {
  description = "Name of the Log Analytics workspace used by the Container Apps environment."
  value       = module.container_app_environment.log_analytics_workspace_name
}

output "container_registry_name" {
  description = "Name of the existing Container Registry (looked up, not created)."
  value       = data.azurerm_container_registry.existing.name
}

output "container_registry_login_server" {
  description = "Login server for image references, e.g. acraiacademy26.azurecr.io/team5-frontend:<tag>."
  value       = data.azurerm_container_registry.existing.login_server
}

output "container_registry_id" {
  description = "Resource ID of the existing Container Registry. The managed identity is granted AcrPull on this."
  value       = data.azurerm_container_registry.existing.id
}

output "frontend_container_app_name" {
  description = "Name of the public frontend Container App."
  value       = module.frontend_app.name
}

output "frontend_url" {
  description = "Public HTTPS URL of the frontend."
  value       = module.frontend_app.url
}
