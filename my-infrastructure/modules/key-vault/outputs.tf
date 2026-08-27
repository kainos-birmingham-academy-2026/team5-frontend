output "id" {
  description = "Fully qualified Azure resource ID of the Key Vault."
  value       = azurerm_key_vault.this.id
}

output "name" {
  description = "Name of the Key Vault."
  value       = azurerm_key_vault.this.name
}

output "uri" {
  description = "URI used by Container Apps secret references (https://<name>.vault.azure.net/)."
  value       = azurerm_key_vault.this.vault_uri
}
