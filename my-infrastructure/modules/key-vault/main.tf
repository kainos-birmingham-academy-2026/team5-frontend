terraform {
  required_version = ">= 1.5"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

# Vault is created empty. Secret values are added in the Azure portal, never
# in Terraform, tfvars, or application source.
resource "azurerm_key_vault" "this" {
  name                = var.name
  location            = var.location
  resource_group_name = var.resource_group_name
  tenant_id           = var.tenant_id
  sku_name            = "standard"

  # Data-plane access via Azure RBAC (not legacy access policies), so a
  # Container App managed identity can be granted Key Vault Secrets User.
  rbac_authorization_enabled = true
  purge_protection_enabled   = false
  soft_delete_retention_days = 7

  tags = var.tags
}

# Portal / CLI operators who add and rotate secrets.
resource "azurerm_role_assignment" "administrators" {
  for_each = toset(var.admin_object_ids)

  scope                = azurerm_key_vault.this.id
  role_definition_name = "Key Vault Administrator"
  principal_id         = each.value
}

# Identities that only need to read secrets (Container App managed identity).
# Map keys are static so for_each can plan before principal IDs exist.
resource "azurerm_role_assignment" "secrets_users" {
  for_each = var.secrets_users

  scope                            = azurerm_key_vault.this.id
  role_definition_name             = "Key Vault Secrets User"
  principal_id                     = each.value
  skip_service_principal_aad_check = true
}
