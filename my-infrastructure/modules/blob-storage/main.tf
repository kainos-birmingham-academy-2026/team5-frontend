resource "azurerm_storage_account" "this" {
  name                            = var.name
  resource_group_name             = var.resource_group_name
  location                        = var.location
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  account_kind                    = "StorageV2"
  min_tls_version                 = "TLS1_2"
  https_traffic_only_enabled      = true
  allow_nested_items_to_be_public = false
  shared_access_key_enabled       = true
  public_network_access_enabled   = true

  blob_properties {
    delete_retention_policy {
      days = var.blob_delete_retention_days
    }
  }

  tags = var.tags
}

resource "azurerm_storage_container" "cv_quarantine" {
  name                  = "cv-quarantine"
  storage_account_id    = azurerm_storage_account.this.id
  container_access_type = "private"
}

resource "azurerm_storage_container" "cv_approved" {
  name                  = "cv-approved"
  storage_account_id    = azurerm_storage_account.this.id
  container_access_type = "private"
}

resource "azurerm_security_center_storage_defender" "this" {
  storage_account_id                          = azurerm_storage_account.this.id
  override_subscription_settings_enabled      = true
  malware_scanning_on_upload_enabled          = true
  malware_scanning_on_upload_cap_gb_per_month = var.malware_scanning_monthly_cap_gb
  sensitive_data_discovery_enabled            = false
}