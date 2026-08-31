terraform {
  required_version = ">= 1.5"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

resource "azurerm_user_assigned_identity" "this" {
  name                = var.name
  location            = var.location
  resource_group_name = var.resource_group_name
  tags                = var.tags
}

# Pull images from ACR when a registry ID is supplied. No-op until ACR exists.
resource "azurerm_role_assignment" "acr_pull" {
  count = var.container_registry_id == null ? 0 : 1

  scope                            = var.container_registry_id
  role_definition_name             = "AcrPull"
  principal_id                     = azurerm_user_assigned_identity.this.principal_id
  skip_service_principal_aad_check = true
}
