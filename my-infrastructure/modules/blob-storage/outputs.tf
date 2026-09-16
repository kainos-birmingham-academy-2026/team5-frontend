output "name" {
  description = "Storage Account name."
  value       = azurerm_storage_account.this.name
}

output "id" {
  description = "Storage Account resource ID."
  value       = azurerm_storage_account.this.id
}

output "primary_blob_endpoint" {
  description = "Primary Blob service endpoint."
  value       = azurerm_storage_account.this.primary_blob_endpoint
}