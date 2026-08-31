output "id" {
  description = "Fully qualified Azure resource ID of the identity. Attach this to the Container App."
  value       = azurerm_user_assigned_identity.this.id
}

output "name" {
  description = "Name of the identity."
  value       = azurerm_user_assigned_identity.this.name
}

output "principal_id" {
  description = "Object ID used in Azure RBAC assignments (Key Vault Secrets User, AcrPull)."
  value       = azurerm_user_assigned_identity.this.principal_id
}

output "client_id" {
  description = "Client ID used by Container Apps when selecting this user-assigned identity."
  value       = azurerm_user_assigned_identity.this.client_id
}
